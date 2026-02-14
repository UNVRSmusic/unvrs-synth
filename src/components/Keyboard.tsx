import "./Keyboard.css";

interface KeyboardProps {
  onNoteOn: (midiNote: number) => void;
  onNoteOff: (midiNote: number) => void;
  activeNotes: Set<number>;
}

const Keyboard = ({ onNoteOn, onNoteOff, activeNotes }: KeyboardProps) => {
  const octaves = 3;
  const startNote = 48; // C3

  const isBlackKey = (noteInOctave: number): boolean => {
    return [1, 3, 6, 8, 10].includes(noteInOctave);
  };

  const renderKeys = () => {
    const keys = [];
    const totalNotes = octaves * 12;

    for (let i = 0; i < totalNotes; i++) {
      const midiNote = startNote + i;
      const noteInOctave = i % 12;
      const isBlack = isBlackKey(noteInOctave);
      const isActive = activeNotes.has(midiNote);

      if (!isBlack) {
        keys.push(
          <div
            key={midiNote}
            className={`key white ${isActive ? "active" : ""}`}
            onMouseDown={() => onNoteOn(midiNote)}
            onMouseUp={() => onNoteOff(midiNote)}
            onMouseLeave={() =>
              activeNotes.has(midiNote) && onNoteOff(midiNote)
            }
          />,
        );
      }
    }

    return keys;
  };

  const renderBlackKeys = () => {
    const keys = [];
    const totalNotes = octaves * 12;

    for (let i = 0; i < totalNotes; i++) {
      const midiNote = startNote + i;
      const noteInOctave = i % 12;
      const isBlack = isBlackKey(noteInOctave);
      const isActive = activeNotes.has(midiNote);

      if (isBlack) {
        const position = calculateBlackKeyPosition(i);
        keys.push(
          <div
            key={midiNote}
            className={`key black ${isActive ? "active" : ""}`}
            style={{ left: `${position}px` }}
            onMouseDown={() => onNoteOn(midiNote)}
            onMouseUp={() => onNoteOff(midiNote)}
            onMouseLeave={() =>
              activeNotes.has(midiNote) && onNoteOff(midiNote)
            }
          />,
        );
      }
    }

    return keys;
  };

  const calculateBlackKeyPosition = (noteIndex: number): number => {
    const whiteKeyWidth = 40;
    const octaveIndex = Math.floor(noteIndex / 12);
    const noteInOctave = noteIndex % 12;

    const blackKeyOffsets = [0.7, 0, 1.8, 0, 2.8, 0, 3.85, 0, 4.9, 0, 5.95, 0];
    const whiteKeysBeforeInOctave = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][
      noteInOctave
    ];

    return (
      (octaveIndex * 7 + whiteKeysBeforeInOctave) * whiteKeyWidth +
      blackKeyOffsets[noteInOctave] * whiteKeyWidth
    );
  };

  return (
    <div className="keyboard-container">
      <div className="keyboard">
        {renderKeys()}
        {renderBlackKeys()}
      </div>
      <div className="keyboard-hint">
        Use computer keyboard (AWSEDFTGHUJKOLP;') or click/MIDI to play • Y/X to
        shift octaves
      </div>
    </div>
  );
};

export default Keyboard;
