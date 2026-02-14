import { Voice } from "./Voice";

export class AudioEngine {
  private static instance: AudioEngine;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeVoices: Map<number, Voice> = new Map();
  private voicePool: Voice[] = [];
  private readonly MAX_VOICES = 16;

  // Synth parameters
  private waveType: OscillatorType = "sawtooth";
  private attack = 0.01;
  private decay = 0.1;
  private sustain = 0.7;
  private release = 0.3;

  // Filter parameters
  private filter1Type: BiquadFilterType = "lowpass";
  private filter1Frequency = 2000;
  private filter1Q = 1;

  private filter2Type: BiquadFilterType = "highpass";
  private filter2Frequency = 100;
  private filter2Q = 1;

  // Effects
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayMix: GainNode | null = null;
  private delayTime = 0.25;
  private delayFeedbackAmount = 0.3;
  private delayMixAmount = 0;

  private reverbNode: ConvolverNode | null = null;
  private reverbMix: GainNode | null = null;
  private reverbMixAmount = 0;

  private constructor() {}

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  async initialize(): Promise<void> {
    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.3;

    // Setup effects chain
    this.setupEffects();

    // Create voice pool
    for (let i = 0; i < this.MAX_VOICES; i++) {
      const voice = new Voice(this.audioContext);
      this.voicePool.push(voice);
    }
  }

  private setupEffects(): void {
    if (!this.audioContext || !this.masterGain) return;

    // Delay effect
    this.delayNode = this.audioContext.createDelay(2.0);
    this.delayNode.delayTime.value = this.delayTime;

    this.delayFeedback = this.audioContext.createGain();
    this.delayFeedback.gain.value = this.delayFeedbackAmount;

    this.delayMix = this.audioContext.createGain();
    this.delayMix.gain.value = this.delayMixAmount;

    // Delay routing: input -> delay -> feedback -> delay
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.delayMix);

    // Simple reverb (we'll use a basic impulse response)
    this.reverbNode = this.audioContext.createConvolver();
    this.reverbMix = this.audioContext.createGain();
    this.reverbMix.gain.value = this.reverbMixAmount;

    // Create a simple impulse response
    this.createSimpleReverb();

    this.reverbNode.connect(this.reverbMix);

    // Final routing
    this.delayMix.connect(this.masterGain);
    this.reverbMix.connect(this.masterGain);
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

    // Configure voice
    voice.setWaveType(this.waveType);
    voice.setEnvelope(this.attack, this.decay, this.sustain, this.release);
    voice.setFilter1(this.filter1Type, this.filter1Frequency, this.filter1Q);
    voice.setFilter2(this.filter2Type, this.filter2Frequency, this.filter2Q);

    // Connect voice to effects
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

    // Start the note
    const frequency = this.midiToFrequency(midiNote);
    voice.noteOn(frequency, velocity);

    this.activeVoices.set(midiNote, voice);
  }

  noteOff(midiNote: number): void {
    const voice = this.activeVoices.get(midiNote);
    if (voice) {
      voice.noteOff();
      this.activeVoices.delete(midiNote);

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
  setWaveType(type: OscillatorType): void {
    this.waveType = type;
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
  }

  setFilter1(type: BiquadFilterType, frequency: number, q: number): void {
    this.filter1Type = type;
    this.filter1Frequency = frequency;
    this.filter1Q = q;
  }

  setFilter2(type: BiquadFilterType, frequency: number, q: number): void {
    this.filter2Type = type;
    this.filter2Frequency = frequency;
    this.filter2Q = q;
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
    if (this.delayMix) {
      this.delayMix.gain.setTargetAtTime(
        mix,
        this.audioContext!.currentTime,
        0.01,
      );
    }
  }

  setReverb(mix: number): void {
    this.reverbMixAmount = mix;
    if (this.reverbMix) {
      this.reverbMix.gain.setTargetAtTime(
        mix,
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

  // Recording functionality
  async startRecording(): Promise<MediaRecorder | null> {
    if (!this.audioContext || !this.masterGain) return null;

    const destination = this.audioContext.createMediaStreamDestination();
    this.masterGain.connect(destination);

    const mediaRecorder = new MediaRecorder(destination.stream);
    return mediaRecorder;
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }
}
