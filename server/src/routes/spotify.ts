import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Get Spotify access token
async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify API credentials not configured');
  }

  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      }
    }
  );

  return response.data.access_token;
}

// Search endpoint
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'track', limit = 20 } = req.query;
    const token = await getSpotifyToken();

    const response = await axios.get('https://api.spotify.com/v1/search', {
      params: { q, type, limit },
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json(response.data);
  } catch (error: any) {
    console.error('Spotify search error:', error);
    res.status(500).json({ 
      error: 'Failed to search Spotify',
      message: error.message || 'Make sure your Spotify API credentials are valid'
    });
  }
});

// Get track details
router.get('/track/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    const token = await getSpotifyToken();

    const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get track details' });
  }
});

// Browse categories
router.get('/browse/categories', async (req, res) => {
  try {
    const token = await getSpotifyToken();

    const response = await axios.get('https://api.spotify.com/v1/browse/categories', {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

export default router;
