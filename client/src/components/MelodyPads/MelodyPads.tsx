import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tone from 'tone';

const NOTES = [
  { note: 'C4', label: 'C', key: 'A', isSharp: false },
  { note: 'C#4', label: 'C#', key: 'W', isSharp: true },
  { note: 'D4', label: 'D', key: 'S', isSharp: false },
  { note: 'D#4', label: 'D#', key: 'E', isSharp: true },
  { note: 'E4', label: 'E', key: 'D', isSharp: false },
  { note: 'F4', label: 'F', key: 'F', isSharp: false },
  { note: 'F#4', label: 'F#', key: 'T', isSharp: true },
  { note: 'G4', label: 'G', key: 'G', isSharp: false },
  { note: 'G#4', label: 'G#', key: 'Y', isSharp: true },
  { note: 'A4', label: 'A', key: 'H', isSharp: false },
  { note: 'A#4', label: 'A#', key: 'U', isSharp: true },
  { note: 'B4', label: 'B', key: 'J', isSharp: false },
];

const INSTRUMENTS = [
  { id: 'synth', name: 'Synth', icon: '🎹' },
  { id: 'fm', name: 'FM Synth', icon: '🎛️' },
  { id: 'am', name: 'AM Synth', icon: '📻' },
  { id: 'pluck', name: 'Pluck', icon: '🎸' },
];

export default function MelodyPads() {
  const [activePad, setActivePad] = useState<string | null>(null);
  const [currentInstrument, setCurrentInstrument] = useState('synth');
  const [octave, setOctave] = useState(4);
  const [instruments, setInstruments] = useState<Record<string, any>>({});
  const [ripples, setRipples] = useState<{ id: string; note: string }[]>([]);

  useEffect(() => {
    const newInstruments: Record<string, any> = {
      synth: new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
      }).toDestination(),
      fm: new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3,
        modulationIndex: 10,
        detune: 0,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.5 },
        modulation: { type: 'square' },
        modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 }
      }).toDestination(),
      am: new Tone.PolySynth(Tone.AMSynth, {
        harmonicity: 2,
        detune: 0,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.8 },
        modulation: { type: 'square' },
        modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 }
      }).toDestination(),
      pluck: new Tone.PluckSynth({
        attackNoise: 1,
        dampening: 4000,
        resonance: 0.7
      }).toDestination(),
    };

    setInstruments(newInstruments);

    return () => {
      Object.values(newInstruments).forEach((inst) => inst.dispose());
    };
  }, []);

  const playNote = async (noteBase: string) => {
    await Tone.start();
    // Adjust note by octave
    const note = noteBase.replace('4', String(octave));
    
    if (instruments[currentInstrument]) {
      const inst = instruments[currentInstrument];
      // PluckSynth is monophonic, others are polyphonic
      if (currentInstrument === 'pluck') {
        inst.triggerAttackRelease(note, '8n');
      } else {
        inst.triggerAttackRelease(note, '8n');
      }
      setActivePad(noteBase);
      
      // Add ripple effect - limit to 3 concurrent ripples to prevent memory issues
      const rippleId = `${noteBase}-${Date.now()}`;
      setRipples(prev => {
        const newRipples = [...prev, { id: rippleId, note: noteBase }];
        return newRipples.slice(-3); // Keep only last 3 ripples
      });
      
      setTimeout(() => setActivePad(null), 300);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== rippleId));
      }, 1000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const note = NOTES.find((n) => n.key === e.key.toUpperCase());
      if (note && !e.repeat) {
        playNote(note.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentInstrument, instruments, octave]);

  return (
    <div className="glass p-6 rounded-2xl gradient-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-3xl font-bold gradient-text">🎹 Melody Pads</h2>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            {INSTRUMENTS.map((inst) => (
              <motion.button
                key={inst.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentInstrument(inst.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentInstrument === inst.id
                    ? 'bg-primary neon-glow-strong text-white'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <span className="flex items-center gap-1">
                  <span>{inst.icon}</span>
                  <span className="hidden sm:inline">{inst.name}</span>
                </span>
              </motion.button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 glass px-4 py-2 rounded-lg">
            <label className="text-sm text-gray-300 font-medium">Octave</label>
            <div className="flex gap-1">
              {[3, 4, 5].map((oct) => (
                <motion.button
                  key={oct}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOctave(oct)}
                  className={`w-8 h-8 rounded font-bold transition-all ${
                    octave === oct
                      ? 'bg-secondary text-white shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {oct}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
        {NOTES.map((note) => (
          <motion.button
            key={note.note}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => playNote(note.note)}
            className={`
              relative h-28 sm:h-32 rounded-xl transition-all duration-300 overflow-hidden
              ${note.isSharp
                ? 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 hover:from-gray-600'
                : 'bg-gradient-to-br from-primary via-purple-600 to-secondary hover:from-primary/90'
              }
              ${activePad === note.note
                ? 'shadow-[0_0_40px_rgba(139,92,246,1),0_0_80px_rgba(139,92,246,0.5)]'
                : 'shadow-lg'
              }
            `}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <span className="text-2xl font-bold drop-shadow-lg">{note.label}</span>
              <span className="text-xs text-gray-300 mt-1 opacity-70">{note.key}</span>
            </div>
            
            {/* Ripple effects */}
            <AnimatePresence>
              {ripples.filter(r => r.note === note.note).map((ripple) => (
                <motion.div
                  key={ripple.id}
                  className="absolute inset-0 rounded-xl border-4 border-white"
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              ))}
            </AnimatePresence>
            
            {/* Glow overlay when active */}
            {activePad === note.note && (
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-6 text-center">
        <div className="text-sm text-gray-400">
          Use keys <span className="text-primary font-bold">A-J</span> and{' '}
          <span className="text-secondary font-bold">W, E, T, Y, U</span> to play notes
        </div>
        <div className="text-xs text-gray-500 mt-2">
          All sounds synthesized with Tone.js • Change octave and instrument type above
        </div>
      </div>
    </div>
  );
}
