import { useState, useRef } from "react";
import { AudioEngine } from "../audio/AudioEngine";
import { Mp3Encoder } from "lamejs";
import "./RecorderSection.css";

interface RecorderSectionProps {
  audioEngine: AudioEngine;
}

const RecorderSection = ({ audioEngine }: RecorderSectionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [format, setFormat] = useState<"mp3" | "wav">("mp3");

  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioBuffersRef = useRef<Float32Array[]>([]);

  const floatTo16BitPCM = (input: Float32Array): Int16Array => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const createWavFile = (
    left: Float32Array,
    right: Float32Array,
    sampleRate: number,
  ): ArrayBuffer => {
    const numChannels = 2;
    const bytesPerSample = 2;
    const dataLength = left.length * numChannels * bytesPerSample;

    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // WAV header
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
    view.setUint16(32, numChannels * bytesPerSample, true);
    view.setUint16(34, bytesPerSample * 8, true);
    writeString(view, 36, "data");
    view.setUint32(40, dataLength, true);

    // Interleave samples
    const leftPCM = floatTo16BitPCM(left);
    const rightPCM = floatTo16BitPCM(right);
    let offset = 44;
    for (let i = 0; i < leftPCM.length; i++) {
      view.setInt16(offset, leftPCM[i], true);
      offset += 2;
      view.setInt16(offset, rightPCM[i], true);
      offset += 2;
    }

    return buffer;
  };

  const startRecording = async () => {
    const audioContext = audioEngine.getAudioContext();
    if (!audioContext) return;

    const masterGain = audioEngine.getMasterGain();
    if (!masterGain) return;

    // Clear previous buffers
    audioBuffersRef.current = [];

    // Create ScriptProcessorNode for audio capture
    const processor = audioContext.createScriptProcessor(4096, 2, 2);

    processor.onaudioprocess = (e) => {
      const leftChannel = e.inputBuffer.getChannelData(0);
      const rightChannel = e.inputBuffer.getChannelData(1);

      // Store both channels
      audioBuffersRef.current.push(new Float32Array(leftChannel));
      audioBuffersRef.current.push(new Float32Array(rightChannel));
    };

    // Connect: masterGain -> processor -> destination
    masterGain.connect(processor);
    processor.connect(audioContext.destination);

    processorRef.current = processor;
    setIsRecording(true);
  };

  const stopRecording = () => {
    const audioContext = audioEngine.getAudioContext();
    const masterGain = audioEngine.getMasterGain();
    const processor = processorRef.current;

    if (!processor || !audioContext || !masterGain) return;

    // Disconnect processor
    masterGain.disconnect(processor);
    processor.disconnect();
    processor.onaudioprocess = null;
    processorRef.current = null;

    setIsRecording(false);

    // Encode audio
    const blob = format === "mp3" ? encodeMp3() : encodeWav();
    if (blob) {
      setRecordedBlob(blob);
    }
  };

  const encodeMp3 = (): Blob | null => {
    const audioContext = audioEngine.getAudioContext();
    if (!audioContext || audioBuffersRef.current.length === 0) return null;

    const sampleRate = audioContext.sampleRate;
    const mp3Encoder = new Mp3Encoder(2, sampleRate, 192);

    const mp3Data: number[] = [];
    const buffers = audioBuffersRef.current;

    // Process in stereo pairs
    for (let i = 0; i < buffers.length; i += 2) {
      const left = floatTo16BitPCM(buffers[i]);
      const right = buffers[i + 1] ? floatTo16BitPCM(buffers[i + 1]) : left;

      const mp3buf = mp3Encoder.encodeBuffer(left, right);
      if (mp3buf.length > 0) {
        for (let j = 0; j < mp3buf.length; j++) {
          mp3Data.push(mp3buf[j]);
        }
      }
    }

    // Flush remaining data
    const mp3buf = mp3Encoder.flush();
    if (mp3buf.length > 0) {
      for (let j = 0; j < mp3buf.length; j++) {
        mp3Data.push(mp3buf[j]);
      }
    }

    return new Blob([new Uint8Array(mp3Data)], { type: "audio/mp3" });
  };

  const encodeWav = (): Blob | null => {
    const audioContext = audioEngine.getAudioContext();
    if (!audioContext || audioBuffersRef.current.length === 0) return null;

    const buffers = audioBuffersRef.current;
    const sampleRate = audioContext.sampleRate;

    // Merge all buffers
    const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
    const mergedLeft = new Float32Array(totalLength / 2);
    const mergedRight = new Float32Array(totalLength / 2);

    let offset = 0;
    for (let i = 0; i < buffers.length; i += 2) {
      mergedLeft.set(buffers[i], offset);
      if (buffers[i + 1]) {
        mergedRight.set(buffers[i + 1], offset);
      }
      offset += buffers[i].length;
    }

    const wavData = createWavFile(mergedLeft, mergedRight, sampleRate);
    return new Blob([wavData], { type: "audio/wav" });
  };

  const downloadRecording = () => {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `synth-recording-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setRecordedBlob(null);
  };

  return (
    <div className="recorder-section">
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as "mp3" | "wav")}
        disabled={isRecording}
        className="format-select"
      >
        <option value="mp3">MP3</option>
        <option value="wav">WAV</option>
      </select>
      {!isRecording ? (
        <button onClick={startRecording} className="record-btn">
          ⏺ Record
        </button>
      ) : (
        <button onClick={stopRecording} className="record-btn recording">
          ⏹ Stop
        </button>
      )}
      {recordedBlob && (
        <button onClick={downloadRecording} className="download-btn">
          ⬇ Download
        </button>
      )}
    </div>
  );
};

export default RecorderSection;
