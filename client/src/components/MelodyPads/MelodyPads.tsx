import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Tone from 'tone';

const NOTES = [
  { note: 'C4', label: 'C', key: 'A' },
  { note: 'C#4', label: 'C#', key: 'W' },
  { note: 'D4', label: 'D', key: 'S' },
  { note: 'D#4', label: 'D#', key: 'E' },
  { note: 'E4', label: 'E', key: 'D' },
  { note: 'F4', label: 'F', key: 'F' },
  { note: 'F#4', label: 'F#', key: 'T' },
  { note: 'G4', label: 'G', key: 'G' },
  { note: 'G#4', label: 'G#', key: 'Y' },
  { note: 'A4', label: 'A', key: 'H' },
  { note: 'A#4', label: 'A#', key: 'U' },
  { note: 'B4', label: 'B', key: 'J' },
];

const INSTRUMENTS = [
  { id: 'synth', name: 'Synth', type: 'synth' },
  { id: 'piano', name: 'Piano', type: 'piano' },
  { id: 'bass', name: 'Bass', type: 'bass' },
  { id: 'pluck', name: 'Pluck', type: 'pluck' },
];

export default function MelodyPads() {
  const [activePad, setActivePad] = useState<string | null>(null);
  const [currentInstrument, setCurrentInstrument] = useState('synth');
  const [instruments, setInstruments] = useState<Record<string, any>>({});

  useEffect(() => {
    const newInstruments: Record<string, any> = {
      synth: new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
      }).toDestination(),
      piano: new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.002, decay: 0.3, sustain: 0.2, release: 2 },
      }).toDestination(),
      bass: new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.8 },
      }).toDestination(),
      pluck: new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'square' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 },
      }).toDestination(),
    };

    setInstruments(newInstruments);

    return () => {
      Object.values(newInstruments).forEach((inst) => inst.dispose());
    };
  }, []);

  const playNote = async (note: string) => {
    await Tone.start();
    if (instruments[currentInstrument]) {
      instruments[currentInstrument].triggerAttackRelease(note, '8n');
      setActivePad(note);
      setTimeout(() => setActivePad(null), 200);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const note = NOTES.find((n) => n.key === e.key.toUpperCase());
      if (note) {
        playNote(note.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentInstrument, instruments]);

  return (
    <div className="glass p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold gradient-text">🎹 Melody Pads</h2>
        
        <div className="flex gap-2">
          {INSTRUMENTS.map((inst) => (
            <motion.button
              key={inst.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentInstrument(inst.id)}
              className={`px-4 py-2 rounded ${
                currentInstrument === inst.id
                  ? 'bg-primary neon-glow'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {inst.name}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
        {NOTES.map((note) => {
          const isSharp = note.label.includes('#');
          return (
            <motion.button
              key={note.note}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => playNote(note.note)}
              className={`
                relative h-24 rounded-lg transition-all
                ${isSharp
                  ? 'bg-gradient-to-br from-gray-700 to-gray-900'
                  : 'bg-gradient-to-br from-primary to-secondary'
                }
                ${activePad === note.note
                  ? 'neon-glow shadow-[0_0_40px_rgba(139,92,246,1)]'
                  : ''
                }
              `}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold">{note.label}</span>
                <span className="text-xs text-gray-400 mt-1">{note.key}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-4 text-center text-sm text-gray-400">
        Use keys A-J and W-U to play notes
      </div>
    </div>
  );
}
