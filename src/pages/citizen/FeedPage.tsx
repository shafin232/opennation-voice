import { useEffect } from 'react';
import { useReports } from '@/hooks/useReports';
import { useVoting } from '@/hooks/useVoting';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, MapPin, Clock, Newspaper } from 'lucide-react';

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
    infrastructure: 'bg-primary/10 text-primary',
    corruption: 'bg-destructive/10 text-destructive',
    health: 'bg-success/10 text-success',
    education: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    environment: 'bg-accent/10 text-accent',
    safety: 'bg-warning/10 text-warning',
    governance: 'bg-primary/10 text-primary',
    other: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
          <Newspaper className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('feed')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">সর্বশেষ নাগরিক প্রতিবেদন</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={() => fetchReports(1, true)} />}

      {loading && reports.length === 0 ? (
        <LoadingSkeleton rows={5} />
      ) : reports.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Newspaper className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">{t('noData')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report, i) => (
            <Card key={report.id} className="group hover:shadow-md transition-all duration-200 animate-slide-up border-border/60" style={{ animationDelay: `${i * 50}ms` }}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base leading-snug">{report.title}</CardTitle>
                  <Badge variant="secondary" className={`shrink-0 text-xs font-medium ${categoryColors[report.category] || ''}`}>
                    {t(report.category as any)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{report.location.district}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{new Date(report.createdAt).toLocaleDateString('bn-BD')}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{report.description}</p>
                <div className="flex items-center gap-2.5">
                  <Button
                    size="sm"
                    variant={report.userVote === 'support' ? 'default' : 'outline'}
                    onClick={() => handleVote(report.id, 'support')}
                    disabled={crisisMode.active || voteLoading}
                    className={`gap-1.5 rounded-lg ${report.userVote === 'support' ? 'gradient-primary border-0' : ''}`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {t('support')} ({report.supportCount})
                  </Button>
                  <Button
                    size="sm"
                    variant={report.userVote === 'doubt' ? 'destructive' : 'outline'}
                    onClick={() => handleVote(report.id, 'doubt')}
                    disabled={crisisMode.active || voteLoading}
                    className="gap-1.5 rounded-lg"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    {t('doubt')} ({report.doubtCount})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {hasMore && (
            <Button variant="outline" className="w-full h-12 rounded-xl border-dashed" onClick={loadMore} disabled={loading}>
              {loading ? t('loading') : 'আরো দেখুন'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
