import "./App.css";
import { AudioEngine } from "./audio/AudioEngine";
import { useState } from "react";
import KeyFeatures from "./components/KeyFeatures";
import Synth from "./components/Synth";

function App() {
  const [audioEngine, setAudioEngine] = useState<AudioEngine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeAudio = async () => {
    const engine = AudioEngine.getInstance();
    console.log("engine", engine);
    await engine.initialize();
    setAudioEngine(engine);
    setIsInitialized(true);
  };

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
