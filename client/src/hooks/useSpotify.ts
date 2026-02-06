import { useState, useCallback } from 'react';
import axios from 'axios';

interface ApiErrorResponse {
  message?: string;
}

export function useSpotify() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveError = (err: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(err)) {
      return err.response?.data?.message || fallback;
    }

    return fallback;
  };

  const searchTracks = useCallback(async (query: string, type = 'track', limit = 20) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/spotify/search', {
        params: { q: query, type, limit },
      });
      return response.data.tracks?.items || [];
    } catch (err: unknown) {
      setError(resolveError(err, 'Failed to search Spotify'));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrack = useCallback(async (trackId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/spotify/track/${trackId}`);
      return response.data;
    } catch (err: unknown) {
      setError(resolveError(err, 'Failed to get track'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/spotify/browse/categories');
      return response.data.categories?.items || [];
    } catch (err: unknown) {
      setError(resolveError(err, 'Failed to get categories'));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { searchTracks, getTrack, getCategories, loading, error };
}
