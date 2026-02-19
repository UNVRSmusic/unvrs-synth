import { Voice } from "./Voice";
import { MIDIRecorder } from "./MIDIRecorder";

export class AudioEngine {
  private static instance: AudioEngine;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeVoices: Map<number, Voice> = new Map();
  private voicePool: Voice[] = [];
  private readonly MAX_VOICES = 16;

  // Synth parameters
  private isMonophonic = false;
  private waveType: OscillatorType = "sine";
  private attack = 0.01;
  private decay = 0.8;
  private sustain = 0.2;
  private release = 1.5;

  // Filter parameters
  private filter1Type: BiquadFilterType = "lowpass";
  private filter1Frequency = 2000;
  private filter1Q = 1;
  private filter1EnvAmount = 0;

  private filter2Type: BiquadFilterType = "highpass";
  private filter2Frequency = 100;
  private filter2Q = 1;
  private filter2EnvAmount = 0;

  // Effects
  // Effect buses - voices connect to these, then routed to effects
  private dryBus: GainNode | null = null;
  private delayBus: GainNode | null = null;
  private reverbBus: GainNode | null = null;

  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayMix: GainNode | null = null;
  private delayTime = 1.3;
  private delayFeedbackAmount = 0.2;
  private delayMixAmount = 0.3;

  private reverbNode: ConvolverNode | null = null;
  private reverbMix: GainNode | null = null;
  private reverbMixAmount = 0.5;

  // Chaos mode - enables "happy accidents" (gain node accumulation)
  private chaosMode = false;

  // Damage mode - allows duplicate MIDI note-ons for overdriven sound
  private damageMode = false;

  // MIDI recorder - always active, background recording
  private midiRecorder = new MIDIRecorder();

  private constructor() {}

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  async initialize(): Promise<void> {
    // Prevent re-initialization if already initialized
    if (this.audioContext) {
      console.warn("AudioEngine already initialized");
      return;
    }

    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.3;

    // Setup effects chain
    this.setupEffects();

    // Create voice pool and connect each voice to the effect buses once
    for (let i = 0; i < this.MAX_VOICES; i++) {
      const voice = new Voice(this.audioContext);

      // Connect voice to all effect buses (connections stay permanent)
      if (this.dryBus) voice.connect(this.dryBus);
      if (this.delayBus) voice.connect(this.delayBus);
      if (this.reverbBus) voice.connect(this.reverbBus);

      this.voicePool.push(voice);
    }
  }

  private setupEffects(): void {
    if (!this.audioContext || !this.masterGain) return;

    // Create effect buses that voices will connect to
    this.dryBus = this.audioContext.createGain();
    this.dryBus.gain.value = 1 - this.delayMixAmount - this.reverbMixAmount;
    this.dryBus.connect(this.masterGain);

    this.delayBus = this.audioContext.createGain();
    this.delayBus.gain.value = this.delayMixAmount;

    this.reverbBus = this.audioContext.createGain();
    this.reverbBus.gain.value = this.reverbMixAmount;

    // Delay effect
    this.delayNode = this.audioContext.createDelay(2.0);
    this.delayNode.delayTime.value = this.delayTime;

    this.delayFeedback = this.audioContext.createGain();
    this.delayFeedback.gain.value = this.delayFeedbackAmount;

    this.delayMix = this.audioContext.createGain();
    this.delayMix.gain.value = 1.0; // Full wet signal from delay

    // Delay routing: delayBus -> delay -> feedback -> delay -> mix -> (master + reverb)
    this.delayBus.connect(this.delayNode);
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.delayMix);
    this.delayMix.connect(this.masterGain); // Direct to output
    this.delayMix.connect(this.reverbBus);  // Also to reverb

    // Simple reverb (we'll use a basic impulse response)
    this.reverbNode = this.audioContext.createConvolver();
    this.reverbMix = this.audioContext.createGain();
    this.reverbMix.gain.value = 1.0; // Full wet signal from reverb

    // Create a simple impulse response
    this.createSimpleReverb();

    // Reverb routing: reverbBus -> reverb -> mix -> master
    this.reverbBus.connect(this.reverbNode);
    this.reverbNode.connect(this.reverbMix);
    this.reverbMix.connect(this.masterGain);

    // Final routing
    this.masterGain.connect(this.audioContext.destination);
  }

  private createSimpleReverb(): void {
    if (!this.audioContext || !this.reverbNode) return;

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * 2; // 2 seconds
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }

    this.reverbNode.buffer = impulse;
  }

  noteOn(midiNote: number, velocity: number = 1): void {
    if (!this.audioContext) return;

    // Resume AudioContext if suspended (required for iOS Safari)
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    // Monophonic mode: stop all active voices before starting a new note
    // if (this.isMonophonic) {
    //   this.activeVoices.forEach((voice, note) => {
    //     voice.noteOff();
    //     this.midiRecorder.logNoteOff(note);
    //   });
    //   this.activeVoices.clear();
    // }

    // Check if this note is already playing (prevent duplicates)
    // Skip this check in damage mode to allow accumulation
    if (!this.damageMode && this.activeVoices.has(midiNote)) {
      // Note is already playing, ignore duplicate
      return;
    }

    // Get a voice from the pool
    let voice = this.voicePool.pop();

    // If no voices available, steal the oldest
    if (!voice) {
      const [oldestNote, oldestVoice] = Array.from(
        this.activeVoices.entries(),
      )[0];
      this.activeVoices.delete(oldestNote);
      voice = oldestVoice;
      voice.noteOff();
    }

    // Configure voice with current synth parameters
    voice.setWaveType(this.waveType);
    voice.setEnvelope(this.attack, this.decay, this.sustain, this.release);
    voice.setFilter1(
      this.filter1Type,
      this.filter1Frequency,
      this.filter1Q,
      this.filter1EnvAmount,
    );
    voice.setFilter2(
      this.filter2Type,
      this.filter2Frequency,
      this.filter2Q,
      this.filter2EnvAmount,
    );

    // CHAOS MODE: Create accumulating gain nodes ("happy accidents")
    if (this.chaosMode && this.audioContext) {
      const dryGain = this.audioContext.createGain();
      dryGain.gain.value = 1 - this.delayMixAmount - this.reverbMixAmount;
      voice.connect(dryGain);
      dryGain.connect(this.masterGain!);

      if (this.delayMixAmount > 0 && this.delayNode) {
        voice.connect(this.delayNode);
      }
      if (this.reverbMixAmount > 0 && this.reverbNode) {
        voice.connect(this.reverbNode);
      }
    }

    // Start the note
    const frequency = this.midiToFrequency(midiNote);
    voice.noteOn(frequency, velocity);

    this.activeVoices.set(midiNote, voice);

    // Log MIDI event
    this.midiRecorder.logNoteOn(midiNote, velocity);
  }

  noteOff(midiNote: number): void {
    const voice = this.activeVoices.get(midiNote);
    if (voice) {
      voice.noteOff();
      this.activeVoices.delete(midiNote);

      // Log MIDI event
      this.midiRecorder.logNoteOff(midiNote);

      // Return voice to pool after release time
      setTimeout(
        () => {
          if (this.voicePool.length < this.MAX_VOICES) {
            this.voicePool.push(voice);
          }
        },
        this.release * 1000 + 100,
      );
    }
  }

  private midiToFrequency(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  // Parameter setters
  setIsMonophonic(value: boolean) {
    this.isMonophonic = value;
  }

  setWaveType(type: OscillatorType): void {
    this.waveType = type;
    // Update all active voices
    this.activeVoices.forEach((voice) => {
      voice.setWaveType(type);
    });
  }

  setEnvelope(
    attack: number,
    decay: number,
    sustain: number,
    release: number,
  ): void {
    this.attack = attack;
    this.decay = decay;
    this.sustain = sustain;
    this.release = release;
    // Update all active voices
    this.activeVoices.forEach((voice) => {
      voice.setEnvelope(attack, decay, sustain, release);
    });
  }

  setFilter1(
    type: BiquadFilterType,
    frequency: number,
    q: number,
    envAmount?: number,
  ): void {
    this.filter1Type = type;
    this.filter1Frequency = frequency;
    this.filter1Q = q;
    if (envAmount !== undefined) {
      this.filter1EnvAmount = envAmount;
    }
    // Update all active voices
    this.activeVoices.forEach((voice) => {
      voice.setFilter1(type, frequency, q, this.filter1EnvAmount);
    });
  }

  setFilter2(
    type: BiquadFilterType,
    frequency: number,
    q: number,
    envAmount?: number,
  ): void {
    this.filter2Type = type;
    this.filter2Frequency = frequency;
    this.filter2Q = q;
    if (envAmount !== undefined) {
      this.filter2EnvAmount = envAmount;
    }
    // Update all active voices
    this.activeVoices.forEach((voice) => {
      voice.setFilter2(type, frequency, q, this.filter2EnvAmount);
    });
  }

  setDelay(time: number, feedback: number, mix: number): void {
    this.delayTime = time;
    this.delayFeedbackAmount = feedback;
    this.delayMixAmount = mix;

    if (this.delayNode) {
      this.delayNode.delayTime.setTargetAtTime(
        time,
        this.audioContext!.currentTime,
        0.01,
      );
    }
    if (this.delayFeedback) {
      this.delayFeedback.gain.setTargetAtTime(
        feedback,
        this.audioContext!.currentTime,
        0.01,
      );
    }

    // Update delay bus gain (how much signal goes to delay)
    if (this.delayBus) {
      this.delayBus.gain.setTargetAtTime(
        mix,
        this.audioContext!.currentTime,
        0.01,
      );
    }

    // Update dry bus to compensate
    this.updateDryBus();
  }

  setReverb(mix: number): void {
    this.reverbMixAmount = mix;

    // Update reverb bus gain (how much signal goes to reverb)
    if (this.reverbBus) {
      this.reverbBus.gain.setTargetAtTime(
        mix,
        this.audioContext!.currentTime,
        0.01,
      );
    }

    // Update dry bus to compensate
    this.updateDryBus();
  }

  private updateDryBus(): void {
    if (this.dryBus) {
      const dryAmount = 1 - this.delayMixAmount - this.reverbMixAmount;
      this.dryBus.gain.setTargetAtTime(
        Math.max(0, dryAmount), // Ensure it doesn't go negative
        this.audioContext!.currentTime,
        0.01,
      );
    }
  }

  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        volume,
        this.audioContext!.currentTime,
        0.01,
      );
    }
  }

  // Parameter getters
  getIsMonophonic() {
    return this.isMonophonic;
  }

  getWaveType(): OscillatorType {
    return this.waveType;
  }

  getEnvelope(): {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  } {
    return {
      attack: this.attack,
      decay: this.decay,
      sustain: this.sustain,
      release: this.release,
    };
  }

  getFilter1(): {
    type: BiquadFilterType;
    frequency: number;
    q: number;
    envAmount: number;
  } {
    return {
      type: this.filter1Type,
      frequency: this.filter1Frequency,
      q: this.filter1Q,
      envAmount: this.filter1EnvAmount,
    };
  }

  getFilter2(): {
    type: BiquadFilterType;
    frequency: number;
    q: number;
    envAmount: number;
  } {
    return {
      type: this.filter2Type,
      frequency: this.filter2Frequency,
      q: this.filter2Q,
      envAmount: this.filter2EnvAmount,
    };
  }

  getDelay(): { time: number; feedback: number; mix: number } {
    return {
      time: this.delayTime,
      feedback: this.delayFeedbackAmount,
      mix: this.delayMixAmount,
    };
  }

  getReverb(): { mix: number } {
    return {
      mix: this.reverbMixAmount,
    };
  }

  // Chaos mode - enables "happy accidents" from gain node accumulation
  setChaosMode(enabled: boolean): void {
    this.chaosMode = enabled;

    if (!this.audioContext) return;

    // When switching modes, reconnect all voices appropriately
    const allVoices = [
      ...this.voicePool,
      ...Array.from(this.activeVoices.values()),
    ];

    if (enabled) {
      // Disconnect from clean buses (chaos mode will create its own connections)
      allVoices.forEach((voice) => {
        voice.disconnect();
      });
    } else {
      // Reconnect to clean buses
      allVoices.forEach((voice) => {
        voice.disconnect();
        if (this.dryBus) voice.connect(this.dryBus);
        if (this.delayBus) voice.connect(this.delayBus);
        if (this.reverbBus) voice.connect(this.reverbBus);
      });
    }
  }

  getChaosMode(): boolean {
    return this.chaosMode;
  }

  // Damage mode - allows duplicate MIDI notes for overdriven accumulation
  setDamageMode(enabled: boolean): void {
    this.damageMode = enabled;

    // When disabling damage mode, stop all playing notes to prevent infinite sustain
    if (!enabled && this.audioContext) {
      // Stop all active voices
      this.activeVoices.forEach((voice) => {
        voice.noteOff();
      });

      // Clear active voices map
      this.activeVoices.clear();

      // Return all voices to pool after release time
      setTimeout(
        () => {
          // Recreate voice pool to ensure clean state
          const allVoices = [
            ...this.voicePool,
            ...Array.from(this.activeVoices.values()),
          ];
          this.voicePool = allVoices.slice(0, this.MAX_VOICES);
        },
        this.release * 1000 + 100,
      );
    }
  }

  getDamageMode(): boolean {
    return this.damageMode;
  }

  getMasterGain(): GainNode | null {
    return this.masterGain;
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  // MIDI Export functionality
  exportMIDI(): Blob | null {
    return this.midiRecorder.exportMIDI();
  }

  clearMIDI(): void {
    this.midiRecorder.clear();
  }

  getMIDIEventCount(): number {
    return this.midiRecorder.getEventCount();
  }
}
