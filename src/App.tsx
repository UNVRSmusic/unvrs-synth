import "./App.css";
import { AudioEngine } from "./audio/AudioEngine";
import { useState, useEffect } from "react";
import KeyFeatures from "./components/KeyFeatures";
import Synth from "./components/Synth";

function App() {
  const [audioEngine, setAudioEngine] = useState<AudioEngine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  const initializeAudio = async () => {
    const engine = AudioEngine.getInstance();
    await engine.initialize();
    setAudioEngine(engine);
    setIsInitialized(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  useEffect(() => {
    console.log("audioEngine", audioEngine);
  }, [audioEngine]);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const bottomPosition = document.documentElement.scrollHeight;
      // Hide when we're within 50px of bottom
      setShowScrollIndicator(scrollPosition < bottomPosition - 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="app">
      {!isInitialized ? (
        <div className="init-screen">
          <KeyFeatures />

          <button onClick={initializeAudio} className="init-button">
            Click to Initialize Audio
          </button>
          <p className="hint">
            Audio context requires user interaction to start
          </p>

          <button
            onClick={scrollToBottom}
            className={`scroll-indicator ${!showScrollIndicator ? "hidden" : ""}`}
            aria-label="Scroll to bottom"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5L12 19M12 19L19 12M12 19L5 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ) : (
        <>
          <h1>UNVRS Synth</h1>
          <Synth audioEngine={audioEngine!} />
        </>
      )}
    </div>
  );
}

export default App;
