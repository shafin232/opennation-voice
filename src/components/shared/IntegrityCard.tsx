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
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ y: -5, boxShadow: '0 12px 40px -8px hsl(174 55% 45% / 0.2)' }}
      className="rounded-xl glass-strong p-5 group cursor-default transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bengali font-semibold text-foreground">{district}</h3>
          <p className="text-xs text-muted-foreground font-mono-data mt-0.5">{totalReports} রিপোর্ট</p>
        </div>
        {verified && (
          <Badge className="bg-primary/15 text-primary border-0 gap-1 animate-pulse text-xs">
            <CheckCircle className="h-3 w-3" />
            যাচাইকৃত
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-around">
        <CircularProgress value={truthScore} size={90} strokeWidth={6} label="সত্যতা" />
        <CircularProgress value={trustScore} size={90} strokeWidth={6} label="বিশ্বাস" />
      </div>

      <div className="mt-4 pt-3 border-t border-[hsl(var(--border-subtle))] flex justify-between text-xs text-muted-foreground">
        <span>সত্যতা স্কোর</span>
        <span className="font-mono-data font-semibold text-foreground">{((truthScore + trustScore) / 2).toFixed(1)}%</span>
      </div>
    </motion.div>
  );
}
