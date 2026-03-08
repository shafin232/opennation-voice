import { useEffect } from 'react';
import { useIntegrity } from '@/hooks/useIntegrity';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MapPin, FileText, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DistrictIntegrityPage() {
  const { metrics, loading, error, fetchMetrics } = useIntegrity();
  const { t } = useLanguage();

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl gradient-accent flex items-center justify-center shadow-sm">
          <MapPin className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('districtIntegrity')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">জেলাভিত্তিক নিয়ন্ত্রণ ও মেট্রিক্স</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={() => fetchMetrics()} />}

      {loading ? <LoadingSkeleton rows={4} /> : metrics.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">{t('noData')}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metrics.map(m => (
              <Card key={m.district} className="border-border/60 hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">{m.district}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium">{t('trustScore')}</span>
                      <span className={`font-bold ${m.trustScore >= 70 ? 'text-success' : m.trustScore >= 40 ? 'text-warning' : 'text-destructive'}`}>{m.trustScore}%</span>
                    </div>
                    <Progress value={m.trustScore} className={`h-2 rounded-full ${m.trustScore >= 70 ? '[&>div]:bg-success' : m.trustScore >= 40 ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'}`} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium">{t('truthScore')}</span>
                      <span className={`font-bold ${m.truthScore >= 70 ? 'text-success' : m.truthScore >= 40 ? 'text-warning' : 'text-destructive'}`}>{m.truthScore}%</span>
                    </div>
                    <Progress value={m.truthScore} className={`h-2 rounded-full ${m.truthScore >= 70 ? '[&>div]:bg-success' : m.truthScore >= 40 ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'}`} />
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{m.totalReports}</span>
                    <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />{m.resolvedReports}</span>
                    <span>RTI: {m.rtiResponseRate}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">তুলনামূলক চার্ট</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={metrics} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="district" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px hsl(var(--foreground)/0.08)' }} />
                  <Bar dataKey="trustScore" name={t('trustScore')} fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="truthScore" name={t('truthScore')} fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
