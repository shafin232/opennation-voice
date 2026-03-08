import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { ReputationBadge } from '@/components/shared/ReputationBadge';
import { CircularProgress } from '@/components/shared/CircularProgress';
import { Phone, MapPin, Calendar, Mail, Shield, Activity, Award, ExternalLink } from 'lucide-react';

const slamIn = {
  hidden: { scale: 0.92, opacity: 0, y: 12 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  if (!user) return null;

  const avgScore = Math.round((user.trustScore + user.truthScore) / 2);

  const roleConfig: Record<string, { label: string; color: string }> = {
    citizen: { label: 'Citizen', color: 'badge-neon' },
    moderator: { label: 'Moderator', color: 'bg-warning/10 text-warning border border-warning/20' },
    admin: { label: 'Admin', color: 'bg-destructive/10 text-destructive border border-destructive/20' },
    superadmin: { label: 'Super Admin', color: 'bg-accent/10 text-accent border border-accent/20' },
  };
  const role = roleConfig[user.role] || roleConfig.citizen;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Profile Hero */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <div className="glass-panel rounded-3xl overflow-hidden shine-top relative">
          {/* Banner */}
          <div className="h-36 relative overflow-hidden">
            <div className="absolute inset-0 gradient-brand" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_120%,_hsl(var(--neon-amber)/0.15),_transparent_60%)]" />
            <motion.div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at 80% 20%, hsl(var(--neon) / 0.25), transparent 50%)' }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            {/* Floating badge */}
            <motion.div
              className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/10 flex items-center gap-1.5"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Shield className="h-3.5 w-3.5 text-primary-foreground/80" />
              <span className="text-[10px] font-bold text-primary-foreground/80 tracking-wider uppercase">{role.label}</span>
            </motion.div>
          </div>

          {/* Content */}
          <div className="px-6 pb-8 -mt-14 text-center relative z-10">
            <div className="mb-3">
              <ReputationBadge score={avgScore} size="lg" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>
            {user.email && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
                <Mail className="h-3 w-3" />{user.email}
              </p>
            )}

            {/* Score rings */}
            <div className="flex items-center justify-center gap-12 mt-8">
              <CircularProgress value={user.trustScore} size={100} strokeWidth={7} label={t('trustScore')} />
              <div className="h-14 w-px bg-border/20" />
              <CircularProgress value={user.truthScore} size={100} strokeWidth={7} label={t('truthScore')} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info bento */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
        {[
          { icon: MapPin, label: 'District', value: user.district || '—', color: 'text-primary' },
          { icon: Phone, label: 'Phone', value: user.phone || '—', color: 'text-accent', mono: true },
          { icon: Award, label: 'Avg Score', value: `${avgScore}/100`, color: 'text-success', big: true },
          { icon: Calendar, label: 'Joined', value: new Date(user.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short' }), color: 'text-warning' },
        ].map((item, i) => (
          <motion.div key={i} variants={slamIn}>
            <div className="glass-panel-hover p-4 rounded-2xl cursor-default">
              <div className={`h-8 w-8 rounded-lg bg-muted/20 flex items-center justify-center mb-3`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-0.5">{item.label}</p>
              <p className={`font-bold tracking-tight ${item.big ? 'text-2xl stat-number' : 'text-sm'} ${item.mono ? 'font-mono-data' : ''}`}>
                {item.value}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Language */}
      <motion.div variants={slamIn} initial="hidden" animate="show">
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-muted/20 flex items-center justify-center">
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Language</p>
              <p className="text-sm font-bold">{user.language === 'bn' ? 'বাংলা' : 'English'}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono-data font-bold text-muted-foreground bg-muted/20 px-2.5 py-1 rounded-md">
            {user.language?.toUpperCase()}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
