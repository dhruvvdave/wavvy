import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as Tone from 'tone';
import { useSequencerStore } from '../../stores/audioStore';

const TRACKS = [
  { name: 'Kick', color: '#8b5cf6' },
  { name: 'Snare', color: '#06b6d4' },
  { name: 'Hi-Hat', color: '#ec4899' },
  { name: '808', color: '#f59e0b' },
  { name: 'Clap', color: '#10b981' },
  { name: 'Open Hat', color: '#8b5cf6' },
  { name: 'Percussion', color: '#06b6d4' },
  { name: 'FX', color: '#ec4899' },
];

const PRESETS = {
  empty: TRACKS.map(() => Array(16).fill(false)),
  basic: [
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], // Hi-Hat
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // 808
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // Clap
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // Open Hat
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // Percussion
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // FX
  ],
  trap: [
    [true, false, false, false, false, false, true, false, true, false, false, false, false, false, true, false], // Kick
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
    [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true], // Hi-Hat
    [false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, true], // 808
    [false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false], // Clap
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true], // Open Hat
    [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // Percussion
    [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], // FX
  ],
};

export default function Sequencer() {
  const { bpm, currentStep, setBpm, setCurrentStep } = useSequencerStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [pattern, setPattern] = useState<boolean[][]>(PRESETS.empty);
  const [volumes, setVolumes] = useState<number[]>(TRACKS.map(() => 0.7));
  const [muted, setMuted] = useState<boolean[]>(TRACKS.map(() => false));
  const [solo, setSolo] = useState<boolean[]>(TRACKS.map(() => false));
  const [audioStarted, setAudioStarted] = useState(false);
  const synthsRef = useRef<any[]>([]);
  const sequenceRef = useRef<Tone.Sequence | null>(null);
  const patternRef = useRef(pattern);
  const mutedRef = useRef(muted);
  const soloRef = useRef(solo);
  const volumesRef = useRef(volumes);

  // Update refs when state changes
  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    soloRef.current = solo;
  }, [solo]);

  useEffect(() => {
    volumesRef.current = volumes;
  }, [volumes]);

  // Initialize Tone.js synthesized drums
  useEffect(() => {
    const kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: 'exponential' }
    }).toDestination();

    const snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0.0, release: 0.2 }
    }).toDestination();

    const hihat = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    }).toDestination();

    const bass808 = new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.8 }
    }).toDestination();

    const clap = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.15 }
    }).toDestination();

    const openhat = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.3, release: 0.3 },
      harmonicity: 3.1,
      modulationIndex: 16,
      resonance: 3000,
      octaves: 1
    }).toDestination();

    const perc = new Tone.MembraneSynth({
      pitchDecay: 0.02,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.2 }
    }).toDestination();

    const fx = new Tone.NoiseSynth({
      noise: { type: 'brown' },
      envelope: { attack: 0.2, decay: 0.5, sustain: 0.2, release: 0.5 }
    }).toDestination();

    synthsRef.current = [kick, snare, hihat, bass808, clap, openhat, perc, fx];

    return () => {
      synthsRef.current.forEach((synth) => synth.dispose());
    };
  }, []);

  // Set up sequencer ONCE - read from refs to avoid recreating
  useEffect(() => {
    if (synthsRef.current.length === 0) return;

    const seq = new Tone.Sequence(
      (time, step) => {
        setCurrentStep(step);
        const currentPattern = patternRef.current;
        const currentMuted = mutedRef.current;
        const currentSolo = soloRef.current;
        const currentVolumes = volumesRef.current;

        currentPattern.forEach((trackPattern, trackIndex) => {
          if (trackPattern[step] && !currentMuted[trackIndex]) {
            const anySolo = currentSolo.some((s) => s);
            if (!anySolo || currentSolo[trackIndex]) {
              const synth = synthsRef.current[trackIndex];
              synth.volume.value = Tone.gainToDb(currentVolumes[trackIndex]);
              
              // Trigger different notes for different drums
              if (trackIndex === 0 || trackIndex === 3 || trackIndex === 6) {
                // Kick, 808, Perc - membrane synths
                const notes = ['C1', 'C1', 'E2'];
                synth.triggerAttackRelease(notes[trackIndex === 0 ? 0 : trackIndex === 3 ? 1 : 2], '8n', time);
              } else if (trackIndex === 2 || trackIndex === 5) {
                // Hi-hat, Open hat - metal synths
                synth.triggerAttackRelease('16n', time);
              } else {
                // Snare, Clap, FX - noise synths
                synth.triggerAttackRelease('8n', time);
              }
            }
          }
        });
      },
      [...Array(16).keys()],
      '16n'
    );

    sequenceRef.current = seq;

    return () => {
      seq.dispose();
    };
  }, []); // Empty deps - only create once!

  // Update BPM
  useEffect(() => {
    Tone.getTransport().bpm.value = bpm;
  }, [bpm]);

  const togglePlay = async () => {
    await Tone.start();
    setAudioStarted(true);
    
    if (isPlaying) {
      Tone.getTransport().stop();
      setIsPlaying(false);
      setCurrentStep(-1);
    } else {
      sequenceRef.current?.start(0);
      Tone.getTransport().start();
      setIsPlaying(true);
    }
  };

  const startAudio = async () => {
    await Tone.start();
    setAudioStarted(true);
  };

  const toggleStep = (trackIndex: number, stepIndex: number) => {
    const newPattern = [...pattern];
    newPattern[trackIndex][stepIndex] = !newPattern[trackIndex][stepIndex];
    setPattern(newPattern);
  };

  const clearPattern = () => {
    setPattern(PRESETS.empty);
  };

  const loadPreset = (presetName: keyof typeof PRESETS) => {
    setPattern(PRESETS[presetName]);
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
  };

  return (
    <>
      {!audioStarted && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startAudio}
            className="glass px-12 py-6 rounded-2xl text-2xl font-bold neon-glow-strong gradient-text"
          >
            🎵 Click to Enable Audio
          </motion.button>
        </div>
      )}
      
      <div className="glass p-6 rounded-2xl gradient-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-3xl font-bold gradient-text">🥁 Beat Sequencer</h2>
        
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 glass px-4 py-2 rounded-lg">
            <label className="text-sm text-gray-300 font-medium">BPM</label>
            <input
              type="range"
              min="60"
              max="200"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-24 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(139,92,246,0.8)]"
            />
            <span className="text-sm font-bold text-primary min-w-[3rem] text-center">{bpm}</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlay}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
              isPlaying 
                ? 'bg-accent/20 text-accent neon-glow-strong' 
                : 'bg-primary/20 text-primary neon-glow'
            }`}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearPattern}
            className="px-6 py-2 rounded-lg font-medium bg-white/5 hover:bg-white/10 transition-all duration-300"
          >
            🗑 Clear
          </motion.button>
        </div>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <span className="text-sm text-gray-400 mr-2">Presets:</span>
        {Object.keys(PRESETS).map((presetName) => (
          <motion.button
            key={presetName}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => loadPreset(presetName as keyof typeof PRESETS)}
            className="px-3 py-1 rounded text-xs bg-white/5 hover:bg-white/10 transition-all capitalize"
          >
            {presetName}
          </motion.button>
        ))}
      </div>

      <div className="space-y-2 overflow-x-auto">
        {TRACKS.map((track, trackIndex) => (
          <div key={trackIndex} className="flex items-center gap-2 min-w-max">
            <div className="w-28 text-sm font-medium" style={{ color: track.color }}>
              {track.name}
            </div>
            
            <div className="flex gap-1 flex-1">
              {Array(16).fill(0).map((_, stepIndex) => (
                <motion.button
                  key={stepIndex}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleStep(trackIndex, stepIndex)}
                  className={`
                    w-10 h-10 rounded-lg transition-all duration-200
                    ${pattern[trackIndex][stepIndex]
                      ? `neon-glow-strong`
                      : 'bg-white/5 hover:bg-white/10'
                    }
                    ${currentStep === stepIndex && isPlaying
                      ? 'ring-2 ring-secondary animate-pulse-slow'
                      : ''
                    }
                  `}
                  style={{
                    backgroundColor: pattern[trackIndex][stepIndex] ? track.color : undefined,
                    boxShadow: pattern[trackIndex][stepIndex] 
                      ? `0 0 20px ${track.color}80, 0 0 40px ${track.color}40`
                      : undefined
                  }}
                />
              ))}
            </div>
            
            <div className="flex gap-2 items-center ml-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumes[trackIndex]}
                onChange={(e) => setVolume(trackIndex, Number(e.target.value))}
                className="w-20 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary"
                title="Volume"
              />
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleMute(trackIndex)}
                className={`px-2 py-1 text-xs rounded font-bold transition-all ${
                  muted[trackIndex] 
                    ? 'bg-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                M
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleSolo(trackIndex)}
                className={`px-2 py-1 text-xs rounded font-bold transition-all ${
                  solo[trackIndex] 
                    ? 'bg-yellow-500/30 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                S
              </motion.button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Click pads to create beats • All sounds synthesized with Tone.js
      </div>
    </div>
    </>
  );
}
