import { motion } from 'framer-motion';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur-xl">
      <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-semibold tracking-tight text-white/90"
        >
          wavvy
        </motion.h1>
        <motion.a
          href="https://github.com/dhruvvdave"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-white/60 hover:text-white/90 transition-colors"
        >
          GitHub
        </motion.a>
      </div>
    </header>
  );
}
