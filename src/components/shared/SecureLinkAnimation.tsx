import { motion } from 'framer-motion';
import { CheckCircle, Lock } from 'lucide-react';

interface SecureLinkAnimationProps {
  show: boolean;
  message?: string;
}

export function SecureLinkAnimation({ show, message = 'নিরাপদ সংযোগ স্থাপিত' }: SecureLinkAnimationProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-xl bg-primary/10 border border-primary/20 p-4 text-center"
    >
      {/* Scan line */}
      <motion.div
        className="absolute inset-y-0 w-1 bg-gradient-to-b from-transparent via-primary to-transparent opacity-60"
        initial={{ left: '-4px' }}
        animate={{ left: '100%' }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />

      <div className="flex items-center justify-center gap-2 relative z-10">
        <Lock className="h-4 w-4 text-primary" />
        <span className="font-bengali font-semibold text-primary text-sm">{message}</span>
        <CheckCircle className="h-4 w-4 text-success" />
      </div>
    </motion.div>
  );
}
