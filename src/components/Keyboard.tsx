import "./Keyboard.css";
import { useRef, useCallback, useEffect } from "react";

interface KeyboardProps {
  onNoteOn: (midiNote: number) => void;
  onNoteOff: (midiNote: number) => void;
  activeNotes: Set<number>;
}

interface KeyData {
  isBlack: boolean;
  midiNote: number;
  noteInOctave: number;
  noteName: string;
  octave: number;
}

const Keyboard = ({ onNoteOn, onNoteOff, activeNotes }: KeyboardProps) => {
  const octaves = 5;
  const startNote = 36; // C2
  const activePointersRef = useRef<Map<number, number>>(new Map()); // pointerId -> midiNote
  const keyboardRef = useRef<HTMLDivElement>(null);

  const NOTE_NAMES = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const BLACK_KEY_INDICES = [1, 3, 6, 8, 10];

  const isBlackKey = (noteInOctave: number): boolean => {
    return BLACK_KEY_INDICES.includes(noteInOctave);
  };

  const getKeyData = (index: number): KeyData => {
    const midiNote = startNote + index;
    const noteInOctave = index % 12;
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = NOTE_NAMES[noteInOctave];

    return {
      isBlack: isBlackKey(noteInOctave),
      midiNote,
      noteInOctave,
      noteName,
      octave,
    };
  };

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, midiNote: number) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      activePointersRef.current.set(e.pointerId, midiNote);
      onNoteOn(midiNote);
    },
    [onNoteOn],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent, _midiNote: number) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget as HTMLElement;
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }

      const activeNote = activePointersRef.current.get(e.pointerId);
      if (activeNote !== undefined) {
        onNoteOff(activeNote);
        activePointersRef.current.delete(e.pointerId);
      }
    },
    [onNoteOff],
  );

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent, midiNote: number) => {
      // If pointer is already down (from another key), switch to this key
      if (e.buttons === 1 && !activePointersRef.current.has(e.pointerId)) {
        e.preventDefault();
        const target = e.currentTarget as HTMLElement;
        target.setPointerCapture(e.pointerId);

        activePointersRef.current.set(e.pointerId, midiNote);
        onNoteOn(midiNote);
      }
    },
    [onNoteOn],
  );

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent, _midiNote: number) => {
      // Only release if we're not captured (captured means we'll handle in pointerup)
      const target = e.currentTarget as HTMLElement;
      if (!target.hasPointerCapture(e.pointerId)) {
        const activeNote = activePointersRef.current.get(e.pointerId);
        if (activeNote !== undefined) {
          onNoteOff(activeNote);
          activePointersRef.current.delete(e.pointerId);
        }
      }
    },
    [onNoteOff],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activePointersRef.current.forEach((midiNote) => {
        onNoteOff(midiNote);
      });
      activePointersRef.current.clear();
    };
  }, [onNoteOff]);

  const renderOctave = (octaveIndex: number) => {
    const whiteKeys: JSX.Element[] = [];
    const blackKeys: JSX.Element[] = [];
    const octaveStartNote = octaveIndex * 12;

    // White keys pattern: C D E F G A B
    const whiteKeyIndices = [0, 2, 4, 5, 7, 9, 11];

    whiteKeyIndices.forEach((noteOffset) => {
      const keyData = getKeyData(octaveStartNote + noteOffset);
      const isActive = activeNotes.has(keyData.midiNote);

      whiteKeys.push(
        <div
          aria-label={`${keyData.noteName}${keyData.octave}`}
          aria-pressed={isActive}
          className={`key white ${isActive ? "active" : ""}`}
          data-note={keyData.midiNote}
          key={keyData.midiNote}
          onContextMenu={(e) => e.preventDefault()}
          onPointerDown={(e) => handlePointerDown(e, keyData.midiNote)}
          onPointerEnter={(e) => handlePointerEnter(e, keyData.midiNote)}
          onPointerLeave={(e) => handlePointerLeave(e, keyData.midiNote)}
          onPointerUp={(e) => handlePointerUp(e, keyData.midiNote)}
          role="button"
          tabIndex={0}
        >
          <span className="key-label">
            {keyData.noteName}
            {keyData.octave}
          </span>
        </div>,
      );
    });

    // Black keys - positioned between specific white keys
    // Pattern: C# D# _ F# G# A# _
    const blackKeyPositions = [
      { noteOffset: 1, position: 0 }, // C# after C
      { noteOffset: 3, position: 1 }, // D# after D
      { noteOffset: 6, position: 3 }, // F# after F
      { noteOffset: 8, position: 4 }, // G# after G
      { noteOffset: 10, position: 5 }, // A# after A
    ];

    blackKeyPositions.forEach(({ noteOffset, position }) => {
      const keyData = getKeyData(octaveStartNote + noteOffset);
      const isActive = activeNotes.has(keyData.midiNote);

      blackKeys.push(
        <div
          aria-label={`${keyData.noteName}${keyData.octave}`}
          aria-pressed={isActive}
          className={`key black ${isActive ? "active" : ""}`}
          data-note={keyData.midiNote}
          key={keyData.midiNote}
          onContextMenu={(e) => e.preventDefault()}
          onPointerDown={(e) => handlePointerDown(e, keyData.midiNote)}
          onPointerEnter={(e) => handlePointerEnter(e, keyData.midiNote)}
          onPointerLeave={(e) => handlePointerLeave(e, keyData.midiNote)}
          onPointerUp={(e) => handlePointerUp(e, keyData.midiNote)}
          role="button"
          style={{ "--black-key-position": position } as React.CSSProperties}
          tabIndex={0}
        >
          <span className="key-label">
            {keyData.noteName}
            {keyData.octave}
          </span>
        </div>,
      );
    });

    return (
      <div key={`octave-${octaveIndex}`} className="octave">
        <div className="white-keys">{whiteKeys}</div>
        <div className="black-keys">{blackKeys}</div>
      </div>
    );
  };

  return (
    <div className="keyboard-container">
      <div
        aria-label="Virtual Piano Keyboard"
        className="keyboard"
        ref={keyboardRef}
        role="group"
      >
        {Array.from({ length: octaves }, (_, i) => renderOctave(i))}
      </div>
      <div className="keyboard-hint">
        Use computer keyboard (AWSEDFTGZHUJKOLP;') or click/touch/MIDI to play •
        Y/X to shift octaves
      </div>
    </div>
  );
};

export default Keyboard;
