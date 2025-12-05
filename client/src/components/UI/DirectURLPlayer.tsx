import { useState } from 'react';
import { motion } from 'framer-motion';

interface DirectURLPlayerProps {
  onUrlLoaded?: (url: string) => void;
}

export default function DirectURLPlayer({ onUrlLoaded }: DirectURLPlayerProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUrl = async () => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      // Validate URL
      new URL(url);
      
      // Check if it's a valid audio URL
      const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
      const hasValidExtension = validExtensions.some(ext => url.toLowerCase().includes(ext));
      
      if (!hasValidExtension) {
        throw new Error('URL must point to an audio file (.mp3, .wav, .ogg, .m4a)');
      }

      // Try to fetch the URL to check if it's accessible
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('Unable to access the audio file. Check the URL and try again.');
      }

      if (onUrlLoaded) {
        onUrlLoaded(url);
      }
      
      setUrl('');
    } catch (err: any) {
      setError(err.message || 'Invalid URL or audio file not accessible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-2xl font-bold gradient-text mb-4">🔗 Direct URL Audio</h2>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && loadUrl()}
            placeholder="Paste audio file URL (e.g., https://example.com/audio.mp3)"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadUrl}
            disabled={loading || !url}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? '🔄 Loading...' : '▶ Load'}
          </motion.button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p className="mb-2">Supported formats: MP3, WAV, OGG, M4A</p>
          <p>Example URLs:</p>
          <ul className="list-disc list-inside ml-2 text-xs">
            <li>https://example.com/song.mp3</li>
            <li>https://cdn.example.com/audio/track.wav</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
