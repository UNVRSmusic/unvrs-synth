import { useState } from "react";
import { AudioEngine } from "../audio/AudioEngine";
import "./ControlSection.css";

interface FilterSectionProps {
  audioEngine: AudioEngine;
  filterNumber: 1 | 2;
}

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

  const handleFrequencyChange = (value: number) => {
    setFrequency(value);
    if (filterNumber === 1) {
      audioEngine.setFilter1(filterType, value, q);
    } else {
      audioEngine.setFilter2(filterType, value, q);
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
      <div className="controls-grid">
        <div className="control-group">
          <label>Frequency</label>
          <input
            type="range"
            min="20"
            max="20000"
            step="1"
            value={frequency}
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
    </div>
  );
};

export default FilterSection;
