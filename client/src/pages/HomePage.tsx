import { useState } from 'react';
import { motion } from 'framer-motion';
import Sequencer from '../components/Sequencer/Sequencer';
import MelodyPads from '../components/MelodyPads/MelodyPads';
import Visualizer from '../components/Visualizer/Visualizer';
import AudioPlayer from '../components/AudioPlayer/AudioPlayer';
import SpotifySearch from '../components/Spotify/SpotifySearch';
import DirectURLPlayer from '../components/UI/DirectURLPlayer';

type AudioSourceTab = 'upload' | 'spotify' | 'url' | 'sequencer';

export default function HomePage() {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [activeTab, setActiveTab] = useState<AudioSourceTab>('upload');

  const tabs: { id: AudioSourceTab; label: string; icon: string }[] = [
    { id: 'upload', label: 'Upload', icon: '📁' },
    { id: 'spotify', label: 'Spotify', icon: '🟢' },
    { id: 'url', label: 'Direct URL', icon: '🔗' },
    { id: 'sequencer', label: 'Sequencer', icon: '🥁' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-bold gradient-text text-center mb-4">
          Welcome to Wavvy
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Create beats, visualize audio, and share your music with the world
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Visualizer audioElement={audioElement} />
      </motion.div>

      {/* Audio Sources Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex gap-2 justify-center">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-primary neon-glow'
                  : 'glass hover:bg-white/10'
              }`}
            >
              {tab.icon} {tab.label}
            </motion.button>
          ))}
        </div>

        <div>
          {activeTab === 'upload' && <AudioPlayer onAudioElement={setAudioElement} />}
          {activeTab === 'spotify' && <SpotifySearch />}
          {activeTab === 'url' && <DirectURLPlayer />}
          {activeTab === 'sequencer' && (
            <div className="glass p-6 rounded-xl">
              <p className="text-center text-gray-400">
                Scroll down to use the Sequencer and Melody Pads below!
              </p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Sequencer />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <MelodyPads />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center text-gray-500 text-sm py-8"
      >
        <p>🌊 Built with React, Tone.js, and Web Audio API</p>
        <p className="mt-2">Upload audio, create beats, and watch them come to life!</p>
      </motion.div>
    </div>
  );
}
