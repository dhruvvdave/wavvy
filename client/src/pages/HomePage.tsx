import { useState } from 'react';
import { motion } from 'framer-motion';
import Sequencer from '../components/Sequencer/Sequencer';
import MelodyPads from '../components/MelodyPads/MelodyPads';
import Visualizer from '../components/Visualizer/Visualizer';
import AudioPlayer from '../components/AudioPlayer/AudioPlayer';
import DirectURLPlayer from '../components/UI/DirectURLPlayer';

// Audio source tabs (sequencer tab removed as beat creation is always visible below)
type AudioSourceTab = 'upload' | 'spotify' | 'url';

export default function HomePage() {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [activeTab, setActiveTab] = useState<AudioSourceTab>('upload');

  const tabs: { id: AudioSourceTab; label: string; icon: string }[] = [
    { id: 'upload', label: 'Upload', icon: '📁' },
    { id: 'spotify', label: 'Spotify', icon: '🟢' },
    { id: 'url', label: 'Direct URL', icon: '🔗' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-8"
      >
        <motion.h1 
          className="text-6xl md:text-7xl font-black gradient-text mb-4"
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{ backgroundSize: '200% auto' }}
        >
          Welcome to WAVVY
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-300 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Create beats, visualize audio, and make music magic happen
        </motion.p>
        <motion.p 
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          A portfolio-worthy beat maker and audio visualizer
        </motion.p>
      </motion.div>

      {/* Visualizer - Hero Centerpiece */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Visualizer audioElement={audioElement} />
      </motion.div>

      {/* Audio Sources Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="space-y-4"
      >
        <h3 className="text-2xl font-bold gradient-text text-center">Audio Sources</h3>
        
        <div className="flex gap-3 justify-center flex-wrap">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-primary neon-glow-strong text-white'
                  : 'glass hover:bg-white/10 text-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </span>
            </motion.button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'upload' && <AudioPlayer onAudioElement={setAudioElement} />}
          {activeTab === 'spotify' && (
            <div className="glass p-8 rounded-2xl text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-2xl font-bold gradient-text mb-2">Coming Soon</h3>
              <p className="text-gray-400">
                Spotify integration requires API credentials.<br/>
                This feature will be available once configured.
              </p>
            </div>
          )}
          {activeTab === 'url' && <DirectURLPlayer />}
        </motion.div>
      </motion.div>

      {/* Beat Creation Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-6"
      >
        <h3 className="text-2xl font-bold gradient-text text-center">Create Your Music</h3>
        
        <div className="grid grid-cols-1 gap-8">
          <Sequencer />
          <MelodyPads />
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-center py-12 space-y-4"
      >
        <div className="glass inline-block px-8 py-4 rounded-2xl">
          <p className="text-xl font-bold gradient-text mb-2">🌊 Made with passion by Dhruv Dave</p>
          <div className="flex gap-4 justify-center text-sm text-gray-400">
            <span>Built with React</span>
            <span>•</span>
            <span>Tone.js</span>
            <span>•</span>
            <span>Web Audio API</span>
            <span>•</span>
            <span>Framer Motion</span>
          </div>
        </div>
        <p className="text-xs text-gray-600">
          Upload audio, create beats, and watch them come to life with stunning visualizations
        </p>
      </motion.footer>
    </div>
  );
}
