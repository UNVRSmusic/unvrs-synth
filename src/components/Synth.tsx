import "./Logo.css";
import "./Synth.css";
import { AudioEngine } from "../audio/AudioEngine";
import { Logo } from "./Logo";
import { useState, useEffect, useCallback } from "react";
import ArpeggiatorSection from "./ArpeggiatorSection";
import EffectsSection from "./EffectsSection";
import EnvelopeSection from "./EnvelopeSection";
import FilterSection from "./FilterSection";
import Footer from "./Footer";
import Keyboard from "./Keyboard";
import MIDIStatus from "./MIDIStatus";
import OscillatorSection from "./OscillatorSection";
import RecorderSection from "./RecorderSection";

interface SynthProps {
  audioEngine: AudioEngine;
}

const Synth = ({ audioEngine }: SynthProps) => {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [midiDevices, setMidiDevices] = useState<WebMidi.MIDIInput[]>([]);
  const [octaveOffset, setOctaveOffset] = useState(0);
  const [chaosMode, setChaosMode] = useState(false);
  const [damageMode, setDamageMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [arpEnabled, setArpEnabled] = useState(false);

  useEffect(() => {
    // Setup MIDI
    setupMIDI();

    // Setup arpeggiator visualization callback
    audioEngine.setArpVisualizationCallback((noteOn, noteOff) => {
      if (noteOn !== null) {
        setActiveNotes((prev) => new Set(prev).add(noteOn));
      }
      if (noteOff !== null) {
        setActiveNotes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(noteOff);
          return newSet;
        });
      }
    });

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

  const handleNoteOn = useCallback(
    (midiNote: number) => {
      console.log("handleNoteOn called", { midiNote, damageMode });
      audioEngine.noteOn(midiNote, 0.8);
      setActiveNotes((prev) => {
        const newSet = new Set(prev).add(midiNote);
        console.log("setActiveNotes after add", {
          midiNote,
          size: newSet.size,
        });
        return newSet;
      });
    },
    [audioEngine, damageMode],
  );

  const handleNoteOff = useCallback(
    (midiNote: number) => {
      console.log("handleNoteOff called", { midiNote });
      audioEngine.noteOff(midiNote);
      setActiveNotes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(midiNote);
        console.log("setActiveNotes after delete", {
          midiNote,
          size: newSet.size,
        });
        return newSet;
      });
    },
    [audioEngine],
  );

  const handleArpToggle = () => {
    setArpEnabled(!arpEnabled);
    audioEngine.setArpEnabled(!arpEnabled);
    gtag("event", "handle_arp_toggle");
  };

  const handleChaosToggle = () => {
    const newChaosMode = !chaosMode;
    setChaosMode(newChaosMode);
    audioEngine.setChaosMode(newChaosMode);
    gtag("event", "handle_chaos_toggle");
  };

  const handleDamageToggle = () => {
    const newDamageMode = !damageMode;
    setDamageMode(newDamageMode);
    audioEngine.setDamageMode(newDamageMode);
    gtag("event", "handle_damage_toggle");

    // When disabling damage mode, clear all active notes in UI
    if (!newDamageMode) {
      setActiveNotes(new Set());
    }
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });

      gtag("event", "handle_fullscreen_toggle");
    } else {
      document.exitFullscreen();
    }
  };

  // Listen for fullscreen changes (e.g., user pressing ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="synth">
      <div className="logo-container">
        <Logo className="synth-logo" width={240} />
      </div>

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

        <div className="modes-container">
          <button
            className={`arp-toggle ${arpEnabled ? "active" : ""}`}
            onClick={handleArpToggle}
            title="Toggle arpeggiator panel"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 20h4V12H3v8zm7 0h4V4h-4v16zm7 0h4v-8h-4v8z" />
            </svg>
          </button>
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
          <button
            className={`fullscreen-toggle ${isFullscreen ? "active" : ""}`}
            onClick={handleFullscreenToggle}
            title="Toggle fullscreen mode (ESC to exit)"
          >
            {isFullscreen ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
              </svg>
            )}
          </button>
        </div>

        <RecorderSection audioEngine={audioEngine} />
      </div>

      <div className="synth-controls">
        {arpEnabled && <ArpeggiatorSection audioEngine={audioEngine} />}
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

      <Footer />
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
    z: 56,
  };
  const baseNote = mapping[key.toLowerCase()];
  return baseNote !== undefined ? baseNote + octaveOffset * 12 : null;
};

export default Synth;
