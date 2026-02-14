<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Web Audio Synthesizer Project

## Project Overview

React TypeScript application for a polyphonic software synthesizer using Web Audio API.

## Features

- Polyphonic synthesis with multiple oscillator types (sine, square, sawtooth, triangle)
- ADSR envelope controls
- Dual filter section (LP/HP/BP/Notch)
- Effects: Delay, Reverb
- Virtual keyboard UI
- Computer keyboard input
- MIDI support
- Audio recording and export

## Architecture Guidelines

- Separate audio engine (pure Web Audio) from React UI
- Voice pooling for polyphony management
- AudioContext singleton pattern
- Type-safe parameter controls

## Progress Checklist

- [x] Copilot instructions created
- [x] Project scaffolded
- [x] Audio engine implemented
- [x] React components created
- [x] MIDI support added
- [x] Recording functionality added
- [x] Project compiled and tested
- [x] Development server running

## Usage

Access the synth at http://localhost:5173 when dev server is running.

## Next Steps for Vibecodování

- Přidat preset system (save/load synth settings)
- Implement LFO modulation
- Add more wave shapes (custom waveforms)
- Visual waveform display
- Master volume control in UI
- Keyboard velocity sensitivity from computer keyboard
- Touch support improvements
- Add arpeggiator
- Sequencer/pattern recording
