import { useState } from "react";
import { AudioEngine } from "../audio/AudioEngine";
import "./ControlSection.css";

interface OscillatorSectionProps {
  audioEngine: AudioEngine;
}

const OscillatorSection = ({ audioEngine }: OscillatorSectionProps) => {
  const [waveType, setWaveType] = useState<OscillatorType>(
    audioEngine.getWaveType(),
  );

  const [isMonophonic, setIsMonophonic] = useState(
    audioEngine.getIsMonophonic(),
  );

  const handleWaveTypeChange = (type: OscillatorType) => {
    setWaveType(type);
    audioEngine.setWaveType(type);
  };

  const handleMonophonicChange = (value: boolean) => {
    setIsMonophonic(value);
    audioEngine.setIsMonophonic(value);
  };

  return (
    <div className="control-section">
      <h3>Oscillator</h3>
      <div className="osc-container">
        <div className="btn-group">
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

        {/* <div className="btn-group">
          <button
            className={`mono-btn ${isMonophonic && "active"}`}
            onClick={() => handleMonophonicChange(!isMonophonic)}
          >
            Mono
          </button>

          <button className="portamento-btn" onClick={() => {}}>
            Glide
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default OscillatorSection;
