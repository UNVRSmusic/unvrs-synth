import { Midi } from "@tonejs/midi";

interface MIDIEvent {
  timestamp: number; // performance.now() timestamp
  type: "noteOn" | "noteOff";
  note: number; // MIDI note number 0-127
  velocity: number; // 0-1 normalized
}

interface ActiveNote {
  note: number;
  velocity: number;
  startTime: number;
}

export class MIDIRecorder {
  private events: MIDIEvent[] = [];
  private startTime: number | null = null;
  private activeNotes: Map<number, ActiveNote> = new Map();

  logNoteOn(note: number, velocity: number): void {
    const timestamp = performance.now();

    // Initialize start time on first event
    if (this.startTime === null) {
      this.startTime = timestamp;
    }

    this.events.push({
      timestamp,
      type: "noteOn",
      note,
      velocity,
    });

    // Track active note for duration calculation
    this.activeNotes.set(note, {
      note,
      velocity,
      startTime: timestamp,
    });
  }

  logNoteOff(note: number): void {
    const timestamp = performance.now();

    if (this.startTime === null) {
      this.startTime = timestamp;
    }

    this.events.push({
      timestamp,
      type: "noteOff",
      note,
      velocity: 0,
    });

    // Remove from active notes
    this.activeNotes.delete(note);
  }

  getEventCount(): number {
    return this.events.length;
  }

  clear(): void {
    this.events = [];
    this.startTime = null;
    this.activeNotes.clear();
  }

  exportMIDI(): Blob | null {
    if (this.events.length === 0 || this.startTime === null) {
      return null;
    }

    // Create new MIDI file
    const midi = new Midi();
    const track = midi.addTrack();

    // Set tempo to 120 BPM (standard)
    midi.header.setTempo(120);

    // Convert events to note objects
    // Group note-on/note-off pairs
    const noteMap = new Map<number, { startTime: number; velocity: number }>();

    for (const event of this.events) {
      const relativeTime = (event.timestamp - this.startTime) / 1000; // Convert to seconds

      if (event.type === "noteOn") {
        noteMap.set(event.note, {
          startTime: relativeTime,
          velocity: event.velocity,
        });
      } else if (event.type === "noteOff") {
        const noteStart = noteMap.get(event.note);
        if (noteStart) {
          // Add note with duration
          track.addNote({
            midi: event.note,
            time: noteStart.startTime,
            duration: relativeTime - noteStart.startTime,
            velocity: noteStart.velocity,
          });
          noteMap.delete(event.note);
        }
      }
    }

    // Handle any notes that are still active (not released)
    // Give them a default duration of 0.5 seconds
    for (const [note, noteData] of noteMap.entries()) {
      track.addNote({
        midi: note,
        time: noteData.startTime,
        duration: 0.5,
        velocity: noteData.velocity,
      });
    }

    // Convert to array buffer and create blob
    const midiArray = midi.toArray();
    // Convert to regular Uint8Array to satisfy TypeScript
    const uint8Array = new Uint8Array(midiArray);
    const blob = new Blob([uint8Array], { type: "audio/midi" });

    return blob;
  }
}
