import { useState, useCallback } from 'react';
import axios from 'axios';

export function useSoundCloud() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTracks = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/soundcloud/search', {
        params: { q: query }
      });
      return response.data.collection || [];
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to search SoundCloud';
      setError(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getStreamUrl = useCallback(async (trackId: number) => {
    try {
      const response = await axios.get(`/api/soundcloud/stream/${trackId}`);
      return response.data.url;
    } catch (err) {
      console.error('Failed to get stream URL:', err);
      return null;
    }
  }, []);

  return { searchTracks, getStreamUrl, loading, error };
}
