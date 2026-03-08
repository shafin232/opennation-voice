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
  ThumbsUp, ThumbsDown, MapPin, Clock, Newspaper, FileText,
  ArrowUpRight, Shield, CheckCircle2, AlertCircle, Eye, Sparkles, Plus, Users, Zap
} from 'lucide-react';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const slamIn = {
  hidden: { scale: 0.92, opacity: 0, y: 12 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};

const approvalConfig: Record<string, { icon: typeof CheckCircle2; label: string; color: string }> = {
  auto_approved: { icon: CheckCircle2, label: 'Verified', color: 'text-success' },
  human_review: { icon: Eye, label: 'In Review', color: 'text-warning' },
  auto_rejected: { icon: AlertCircle, label: 'Rejected', color: 'text-destructive' },
  pending: { icon: Clock, label: 'Pending', color: 'text-muted-foreground' },
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

  const catColor: Record<string, string> = {
    infrastructure: 'bg-primary/8 text-primary',
    corruption: 'bg-destructive/8 text-destructive',
    health: 'bg-success/8 text-success',
    education: 'bg-violet-500/10 text-violet-400',
    environment: 'bg-primary/8 text-primary',
    safety: 'bg-warning/8 text-warning',
    governance: 'bg-primary/8 text-primary',
    other: 'bg-muted text-muted-foreground',
  };

  const stats = [
    { icon: FileText, label: 'Total Reports', value: reports.length, color: 'text-primary' },
    { icon: CheckCircle2, label: 'Verified', value: reports.filter(r => r.status === 'verified').length, color: 'text-success' },
    { icon: Users, label: 'Active Votes', value: reports.reduce((a, r) => a + r.supportCount + r.doubtCount, 0), color: 'text-accent' },
    { icon: Zap, label: 'Pending', value: reports.filter(r => r.status === 'pending').length, color: 'text-warning' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Live Feed</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-[0.95]">
            {user ? (
              <>স্বাগতম, <span className="gradient-text-neon">{user.name?.split(' ')[0]}</span></>
            ) : t('feed')}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">সর্বশেষ নাগরিক প্রতিবেদন ও গণভোট</p>
        </div>
        <Button
          onClick={() => navigate('/app/submit-report')}
          className="hidden sm:flex gap-2 bg-primary text-primary-foreground rounded-xl btn-glow glow-neon h-11 px-6 font-semibold"
        >
          <Plus className="h-4 w-4" /> রিপোর্ট
        </Button>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={slamIn}>
            <div className="glass-panel-hover p-5 rounded-2xl cursor-default group">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-9 w-9 rounded-xl bg-muted/30 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
              </div>
              <p className="stat-number text-3xl text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium tracking-wide">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {error && <ErrorBanner message={error} onRetry={() => fetchReports(1, true)} />}

      {loading && reports.length === 0 ? (
        <LoadingSkeleton rows={5} />
      ) : reports.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24">
          <motion.div
            className="h-24 w-24 rounded-3xl glass-panel flex items-center justify-center mx-auto mb-6"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Newspaper className="h-12 w-12 text-primary/25" />
          </motion.div>
          <h3 className="text-xl font-bold mb-2">কোনো প্রতিবেদন নেই</h3>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">প্রথম রিপোর্ট জমা দিয়ে পরিবর্তন শুরু করুন!</p>
          <Button
            onClick={() => navigate('/app/submit-report')}
            className="bg-primary text-primary-foreground glow-neon btn-glow gap-2 h-12 px-8 rounded-xl text-base font-semibold"
          >
            <FileText className="h-5 w-5" /> প্রথম রিপোর্ট জমা দিন
          </Button>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reports.map((report) => {
            const approval = approvalConfig[report.approvalDecision ?? 'pending'] || approvalConfig.pending;
            const ApprovalIcon = approval.icon;
            const truthPct = Math.round((report.truthProbability ?? 0.5) * 100);

            return (
              <motion.div key={report.id} variants={slamIn}>
                <div className="glass-panel-hover p-5 rounded-2xl h-full flex flex-col shine-top relative group">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-sm font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors tracking-tight">
                      {report.title}
                    </h3>
                    <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${catColor[report.category] || catColor.other}`}>
                      {t(report.category as any)}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-3">
                    <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{report.location.district}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{new Date(report.createdAt).toLocaleDateString('bn-BD')}</span>
                  </div>

                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 line-clamp-3 flex-1">{report.description}</p>

                  {/* Truth bar */}
                  <div className="mb-3 p-3 rounded-xl bg-muted/15 border border-border/30 space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`flex items-center gap-1.5 font-bold uppercase tracking-widest ${approval.color}`}>
                        <ApprovalIcon className="h-3 w-3" />
                        {approval.label}
                      </span>
                      <span className={`font-mono-data font-bold text-sm ${truthPct >= 70 ? 'text-success' : truthPct >= 40 ? 'text-warning' : 'text-destructive'}`}>
                        {truthPct}%
                      </span>
                    </div>
                    <Progress
                      value={truthPct}
                      className={`h-1.5 rounded-full bg-muted/30 ${
                        truthPct >= 70 ? '[&>div]:bg-success' : truthPct >= 40 ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'
                      }`}
                    />
                  </div>

                  {/* Votes */}
                  <div className="flex items-center gap-2 pt-3 border-t border-border/30">
                    <Button
                      size="sm"
                      variant={report.userVote === 'support' ? 'default' : 'outline'}
                      onClick={() => handleVote(report.id, 'support')}
                      disabled={crisisMode.active || voteLoading}
                      className={`gap-1.5 rounded-xl text-xs h-8 ${
                        report.userVote === 'support' ? 'bg-primary text-primary-foreground glow-neon' : 'border-border/40 hover:border-primary/30'
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
                      className={`gap-1.5 rounded-xl text-xs h-8 ${
                        report.userVote !== 'doubt' ? 'border-border/40 hover:border-destructive/30' : ''
                      }`}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      <span className="font-mono-data">{report.doubtCount}</span>
                    </Button>
                    <div className="flex-1" />
                    <span className="text-[10px] text-muted-foreground/40 font-medium">{report.authorName}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {hasMore && (
        <Button
          variant="outline"
          className="w-full h-12 rounded-2xl border-dashed border-border/40 hover:border-primary/30 transition-all font-semibold"
          onClick={loadMore}
          disabled={loading}
        >
          {loading ? t('loading') : 'আরো দেখুন'}
        </Button>
      )}

      {/* Mobile FAB */}
      <motion.div
        className="fixed bottom-24 right-4 z-40 sm:hidden"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.3 }}
      >
        <Button
          onClick={() => navigate('/app/submit-report')}
          className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground glow-neon btn-glow p-0"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>
    </div>
  );
}
