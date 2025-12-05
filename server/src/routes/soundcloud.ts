import { Router } from 'express';
import axios from 'axios';

const router = Router();

// SoundCloud search endpoint (requires SOUNDCLOUD_CLIENT_ID in .env)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID;

    if (!clientId) {
      return res.status(500).json({ 
        error: 'SoundCloud API client ID not configured',
        message: 'Please add SOUNDCLOUD_CLIENT_ID to your .env file'
      });
    }

    const response = await axios.get('https://api-v2.soundcloud.com/search/tracks', {
      params: {
        q,
        client_id: clientId,
        limit: 20
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('SoundCloud search error:', error);
    res.status(500).json({ 
      error: 'Failed to search SoundCloud',
      message: 'Make sure your SoundCloud API credentials are valid'
    });
  }
});

// Stream URL endpoint (proxy to avoid CORS)
router.get('/stream/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID;

    if (!clientId) {
      return res.status(500).json({ error: 'SoundCloud API not configured' });
    }

    const response = await axios.get(`https://api-v2.soundcloud.com/tracks/${trackId}/stream`, {
      params: { client_id: clientId }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stream URL' });
  }
});

export default router;
