// Web MIDI API type definitions
declare namespace WebMidi {
  interface MIDIMessageEvent extends Event {
    data: Uint8Array;
  }

  interface MIDIInput extends EventTarget {
    id: string;
    manufacturer?: string;
    name?: string;
    type: "input";
    version?: string;
    state: "connected" | "disconnected";
    connection: "open" | "closed" | "pending";
    onmidimessage: ((event: MIDIMessageEvent) => void) | null;
    onstatechange: ((event: Event) => void) | null;
  }

  interface MIDIOutput extends EventTarget {
    id: string;
    manufacturer?: string;
    name?: string;
    type: "output";
    version?: string;
    state: "connected" | "disconnected";
    connection: "open" | "closed" | "pending";
    send(data: number[] | Uint8Array, timestamp?: number): void;
    clear(): void;
  }

  interface MIDIInputMap extends Map<string, MIDIInput> {}
  interface MIDIOutputMap extends Map<string, MIDIOutput> {}

  interface MIDIAccess extends EventTarget {
    inputs: MIDIInputMap;
    outputs: MIDIOutputMap;
    onstatechange: ((event: Event) => void) | null;
    sysexEnabled: boolean;
  }

  interface MIDIOptions {
    sysex?: boolean;
    software?: boolean;
  }
}

interface Navigator {
  requestMIDIAccess(options?: WebMidi.MIDIOptions): Promise<WebMidi.MIDIAccess>;
}
