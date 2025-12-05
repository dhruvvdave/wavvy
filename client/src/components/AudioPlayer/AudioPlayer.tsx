import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAudioStore } from '../../stores/audioStore';

interface AudioPlayerProps {
  onAudioElement?: (element: HTMLAudioElement | null) => void;
}

export default function AudioPlayer({ onAudioElement }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrackLocal] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { isPlaying, currentTime, duration, volume, setIsPlaying, setCurrentTime, setDuration, setVolume, setCurrentTrack } = useAudioStore();

  useEffect(() => {
    if (audioRef.current && onAudioElement) {
      onAudioElement(audioRef.current);
    }
  }, [onAudioElement]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [setCurrentTime, setDuration, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (file: File) => {
    if (file && audioRef.current) {
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      setCurrentTrackLocal(file.name);
      
      // Update track metadata in store
      setCurrentTrack({
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        artist: 'Local File',
        albumArt: undefined,
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl gradient-border">
      <h2 className="text-3xl font-bold gradient-text mb-6">📁 Audio Player</h2>
      
      <audio ref={audioRef} />

      {!currentTrack ? (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
            ${isDragging 
              ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(139,92,246,0.3)]' 
              : 'border-white/20 hover:border-primary/50 hover:bg-white/5'
            }
          `}
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            animate={{ y: isDragging ? -10 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-bold mb-2">Drop your audio file here</h3>
            <p className="text-gray-400 mb-6">or click to browse</p>
            <label className="btn-primary cursor-pointer inline-block">
              📤 Choose Audio File
              <input
                type="file"
                accept="audio/mp3,audio/wav,audio/ogg,audio/m4a"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-4">
              Supports MP3, WAV, OGG, M4A
            </p>
          </motion.div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 glass p-4 rounded-xl">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl">
              🎵
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate text-lg">{currentTrack}</h3>
              <p className="text-sm text-gray-400">Now Playing</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentTrackLocal(null);
                setIsPlaying(false);
                setCurrentTrack(null);
                if (audioRef.current) {
                  audioRef.current.src = '';
                }
              }}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              ✕
            </motion.button>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary neon-glow-strong flex items-center justify-center text-2xl font-bold shadow-lg"
            >
              {isPlaying ? '⏸' : '▶'}
            </motion.button>

            <div className="flex-1 space-y-2">
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(139,92,246,0.8)] [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div 
                  className="absolute top-0 left-0 h-2 bg-gradient-to-r from-primary to-secondary rounded-lg pointer-events-none"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-400 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 glass px-4 py-3 rounded-lg">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                className="text-xl"
              >
                {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </motion.button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-24 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
