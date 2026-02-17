import { useState } from "react";
import { AudioEngine } from "../audio/AudioEngine";
import "./ControlSection.css";

interface FilterSectionProps {
  audioEngine: AudioEngine;
  filterNumber: 1 | 2;
}

// Exponential frequency mapping constants
const MIN_FREQ = 20;
const MAX_FREQ = 20000;
const SLIDER_STEPS = 1000;

// Convert linear slider value (0-1000) to exponential frequency (20-20000 Hz)
const sliderToFreq = (sliderValue: number): number => {
  return MIN_FREQ * Math.pow(MAX_FREQ / MIN_FREQ, sliderValue / SLIDER_STEPS);
};

// Convert frequency to linear slider value
const freqToSlider = (freq: number): number => {
  return (
    (Math.log(freq / MIN_FREQ) / Math.log(MAX_FREQ / MIN_FREQ)) * SLIDER_STEPS
  );
};

const FilterSection = ({ audioEngine, filterNumber }: FilterSectionProps) => {
  const filterDefaults =
    filterNumber === 1 ? audioEngine.getFilter1() : audioEngine.getFilter2();

  const [filterType, setFilterType] = useState<BiquadFilterType>(
    filterDefaults.type,
  );
  const [frequency, setFrequency] = useState(filterDefaults.frequency);
  const [q, setQ] = useState(filterDefaults.q);

  const handleTypeChange = (type: BiquadFilterType) => {
    setFilterType(type);
    if (filterNumber === 1) {
      audioEngine.setFilter1(type, frequency, q);
    } else {
      audioEngine.setFilter2(type, frequency, q);
    }
  };

  const handleFrequencyChange = (sliderValue: number) => {
    const freq = sliderToFreq(sliderValue);
    setFrequency(freq);
    if (filterNumber === 1) {
      audioEngine.setFilter1(filterType, freq, q);
    } else {
      audioEngine.setFilter2(filterType, freq, q);
    }
  };

  const handleQChange = (value: number) => {
    setQ(value);
    if (filterNumber === 1) {
      audioEngine.setFilter1(filterType, frequency, value);
    } else {
      audioEngine.setFilter2(filterType, frequency, value);
    }
  };

  return (
    <div className="control-section">
      <h3>Filter {filterNumber}</h3>

      <div className="controls-grid">
        <div className="control-group">
          <label>Frequency</label>
          <input
            type="range"
            min="0"
            max={SLIDER_STEPS}
            step="1"
            value={freqToSlider(frequency)}
            onChange={(e) => handleFrequencyChange(parseFloat(e.target.value))}
          />
          <span className="value">{frequency.toFixed(0)} Hz</span>
        </div>
        <div className="control-group">
          <label>Resonance</label>
          <input
            type="range"
            min="0.1"
            max="20"
            step="0.1"
            value={q}
            onChange={(e) => handleQChange(parseFloat(e.target.value))}
          />
          <span className="value">{q.toFixed(1)}</span>
        </div>
      </div>

      <div className="filter-type-selector">
        {(
          ["lowpass", "highpass", "bandpass", "notch"] as BiquadFilterType[]
        ).map((type) => (
          <button
            key={type}
            className={`filter-btn ${filterType === type ? "active" : ""}`}
            onClick={() => handleTypeChange(type)}
          >
            {type === "lowpass"
              ? "LP"
              : type === "highpass"
                ? "HP"
                : type === "bandpass"
                  ? "BP"
                  : "NOTCH"}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterSection;
