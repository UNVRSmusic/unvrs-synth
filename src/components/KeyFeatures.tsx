import "./KeyFeatures.css";

const KeyFeatures = () => {
  return (
    <div className="key-features">
      <h1>UNVRS Synth</h1>

      <div className="feature-item">
        <div className="feature-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div className="feature-content">
          <h3>Smart MIDI Record</h3>
          <p>Recording starts automatically from first key press</p>
        </div>
      </div>

      <div className="feature-item">
        <div className="feature-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 19v-7m0 0V5m0 7l-3 3m3-3l3 3" />
            <path d="M5 21h14a2 2 0 002-2v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="feature-content">
          <h3>WAV Export</h3>
          <p>High-quality audio recording and export to WAV format</p>
        </div>
      </div>

      <div className="feature-item">
        <div className="feature-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="2" y="7" width="20" height="10" rx="2" />
            <circle cx="7" cy="12" r="1" fill="currentColor" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            <circle cx="17" cy="12" r="1" fill="currentColor" />
          </svg>
        </div>
        <div className="feature-content">
          <h3>MIDI Hardware Support</h3>
          <p>Auto-detection and seamless connectivity with MIDI controllers</p>
        </div>
      </div>

      <div className="feature-item">
        <div className="feature-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div className="feature-content">
          <h3>Chaos & Damage Modes</h3>
          <p>
            Experimental sound design with uncontrolled chaos and distortion
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyFeatures;
