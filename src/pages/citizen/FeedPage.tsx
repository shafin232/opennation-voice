import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReports } from '@/hooks/useReports';
import { useVoting } from '@/hooks/useVoting';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, MapPin, Clock, Newspaper, TrendingUp, Users, FileText } from 'lucide-react';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const slamIn = {
  hidden: { scale: 0.9, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
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
    infrastructure: 'bg-primary/15 text-primary',
    corruption: 'bg-destructive/15 text-destructive',
    health: 'bg-success/15 text-success',
    education: 'bg-purple-500/15 text-purple-400',
    environment: 'bg-primary/15 text-primary',
    safety: 'bg-warning/15 text-warning',
    governance: 'bg-primary/15 text-primary',
    other: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow-teal">
          <Newspaper className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bengali font-bold text-foreground tracking-tight">{t('feed')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-bengali">সর্বশেষ নাগরিক প্রতিবেদন</p>
        </div>
      </motion.div>

      {/* Stats bento row */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { icon: FileText, label: 'মোট রিপোর্ট', value: reports.length, color: 'text-primary' },
          { icon: TrendingUp, label: 'যাচাইকৃত', value: reports.filter(r => r.status === 'verified').length, color: 'text-success' },
          { icon: Users, label: 'সক্রিয় ভোট', value: reports.reduce((a, r) => a + r.supportCount + r.doubtCount, 0), color: 'text-accent' },
          { icon: Clock, label: 'অপেক্ষমান', value: reports.filter(r => r.status === 'pending').length, color: 'text-warning' },
        ].map((stat, i) => (
          <motion.div key={i} variants={slamIn}>
            <div className="glass-strong rounded-xl p-4 hover:shadow-glow-teal transition-shadow">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="font-mono-data text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground font-bengali">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {error && <ErrorBanner message={error} onRetry={() => fetchReports(1, true)} />}

      {loading && reports.length === 0 ? (
        <LoadingSkeleton rows={5} />
      ) : reports.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl glass flex items-center justify-center mb-4">
            <Newspaper className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium font-bengali">{t('noData')}</p>
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {reports.map((report, i) => (
            <motion.div key={report.id} variants={slamIn} whileHover={{ y: -5 }}>
              <Card className="glass-strong border-[hsl(var(--border-subtle))] hover:shadow-glow-teal transition-all duration-300 h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base leading-snug font-bengali">{report.title}</CardTitle>
                    <Badge variant="secondary" className={`shrink-0 text-[10px] font-medium border-0 ${categoryColors[report.category] || ''}`}>
                      {t(report.category as any)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{report.location.district}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{new Date(report.createdAt).toLocaleDateString('bn-BD')}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{report.description}</p>
                  <div className="flex items-center gap-2.5">
                    <Button
                      size="sm"
                      variant={report.userVote === 'support' ? 'default' : 'outline'}
                      onClick={() => handleVote(report.id, 'support')}
                      disabled={crisisMode.active || voteLoading}
                      className={`gap-1.5 rounded-lg text-xs ${report.userVote === 'support' ? 'bg-primary text-primary-foreground shadow-glow-teal' : 'border-[hsl(var(--border-subtle))]'}`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span className="font-mono-data">{report.supportCount}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant={report.userVote === 'doubt' ? 'destructive' : 'outline'}
                      onClick={() => handleVote(report.id, 'doubt')}
                      disabled={crisisMode.active || voteLoading}
                      className={`gap-1.5 rounded-lg text-xs ${report.userVote !== 'doubt' ? 'border-[hsl(var(--border-subtle))]' : ''}`}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      <span className="font-mono-data">{report.doubtCount}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {hasMore && (
        <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-[hsl(var(--border-subtle))] font-bengali" onClick={loadMore} disabled={loading}>
          {loading ? t('loading') : 'আরো দেখুন'}
        </Button>
      )}
    </div>
  );
}
