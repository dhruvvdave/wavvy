import { useState, useCallback } from 'react';
import axios from 'axios';

export function useSpotify() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTracks = useCallback(async (query: string, type = 'track', limit = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/spotify/search', {
        params: { q: query, type, limit }
      });
      return response.data.tracks?.items || [];
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to search Spotify';
      setError(errorMsg);
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
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to get track';
      setError(errorMsg);
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
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to get categories';
      setError(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { searchTracks, getTrack, getCategories, loading, error };
}
