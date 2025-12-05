import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Tone from 'tone';
import { useSequencerStore } from '../../stores/audioStore';

const TRACKS = [
  { name: 'Kick', sample: '/sounds/kick.wav' },
  { name: 'Snare', sample: '/sounds/snare.wav' },
  { name: 'Hi-Hat', sample: '/sounds/hihat.wav' },
  { name: '808', sample: '/sounds/808.wav' },
  { name: 'Clap', sample: '/sounds/clap.wav' },
  { name: 'Open Hat', sample: '/sounds/openhat.wav' },
  { name: 'Percussion', sample: '/sounds/perc.wav' },
  { name: 'FX', sample: '/sounds/fx.wav' },
];

export default function Sequencer() {
  const { bpm, currentStep, setBpm, setCurrentStep } = useSequencerStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [pattern, setPattern] = useState<boolean[][]>(
    TRACKS.map(() => Array(16).fill(false))
  );
  const [volumes, setVolumes] = useState<number[]>(TRACKS.map(() => 0.7));
  const [muted, setMuted] = useState<boolean[]>(TRACKS.map(() => false));
  const [solo, setSolo] = useState<boolean[]>(TRACKS.map(() => false));
  const [players, setPlayers] = useState<Tone.Player[]>([]);
  const [sequence, setSequence] = useState<Tone.Sequence | null>(null);

  // Initialize Tone.js players
  useEffect(() => {
    const newPlayers = TRACKS.map((track) => {
      return new Tone.Player({
        url: track.sample,
        volume: -10,
      }).toDestination();
    });
    setPlayers(newPlayers);

    return () => {
      newPlayers.forEach((player) => player.dispose());
    };
  }, []);

  // Set up sequencer
  useEffect(() => {
    if (players.length === 0) return;

    const seq = new Tone.Sequence(
      (time, step) => {
        setCurrentStep(step);
        pattern.forEach((trackPattern, trackIndex) => {
          if (trackPattern[step] && !muted[trackIndex]) {
            const anySolo = solo.some((s) => s);
            if (!anySolo || solo[trackIndex]) {
              players[trackIndex].start(time);
            }
          }
        });
      },
      [...Array(16).keys()],
      '16n'
    );

    setSequence(seq);

    return () => {
      seq.dispose();
    };
  }, [players, pattern, muted, solo]);

  // Update BPM
  useEffect(() => {
    Tone.getTransport().bpm.value = bpm;
  }, [bpm]);

  const togglePlay = async () => {
    await Tone.start();
    if (isPlaying) {
      Tone.getTransport().stop();
      setIsPlaying(false);
    } else {
      sequence?.start(0);
      Tone.getTransport().start();
      setIsPlaying(true);
    }
  };

  const toggleStep = (trackIndex: number, stepIndex: number) => {
    const newPattern = [...pattern];
    newPattern[trackIndex][stepIndex] = !newPattern[trackIndex][stepIndex];
    setPattern(newPattern);
  };

  const clearPattern = () => {
    setPattern(TRACKS.map(() => Array(16).fill(false)));
  };

  const toggleMute = (trackIndex: number) => {
    const newMuted = [...muted];
    newMuted[trackIndex] = !newMuted[trackIndex];
    setMuted(newMuted);
  };

  const toggleSolo = (trackIndex: number) => {
    const newSolo = [...solo];
    newSolo[trackIndex] = !newSolo[trackIndex];
    setSolo(newSolo);
  };

  const setVolume = (trackIndex: number, volume: number) => {
    const newVolumes = [...volumes];
    newVolumes[trackIndex] = volume;
    setVolumes(newVolumes);
    if (players[trackIndex]) {
      players[trackIndex].volume.value = Tone.gainToDb(volume);
    }
  };

  return (
    <div className="glass p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold gradient-text">🥁 Beat Sequencer</h2>
        
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">BPM</label>
            <input
              type="number"
              min="60"
              max="200"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-center"
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlay}
            className={`btn-primary ${isPlaying ? 'bg-accent/20' : ''}`}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearPattern}
            className="btn-primary"
          >
            🗑 Clear
          </motion.button>
        </div>
      </div>

      <div className="space-y-2">
        {TRACKS.map((track, trackIndex) => (
          <div key={trackIndex} className="flex items-center gap-2">
            <div className="w-24 text-sm text-gray-300">{track.name}</div>
            
            <div className="flex gap-1 flex-1">
              {Array(16).fill(0).map((_, stepIndex) => (
                <motion.button
                  key={stepIndex}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleStep(trackIndex, stepIndex)}
                  className={`
                    w-8 h-8 rounded transition-all
                    ${pattern[trackIndex][stepIndex]
                      ? 'bg-primary neon-glow'
                      : 'bg-white/5 hover:bg-white/10'
                    }
                    ${currentStep === stepIndex && isPlaying
                      ? 'ring-2 ring-secondary'
                      : ''
                    }
                  `}
                />
              ))}
            </div>
            
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumes[trackIndex]}
                onChange={(e) => setVolume(trackIndex, Number(e.target.value))}
                className="w-20"
              />
              
              <button
                onClick={() => toggleMute(trackIndex)}
                className={`px-2 py-1 text-xs rounded ${
                  muted[trackIndex] ? 'bg-red-500/20' : 'bg-white/5'
                }`}
              >
                M
              </button>
              
              <button
                onClick={() => toggleSolo(trackIndex)}
                className={`px-2 py-1 text-xs rounded ${
                  solo[trackIndex] ? 'bg-yellow-500/20' : 'bg-white/5'
                }`}
              >
                S
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
