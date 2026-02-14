import { useState, useEffect } from "react";
import { AudioEngine } from "../audio/AudioEngine";
import Keyboard from "./Keyboard";
import OscillatorSection from "./OscillatorSection";
import EnvelopeSection from "./EnvelopeSection";
import FilterSection from "./FilterSection";
import EffectsSection from "./EffectsSection";
import RecorderSection from "./RecorderSection";
import MIDIStatus from "./MIDIStatus";
import "./Synth.css";

interface SynthProps {
  audioEngine: AudioEngine;
}

const Synth = ({ audioEngine }: SynthProps) => {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [midiDevices, setMidiDevices] = useState<WebMidi.MIDIInput[]>([]);
  const [octaveOffset, setOctaveOffset] = useState(0);
  const [chaosMode, setChaosMode] = useState(false);
  const [damageMode, setDamageMode] = useState(false);

  useEffect(() => {
    // Setup MIDI
    setupMIDI();

    // Setup computer keyboard
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      // Octave controls
      if (e.key.toLowerCase() === "y") {
        setOctaveOffset((prev) => Math.max(prev - 1, -3));
        return;
      }
      if (e.key.toLowerCase() === "x") {
        setOctaveOffset((prev) => Math.min(prev + 1, 3));
        return;
      }

      const midiNote = keyToMidiNote(e.key, octaveOffset);
      if (midiNote !== null && !activeNotes.has(midiNote)) {
        audioEngine.noteOn(midiNote, 0.8);
        setActiveNotes((prev) => new Set(prev).add(midiNote));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "x" || e.key.toLowerCase() === "y") return;

      const midiNote = keyToMidiNote(e.key, octaveOffset);
      if (midiNote !== null) {
        audioEngine.noteOff(midiNote);
        setActiveNotes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(midiNote);
          return newSet;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [audioEngine, activeNotes, octaveOffset]);

  const setupMIDI = async () => {
    if (!navigator.requestMIDIAccess) return;

    try {
      const midiAccess = await navigator.requestMIDIAccess();
      const inputs = Array.from(midiAccess.inputs.values());
      setMidiDevices(inputs);

      inputs.forEach((input) => {
        input.onmidimessage = handleMIDIMessage;
      });
    } catch (error) {
      console.log("MIDI access denied:", error);
    }
  };

  const handleMIDIMessage = (message: WebMidi.MIDIMessageEvent) => {
    const [status, note, velocity] = message.data;
    const command = status >> 4;

    if (command === 9 && velocity > 0) {
      // Note on - in damage mode, allow duplicates for overdriven sound
      if (damageMode || !activeNotes.has(note)) {
        audioEngine.noteOn(note, velocity / 127);
        setActiveNotes((prev) => new Set(prev).add(note));
      }
    } else if (command === 8 || (command === 9 && velocity === 0)) {
      // Note off
      audioEngine.noteOff(note);
      setActiveNotes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
    }
  };

  const handleNoteOn = (midiNote: number) => {
    audioEngine.noteOn(midiNote, 0.8);
    setActiveNotes((prev) => new Set(prev).add(midiNote));
  };

  const handleNoteOff = (midiNote: number) => {
    audioEngine.noteOff(midiNote);
    setActiveNotes((prev) => {
      const newSet = new Set(prev);
      newSet.delete(midiNote);
      return newSet;
    });
  };

  const handleChaosToggle = () => {
    const newChaosMode = !chaosMode;
    setChaosMode(newChaosMode);
    audioEngine.setChaosMode(newChaosMode);
  };

  const handleDamageToggle = () => {
    const newDamageMode = !damageMode;
    setDamageMode(newDamageMode);
    audioEngine.setDamageMode(newDamageMode);
  };

  return (
    <div className="synth">
      <div className="synth-header">
        <MIDIStatus devices={midiDevices} />
        <div className="octave-display">
          <span className="octave-label">Octave:</span>
          <span className="octave-value">
            {octaveOffset > 0 ? "+" : ""}
            {octaveOffset}
          </span>
          <span className="octave-hint">(X/Y)</span>
        </div>
        <button
          className={`chaos-toggle ${chaosMode ? "active" : ""}`}
          onClick={handleChaosToggle}
          title="Enable chaos mode - happy accidents from gain node accumulation"
        >
          🌀 Chaos
        </button>
        <button
          className={`damage-toggle ${damageMode ? "active" : ""}`}
          onClick={handleDamageToggle}
          title="Enable damage mode - allow duplicate MIDI notes for overdriven sound"
        >
          ⚡ Damage
        </button>
        <RecorderSection audioEngine={audioEngine} />
      </div>

      <div className="synth-controls">
        <OscillatorSection audioEngine={audioEngine} />
        <EnvelopeSection audioEngine={audioEngine} />
        <FilterSection audioEngine={audioEngine} filterNumber={1} />
        <FilterSection audioEngine={audioEngine} filterNumber={2} />
        <EffectsSection audioEngine={audioEngine} />
      </div>

      <Keyboard
        onNoteOn={handleNoteOn}
        onNoteOff={handleNoteOff}
        activeNotes={activeNotes}
      />
    </div>
  );
};

// Keyboard mapping (2 octaves starting at C3)
const keyToMidiNote = (
  key: string,
  octaveOffset: number = 0,
): number | null => {
  const mapping: { [key: string]: number } = {
    a: 48,
    w: 49,
    s: 50,
    e: 51,
    d: 52,
    f: 53,
    t: 54,
    g: 55,
    // y is now used for octave shift
    h: 57,
    u: 58,
    j: 59,
    k: 60,
    o: 61,
    l: 62,
    p: 63,
    ";": 64,
    "'": 65,
  };
  const baseNote = mapping[key.toLowerCase()];
  return baseNote !== undefined ? baseNote + octaveOffset * 12 : null;
};

export default Synth;
