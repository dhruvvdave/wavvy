import { motion } from 'framer-motion';
import { Beat } from '../../types';

interface BeatCardProps {
  beat: Beat;
  onPlay?: (beat: Beat) => void;
  onLike?: (beatId: string) => void;
  onDelete?: (beatId: string) => void;
  isOwner?: boolean;
}

export default function BeatCard({ beat, onPlay, onLike, onDelete, isOwner }: BeatCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="glass p-6 rounded-xl hover:bg-white/10 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold gradient-text truncate mb-1">
            {beat.title}
          </h3>
          {beat.description && (
            <p className="text-sm text-gray-400 line-clamp-2">{beat.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <span>🎵</span>
          <span>{beat.bpm} BPM</span>
        </div>
        <div className="flex items-center gap-1">
          <span>▶</span>
          <span>{beat.plays} plays</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📅</span>
          <span>{formatDate(beat.created_at)}</span>
        </div>
      </div>

      {beat.user && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <span className="text-gray-500">by</span>
          <span className="text-primary font-semibold">{beat.user.username}</span>
        </div>
      )}

      <div className="flex gap-2">
        {onPlay && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPlay(beat)}
            className="flex-1 btn-primary bg-primary/20"
          >
            ▶ Play
          </motion.button>
        )}
        
        {onLike && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onLike(beat.id)}
            className="btn-primary"
          >
            ❤️
          </motion.button>
        )}

        {isOwner && onDelete && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(beat.id)}
            className="btn-primary bg-red-500/20"
          >
            🗑️
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
