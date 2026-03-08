import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReports } from '@/hooks/useReports';
import { useVoting } from '@/hooks/useVoting';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import {
  ThumbsUp, ThumbsDown, MapPin, Clock, Newspaper, TrendingUp, Users, FileText,
  ArrowUpRight, Shield, CheckCircle2, AlertCircle, Eye, Sparkles, Plus
} from 'lucide-react';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const slamIn = {
  hidden: { scale: 0.92, opacity: 0, y: 8 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};

const approvalBadge: Record<string, { icon: typeof CheckCircle2; label: string; className: string }> = {
  auto_approved: { icon: CheckCircle2, label: 'যাচাইকৃত', className: 'bg-success/10 text-success border-success/20' },
  human_review: { icon: Eye, label: 'পর্যালোচনায়', className: 'bg-warning/10 text-warning border-warning/20' },
  auto_rejected: { icon: AlertCircle, label: 'প্রত্যাখ্যাত', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  pending: { icon: Clock, label: 'অপেক্ষমান', className: 'bg-muted/50 text-muted-foreground border-border/50' },
};

export default function FeedPage() {
  const { reports, loading, error, fetchReports, loadMore, hasMore } = useReports();
  const { vote, loading: voteLoading } = useVoting();
  const { t } = useLanguage();
  const { crisisMode } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchReports(1, true); }, [fetchReports]);

  const handleVote = async (reportId: string, type: 'support' | 'doubt') => {
    const result = await vote({ reportId, type });
    if (result) fetchReports(1, true);
  };

  const categoryColors: Record<string, string> = {
    infrastructure: 'bg-primary/10 text-primary border-primary/10',
    corruption: 'bg-destructive/10 text-destructive border-destructive/10',
    health: 'bg-success/10 text-success border-success/10',
    education: 'bg-purple-500/10 text-purple-400 border-purple-400/10',
    environment: 'bg-primary/10 text-primary border-primary/10',
    safety: 'bg-warning/10 text-warning border-warning/10',
    governance: 'bg-primary/10 text-primary border-primary/10',
    other: 'bg-muted/50 text-muted-foreground border-border',
  };

  const stats = [
    { icon: FileText, label: 'মোট রিপোর্ট', value: reports.length, color: 'text-primary', glow: 'shadow-glow-teal', gradient: 'from-primary/5 to-transparent' },
    { icon: CheckCircle2, label: 'যাচাইকৃত', value: reports.filter(r => r.status === 'verified').length, color: 'text-success', glow: '', gradient: 'from-success/5 to-transparent' },
    { icon: Users, label: 'সক্রিয় ভোট', value: reports.reduce((a, r) => a + r.supportCount + r.doubtCount, 0), color: 'text-accent', glow: 'shadow-glow-amber', gradient: 'from-accent/5 to-transparent' },
    { icon: Clock, label: 'অপেক্ষমান', value: reports.filter(r => r.status === 'pending').length, color: 'text-warning', glow: '', gradient: 'from-warning/5 to-transparent' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Hero — shows greeting */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow-teal">
              <Newspaper className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-bengali font-bold text-foreground tracking-tight leading-none">
                  {user ? `স্বাগতম, ${user.name?.split(' ')[0]}` : t('feed')}
                </h1>
                <motion.div
                  animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                  transition={{ duration: 2, delay: 0.5 }}
                >
                  <Sparkles className="h-5 w-5 text-accent" />
                </motion.div>
              </div>
              <p className="text-sm text-muted-foreground mt-1 font-bengali">সর্বশেষ নাগরিক প্রতিবেদন ও গণভোট</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/app/submit-report')}
            className="hidden sm:flex gap-2 bg-primary text-primary-foreground shadow-glow-teal font-bengali btn-press"
          >
            <Plus className="h-4 w-4" />
            রিপোর্ট করুন
          </Button>
        </div>
      </motion.div>

      {/* Stats bento */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={slamIn} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
            <div className={`glass-card p-5 rounded-2xl gradient-shine bg-gradient-to-br ${stat.gradient} ${stat.glow} transition-all duration-300 cursor-default`}>
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-xl bg-muted/30 flex items-center justify-center">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40" />
              </div>
              <p className="font-mono-data text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground font-bengali mt-1">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {error && <ErrorBanner message={error} onRetry={() => fetchReports(1, true)} />}

      {loading && reports.length === 0 ? (
        <LoadingSkeleton rows={5} />
      ) : reports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="relative inline-block mb-6">
            <motion.div
              className="h-24 w-24 rounded-3xl glass-card flex items-center justify-center mx-auto"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Newspaper className="h-12 w-12 text-primary/30" />
            </motion.div>
            <motion.div
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center border-2 border-background"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="h-4 w-4 text-primary" />
            </motion.div>
          </div>
          <h3 className="text-xl font-bengali font-bold text-foreground mb-2">কোনো প্রতিবেদন নেই</h3>
          <p className="text-sm text-muted-foreground font-bengali mb-8 max-w-sm mx-auto">
            এখনো কোনো নাগরিক প্রতিবেদন জমা হয়নি। প্রথম রিপোর্ট জমা দিয়ে পরিবর্তন শুরু করুন!
          </p>
          <Button
            onClick={() => navigate('/app/submit-report')}
            className="bg-primary text-primary-foreground shadow-glow-teal font-bengali btn-press gap-2 h-12 px-8 text-base"
          >
            <FileText className="h-5 w-5" />
            প্রথম রিপোর্ট জমা দিন
          </Button>
        </motion.div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {reports.map((report) => {
            const approval = approvalBadge[report.approvalDecision ?? 'pending'] || approvalBadge.pending;
            const ApprovalIcon = approval.icon;
            const truthPct = Math.round((report.truthProbability ?? 0.5) * 100);

            return (
              <motion.div
                key={report.id}
                variants={slamIn}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="glass-card p-5 rounded-2xl h-full flex flex-col gradient-shine transition-all duration-300 group">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-sm font-semibold leading-snug font-bengali text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {report.title}
                    </h3>
                    <Badge className={`shrink-0 text-[10px] font-medium border ${categoryColors[report.category] || categoryColors.other}`}>
                      {t(report.category as any)}
                    </Badge>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-3">
                    <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{report.location.district}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{new Date(report.createdAt).toLocaleDateString('bn-BD')}</span>
                  </div>

                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 line-clamp-3 flex-1">{report.description}</p>

                  {/* Truth Score Bar */}
                  <div className="mb-3 p-2.5 rounded-xl bg-muted/20 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1.5 font-semibold text-muted-foreground uppercase tracking-wider">
                        <ApprovalIcon className="h-3 w-3" />
                        {approval.label}
                      </span>
                      <span className={`font-mono-data font-bold ${truthPct >= 70 ? 'text-success' : truthPct >= 40 ? 'text-warning' : 'text-destructive'}`}>
                        {truthPct}%
                      </span>
                    </div>
                    <Progress
                      value={truthPct}
                      className={`h-1.5 rounded-full ${
                        truthPct >= 70 ? '[&>div]:bg-success' : truthPct >= 40 ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'
                      }`}
                    />
                  </div>

                  {/* Vote buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[hsl(var(--border-subtle))]">
                    <Button
                      size="sm"
                      variant={report.userVote === 'support' ? 'default' : 'outline'}
                      onClick={() => handleVote(report.id, 'support')}
                      disabled={crisisMode.active || voteLoading}
                      className={`gap-1.5 rounded-xl text-xs btn-press ${
                        report.userVote === 'support'
                          ? 'bg-primary text-primary-foreground shadow-glow-teal'
                          : 'border-[hsl(var(--border-subtle))] hover:border-primary/30'
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span className="font-mono-data">{report.supportCount}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant={report.userVote === 'doubt' ? 'destructive' : 'outline'}
                      onClick={() => handleVote(report.id, 'doubt')}
                      disabled={crisisMode.active || voteLoading}
                      className={`gap-1.5 rounded-xl text-xs btn-press ${
                        report.userVote !== 'doubt' ? 'border-[hsl(var(--border-subtle))] hover:border-destructive/30' : ''
                      }`}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      <span className="font-mono-data">{report.doubtCount}</span>
                    </Button>
                    <div className="flex-1" />
                    <span className="text-[10px] text-muted-foreground/50 font-bengali">{report.authorName}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {hasMore && (
        <Button variant="outline" className="w-full h-12 rounded-2xl border-dashed border-[hsl(var(--border-subtle))] font-bengali btn-press hover:border-primary/30 transition-colors" onClick={loadMore} disabled={loading}>
          {loading ? t('loading') : 'আরো দেখুন'}
        </Button>
      )}

      {/* Mobile FAB */}
      <motion.div
        className="fixed bottom-20 right-4 z-40 sm:hidden"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.3 }}
      >
        <Button
          onClick={() => navigate('/app/submit-report')}
          className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-glow-teal btn-press p-0"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>
    </div>
  );
}
