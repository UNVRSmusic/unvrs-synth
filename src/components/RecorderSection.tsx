import { useState } from "react";
import { AudioEngine } from "../audio/AudioEngine";
import "./RecorderSection.css";

interface RecorderSectionProps {
  audioEngine: AudioEngine;
}

const RecorderSection = ({ audioEngine }: RecorderSectionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const startRecording = async () => {
    const recorder = await audioEngine.startRecording();
    if (!recorder) return;

    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      setAudioChunks(chunks);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const downloadRecording = () => {
    if (audioChunks.length === 0) return;

    const blob = new Blob(audioChunks, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `synth-recording-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    setAudioChunks([]);
  };

  return (
    <div className="recorder-section">
      {!isRecording ? (
        <button onClick={startRecording} className="record-btn">
          ⏺ Record
        </button>
      ) : (
        <button onClick={stopRecording} className="record-btn recording">
          ⏹ Stop
        </button>
      )}
      {audioChunks.length > 0 && (
        <button onClick={downloadRecording} className="download-btn">
          ⬇ Download
        </button>
      )}
    </div>
  );
};

export default RecorderSection;
