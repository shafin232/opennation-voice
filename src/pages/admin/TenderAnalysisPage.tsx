import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { winRateAnomaly, bidRotation, hhiIndex, executionRisk } from '@/lib/algorithms';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TrendingUp, AlertTriangle, BarChart3, Shield, Target } from 'lucide-react';

export default function TenderAnalysisPage() {
  const { tenders, loading, error, fetchTenders } = useAdmin();
  const { tenders, loading, error, fetchTenders } = useAdmin();
  const { t } = useLanguage();
  const [bidRotationData, setBidRotationData] = useState<any>(null);
  const [hhiData, setHhiData] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => { fetchTenders(); }, [fetchTenders]);

  const runFullAnalysis = async () => {
    setAnalyzing(true);
    try {
      const [brResult, hhiResult] = await Promise.all([
        bidRotation().catch(() => null),
        hhiIndex().catch(() => null),
      ]);
      setBidRotationData(brResult);
      setHhiData(hhiResult);

      // Run execution risk for each tender
      for (const tender of tenders) {
        await executionRisk(tender.id).catch(() => {});
      }
      // Refresh tenders to get updated risk scores
      await fetchTenders();
    } catch {
      // Non-blocking
    } finally {
      setAnalyzing(false);
    }
  };

  const riskConfig: Record<string, { className: string; label: string }> = {
    low_risk: { className: 'bg-success/10 text-success border-0', label: 'নিম্ন ঝুঁকি' },
    medium_risk: { className: 'bg-warning/10 text-warning border-0', label: 'মাঝারি ঝুঁকি' },
    high_risk: { className: 'bg-destructive/10 text-destructive border-0', label: 'উচ্চ ঝুঁকি' },
    critical: { className: 'bg-destructive text-destructive-foreground', label: 'সংকটপূর্ণ' },
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('tenderAnalysis')}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">টেন্ডার ঝুঁকি বিশ্লেষণ</p>
          </div>
        </div>
        <Button
          onClick={runFullAnalysis}
          disabled={analyzing || loading}
          size="sm"
          className="gap-1.5"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          {analyzing ? 'বিশ্লেষণ চলছে...' : 'AI বিশ্লেষণ চালান'}
        </Button>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchTenders} />}

      {/* Bid Rotation & HHI Analysis Cards */}
      {(bidRotationData || hhiData) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bidRotationData?.departments?.length > 0 && (
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-warning" />
                  বিড রোটেশন / কার্টেল ডিটেকশন
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {bidRotationData.departments.map((dept: any) => (
                  <div key={dept.department} className="p-2.5 rounded-lg bg-muted/50 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">{dept.department}</span>
                      <Badge className={`text-[10px] ${dept.risk === 'high' ? 'bg-destructive/10 text-destructive border-0' : dept.risk === 'medium' ? 'bg-warning/10 text-warning border-0' : 'bg-success/10 text-success border-0'}`}>
                        {dept.risk === 'high' ? 'উচ্চ ঝুঁকি' : dept.risk === 'medium' ? 'মাঝারি' : 'স্বাভাবিক'}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      প্রধান ঠিকাদার: {dept.dominant_contractors.join(', ')} | ঘনত্ব: {(dept.consistency * 100).toFixed(0)}%
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {hhiData?.departments?.length > 0 && (
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  HHI সূচক (পক্ষপাতিত্ব বিশ্লেষণ)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {hhiData.departments.map((dept: any) => (
                  <div key={dept.department} className="p-2.5 rounded-lg bg-muted/50 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">{dept.department}</span>
                      <Badge className={`text-[10px] ${dept.risk === 'critical' ? 'bg-destructive text-destructive-foreground' : dept.risk === 'high' ? 'bg-destructive/10 text-destructive border-0' : dept.risk === 'moderate' ? 'bg-warning/10 text-warning border-0' : 'bg-success/10 text-success border-0'}`}>
                        HHI: {dept.hhi}
                      </Badge>
                    </div>
                    <Progress value={Math.min(100, dept.hhi / 100)} className={`h-1.5 ${dept.hhi > 5000 ? '[&>div]:bg-destructive' : dept.hhi > 2500 ? '[&>div]:bg-warning' : '[&>div]:bg-success'}`} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

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
