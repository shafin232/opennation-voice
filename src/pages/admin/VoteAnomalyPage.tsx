import { useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, Clock } from 'lucide-react';

export default function VoteAnomalyPage() {
  const { anomalies, loading, error, fetchAnomalies } = useAdmin();
  const { t } = useLanguage();

  useEffect(() => { fetchAnomalies(); }, [fetchAnomalies]);

  const severityConfig: Record<string, { className: string; label: string }> = {
    low: { className: 'bg-warning/10 text-warning border-0', label: 'নিম্ন' },
    medium: { className: 'bg-destructive/10 text-destructive border-0', label: 'মাঝারি' },
    high: { className: 'bg-destructive text-destructive-foreground', label: 'উচ্চ' },
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
          <Activity className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('voteAnomaly')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">সন্দেহজনক ভোটিং কার্যক্রম</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchAnomalies} />}

      {loading ? <LoadingSkeleton rows={4} /> : anomalies.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-success/10 flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-success" />
          </div>
          <p className="text-muted-foreground font-medium">কোনো অসঙ্গতি সনাক্ত হয়নি</p>
        </div>
      ) : (
        <div className="space-y-3">
          {anomalies.map(a => {
            const severity = severityConfig[a.severity] || severityConfig.low;
            return (
              <Card key={a.id} className={`border-border/60 hover:shadow-sm transition-all ${a.severity === 'high' ? 'border-destructive/30' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      </div>
                      <CardTitle className="text-sm leading-snug">{a.reportTitle}</CardTitle>
                    </div>
                    <Badge className={`shrink-0 text-xs font-medium ${severity.className}`}>{severity.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">{a.details}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Activity className="h-3 w-3" />ধরন: {a.anomalyType}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(a.detectedAt).toLocaleString('bn-BD')}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
