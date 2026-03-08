import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReports } from '@/hooks/useReports';
import { useVoting } from '@/hooks/useVoting';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, MapPin, Clock, Newspaper, TrendingUp, Users, FileText, ArrowUpRight, Shield } from 'lucide-react';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const slamIn = {
  hidden: { scale: 0.92, opacity: 0, y: 8 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};

export default function FeedPage() {
  const { reports, loading, error, fetchReports, loadMore, hasMore } = useReports();
  const { vote, loading: voteLoading } = useVoting();
  const { t } = useLanguage();
  const { crisisMode } = useApp();

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
    { icon: FileText, label: 'মোট রিপোর্ট', value: reports.length, color: 'text-primary', glow: 'shadow-glow-teal' },
    { icon: TrendingUp, label: 'যাচাইকৃত', value: reports.filter(r => r.status === 'verified').length, color: 'text-success', glow: '' },
    { icon: Users, label: 'সক্রিয় ভোট', value: reports.reduce((a, r) => a + r.supportCount + r.doubtCount, 0), color: 'text-accent', glow: 'shadow-glow-amber' },
    { icon: Clock, label: 'অপেক্ষমান', value: reports.filter(r => r.status === 'pending').length, color: 'text-warning', glow: '' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-1"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="h-11 w-11 rounded-2xl gradient-primary flex items-center justify-center shadow-glow-teal">
            <Newspaper className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bengali font-bold text-foreground tracking-tight leading-none">{t('feed')}</h1>
            <p className="text-sm text-muted-foreground mt-1 font-bengali">সর্বশেষ নাগরিক প্রতিবেদন ও গণভোট</p>
          </div>
        </div>
      </motion.div>

      {/* Stats bento — premium floating cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {stats.map((stat, i) => (
          <motion.div key={i} variants={slamIn} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
            <div className={`glass-card p-5 rounded-2xl gradient-shine ${stat.glow} transition-all duration-300 cursor-default`}>
              <div className="flex items-center justify-between mb-3">
                <div className="h-8 w-8 rounded-xl bg-muted/30 flex items-center justify-center">
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
        /* Premium empty state */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="relative inline-block mb-6">
            <div className="h-20 w-20 rounded-3xl glass-card flex items-center justify-center mx-auto">
              <Newspaper className="h-10 w-10 text-primary/40" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="h-3 w-3 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-bengali font-semibold text-foreground mb-2">কোনো প্রতিবেদন নেই</h3>
          <p className="text-sm text-muted-foreground font-bengali mb-6 max-w-sm mx-auto">
            এখনো কোনো নাগরিক প্রতিবেদন জমা হয়নি। প্রথম রিপোর্ট জমা দিন।
          </p>
          <Button className="bg-primary text-primary-foreground shadow-glow-teal font-bengali btn-press gap-2">
            <FileText className="h-4 w-4" />
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
          {reports.map((report) => (
            <motion.div
              key={report.id}
              variants={slamIn}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="glass-card p-5 rounded-2xl h-full flex flex-col gradient-shine transition-all duration-300">
                {/* Top edge highlight */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-sm font-semibold leading-snug font-bengali text-foreground line-clamp-2">{report.title}</h3>
                  <Badge className={`shrink-0 text-[10px] font-medium border ${categoryColors[report.category] || categoryColors.other}`}>
                    {t(report.category as any)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-3">
                  <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{report.location.district}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{new Date(report.createdAt).toLocaleDateString('bn-BD')}</span>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 line-clamp-3 flex-1">{report.description}</p>
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
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {hasMore && (
        <Button variant="outline" className="w-full h-12 rounded-2xl border-dashed border-[hsl(var(--border-subtle))] font-bengali btn-press hover:border-primary/30 transition-colors" onClick={loadMore} disabled={loading}>
          {loading ? t('loading') : 'আরো দেখুন'}
        </Button>
      )}
    </div>
  );
}
