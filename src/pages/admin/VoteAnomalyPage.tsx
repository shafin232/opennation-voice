import { useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

export default function VoteAnomalyPage() {
  const { anomalies, loading, error, fetchAnomalies } = useAdmin();
  const { t } = useLanguage();

  useEffect(() => { fetchAnomalies(); }, [fetchAnomalies]);

  const severityColor: Record<string, string> = {
    low: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    medium: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    high: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Activity className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t('voteAnomaly')}</h1>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchAnomalies} />}

      {loading ? <LoadingSkeleton rows={4} /> : anomalies.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t('noData')}</p>
      ) : (
        <div className="space-y-3">
          {anomalies.map(a => (
            <Card key={a.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">{a.reportTitle}</CardTitle>
                  <Badge className={severityColor[a.severity] || ''}>{a.severity}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{a.details}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>ধরন: {a.anomalyType}</span>
                  <span>সনাক্ত: {new Date(a.detectedAt).toLocaleString('bn-BD')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
