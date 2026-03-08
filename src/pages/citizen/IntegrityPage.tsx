import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useIntegrity } from '@/hooks/useIntegrity';
import { nationalIndex, districtRanking } from '@/lib/algorithms';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { IntegrityCard } from '@/components/shared/IntegrityCard';
import { IntegrityMap } from '@/components/shared/IntegrityMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, Globe, Shield, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slamIn = {
  hidden: { scale: 0.92, opacity: 0, y: 8 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};

export default function IntegrityPage() {
  const { metrics, loading, error, fetchMetrics } = useIntegrity();
  const { nationalIndex, districtRanking } = useAlgorithms();
  const { t } = useLanguage();
  const [nii, setNii] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  // Fetch NII & ranking when metrics load
  useEffect(() => {
    if (metrics.length > 0) {
      nationalIndex('volume').then(setNii).catch(() => {});
      districtRanking().then((r: any) => setRanking(r?.ranking ?? [])).catch(() => {});
    }
  }, [metrics.length, nationalIndex, districtRanking]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl gradient-accent flex items-center justify-center shadow-glow-amber">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bengali font-bold text-foreground tracking-tight leading-none">{t('integrity')}</h1>
            <p className="text-sm text-muted-foreground mt-1 font-bengali">জেলাভিত্তিক সততা ও স্বচ্ছতা মেট্রিক্স</p>
          </div>
        </div>
      </motion.div>

      {/* National Integrity Index Card */}
      {nii && (
        <motion.div variants={slamIn} initial="hidden" animate="show">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">জাতীয় সততা সূচক (NII)</p>
                  <p className="text-5xl font-bold text-foreground mt-2">
                    {nii.national_integrity_index?.toFixed(1) ?? '—'}
                    <span className="text-lg text-muted-foreground font-normal">/100</span>
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="outline" className="text-[10px]">
                    {nii.eligible_districts} জেলা অন্তর্ভুক্ত
                  </Badge>
                  <p className="text-[10px] text-muted-foreground">
                    {nii.excluded_districts} জেলা বাদ (ন্যূনতম রিপোর্ট পূরণ হয়নি)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* District Ranking */}
      {ranking.length > 0 && (
        <motion.div variants={slamIn} initial="hidden" animate="show">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                জেলা র‍্যাংকিং (কম্পোজিট স্কোর)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ranking.slice(0, 10).map((d: any, i: number) => (
                  <div key={d.district} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <span className={`text-sm font-bold w-6 text-center ${i < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium flex-1">{d.district}</span>
                    <span className="text-xs text-muted-foreground">{d.total_reports} রিপোর্ট</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {d.composite?.toFixed(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {error && <ErrorBanner message={error} onRetry={() => fetchMetrics()} />}

      {loading ? <LoadingSkeleton rows={3} /> : metrics.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <div className="relative inline-block mb-6">
            <div className="h-20 w-20 rounded-3xl glass-card flex items-center justify-center mx-auto">
              <Globe className="h-10 w-10 text-primary/40" />
            </div>
          </div>
          <h3 className="text-lg font-bengali font-semibold text-foreground mb-2">কোনো ডেটা নেই</h3>
          <p className="text-sm text-muted-foreground font-bengali mb-6 max-w-sm mx-auto">
            সততা মেট্রিক্স এখনো লোড হচ্ছে অথবা পাওয়া যায়নি।
          </p>
          <Button onClick={() => fetchMetrics()} className="bg-primary text-primary-foreground shadow-glow-teal font-bengali btn-press">
            পুনরায় চেষ্টা করুন
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Bento grid: Map + first card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div variants={slamIn} initial="hidden" animate="show" className="lg:col-span-2">
              <IntegrityMap />
            </motion.div>
            {metrics[0] && (
              <IntegrityCard
                district={metrics[0].district}
                truthScore={metrics[0].truthScore}
                trustScore={metrics[0].trustScore}
                verified={metrics[0].verifiedReports > 0}
                totalReports={metrics[0].totalReports}
                index={0}
              />
            )}
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {metrics.slice(1, 7).map((m, i) => (
              <IntegrityCard
                key={m.district}
                district={m.district}
                truthScore={m.truthScore}
                trustScore={m.trustScore}
                verified={m.verifiedReports > 0}
                totalReports={m.totalReports}
                index={i + 1}
              />
            ))}
          </div>

          {/* Chart */}
          {metrics.length > 0 && (
            <motion.div variants={slamIn} initial="hidden" animate="show">
              <div className="glass-card p-6 rounded-2xl gradient-shine">
                <h3 className="text-sm font-bengali font-semibold text-foreground mb-4">জেলাভিত্তিক সততা তুলনা</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={metrics} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                    <XAxis dataKey="district" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '16px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--card))',
                        boxShadow: '0 8px 32px hsl(0 0% 0% / 0.15)',
                        backdropFilter: 'blur(16px)',
                      }}
                    />
                    <Bar dataKey="trustScore" name={t('trustScore')} fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="truthScore" name={t('truthScore')} fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
