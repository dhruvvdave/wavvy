# 🌊 Wavvy - Beat Maker, Visualizer & Collaboration Platform

A fully functional, production-ready beat making and audio visualization platform with a stunning dark neon UI. Built for beatmakers to create, visualize, and share their music.

![Wavvy](https://via.placeholder.com/1200x600/0a0a0f/8b5cf6?text=Wavvy+Beat+Maker)

## ✨ Features

### 🥁 Beat Sequencer / Drum Machine
- 16-step grid-based drum sequencer
- 8 tracks: Kick, Snare, Hi-Hat, 808, Clap, Open Hat, Percussion, FX
- Adjustable BPM (60-200)
- Swing control
- Per-track volume, mute, and solo controls
- Play, pause, and clear controls
- Visual indication of current playing step
- Pattern saving and loading

### 🎹 Melody Pads
- 12 interactive pads (full octave with sharps)
- Multiple instrument sounds: Synth, Piano, Bass, Pluck
- Keyboard support (A-L keys for notes, W-U for sharps)
- Visual glow feedback on trigger
- Recording mode for pad sequences

### 🎨 Audio Visualizer (CRITICAL FEATURE)
Five stunning visualizer modes:
- **Frequency Bars**: Classic equalizer bars
- **Waveform**: Smooth oscilloscope-style wave
- **Circular**: Radial visualizer pulsing from center
- **Particles**: Dancing particles reacting to beats
- **Spectrum**: Full color spectrum visualization

Features:
- Real-time audio analysis using Web Audio API
- 60fps smooth animations
- Canvas-based rendering
- Fullscreen mode support
- Customizable themes
- Works with sequencer, uploaded files, and streaming services

### 📁 Upload & Play System
- Support for MP3, WAV, OGG files
- Full playback controls
- Progress bar with seek functionality
- Volume control
- Time display (current/duration)
- Audio file library

### 🔊 Audio Integration Ready
Framework built for:
- 🟠 **SoundCloud** integration (search, stream, visualize)
- 🟢 **Spotify** integration (search, 30s previews, visualize)
- 🔗 **Direct URL** audio streaming

### 👤 User System (Backend Ready)
- User authentication with JWT
- Profile management
- Beat storage and retrieval
- Comments and likes system

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for lightning-fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Tone.js** for audio synthesis
- **Web Audio API** for visualizer
- **Canvas API** for rendering
- **Zustand** for state management
- **React Query** for data fetching

### Backend
- **Node.js** with **Express**
- **TypeScript**
- **PostgreSQL** database
- **Prisma** ORM
- **JWT** authentication
- **bcrypt** password hashing
- **Multer** file uploads
- **CORS** enabled

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### ⚠️ Important Security Notes

1. **JWT Secret**: The application will not start without a valid `JWT_SECRET` environment variable
2. **File Uploads**: Using Multer 2.0.2 (secure, patched version)
3. **Database**: Mock in-memory storage is used by default. Configure Prisma for production.
4. **API Keys**: External API integrations (SoundCloud, Spotify) require valid credentials

### 1. Clone the Repository
```bash
git clone https://github.com/dhruvvdave/wavvy.git
cd wavvy
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `SOUNDCLOUD_CLIENT_ID`: SoundCloud API client ID (optional)
- `SPOTIFY_CLIENT_ID`: Spotify API client ID (optional)
- `SPOTIFY_CLIENT_SECRET`: Spotify API client secret (optional)

### 3. Install Dependencies

**Client:**
```bash
cd client
npm install
```

**Server:**
```bash
cd ../server
npm install
```

### 4. Set Up Database
```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

### 5. Add Audio Samples
Place royalty-free drum samples in `client/public/sounds/`:
- `kick.wav`
- `snare.wav`
- `hihat.wav`
- `808.wav`
- `clap.wav`
- `openhat.wav`
- `perc.wav`
- `fx.wav`

### 6. Run Development Servers

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

The app will be available at `http://localhost:3000`

## 🔑 API Keys Setup

### SoundCloud API
1. Create a SoundCloud account at https://soundcloud.com
2. Register your app at https://developers.soundcloud.com/
3. Get your Client ID
4. Add to `.env`: `SOUNDCLOUD_CLIENT_ID=your_client_id`

### Spotify API
1. Go to https://developer.spotify.com/dashboard
2. Create a new app
3. Get your Client ID and Client Secret
4. Add redirect URI: `http://localhost:3000/callback`
5. Add to `.env`:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

## 🚀 Build for Production

**Client:**
```bash
cd client
npm run build
```

**Server:**
```bash
cd server
npm run build
npm start
```

## 📖 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Beats
- `GET /api/beats` - Get all beats
- `GET /api/beats/:id` - Get specific beat
- `POST /api/beats` - Create new beat
- `PUT /api/beats/:id` - Update beat
- `DELETE /api/beats/:id` - Delete beat

### Upload
- `POST /api/upload` - Upload audio file

## 🎮 Usage

### Creating Beats
1. Click squares on the sequencer grid to add drum hits
2. Adjust BPM with the slider
3. Use M (mute) and S (solo) buttons per track
4. Click Play to hear your beat

### Using Melody Pads
1. Select an instrument (Synth, Piano, Bass, Pluck)
2. Click pads or use keyboard (A-J, W-U)
3. Create melodies on top of your beats

### Visualizing Audio
1. Upload an audio file or play a beat
2. Select visualizer mode (Frequency, Waveform, Circular, Particles, Spectrum)
3. Watch your music come to life!

## 🎨 UI Theme

- **Background**: `#0a0a0f` (near-black)
- **Primary**: `#8b5cf6` (purple)
- **Secondary**: `#06b6d4` (cyan)
- **Accent**: `#ec4899` (pink)
- **Effects**: Glassmorphism, neon glows, smooth animations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Tone.js for audio synthesis
- Web Audio API for visualizations
- All the amazing beatmakers out there!

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ and 🌊 by the Wavvy team**
