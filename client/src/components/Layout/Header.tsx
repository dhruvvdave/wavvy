import { motion } from 'framer-motion';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/5">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
        >
          wavvy
        </motion.h1>
        <motion.a 
          href="https://github.com/dhruvvdave" 
          target="_blank" 
          rel="noopener noreferrer"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          GitHub ↗
        </motion.a>
      </div>
    </header>
  );
}
