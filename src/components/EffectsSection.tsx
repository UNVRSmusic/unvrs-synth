import { useState } from "react";
import { AudioEngine } from "../audio/AudioEngine";
import "./ControlSection.css";

interface EffectsSectionProps {
  audioEngine: AudioEngine;
}

const EffectsSection = ({ audioEngine }: EffectsSectionProps) => {
  const delayDefaults = audioEngine.getDelay();
  const reverbDefaults = audioEngine.getReverb();

  const [delayTime, setDelayTime] = useState(delayDefaults.time);
  const [delayFeedback, setDelayFeedback] = useState(delayDefaults.feedback);
  const [delayMix, setDelayMix] = useState(delayDefaults.mix);
  const [reverbMix, setReverbMix] = useState(reverbDefaults.mix);

  const handleDelayTimeChange = (value: number) => {
    setDelayTime(value);
    audioEngine.setDelay(value, delayFeedback, delayMix);
  };

  const handleDelayFeedbackChange = (value: number) => {
    setDelayFeedback(value);
    audioEngine.setDelay(delayTime, value, delayMix);
  };

  const handleDelayMixChange = (value: number) => {
    setDelayMix(value);
    audioEngine.setDelay(delayTime, delayFeedback, value);
  };

  const handleReverbMixChange = (value: number) => {
    setReverbMix(value);
    audioEngine.setReverb(value);
  };

  return (
    <div className="control-section">
      <h3>Effects</h3>
      <div className="controls-grid">
        <div className="control-group">
          <label>Delay Time</label>
          <input
            type="range"
            min="0.01"
            max="2"
            step="0.01"
            value={delayTime}
            onChange={(e) => handleDelayTimeChange(parseFloat(e.target.value))}
          />
          <span className="value">{delayTime.toFixed(2)}s</span>
        </div>
        <div className="control-group">
          <label>Delay Feedback</label>
          <input
            type="range"
            min="0"
            max="0.95"
            step="0.01"
            value={delayFeedback}
            onChange={(e) =>
              handleDelayFeedbackChange(parseFloat(e.target.value))
            }
          />
          <span className="value">{(delayFeedback * 100).toFixed(0)}%</span>
        </div>
        <div className="control-group">
          <label>Delay Mix</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={delayMix}
            onChange={(e) => handleDelayMixChange(parseFloat(e.target.value))}
          />
          <span className="value">{(delayMix * 100).toFixed(0)}%</span>
        </div>
        <div className="control-group">
          <label>Reverb Mix</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={reverbMix}
            onChange={(e) => handleReverbMixChange(parseFloat(e.target.value))}
          />
          <span className="value">{(reverbMix * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

export default EffectsSection;
