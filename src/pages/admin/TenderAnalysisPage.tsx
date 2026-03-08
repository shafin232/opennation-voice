import { useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function TenderAnalysisPage() {
  const { tenders, loading, error, fetchTenders } = useAdmin();
  const { t } = useLanguage();

  useEffect(() => { fetchTenders(); }, [fetchTenders]);

  const riskConfig: Record<string, { className: string; label: string }> = {
    low_risk: { className: 'bg-success/10 text-success border-0', label: 'নিম্ন ঝুঁকি' },
    medium_risk: { className: 'bg-warning/10 text-warning border-0', label: 'মাঝারি ঝুঁকি' },
    high_risk: { className: 'bg-destructive/10 text-destructive border-0', label: 'উচ্চ ঝুঁকি' },
    critical: { className: 'bg-destructive text-destructive-foreground', label: 'সংকটপূর্ণ' },
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-warning" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('tenderAnalysis')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">টেন্ডার ঝুঁকি বিশ্লেষণ</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchTenders} />}

      {loading ? <LoadingSkeleton rows={4} /> : tenders.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">{t('noData')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tenders.map(tender => {
            const risk = riskConfig[tender.status] || riskConfig.low_risk;
            return (
              <Card key={tender.id} className={`border-border/60 hover:shadow-sm transition-all ${tender.riskScore >= 80 ? 'border-destructive/30' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-sm leading-snug">{tender.tenderTitle}</CardTitle>
                    <Badge className={`shrink-0 text-xs font-medium ${risk.className}`}>{risk.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-lg bg-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">বিভাগ</p>
                      <p className="text-sm font-medium mt-0.5">{tender.department}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">প্রদানকারী</p>
                      <p className="text-sm font-medium mt-0.5">{tender.awardedTo}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">আনুমানিক</p>
                      <p className="text-sm font-medium mt-0.5">৳{tender.estimatedCost.toLocaleString()}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">প্রকৃত</p>
                      <p className="text-sm font-medium mt-0.5">৳{tender.actualCost.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium">{t('riskLevel')}</span>
                      <span className={`font-bold ${tender.riskScore >= 70 ? 'text-destructive' : tender.riskScore >= 40 ? 'text-warning' : 'text-success'}`}>{tender.riskScore}%</span>
                    </div>
                    <Progress value={tender.riskScore} className={`h-2.5 rounded-full ${tender.riskScore >= 70 ? '[&>div]:bg-destructive' : tender.riskScore >= 40 ? '[&>div]:bg-warning' : '[&>div]:bg-success'}`} />
                  </div>
                  {tender.riskFactors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tender.riskFactors.map(f => (
                        <Badge key={f} variant="outline" className="text-[10px] font-normal px-2 py-0.5 gap-1">
                          <AlertTriangle className="h-2.5 w-2.5" />{f}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
