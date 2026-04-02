import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
  BarChart3, FileText, CheckCircle2, XCircle, Clock, Users,
  Shield, TrendingUp, AlertTriangle, Activity
} from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];

const slamIn = {
  hidden: { scale: 0.96, opacity: 0, y: 12 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 350, damping: 30 } },
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalReports: 0, verified: 0, rejected: 0, pending: 0,
    totalVotes: 0, totalUsers: 0, avgTruth: 0,
    categoryBreakdown: [] as { name: string; value: number }[],
    districtBreakdown: [] as { district: string; reports: number; trust: number }[],
    riskBreakdown: [] as { name: string; value: number }[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    console.log('[Analytics] Loading dashboard data');
    const [reportsRes, votesRes, profilesRes, tendersRes, metricsRes] = await Promise.all([
      supabase.from('reports').select('status, approval_decision, category, truth_probability, district'),
      supabase.from('votes').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('tenders').select('status, risk_score'),
      supabase.from('integrity_metrics').select('*'),
    ]);

    const reports = reportsRes.data ?? [];
    const verified = reports.filter(r => r.approval_decision === 'approved').length;
    const rejected = reports.filter(r => r.approval_decision === 'rejected').length;
    const pending = reports.filter(r => r.approval_decision === 'pending' || !r.approval_decision).length;
    const avgTruth = reports.length > 0
      ? Math.round(reports.reduce((a, r) => a + (r.truth_probability ?? 0.5), 0) / reports.length * 100)
      : 0;

    // Category breakdown
    const catMap = new Map<string, number>();
    for (const r of reports) {
      catMap.set(r.category, (catMap.get(r.category) || 0) + 1);
    }
    const catLabels: Record<string, string> = {
      infrastructure: 'অবকাঠামো', corruption: 'দুর্নীতি', health: 'স্বাস্থ্য',
      education: 'শিক্ষা', environment: 'পরিবেশ', human_rights: 'মানবাধিকার',
      public_service: 'জনসেবা', other: 'অন্যান্য',
    };
    const categoryBreakdown = Array.from(catMap.entries()).map(([k, v]) => ({
      name: catLabels[k] || k, value: v,
    }));

    // District breakdown from integrity_metrics
    const districtBreakdown = (metricsRes.data ?? []).map(m => ({
      district: m.district, reports: m.total_reports, trust: m.trust_score,
    }));

    // Tender risk breakdown
    const tenders = tendersRes.data ?? [];
    const riskMap = new Map<string, number>();
    const riskLabels: Record<string, string> = {
      low_risk: 'Low Risk', medium_risk: 'Medium', high_risk: 'High Risk', critical: 'Critical',
    };
    for (const t of tenders) {
      riskMap.set(t.status, (riskMap.get(t.status) || 0) + 1);
    }
    const riskBreakdown = Array.from(riskMap.entries()).map(([k, v]) => ({
      name: riskLabels[k] || k, value: v,
    }));

    setStats({
      totalReports: reports.length,
      verified, rejected, pending,
      totalVotes: votesRes.count ?? 0,
      totalUsers: profilesRes.count ?? 0,
      avgTruth,
      categoryBreakdown,
      districtBreakdown,
      riskBreakdown,
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-6xl mx-auto">
        {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl bg-muted/20 animate-pulse" />)}
      </div>
    );
  }

  const summaryCards = [
    { icon: FileText, label: 'মোট রিপোর্ট', value: stats.totalReports, color: 'text-primary', bg: 'bg-primary/10' },
    { icon: CheckCircle2, label: 'অনুমোদিত', value: stats.verified, color: 'text-success', bg: 'bg-success/10' },
    { icon: XCircle, label: 'প্রত্যাখ্যাত', value: stats.rejected, color: 'text-destructive', bg: 'bg-destructive/10' },
    { icon: Clock, label: 'অপেক্ষমাণ', value: stats.pending, color: 'text-warning', bg: 'bg-warning/10' },
    { icon: Users, label: 'মোট ইউজার', value: stats.totalUsers, color: 'text-accent', bg: 'bg-accent/10' },
    { icon: Shield, label: 'গড় Truth Score', value: `${stats.avgTruth}%`, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">অ্যানালিটিক্স ড্যাশবোর্ড</h1>
          <p className="text-xs text-muted-foreground">Algorithm পারফরম্যান্স ও প্ল্যাটফর্ম পরিসংখ্যান</p>
        </div>
      </div>

      {/* Summary cards */}
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        initial="hidden" animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {summaryCards.map((card, i) => (
          <motion.div key={i} variants={slamIn}>
            <Card className="border-border/40">
              <CardContent className="p-4 text-center">
                <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center mx-auto mb-2`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold stat-number">{card.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row 1 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Category pie chart */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" /> ক্যাটেগরি ভিত্তিক রিপোর্ট
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.categoryBreakdown}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {stats.categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">ডেটা নেই</p>
            )}
          </CardContent>
        </Card>

        {/* Tender risk pie chart */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> টেন্ডার ঝুঁকি বিশ্লেষণ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.riskBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.riskBreakdown}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {stats.riskBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">ডেটা নেই</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* District chart */}
      {stats.districtBreakdown.length > 0 && (
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> জেলাভিত্তিক পারফরম্যান্স
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.districtBreakdown} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="district" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Bar dataKey="reports" name="রিপোর্ট সংখ্যা" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="trust" name="Trust Score" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Approval rate */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">অনুমোদনের হার</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'অনুমোদিত', value: stats.verified, total: stats.totalReports, color: 'bg-success' },
              { label: 'প্রত্যাখ্যাত', value: stats.rejected, total: stats.totalReports, color: 'bg-destructive' },
              { label: 'অপেক্ষমাণ', value: stats.pending, total: stats.totalReports, color: 'bg-warning' },
            ].map((item, i) => {
              const pct = stats.totalReports > 0 ? Math.round((item.value / item.total) * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium">{item.label}</span>
                    <span className="font-bold">{pct}%</span>
                  </div>
                  <Progress value={pct} className={`h-2.5 [&>div]:${item.color}`} />
                  <p className="text-[10px] text-muted-foreground mt-1">{item.value}/{item.total}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
