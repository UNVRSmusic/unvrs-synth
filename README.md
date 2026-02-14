# UNVRS Synth 🎹

Webový polyphonic software synthesizer postavený s React, TypeScript a Web Audio API.

## Features

- ✨ **Polyphonic synthesis** - až 16 současně hrajících hlasů
- 🌊 **4 typy oscilátorů** - Sine, Square, Sawtooth, Triangle
- 📊 **ADSR envelope** - plná kontrola Attack, Decay, Sustain, Release
- 🎚️ **Dual filter sekce** - 2x nezávislé filtry (Lowpass, Highpass, Bandpass, Notch)
- 🎸 **Efekty** - Delay s feedback kontrolou a Reverb
- 🎹 **Virtuální klaviatura** - hrát myší nebo dotykem
- ⌨️ **Computer keyboard support** - AWSEDFTGYHUJKOLP;' klávesy
- 🎛️ **MIDI podpora** - připoj MIDI keyboard
- 🎙️ **Nahrávání a export** - záznam a download audio souborů

## Spuštění

```bash
# Instalace dependencies
npm install

# Dev server (http://localhost:5173)
npm run dev

# Build pro produkci
npm run build

# Preview produkčního buildu
npm run preview
```

## Použití

1. **Klikni "Click to Initialize Audio"** - Web Audio API vyžaduje user interaction
2. **Hraj noty:**
   - Klikej na virtuální klaviaturu
   - Používej klávesy na klávesnici (A=C3, W=C#3, S=D3, atd.)
   - Připoj MIDI keyboard a hraj
3. **Nastav zvuk:**
   - Vyber wave type (sine/square/sawtooth/triangle)
   - Uprav ADSR envelope pro tvar zvuku
   - Nastav oba filtry pro barvění zvuku
   - Přidej delay a reverb efekty
4. **Nahraj performance:**
   - Klikni "Record" tlačítko
   - Zahraj něco cool
   - Klikni "Stop"
   - Stáhni si WebM audio file

## Architektura

```
src/
├── audio/              # Web Audio engine (oddělený od React)
│   ├── AudioEngine.ts  # Singleton pro audio context a voice management
│   └── Voice.ts        # Individual voice s oscilátorem, filtry, envelope
├── components/         # React UI komponenty
│   ├── Synth.tsx       # Hlavní synth container
│   ├── Keyboard.tsx    # Virtuální piano klaviatura
│   ├── OscillatorSection.tsx
│   ├── EnvelopeSection.tsx
│   ├── FilterSection.tsx
│   ├── EffectsSection.tsx
│   ├── RecorderSection.tsx
│   └── MIDIStatus.tsx
└── types/
    └── webmidi.d.ts    # Type definitions pro Web MIDI API
```

### Klíčové koncepty:

- **Voice Pooling** - 16-voice polyphonie s automatickým voice stealing
- **Oddělení audio/UI** - čistý Web Audio engine nezávislý na Reactu
- **Real-time parameter control** - smooth transitions pomocí `setTargetAtTime`
- **Effects chain** - dry/wet mix routing pro delay a reverb

## Keyboard Mapping

```
 W E   T Y U   O P      (Černé klávesy)
A S D F G H J K L ;'    (Bílé klávesy)
|                   |
C3 --------------- C5  (2 oktávy)
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - type safety
- **Vite** - build tool & dev server
- **Web Audio API** - syntéza a zpracování zvuku
- **Web MIDI API** - MIDI device podpora
- **MediaRecorder API** - nahrávání audia

## Browser Support

- Chrome/Edge ✅
- Firefox ✅
- Safari ✅ (MIDI podpora omezená)

Web Audio a Web MIDI API jsou podporované v moderních prohlížečích. Pro nejlepší zkušenost používej Chrome nebo Edge.

## Vibecodování

Projekt je nastaven pro pohodové vibecodování:

- TypeScript autocomplete pro méně chyb
- Hot reload díky Vite
- Čistá architektura = snadné rozšíření
- CSS modules pro stylování

## License

MIT
