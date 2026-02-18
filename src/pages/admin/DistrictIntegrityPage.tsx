import { useEffect } from 'react';
import { useIntegrity } from '@/hooks/useIntegrity';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DistrictIntegrityPage() {
  const { metrics, loading, error, fetchMetrics } = useIntegrity();
  const { t } = useLanguage();

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <MapPin className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t('districtIntegrity')}</h1>
      </div>

      {error && <ErrorBanner message={error} onRetry={() => fetchMetrics()} />}

      {loading ? <LoadingSkeleton rows={4} /> : metrics.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t('noData')}</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metrics.map(m => (
              <Card key={m.district}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{m.district}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>{t('trustScore')}</span><span>{m.trustScore}%</span></div>
                    <Progress value={m.trustScore} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>{t('truthScore')}</span><span>{m.truthScore}%</span></div>
                    <Progress value={m.truthScore} className="h-2" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    রিপোর্ট: {m.totalReports} · সমাধান: {m.resolvedReports} · RTI: {m.rtiResponseRate}%
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm">তুলনামূলক চার্ট</CardTitle></CardHeader>
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
        </>
      )}
    </div>
  );
}
