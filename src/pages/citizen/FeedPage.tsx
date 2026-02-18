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
import { ThumbsUp, ThumbsDown, MapPin, Clock } from 'lucide-react';

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
    infrastructure: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    corruption: 'bg-red-500/10 text-red-700 dark:text-red-300',
    health: 'bg-green-500/10 text-green-700 dark:text-green-300',
    education: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
    environment: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    safety: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
    governance: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    other: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">{t('feed')}</h1>

      {error && <ErrorBanner message={error} onRetry={() => fetchReports(1, true)} />}

      {loading && reports.length === 0 ? (
        <LoadingSkeleton rows={5} />
      ) : reports.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t('noData')}</p>
      ) : (
        <div className="space-y-3">
          {reports.map(report => (
            <Card key={report.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <Badge variant="secondary" className={categoryColors[report.category] || ''}>
                    {t(report.category as any)}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{report.location.district}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(report.createdAt).toLocaleDateString('bn-BD')}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={report.userVote === 'support' ? 'default' : 'outline'}
                    onClick={() => handleVote(report.id, 'support')}
                    disabled={crisisMode.active || voteLoading}
                    className="gap-1"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {t('support')} ({report.supportCount})
                  </Button>
                  <Button
                    size="sm"
                    variant={report.userVote === 'doubt' ? 'destructive' : 'outline'}
                    onClick={() => handleVote(report.id, 'doubt')}
                    disabled={crisisMode.active || voteLoading}
                    className="gap-1"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    {t('doubt')} ({report.doubtCount})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {hasMore && (
            <Button variant="outline" className="w-full" onClick={loadMore} disabled={loading}>
              {loading ? t('loading') : 'আরো দেখুন'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
