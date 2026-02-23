import "./ControlSection.css";
import { AudioEngine } from "../audio/AudioEngine";
import { useState } from "react";

interface OscillatorSectionProps {
  audioEngine: AudioEngine;
}

const OscillatorSection = ({ audioEngine }: OscillatorSectionProps) => {
  const [waveType, setWaveType] = useState<OscillatorType>(
    audioEngine.getWaveType(),
  );
  const [noiseVolume, setNoiseVolume] = useState(audioEngine.getNoiseVolume());

  // const [isMonophonic, setIsMonophonic] = useState(
  //   audioEngine.getIsMonophonic(),
  // );

  const handleWaveTypeChange = (type: OscillatorType) => {
    setWaveType(type);
    audioEngine.setWaveType(type);
  };

  const handleNoiseVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setNoiseVolume(value);
    audioEngine.setNoiseVolume(value);
  };

  // const handleMonophonicChange = (value: boolean) => {
  //   setIsMonophonic(value);
  //   audioEngine.setIsMonophonic(value);
  // };

  return (
    <div className="control-section">
      <h3>Oscillator</h3>
      <div className="osc-container">
        <div className="osc-group">
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

        <div className="control-group">
          <label>Noise: {noiseVolume.toFixed(2)}</label>
          <input
            max="1"
            min="0"
            onChange={handleNoiseVolumeChange}
            step="0.01"
            type="range"
            value={noiseVolume}
          />
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
