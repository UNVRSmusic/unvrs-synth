import "./ControlSection.css";
import { AudioEngine } from "../audio/AudioEngine";
import { useState } from "react";

interface EnvelopeSectionProps {
  audioEngine: AudioEngine;
}

const EnvelopeSection = ({ audioEngine }: EnvelopeSectionProps) => {
  const envelope = audioEngine.getEnvelope();
  const [attack, setAttack] = useState(envelope.attack);
  const [decay, setDecay] = useState(envelope.decay);
  const [sustain, setSustain] = useState(envelope.sustain);
  const [release, setRelease] = useState(envelope.release);

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
            max="2"
            min="0.001"
            onChange={(e) => handleAttackChange(parseFloat(e.target.value))}
            step="0.001"
            type="range"
            value={attack}
          />
          <span className="value">{attack.toFixed(3)}s</span>
        </div>
        <div className="control-group">
          <label>Decay</label>
          <input
            max="2"
            min="0.001"
            onChange={(e) => handleDecayChange(parseFloat(e.target.value))}
            step="0.001"
            type="range"
            value={decay}
          />
          <span className="value">{decay.toFixed(3)}s</span>
        </div>
        <div className="control-group">
          <label>Sustain</label>
          <input
            max="1"
            min="0"
            onChange={(e) => handleSustainChange(parseFloat(e.target.value))}
            step="0.01"
            type="range"
            value={sustain}
          />
          <span className="value">{sustain.toFixed(2)}</span>
        </div>
        <div className="control-group">
          <label>Release</label>
          <input
            max="3"
            min="0.001"
            onChange={(e) => handleReleaseChange(parseFloat(e.target.value))}
            step="0.001"
            type="range"
            value={release}
          />
          <span className="value">{release.toFixed(3)}s</span>
        </div>
      </div>
    </div>
  );
};

export default EnvelopeSection;
