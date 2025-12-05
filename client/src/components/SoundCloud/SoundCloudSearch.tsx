import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface SoundCloudTrack {
  id: number;
  title: string;
  user: { username: string };
  artwork_url?: string;
  duration: number;
  permalink_url: string;
}

export default function SoundCloudSearch() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<SoundCloudTrack[]>([]);
  const [loading, setLoading] = useState(false);

  const searchTracks = async () => {
    if (!query) return;
    
    setLoading(true);
    try {
      // Note: This requires a SoundCloud API client ID
      // For now, this is a placeholder implementation
      const response = await axios.get('/api/soundcloud/search', {
        params: { q: query }
      });
      setTracks(response.data.collection || []);
    } catch (error) {
      console.error('Error searching SoundCloud:', error);
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
    <div className="glass p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">
        <span className="gradient-text">🟠 SoundCloud</span>
      </h2>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchTracks()}
          placeholder="Search for tracks..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-soundcloud"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={searchTracks}
          className="btn-primary bg-soundcloud/20"
          disabled={loading}
        >
          {loading ? '🔄' : '🔍'} Search
        </motion.button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {tracks.map((track) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-4 rounded-lg flex items-center gap-4 hover:bg-white/10 transition-all"
          >
            {track.artwork_url && (
              <img
                src={track.artwork_url}
                alt={track.title}
                className="w-12 h-12 rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{track.title}</h3>
              <p className="text-sm text-gray-400 truncate">{track.user.username}</p>
            </div>
            <div className="text-sm text-gray-400">
              {formatDuration(track.duration)}
            </div>
            <a
              href={track.permalink_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs bg-soundcloud/20"
            >
              Open
            </a>
          </motion.div>
        ))}
      </div>

      {tracks.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          Search for tracks on SoundCloud
        </div>
      )}
    </div>
  );
}
