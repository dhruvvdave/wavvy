import { motion } from 'framer-motion';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="text-3xl font-bold gradient-text">
              🌊 Wavvy
            </div>
          </motion.div>
          
          <nav className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass px-4 py-2 rounded-lg neon-glow"
            >
              Explore
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass px-4 py-2 rounded-lg neon-glow"
            >
              Profile
            </motion.button>
          </nav>
        </div>
      </div>
    </header>
  );
}
