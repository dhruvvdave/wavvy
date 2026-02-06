import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    images: { url: string }[];
  };
  duration_ms: number;
  external_urls: { spotify: string };
}

export default function SpotifySearch() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTracks = async () => {
    if (!query) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/spotify/search`, {
        params: { q: query, type: 'track' },
      });
      setTracks(response.data.tracks?.items || []);
    } catch {
      setError('Spotify API is not configured.');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-5">
      <h2 className="text-lg font-medium text-white">Spotify search</h2>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchTracks()}
          placeholder="Search"
          className="flex-1 rounded-md border border-white/15 bg-black/25 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/30"
        />
        <button
          onClick={searchTracks}
          disabled={loading || !query}
          className="rounded-md border border-white/20 bg-white/10 hover:bg-white/20 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? '...' : 'Go'}
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-white/55">{error}</p>}

      <div className="mt-4 space-y-2 max-h-80 overflow-y-auto pr-1">
        {tracks.map((track) => (
          <div key={track.id} className="rounded-lg border border-white/10 bg-black/25 p-2.5 flex items-center gap-3">
            {track.album.images[2] && <img src={track.album.images[2].url} alt={track.name} className="w-10 h-10 rounded" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{track.name}</p>
              <p className="text-xs text-white/50 truncate">{track.artists.map((a) => a.name).join(', ')}</p>
            </div>
            <span className="text-xs text-white/45">{formatDuration(track.duration_ms)}</span>
            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs rounded border border-white/20 px-2 py-1 hover:bg-white/10"
            >
              Open
            </a>
          </div>
        ))}
      </div>

      {tracks.length === 0 && !loading && !error && <p className="text-xs text-white/40 mt-4">No results</p>}
    </div>
  );
}
