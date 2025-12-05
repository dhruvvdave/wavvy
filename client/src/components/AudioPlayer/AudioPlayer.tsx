import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAudioStore } from '../../stores/audioStore';

interface AudioPlayerProps {
  onAudioElement?: (element: HTMLAudioElement | null) => void;
}

export default function AudioPlayer({ onAudioElement }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const { isPlaying, currentTime, duration, volume, setIsPlaying, setCurrentTime, setDuration, setVolume } = useAudioStore();

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
  }, []);

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
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && audioRef.current) {
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      setCurrentTrack(file.name);
    }
  };

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-2xl font-bold gradient-text mb-4">📁 Audio Player</h2>
      
      <audio ref={audioRef} />

      {!currentTrack && (
        <div className="mb-4">
          <label className="btn-primary cursor-pointer inline-block">
            📤 Upload Audio File
            <input
              type="file"
              accept="audio/mp3,audio/wav,audio/ogg"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {currentTrack && (
        <div className="space-y-4">
          <div className="text-sm text-gray-300">
            Now Playing: <span className="text-primary">{currentTrack}</span>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-primary neon-glow flex items-center justify-center"
            >
              {isPlaying ? '⏸' : '▶'}
            </motion.button>

            <div className="flex-1 space-y-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-24"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
