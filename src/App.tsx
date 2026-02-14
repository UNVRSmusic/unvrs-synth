import { useState } from "react";
import "./App.css";
import Synth from "./components/Synth";
import { AudioEngine } from "./audio/AudioEngine";

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
      <h1>UNVRS Synth</h1>
      {!isInitialized ? (
        <div className="init-screen">
          <button onClick={initializeAudio} className="init-button">
            Click to Initialize Audio
          </button>
          <p className="hint">
            Audio context requires user interaction to start
          </p>
        </div>
      ) : (
        <Synth audioEngine={audioEngine!} />
      )}
    </div>
  );
}

export default App;
