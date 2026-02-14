import "./MIDIStatus.css";

interface MIDIStatusProps {
  devices: WebMidi.MIDIInput[];
}

const MIDIStatus = ({ devices }: MIDIStatusProps) => {
  return (
    <div className="midi-status">
      <span className="midi-label">MIDI:</span>
      {devices.length > 0 ? (
        <div className="midi-devices">
          {devices.map((device, index) => (
            <span key={index} className="midi-device">
              ✓ {device.name}
            </span>
          ))}
        </div>
      ) : (
        <span className="midi-none">No devices</span>
      )}
    </div>
  );
};

export default MIDIStatus;
