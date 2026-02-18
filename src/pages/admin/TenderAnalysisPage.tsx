import { useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';

export default function TenderAnalysisPage() {
  const { tenders, loading, error, fetchTenders } = useAdmin();
  const { t } = useLanguage();

  useEffect(() => { fetchTenders(); }, [fetchTenders]);

  const riskColor: Record<string, string> = {
    low_risk: 'bg-green-500/10 text-green-700 dark:text-green-400',
    medium_risk: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    high_risk: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    critical: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t('tenderAnalysis')}</h1>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchTenders} />}

      {loading ? <LoadingSkeleton rows={4} /> : tenders.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t('noData')}</p>
      ) : (
        <div className="space-y-3">
          {tenders.map(tender => (
            <Card key={tender.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">{tender.tenderTitle}</CardTitle>
                  <Badge className={riskColor[tender.status] || ''}>{t(tender.status.replace('_', '') as any) || tender.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span>বিভাগ: {tender.department}</span>
                  <span>প্রদানকারী: {tender.awardedTo}</span>
                  <span>আনুমানিক: ৳{tender.estimatedCost.toLocaleString()}</span>
                  <span>প্রকৃত: ৳{tender.actualCost.toLocaleString()}</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{t('riskLevel')}</span><span>{tender.riskScore}%</span>
                  </div>
                  <Progress value={tender.riskScore} className="h-2" />
                </div>
                {tender.riskFactors.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tender.riskFactors.map(f => (
                      <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
