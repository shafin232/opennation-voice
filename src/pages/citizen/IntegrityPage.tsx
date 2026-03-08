import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useIntegrity } from '@/hooks/useIntegrity';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { IntegrityCard } from '@/components/shared/IntegrityCard';
import { IntegrityMap } from '@/components/shared/IntegrityMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slamIn = {
  hidden: { scale: 0.92, opacity: 0, y: 8 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};

export default function IntegrityPage() {
  const { metrics, loading, error, fetchMetrics } = useIntegrity();
  const { t } = useLanguage();

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

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
