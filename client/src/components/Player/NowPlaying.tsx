import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAudioStore } from '../../stores/audioStore';

interface NowPlayingProps {
  audioElement: HTMLAudioElement | null;
}

export default function NowPlaying({ audioElement }: NowPlayingProps) {
  const { 
    isPlaying, 
    currentTime, 
    duration, 
    volume,
    currentTrack,
    setIsPlaying, 
    setCurrentTime, 
    setDuration,
    setVolume 
  } = useAudioStore();
  
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  // Update time and duration
  useEffect(() => {
    if (!audioElement) return;

    const updateTime = () => setCurrentTime(audioElement.currentTime);
    const updateDuration = () => setDuration(audioElement.duration);
    const updatePlayState = () => setIsPlaying(!audioElement.paused);

    audioElement.addEventListener('timeupdate', updateTime);
    audioElement.addEventListener('durationchange', updateDuration);
    audioElement.addEventListener('play', updatePlayState);
    audioElement.addEventListener('pause', updatePlayState);

    return () => {
      audioElement.removeEventListener('timeupdate', updateTime);
      audioElement.removeEventListener('durationchange', updateDuration);
      audioElement.removeEventListener('play', updatePlayState);
      audioElement.removeEventListener('pause', updatePlayState);
    };
  }, [audioElement, setCurrentTime, setDuration, setIsPlaying]);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch(err => console.error('Play error:', err));
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioElement || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioElement.currentTime = percent * duration;
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioElement || !volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percent));
    audioElement.volume = newVolume;
    setVolume(newVolume);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioElement) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5"
      >
        <div className="text-center text-gray-400">
          <div className="text-5xl mb-4">🎵</div>
          <p>No track loaded</p>
          <p className="text-sm mt-2">Upload or search for music to get started</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5"
    >
      <div className="flex items-center gap-4 mb-4">
        {currentTrack?.albumArt && (
          <img 
            src={currentTrack.albumArt} 
            alt="Album art" 
            className="w-16 h-16 rounded-lg object-cover shadow-lg"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">
            {currentTrack?.title || 'Unknown Track'}
          </h3>
          <p className="text-gray-400 text-sm truncate">
            {currentTrack?.artist || 'Unknown Artist'}
          </p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-4">
        <div 
          ref={progressRef}
          onClick={handleProgressClick}
          className="h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          title="Previous"
        >
          ⏮
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePlayPause}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-shadow"
        >
          {isPlaying ? '⏸' : '▶'}
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          title="Next"
        >
          ⏭
        </motion.button>
      </div>

      {/* Volume control */}
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm">🔊</span>
        <div 
          ref={volumeRef}
          onClick={handleVolumeChange}
          className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer"
        >
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
            style={{ width: `${volume * 100}%` }}
          />
        </div>
        <span className="text-gray-400 text-sm w-10 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </motion.div>
  );
}
