import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ReputationBadge } from '@/components/shared/ReputationBadge';
import { CircularProgress } from '@/components/shared/CircularProgress';
import { Phone, MapPin, Calendar, Mail, Shield, Activity, FileText, ThumbsUp, Award } from 'lucide-react';

const slamIn = {
  hidden: { scale: 0.92, opacity: 0, y: 8 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  const avgScore = Math.round((user.trustScore + user.truthScore) / 2);

  const roleConfig: Record<string, { label: string; className: string }> = {
    citizen: { label: 'নাগরিক', className: 'bg-primary/10 text-primary border-primary/20' },
    moderator: { label: 'মডারেটর', className: 'bg-warning/10 text-warning border-warning/20' },
    admin: { label: 'প্রশাসক', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    superadmin: { label: 'সুপার অ্যাডমিন', className: 'bg-accent/10 text-accent border-accent/20' },
  };

  const role = roleConfig[user.role] || roleConfig.citizen;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Profile Hero Card */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 28 }}
      >
        <div className="glass-card rounded-2xl overflow-hidden gradient-shine">
          {/* Banner with animated gradient */}
          <div className="h-32 relative overflow-hidden">
            <div className="absolute inset-0 gradient-primary" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_120%,_hsl(var(--amber)/0.2),_transparent_60%)]" />
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 80% 20%, hsl(var(--teal) / 0.3), transparent 50%)',
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            {/* Floating shield icon */}
            <motion.div
              className="absolute top-4 right-4 h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Shield className="h-5 w-5 text-white/80" />
            </motion.div>
          </div>

          {/* Profile content */}
          <div className="px-6 pb-6 -mt-16 text-center relative">
            <div className="mb-3">
              <ReputationBadge score={avgScore} size="lg" />
            </div>
            <h2 className="text-2xl font-bengali font-bold text-foreground">{user.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge className={`text-[10px] font-semibold border ${role.className}`}>
                {role.label}
              </Badge>
              {user.email && (
                <Badge variant="outline" className="text-[10px] gap-1 border-[hsl(var(--border-subtle))]">
                  <Mail className="h-2.5 w-2.5" />
                  {user.email}
                </Badge>
              )}
            </div>

            {/* Score gauges */}
            <div className="flex items-center justify-center gap-10 mt-8">
              <CircularProgress value={user.trustScore} size={110} strokeWidth={8} label={t('trustScore')} />
              <div className="h-16 w-px bg-border/30" />
              <CircularProgress value={user.truthScore} size={110} strokeWidth={8} label={t('truthScore')} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info Grid */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
        <motion.div variants={slamIn}>
          <div className="glass-card p-4 rounded-2xl gradient-shine">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">জেলা</p>
            <p className="text-sm font-bengali font-semibold mt-0.5 text-foreground">{user.district || '—'}</p>
          </div>
        </motion.div>
        <motion.div variants={slamIn}>
          <div className="glass-card p-4 rounded-2xl gradient-shine">
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
              <Phone className="h-4 w-4 text-accent" />
            </div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">{t('phone')}</p>
            <p className="text-sm font-mono-data font-semibold mt-0.5 text-foreground">{user.phone || '—'}</p>
          </div>
        </motion.div>
        <motion.div variants={slamIn}>
          <div className="glass-card p-4 rounded-2xl gradient-shine">
            <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center mb-2">
              <Award className="h-4 w-4 text-success" />
            </div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">গড় স্কোর</p>
            <p className="text-2xl font-mono-data font-bold mt-0.5 text-foreground">{avgScore}<span className="text-xs text-muted-foreground">/100</span></p>
          </div>
        </motion.div>
        <motion.div variants={slamIn}>
          <div className="glass-card p-4 rounded-2xl gradient-shine">
            <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center mb-2">
              <Calendar className="h-4 w-4 text-warning" />
            </div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">যোগদান</p>
            <p className="text-sm font-bengali font-semibold mt-0.5 text-foreground">
              {new Date(user.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Language preference */}
      <motion.div variants={slamIn} initial="hidden" animate="show">
        <div className="glass-card p-4 rounded-2xl gradient-shine flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-muted/30 flex items-center justify-center">
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">ভাষা</p>
              <p className="text-sm font-bengali font-semibold text-foreground">{user.language === 'bn' ? 'বাংলা' : 'English'}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] border-[hsl(var(--border-subtle))]">
            {user.language?.toUpperCase()}
          </Badge>
        </div>
      </motion.div>
    </div>
  );
}
