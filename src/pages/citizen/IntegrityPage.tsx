import { useEffect } from 'react';
import { useIntegrity } from '@/hooks/useIntegrity';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function IntegrityPage() {
  const { metrics, loading, error, fetchMetrics } = useIntegrity();
  const { t } = useLanguage();

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">{t('integrity')}</h1>

      {error && <ErrorBanner message={error} onRetry={() => fetchMetrics()} />}

      {loading ? <LoadingSkeleton rows={3} /> : metrics.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t('noData')}</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metrics.slice(0, 6).map(m => (
              <Card key={m.district}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{m.district}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{t('trustScore')}</span>
                      <span>{m.trustScore}%</span>
                    </div>
                    <Progress value={m.trustScore} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{t('truthScore')}</span>
                      <span>{m.truthScore}%</span>
                    </div>
                    <Progress value={m.truthScore} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>{t('totalReports')}: {m.totalReports}</span>
                    <span>{t('verified')}: {m.verifiedReports}</span>
                    <span>{t('resolved')}: {m.resolvedReports}</span>
                    <span>RTI: {m.rtiResponseRate}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {metrics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">জেলাভিত্তিক সততা তুলনা</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="district" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="trustScore" name={t('trustScore')} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="truthScore" name={t('truthScore')} fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
