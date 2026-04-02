import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TrendingUp, AlertTriangle, HeartPulse } from 'lucide-react';
import type { TenderAnalysis } from '@/types';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const slamIn = {
  hidden: { scale: 0.92, opacity: 0, y: 8 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};

export default function CitizenTenderPage() {
  const { t } = useLanguage();
  const [tenders, setTenders] = useState<TenderAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTenders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('tenders')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw err;
      setTenders((data ?? []).map(t => ({
        id: t.id,
        tenderTitle: t.tender_title,
        department: t.department,
        estimatedCost: t.estimated_cost,
        actualCost: t.actual_cost,
        riskScore: t.risk_score,
        riskFactors: t.risk_factors,
        status: t.status as any,
        awardedTo: t.awarded_to,
        createdAt: t.created_at,
      })));
    } catch (err: any) {
      setError(err.message || 'Failed');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTenders(); }, [fetchTenders]);

  const riskConfig: Record<string, { className: string; label: string }> = {
    low_risk: { className: 'bg-success/10 text-success border-0', label: 'নিম্ন ঝুঁকি' },
    medium_risk: { className: 'bg-warning/10 text-warning border-0', label: 'মাঝারি ঝুঁকি' },
    high_risk: { className: 'bg-destructive/10 text-destructive border-0', label: 'উচ্চ ঝুঁকি' },
    critical: { className: 'bg-destructive text-destructive-foreground', label: 'সংকটপূর্ণ' },
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-warning/15 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bengali font-bold text-foreground tracking-tight leading-none">{t('tenderAnalysis')}</h1>
            <p className="text-sm text-muted-foreground mt-1 font-bengali">সরকারি টেন্ডার স্বচ্ছতা ও ঝুঁকি বিশ্লেষণ</p>
          </div>
        </div>
      </motion.div>

      {error && <ErrorBanner message={error} onRetry={fetchTenders} />}

      {loading ? <LoadingSkeleton rows={4} /> : tenders.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <div className="h-20 w-20 rounded-3xl glass-card flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="h-10 w-10 text-warning/40" />
          </div>
          <h3 className="text-lg font-bengali font-semibold text-foreground mb-2">কোনো টেন্ডার তথ্য নেই</h3>
          <p className="text-sm text-muted-foreground font-bengali mb-6">{t('noData')}</p>
          <Button onClick={fetchTenders} className="bg-primary text-primary-foreground font-bengali btn-press">পুনরায় লোড</Button>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          {tenders.map(tender => {
            const risk = riskConfig[tender.status] || riskConfig.low_risk;
            const costDiff = tender.actualCost - tender.estimatedCost;
            const costDiffPct = tender.estimatedCost > 0 ? ((costDiff / tender.estimatedCost) * 100).toFixed(1) : '0';

            return (
              <motion.div key={tender.id} variants={slamIn} whileHover={{ y: -2, transition: { duration: 0.2 } }}>
                <div className={`glass-card p-5 rounded-2xl gradient-shine transition-all duration-300 ${tender.riskScore >= 80 ? 'border-destructive/30 border' : ''}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-sm font-bold font-bengali leading-snug">{tender.tenderTitle}</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{tender.department} · {tender.awardedTo}</p>
                    </div>
                    <Badge className={`shrink-0 text-[10px] font-bold ${risk.className}`}>{risk.label}</Badge>
                  </div>

                  {/* Cost comparison */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-muted/10 border border-border/20 text-center">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">আনুমানিক</p>
                      <p className="text-xs font-bold font-mono mt-0.5">৳{tender.estimatedCost.toLocaleString('bn-BD')}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-muted/10 border border-border/20 text-center">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">প্রকৃত</p>
                      <p className="text-xs font-bold font-mono mt-0.5">৳{tender.actualCost.toLocaleString('bn-BD')}</p>
                    </div>
                    <div className={`p-2.5 rounded-xl text-center ${costDiff > 0 ? 'bg-destructive/5 border border-destructive/15' : 'bg-success/5 border border-success/15'}`}>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">পার্থক্য</p>
                      <p className={`text-xs font-bold font-mono mt-0.5 ${costDiff > 0 ? 'text-destructive' : 'text-success'}`}>
                        {costDiff > 0 ? '+' : ''}{costDiffPct}%
                      </p>
                    </div>
                  </div>

                  {/* Risk bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium font-bengali">ঝুঁকি স্কোর</span>
                      <span className={`font-bold font-mono ${tender.riskScore >= 70 ? 'text-destructive' : tender.riskScore >= 40 ? 'text-warning' : 'text-success'}`}>{tender.riskScore}%</span>
                    </div>
                    <Progress value={tender.riskScore} className={`h-2 rounded-full ${tender.riskScore >= 70 ? '[&>div]:bg-destructive' : tender.riskScore >= 40 ? '[&>div]:bg-warning' : '[&>div]:bg-success'}`} />
                  </div>

                  {/* Risk factors */}
                  {tender.riskFactors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tender.riskFactors.map(f => (
                        <Badge key={f} variant="outline" className="text-[10px] font-normal px-2 py-0.5 gap-1 rounded-lg">
                          <AlertTriangle className="h-2.5 w-2.5" />{f}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
