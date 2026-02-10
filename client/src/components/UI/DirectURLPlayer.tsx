import { useRef, useState } from 'react';
import { useAudioStore } from '../../stores/audioStore';

interface DirectURLPlayerProps {
  onAudioElement?: (element: HTMLAudioElement | null) => void;
}

export default function DirectURLPlayer({ onAudioElement }: DirectURLPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [url, setUrl] = useState('');
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isPlaying, setIsPlaying, setCurrentTrack } = useAudioStore();

  const loadUrl = async () => {
    if (!url || !audioRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const parsed = new URL(url);
      const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
      const hasValidExtension = validExtensions.some((ext) => parsed.pathname.toLowerCase().endsWith(ext));

      if (!hasValidExtension) {
        throw new Error('Use a direct audio URL (.mp3, .wav, .ogg, .m4a).');
      }

      audioRef.current.src = url;
      audioRef.current.load();

      setLoadedUrl(url);
      setCurrentTrack({
        title: parsed.pathname.split('/').pop() || 'Remote Track',
        artist: parsed.hostname,
      });
      onAudioElement?.(audioRef.current);
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid URL.');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setError('Playback failed. Source may block browser playback.');
    }
  };

  const clearLoadedTrack = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = '';
    setLoadedUrl(null);
    setIsPlaying(false);
    setCurrentTrack(null);
    onAudioElement?.(null);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-5">
      <h2 className="text-lg font-medium text-white">Stream URL</h2>

      <audio ref={audioRef} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />

      <div className="mt-4 flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadUrl()}
          placeholder="https://example.com/track.mp3"
          className="flex-1 rounded-md border border-white/15 bg-black/25 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/30"
        />
        <button
          onClick={loadUrl}
          disabled={loading || !url}
          className="rounded-md border border-white/20 bg-white/10 hover:bg-white/20 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? '...' : 'Load'}
        </button>
      </div>

      {loadedUrl && (
        <div className="mt-4 rounded-lg border border-white/10 bg-black/25 p-3 flex items-center justify-between gap-2">
          <p className="text-xs text-white/55 truncate">{loadedUrl}</p>
          <div className="flex gap-2">
            <button onClick={togglePlay} className="text-xs rounded border border-white/20 px-2.5 py-1 hover:bg-white/10">
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={clearLoadedTrack} className="text-xs rounded border border-white/20 px-2.5 py-1 hover:bg-white/10">
              Clear
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-white/55">{error}</p>}
    </div>
  );
}
