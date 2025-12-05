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
    <div className="glass p-6 rounded-2xl gradient-border">
      <h2 className="text-3xl font-bold gradient-text mb-6">🔗 Direct URL Audio</h2>

      <div className="space-y-4">
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && loadUrl()}
            placeholder="Paste audio file URL (e.g., https://example.com/audio.mp3)"
            className="flex-1 bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all duration-300 placeholder:text-gray-600"
          />
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadUrl}
            disabled={loading || !url}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
              loading || !url
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : 'bg-primary neon-glow-strong text-white'
            }`}
          >
            {loading ? '🔄 Loading...' : '▶ Load'}
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-4 text-sm text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
          >
            <span className="font-bold">⚠️ Error:</span> {error}
          </motion.div>
        )}

        <div className="glass p-4 rounded-xl text-sm text-gray-400 space-y-3">
          <div>
            <span className="text-primary font-bold">Supported formats:</span> MP3, WAV, OGG, M4A
          </div>
          <div>
            <p className="text-gray-500 mb-2">Example URLs:</p>
            <ul className="space-y-1 text-xs text-gray-600 ml-4">
              <li>• https://example.com/song.mp3</li>
              <li>• https://cdn.example.com/audio/track.wav</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
