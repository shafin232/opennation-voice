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
import { BarChart3 } from 'lucide-react';

const slamIn = {
  hidden: { scale: 0.9, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
};

export default function IntegrityPage() {
  const { metrics, loading, error, fetchMetrics } = useIntegrity();
  const { t } = useLanguage();

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="h-10 w-10 rounded-xl gradient-accent flex items-center justify-center shadow-glow-amber">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bengali font-bold text-foreground tracking-tight">{t('integrity')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-bengali">জেলাভিত্তিক সততা ও স্বচ্ছতা মেট্রিক্স</p>
        </div>
      </motion.div>

      {error && <ErrorBanner message={error} onRetry={() => fetchMetrics()} />}

      {loading ? <LoadingSkeleton rows={3} /> : metrics.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl glass flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium font-bengali">{t('noData')}</p>
        </div>
      ) : (
        <>
          {/* Bento grid: Map + cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Map takes 2 cols */}
            <motion.div
              variants={slamIn}
              initial="hidden"
              animate="show"
              className="lg:col-span-2"
            >
              <IntegrityMap />
            </motion.div>

            {/* First metric card */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <Card className="glass-strong border-[hsl(var(--border-subtle))]">
                <CardHeader>
                  <CardTitle className="text-sm font-bengali font-semibold">জেলাভিত্তিক সততা তুলনা</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={metrics} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="district" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid hsl(var(--border))',
                          background: 'hsl(var(--card))',
                          boxShadow: '0 4px 12px hsl(var(--foreground)/0.08)',
                        }}
                      />
                      <Bar dataKey="trustScore" name={t('trustScore')} fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="truthScore" name={t('truthScore')} fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
