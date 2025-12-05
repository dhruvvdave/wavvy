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
        className="text-center py-12"
      >
        <motion.h1 
          className="text-6xl md:text-7xl lg:text-8xl font-black gradient-text mb-6"
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
          🌊 WAVVY
        </motion.h1>
        <motion.p 
          className="text-2xl md:text-3xl text-gray-300 mb-3 font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Create Beats • Visualize Audio • Make Music Magic
        </motion.p>
        <motion.p 
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          A professional beat maker and audio visualizer built with modern web technologies
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
        <h3 className="text-3xl font-bold gradient-text text-center mb-6">📁 Audio Sources</h3>
        
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
        <h3 className="text-3xl font-bold gradient-text text-center mb-6">🎵 Create Your Music</h3>
        
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
        className="text-center py-12 space-y-6 border-t border-white/10 mt-16"
      >
        <div className="glass inline-block px-8 py-4 rounded-2xl neon-glow">
          <p className="text-2xl font-bold gradient-text mb-3">
            Made with 💜 by Dhruv Dave
          </p>
          <div className="flex gap-4 justify-center text-sm text-gray-400 mb-3">
            <span>Built with React</span>
            <span>•</span>
            <span>Tone.js</span>
            <span>•</span>
            <span>Web Audio API</span>
            <span>•</span>
            <span>Framer Motion</span>
          </div>
          <div className="flex gap-3 justify-center">
            <motion.a
              href="https://github.com/dhruvvdave/wavvy"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="glass px-5 py-2 rounded-lg neon-glow text-sm font-medium transition-all duration-300 hover:bg-white/10"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                View on GitHub ↗
              </span>
            </motion.a>
          </div>
        </div>
        <p className="text-xs text-gray-600">
          Upload audio, create beats, and watch them come to life with stunning visualizations
        </p>
      </motion.footer>
    </div>
  );
}
