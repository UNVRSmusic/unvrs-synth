import { useState } from "react";
import { AudioEngine } from "../audio/AudioEngine";
import "./ControlSection.css";

interface OscillatorSectionProps {
  audioEngine: AudioEngine;
}

const OscillatorSection = ({ audioEngine }: OscillatorSectionProps) => {
  const [waveType, setWaveType] = useState<OscillatorType>("sawtooth");

  const handleWaveTypeChange = (type: OscillatorType) => {
    setWaveType(type);
    audioEngine.setWaveType(type);
  };

  return (
    <div className="control-section">
      <h3>Oscillator</h3>
      <div className="wave-selector">
        {(["sine", "square", "sawtooth", "triangle"] as OscillatorType[]).map(
          (type) => (
            <button
              key={type}
              className={`wave-btn ${waveType === type ? "active" : ""}`}
              onClick={() => handleWaveTypeChange(type)}
            >
              {type}
            </button>
          ),
        )}
      </div>
    </div>
  );
};

export default OscillatorSection;
