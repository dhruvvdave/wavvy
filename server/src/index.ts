import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import beatsRouter from './routes/beats.js';
import uploadRouter from './routes/upload.js';
import spotifyRouter from './routes/spotify.js';

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is required');
  console.error('Please set JWT_SECRET in your .env file');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/beats', beatsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/spotify', spotifyRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Wavvy API is running' });
});

app.listen(PORT, () => {
  console.log(`🌊 Wavvy server running on port ${PORT}`);
});
