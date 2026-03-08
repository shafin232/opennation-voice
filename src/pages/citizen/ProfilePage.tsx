import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ReputationBadge } from '@/components/shared/ReputationBadge';
import { CircularProgress } from '@/components/shared/CircularProgress';
import { Phone, MapPin, Calendar, User } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  const avgScore = Math.round((user.trustScore + user.truthScore) / 2);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 28 }}
      >
        <div className="glass-card rounded-2xl overflow-hidden gradient-shine">
          {/* Banner */}
          <div className="h-28 gradient-primary relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,_hsl(var(--teal)/0.3),_transparent_70%)]" />
          </div>

          {/* Profile content */}
          <div className="px-6 pb-6 -mt-14 text-center">
            <div className="mb-4">
              <ReputationBadge score={avgScore} size="lg" />
            </div>
            <h2 className="text-xl font-bengali font-bold text-foreground">{user.name}</h2>
            <Badge className="mt-1.5 text-[10px] bg-muted/30 border-[hsl(var(--border-subtle))] text-muted-foreground">{user.role}</Badge>

            {/* Score gauges */}
            <div className="flex items-center justify-center gap-8 mt-6">
              <CircularProgress value={user.trustScore} size={100} strokeWidth={7} label={t('trustScore')} />
              <CircularProgress value={user.truthScore} size={100} strokeWidth={7} label={t('truthScore')} />
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="glass p-3 rounded-xl text-left">
                <Phone className="h-3.5 w-3.5 text-muted-foreground mb-1.5" />
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">{t('phone')}</p>
                <p className="text-sm font-mono-data font-medium mt-0.5">{user.phone}</p>
              </div>
              <div className="glass p-3 rounded-xl text-left">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground mb-1.5" />
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">জেলা</p>
                <p className="text-sm font-bengali font-medium mt-0.5">{user.district}</p>
              </div>
            </div>

            {/* Join date */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/50 mt-5 pt-4 border-t border-[hsl(var(--border-subtle))]">
              <Calendar className="h-3 w-3" />
              <span className="font-bengali">যোগদান: {new Date(user.createdAt).toLocaleDateString('bn-BD')}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
