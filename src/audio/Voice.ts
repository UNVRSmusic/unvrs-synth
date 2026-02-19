export class Voice {
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode;
  private filter1: BiquadFilterNode;
  private filter2: BiquadFilterNode;
  private audioContext: AudioContext;
  private waveType: OscillatorType = "sine";

  private attack = 0.01;
  private decay = 0.1;
  private sustain = 0.7;
  private release = 0.3;

  // Filter envelope amounts
  private filter1EnvAmount = 0;
  private filter2EnvAmount = 0;
  private filter1BaseFreq = 2000;
  private filter2BaseFreq = 100;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;

    // Create nodes
    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = 0;

    this.filter1 = audioContext.createBiquadFilter();
    this.filter1.type = "lowpass";
    this.filter1.frequency.value = 2000;
    this.filter1.Q.value = 1;

    this.filter2 = audioContext.createBiquadFilter();
    this.filter2.type = "highpass";
    this.filter2.frequency.value = 100;
    this.filter2.Q.value = 1;

    // Connect filter chain
    this.filter1.connect(this.filter2);
    this.filter2.connect(this.gainNode);
  }

  setWaveType(type: OscillatorType): void {
    this.waveType = type;
    // If oscillator is currently playing, update it in real-time
    if (this.oscillator) {
      try {
        this.oscillator.type = type;
      } catch (e) {
        // Some browsers don't support real-time type change
        console.warn("Could not change oscillator type in real-time");
      }
    }
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

  setFilter1(type: BiquadFilterType, frequency: number, q: number, envAmount: number = 0): void {
    this.filter1.type = type;
    this.filter1BaseFreq = frequency;
    this.filter1EnvAmount = envAmount;
    this.filter1.frequency.setTargetAtTime(
      frequency,
      this.audioContext.currentTime,
      0.01,
    );
    this.filter1.Q.setTargetAtTime(q, this.audioContext.currentTime, 0.01);
  }

  setFilter2(type: BiquadFilterType, frequency: number, q: number, envAmount: number = 0): void {
    this.filter2.type = type;
    this.filter2BaseFreq = frequency;
    this.filter2EnvAmount = envAmount;
    this.filter2.frequency.setTargetAtTime(
      frequency,
      this.audioContext.currentTime,
      0.01,
    );
    this.filter2.Q.setTargetAtTime(q, this.audioContext.currentTime, 0.01);
  }

  noteOn(frequency: number, velocity: number): void {
    const now = this.audioContext.currentTime;

    // Clean up previous oscillator if exists
    if (this.oscillator) {
      try {
        this.oscillator.stop(now);
        this.oscillator.disconnect();
      } catch (e) {
        // Oscillator might already be stopped
      }
    }

    // Create new oscillator with current wave type
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = this.waveType; // Use stored wave type!
    this.oscillator.frequency.value = frequency;
    this.oscillator.connect(this.filter1);

    // ADSR envelope for gain
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.linearRampToValueAtTime(velocity, now + this.attack);
    this.gainNode.gain.linearRampToValueAtTime(
      velocity * this.sustain,
      now + this.attack + this.decay,
    );

    // ADSR envelope for filter cutoff modulation
    if (this.filter1EnvAmount !== 0) {
      const envMax = this.filter1BaseFreq + (this.filter1EnvAmount * 10000);
      const envSustain = this.filter1BaseFreq + (this.filter1EnvAmount * 10000 * this.sustain);
      this.filter1.frequency.cancelScheduledValues(now);
      this.filter1.frequency.setValueAtTime(this.filter1BaseFreq, now);
      this.filter1.frequency.linearRampToValueAtTime(envMax, now + this.attack);
      this.filter1.frequency.linearRampToValueAtTime(envSustain, now + this.attack + this.decay);
    }

    if (this.filter2EnvAmount !== 0) {
      const envMax = this.filter2BaseFreq + (this.filter2EnvAmount * 10000);
      const envSustain = this.filter2BaseFreq + (this.filter2EnvAmount * 10000 * this.sustain);
      this.filter2.frequency.cancelScheduledValues(now);
      this.filter2.frequency.setValueAtTime(this.filter2BaseFreq, now);
      this.filter2.frequency.linearRampToValueAtTime(envMax, now + this.attack);
      this.filter2.frequency.linearRampToValueAtTime(envSustain, now + this.attack + this.decay);
    }

    this.oscillator.start(now);
  }

  noteOff(): void {
    if (!this.oscillator) return;

    const now = this.audioContext.currentTime;

    // Release envelope for gain
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(0, now + this.release);

    // Release envelope for filters
    if (this.filter1EnvAmount !== 0) {
      this.filter1.frequency.cancelScheduledValues(now);
      this.filter1.frequency.setValueAtTime(this.filter1.frequency.value, now);
      this.filter1.frequency.linearRampToValueAtTime(this.filter1BaseFreq, now + this.release);
    }

    if (this.filter2EnvAmount !== 0) {
      this.filter2.frequency.cancelScheduledValues(now);
      this.filter2.frequency.setValueAtTime(this.filter2.frequency.value, now);
      this.filter2.frequency.linearRampToValueAtTime(this.filter2BaseFreq, now + this.release);
    }

    this.oscillator.stop(now + this.release);
    this.oscillator = null;
  }

  connect(destination: AudioNode): void {
    // Safety check: ensure we're connecting nodes from the same audio context
    if (destination.context !== this.audioContext) {
      console.error(
        "Cannot connect: destination belongs to a different AudioContext",
        {
          voiceContext: this.audioContext,
          destinationContext: destination.context,
        },
      );
      return;
    }
    this.gainNode.connect(destination);
  }

  disconnect(): void {
    this.gainNode.disconnect();
  }
}
