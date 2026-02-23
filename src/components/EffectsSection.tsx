import "./ControlSection.css";
import { AudioEngine } from "../audio/AudioEngine";
import { useState } from "react";

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
            max="2"
            min="0.01"
            onChange={(e) => handleDelayTimeChange(parseFloat(e.target.value))}
            step="0.01"
            type="range"
            value={delayTime}
          />
          <span className="value">{delayTime.toFixed(2)}s</span>
        </div>
        <div className="control-group">
          <label>Delay Feedback</label>
          <input
            max="0.95"
            min="0"
            onChange={(e) =>
              handleDelayFeedbackChange(parseFloat(e.target.value))
            }
            step="0.01"
            type="range"
            value={delayFeedback}
          />
          <span className="value">{(delayFeedback * 100).toFixed(0)}%</span>
        </div>
        <div className="control-group">
          <label>Delay Mix</label>
          <input
            max="1"
            min="0"
            onChange={(e) => handleDelayMixChange(parseFloat(e.target.value))}
            step="0.01"
            type="range"
            value={delayMix}
          />
          <span className="value">{(delayMix * 100).toFixed(0)}%</span>
        </div>
        <div className="control-group">
          <label>Reverb Mix</label>
          <input
            max="1"
            min="0"
            onChange={(e) => handleReverbMixChange(parseFloat(e.target.value))}
            step="0.01"
            type="range"
            value={reverbMix}
          />
          <span className="value">{(reverbMix * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

export default EffectsSection;
