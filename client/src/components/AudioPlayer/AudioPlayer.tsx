import { useState, useRef, useEffect } from 'react';
import { useAudioStore } from '../../stores/audioStore';

interface AudioPlayerProps {
  onAudioElement?: (element: HTMLAudioElement | null) => void;
}

export default function AudioPlayer({ onAudioElement }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrackLocal] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { isPlaying, currentTime, duration, volume, setIsPlaying, setCurrentTime, setDuration, setVolume, setCurrentTrack } =
    useAudioStore();

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

      setCurrentTrack({
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Local File',
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
    <div className="rounded-xl border border-sky-200/20 bg-transparent p-5">
      <h2 className="text-lg font-medium text-white">Upload audio</h2>
      <audio ref={audioRef} />

      {!currentTrack ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-4 rounded-lg border border-dashed p-10 text-center transition-colors ${
            isDragging ? 'border-sky-200/60 bg-sky-300/15' : 'border-sky-200/25 bg-sky-950/20'
          }`}
        >
          <p className="text-sm text-white/85">Drop file here</p>
          <p className="text-xs text-sky-100/55 mt-1 mb-4">MP3, WAV, OGG, M4A</p>
          <label className="inline-flex cursor-pointer rounded-md border border-sky-200/30 bg-sky-300/15 hover:bg-sky-200/25 px-4 py-2 text-sm text-white">
            Choose file
            <input
              type="file"
              accept="audio/mp3,audio/wav,audio/ogg,audio/m4a"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-sky-200/20 bg-sky-950/20 p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-white truncate">{currentTrack}</p>
              <p className="text-xs text-sky-100/55">Loaded</p>
            </div>
            <button
              onClick={() => {
                setCurrentTrackLocal(null);
                setIsPlaying(false);
                setCurrentTrack(null);
                if (audioRef.current) {
                  audioRef.current.src = '';
                }
              }}
              className="rounded-md border border-sky-200/30 px-3 py-1.5 text-xs hover:bg-sky-200/15"
            >
              Remove
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="rounded-full w-10 h-10 border border-sky-200/30 hover:bg-sky-200/15 text-sm">
              {isPlaying ? '❚❚' : '▶'}
            </button>

            <div className="flex-1 space-y-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-sky-100/15 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-100"
              />
              <div className="flex justify-between text-xs text-sky-100/55">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 h-2 bg-sky-100/15 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}
