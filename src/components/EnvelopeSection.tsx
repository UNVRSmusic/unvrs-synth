import { useState } from "react";
import { AudioEngine } from "../audio/AudioEngine";
import "./ControlSection.css";

interface EnvelopeSectionProps {
  audioEngine: AudioEngine;
}

const EnvelopeSection = ({ audioEngine }: EnvelopeSectionProps) => {
  const [attack, setAttack] = useState(0.01);
  const [decay, setDecay] = useState(0.1);
  const [sustain, setSustain] = useState(0.7);
  const [release, setRelease] = useState(0.3);

  const handleAttackChange = (value: number) => {
    setAttack(value);
    audioEngine.setEnvelope(value, decay, sustain, release);
  };

  const handleDecayChange = (value: number) => {
    setDecay(value);
    audioEngine.setEnvelope(attack, value, sustain, release);
  };

  const handleSustainChange = (value: number) => {
    setSustain(value);
    audioEngine.setEnvelope(attack, decay, value, release);
  };

  const handleReleaseChange = (value: number) => {
    setRelease(value);
    audioEngine.setEnvelope(attack, decay, sustain, value);
  };

  return (
    <div className="control-section">
      <h3>ADSR Envelope</h3>
      <div className="controls-grid">
        <div className="control-group">
          <label>Attack</label>
          <input
            type="range"
            min="0.001"
            max="2"
            step="0.001"
            value={attack}
            onChange={(e) => handleAttackChange(parseFloat(e.target.value))}
          />
          <span className="value">{attack.toFixed(3)}s</span>
        </div>
        <div className="control-group">
          <label>Decay</label>
          <input
            type="range"
            min="0.001"
            max="2"
            step="0.001"
            value={decay}
            onChange={(e) => handleDecayChange(parseFloat(e.target.value))}
          />
          <span className="value">{decay.toFixed(3)}s</span>
        </div>
        <div className="control-group">
          <label>Sustain</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={sustain}
            onChange={(e) => handleSustainChange(parseFloat(e.target.value))}
          />
          <span className="value">{sustain.toFixed(2)}</span>
        </div>
        <div className="control-group">
          <label>Release</label>
          <input
            type="range"
            min="0.001"
            max="3"
            step="0.001"
            value={release}
            onChange={(e) => handleReleaseChange(parseFloat(e.target.value))}
          />
          <span className="value">{release.toFixed(3)}s</span>
        </div>
      </div>
    </div>
  );
};

export default EnvelopeSection;
