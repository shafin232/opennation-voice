import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { CircularProgress } from './CircularProgress';
import { CheckCircle } from 'lucide-react';

interface IntegrityCardProps {
  district: string;
  truthScore: number;
  trustScore: number;
  verified?: boolean;
  totalReports?: number;
  index?: number;
}

export function IntegrityCard({ district, truthScore, trustScore, verified = false, totalReports = 0, index = 0 }: IntegrityCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0, y: 8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring' as const, stiffness: 400, damping: 28 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card p-5 rounded-2xl gradient-shine cursor-default transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bengali font-semibold text-foreground text-sm">{district}</h3>
          <p className="text-[10px] text-muted-foreground font-mono-data mt-0.5">{totalReports} রিপোর্ট</p>
        </div>
        {verified && (
          <Badge className="bg-primary/10 text-primary border-primary/10 gap-1 text-[10px]" style={{ animation: 'gentlePulse 3s ease-in-out infinite' }}>
            <CheckCircle className="h-3 w-3" />
            যাচাইকৃত
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-around">
        <CircularProgress value={truthScore} size={85} strokeWidth={5} label="সত্যতা" />
        <CircularProgress value={trustScore} size={85} strokeWidth={5} label="বিশ্বাস" />
      </div>

      <div className="mt-4 pt-3 border-t border-[hsl(var(--border-subtle))] flex justify-between items-center text-xs text-muted-foreground">
        <span className="font-bengali">সমন্বিত স্কোর</span>
        <span className="font-mono-data font-bold text-foreground text-sm">{((truthScore + trustScore) / 2).toFixed(1)}%</span>
      </div>
    </motion.div>
  );
}
