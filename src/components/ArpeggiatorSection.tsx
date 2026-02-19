import "./ArpeggiatorSection.css";
import { AudioEngine } from "../audio/AudioEngine";
import { useState } from "react";
import { ArpMode, ArpRate } from "../audio/Arpeggiator";

interface ArpeggiatorSectionProps {
  audioEngine: AudioEngine;
}

const ArpeggiatorSection = ({ audioEngine }: ArpeggiatorSectionProps) => {
  const arpState = audioEngine.getArpState();
  const [enabled] = useState(arpState.enabled);
  const [mode, setMode] = useState<ArpMode>(arpState.mode);
  const [bpm, setBpm] = useState(arpState.bpm);
  const [rate, setRate] = useState<ArpRate>(arpState.rate);
  const [hold, setHold] = useState(arpState.hold);

  const handleModeChange = (newMode: ArpMode) => {
    setMode(newMode);
    audioEngine.setArpMode(newMode);
  };

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setBpm(value);
    audioEngine.setArpBPM(value);
  };

  const handleRateChange = (newRate: ArpRate) => {
    setRate(newRate);
    audioEngine.setArpRate(newRate);
  };

  const handleHoldChange = (value: boolean) => {
    setHold(value);
    audioEngine.setArpHold(value);
  };

  return (
    <div className="arpeggiator-section">
      <h3>Arpeggiator</h3>
      <div className="arpeggiator-controls">
        {/* <div className="arp-control-row">
          <label className="arp-checkbox-label">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => handleEnabledChange(e.target.checked)}
            />
            <span>Enable</span>
          </label>
        </div> */}

        <div className="arp-control-row">
          <label>Mode</label>
          <div className="arp-btn-group">
            {(["up", "down", "updown", "random", "order"] as ArpMode[]).map(
              (m) => (
                <button
                  key={m}
                  className={`arp-mode-btn ${mode === m ? "active" : ""}`}
                  onClick={() => handleModeChange(m)}
                  disabled={!enabled}
                >
                  {m}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="arp-control-row">
          <label>BPM: {bpm}</label>
          <input
            type="range"
            min="40"
            max="240"
            step="1"
            value={bpm}
            onChange={handleBpmChange}
            disabled={!enabled}
          />
        </div>

        <div className="arp-control-row">
          <label>Rate</label>
          <div className="arp-btn-group">
            {(["1/4", "1/8", "1/16", "1/32"] as ArpRate[]).map((r) => (
              <button
                key={r}
                className={`arp-rate-btn ${rate === r ? "active" : ""}`}
                onClick={() => handleRateChange(r)}
                disabled={!enabled}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="arp-control-row">
          <button
            className={`arp-hold-btn ${hold ? "active" : ""}`}
            onClick={() => handleHoldChange(!hold)}
            disabled={!enabled}
          >
            Hold
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArpeggiatorSection;
