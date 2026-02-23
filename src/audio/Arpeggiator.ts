export type ArpMode = "up" | "down" | "updown" | "random" | "order";
export type ArpRate = "1/4" | "1/8" | "1/16" | "1/32";

export class Arpeggiator {
  private notes: Set<number> = new Set();
  private notesArray: number[] = [];
  private currentIndex = 0;
  private isRunning = false;
  private intervalId: number | null = null;
  private lastNote: number | null = null;
  private direction = 1; // 1 for up, -1 for down (used in updown mode)

  private enabled = false;
  private mode: ArpMode = "up";
  private bpm = 120;
  private rate: ArpRate = "1/16";
  private hold = false;

  private onNoteCallback: ((note: number, velocity: number) => void) | null =
    null;
  private offNoteCallback: ((note: number) => void) | null = null;

  constructor() {}

  setCallbacks(
    onNote: (note: number, velocity: number) => void,
    offNote: (note: number) => void,
  ): void {
    this.onNoteCallback = onNote;
    this.offNoteCallback = offNote;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (enabled) {
      this.start();
    } else {
      this.stop();
    }
  }

  setMode(mode: ArpMode): void {
    this.mode = mode;
  }

  setBPM(bpm: number): void {
    this.bpm = bpm;
    if (this.isRunning) {
      this.restartInterval();
    }
  }

  setRate(rate: ArpRate): void {
    this.rate = rate;
    if (this.isRunning) {
      this.restartInterval();
    }
  }

  setHold(hold: boolean): void {
    this.hold = hold;
    // If hold is disabled, clear all notes
    if (!hold) {
      this.notes.clear();
      this.updateNotesArray();
      this.stop();
      if (this.lastNote !== null && this.offNoteCallback) {
        this.offNoteCallback(this.lastNote);
        this.lastNote = null;
      }
    }
  }

  addNote(note: number): void {
    this.notes.add(note);
    this.updateNotesArray();
    if (this.enabled && !this.isRunning && this.notes.size > 0) {
      this.start();
    }
  }

  removeNote(note: number): void {
    // In hold mode, don't remove notes
    if (this.hold) {
      return;
    }

    this.notes.delete(note);
    this.updateNotesArray();
    if (this.notes.size === 0) {
      this.stop();
      if (this.lastNote !== null && this.offNoteCallback) {
        this.offNoteCallback(this.lastNote);
        this.lastNote = null;
      }
    }
  }

  private updateNotesArray(): void {
    this.notesArray = Array.from(this.notes).sort((a, b) => a - b);
    // Reset index when notes change
    if (this.currentIndex >= this.notesArray.length) {
      this.currentIndex = 0;
    }
  }

  private getNextNote(): number | null {
    if (this.notesArray.length === 0) return null;

    let nextNote: number;

    switch (this.mode) {
      case "up":
        nextNote = this.notesArray[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.notesArray.length;
        break;

      case "down":
        nextNote = this.notesArray[this.currentIndex];
        this.currentIndex =
          this.currentIndex === 0
            ? this.notesArray.length - 1
            : this.currentIndex - 1;
        break;

      case "updown":
        nextNote = this.notesArray[this.currentIndex];
        this.currentIndex += this.direction;

        // Reverse direction at boundaries
        if (this.currentIndex >= this.notesArray.length) {
          this.currentIndex = this.notesArray.length - 2;
          this.direction = -1;
          if (this.currentIndex < 0) this.currentIndex = 0;
        } else if (this.currentIndex < 0) {
          this.currentIndex = 1;
          this.direction = 1;
          if (this.currentIndex >= this.notesArray.length)
            this.currentIndex = 0;
        }
        break;

      case "random":
        const randomIndex = Math.floor(Math.random() * this.notesArray.length);
        nextNote = this.notesArray[randomIndex];
        break;

      case "order":
        // Play in the order they were pressed (insertion order)
        nextNote = this.notesArray[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.notesArray.length;
        break;

      default:
        nextNote = this.notesArray[0];
    }

    return nextNote;
  }

  private getIntervalMs(): number {
    // Calculate interval based on BPM and rate
    const beatDuration = 60000 / this.bpm; // ms per quarter note
    const rateMultiplier = {
      "1/4": 1,
      "1/8": 0.5,
      "1/16": 0.25,
      "1/32": 0.125,
    };
    return beatDuration * rateMultiplier[this.rate];
  }

  private start(): void {
    if (this.isRunning || this.notesArray.length === 0) return;

    this.isRunning = true;
    this.currentIndex = 0;
    this.direction = 1;

    const tick = () => {
      const note = this.getNextNote();
      if (note !== null && this.onNoteCallback) {
        // Turn off the last note
        if (this.lastNote !== null && this.offNoteCallback) {
          this.offNoteCallback(this.lastNote);
        }
        // Turn on the new note
        this.onNoteCallback(note, 0.8);
        this.lastNote = note;
      }
    };

    // Play first note immediately
    tick();

    // Schedule repeating ticks
    this.intervalId = window.setInterval(tick, this.getIntervalMs());
  }

  private stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private restartInterval(): void {
    // Stop the current interval without resetting state
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Restart with new timing, keeping current position
    const tick = () => {
      const note = this.getNextNote();
      if (note !== null && this.onNoteCallback) {
        // Turn off the last note
        if (this.lastNote !== null && this.offNoteCallback) {
          this.offNoteCallback(this.lastNote);
        }
        // Turn on the new note
        this.onNoteCallback(note, 0.8);
        this.lastNote = note;
      }
    };

    this.intervalId = window.setInterval(tick, this.getIntervalMs());
  }

  getState() {
    return {
      activeNotes: this.notes.size,
      bpm: this.bpm,
      enabled: this.enabled,
      hold: this.hold,
      isRunning: this.isRunning,
      mode: this.mode,
      rate: this.rate,
    };
  }
}
