import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { computeReputation } from '@/lib/algorithms';
import {
  Shield, TrendingUp, TrendingDown, AlertTriangle, Clock, Bot,
  CheckCircle2, XCircle, Vote, Award, Star, Crown, Zap, Timer
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BreakdownData {
  user_id: string;
  reputation_raw: number;
  effective_trust: number;
  tier: string;
  tier_label: string;
  vote_weight: number;
  breakdown: {
    initial: number;
    true_reports: { count: number; points: number };
    confirmed_votes: { points: number };
    false_reports: { count: number; penalty: number };
    false_votes: { penalty: number };
    bot_detection: { burst_ratio: number; penalty: number };
    account_age: { days: number; bonus: number };
    activity_decay: number;
    maturity_multiplier: number;
    confidence: number;
  };
}

const tierConfig: Record<string, { icon: typeof Shield; gradient: string; border: string; text: string }> = {
  highly_trusted: { icon: Crown, gradient: 'from-yellow-400 to-amber-500', border: 'border-yellow-400/30', text: 'text-yellow-400' },
  trusted: { icon: Star, gradient: 'from-primary to-emerald-500', border: 'border-primary/30', text: 'text-primary' },
  verified: { icon: Shield, gradient: 'from-blue-400 to-blue-600', border: 'border-blue-400/30', text: 'text-blue-400' },
  low: { icon: AlertTriangle, gradient: 'from-orange-400 to-orange-600', border: 'border-orange-400/30', text: 'text-orange-400' },
  untrusted: { icon: XCircle, gradient: 'from-destructive to-red-700', border: 'border-destructive/30', text: 'text-destructive' },
};

const tierThresholds = [
  { min: 90, label: 'Highly Trusted', labelBn: 'অত্যন্ত বিশ্বস্ত', weight: '2.0x', key: 'highly_trusted' },
  { min: 70, label: 'Trusted', labelBn: 'বিশ্বস্ত', weight: '1.5x', key: 'trusted' },
  { min: 40, label: 'Verified', labelBn: 'যাচাইকৃত', weight: '1.0x', key: 'verified' },
  { min: 20, label: 'Low', labelBn: 'নিম্ন', weight: '0.25x', key: 'low' },
  { min: 0, label: 'Untrusted', labelBn: 'অনির্ভরযোগ্য', weight: '0x', key: 'untrusted' },
];

const slamIn = {
  hidden: { scale: 0.92, opacity: 0, y: 12 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};

export function IntegrityBreakdown({ userId }: { userId: string }) {
  const [data, setData] = useState<BreakdownData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[IntegrityBreakdown] Fetching reputation for', userId);
    computeReputation(userId)
      .then((res) => {
        console.log('[IntegrityBreakdown] Response:', JSON.stringify(res));
        setData(res as BreakdownData);
      })
      .catch((e) => {
        console.error('[IntegrityBreakdown] Error:', e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-muted/30 rounded w-1/2 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted/20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center text-muted-foreground">
        <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-warning" />
        <p className="text-sm">ডেটা লোড করা যায়নি</p>
      </div>
    );
  }

  const { breakdown: b } = data;
  const tc = tierConfig[data.tier] || tierConfig.verified;
  const TierIcon = tc.icon;
  const currentTierThreshold = tierThresholds.find(t => t.key === data.tier) || tierThresholds[2];

  const pointItems = [
    { label: 'শুরুর পয়েন্ট', labelEn: 'Initial', value: b.initial, icon: Zap, color: 'text-muted-foreground', positive: true },
    { label: 'সত্য রিপোর্ট', labelEn: `${b.true_reports.count} verified`, value: b.true_reports.points, icon: CheckCircle2, color: 'text-success', positive: true },
    { label: 'সঠিক ভোট', labelEn: 'Confirmed votes', value: b.confirmed_votes.points, icon: Vote, color: 'text-primary', positive: true },
    { label: 'অ্যাকাউন্ট বয়স', labelEn: `${b.account_age.days} days`, value: b.account_age.bonus, icon: Timer, color: 'text-accent', positive: true },
    { label: 'ভুয়া রিপোর্ট', labelEn: `${b.false_reports.count} false`, value: b.false_reports.penalty, icon: XCircle, color: 'text-destructive', positive: false },
    { label: 'ভুল ভোট', labelEn: 'Wrong votes', value: b.false_votes.penalty, icon: TrendingDown, color: 'text-destructive', positive: false },
    { label: 'বট পেনাল্টি', labelEn: `Burst: ${(b.bot_detection.burst_ratio * 100).toFixed(0)}%`, value: b.bot_detection.penalty, icon: Bot, color: 'text-destructive', positive: false },
  ].filter(item => item.value !== 0);

  return (
    <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="show" className="space-y-4">
      {/* Tier Badge Card */}
      <motion.div variants={slamIn}>
        <div className={`glass-panel rounded-2xl p-5 ${tc.border} border`}>
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${tc.gradient} flex items-center justify-center shadow-lg`}>
              <TierIcon className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">ইন্টিগ্রিটি টিয়ার</p>
              <p className={`text-xl font-bold ${tc.text}`}>{data.tier_label}</p>
              <p className="text-[10px] text-muted-foreground">{currentTierThreshold.label} • ভোট ওয়েট: {data.vote_weight}x</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold stat-number">{Math.round(data.effective_trust)}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Effective Trust</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Raw Reputation Gauge */}
      <motion.div variants={slamIn}>
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">র' রেপুটেশন স্কোর</p>
            <span className="text-sm font-bold stat-number">{Math.round(data.reputation_raw)}/100</span>
          </div>
          <Progress value={data.reputation_raw} className="h-2.5" />
          <div className="flex justify-between mt-2">
            {tierThresholds.slice().reverse().map(t => (
              <div key={t.key} className={`text-center ${data.tier === t.key ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`text-[8px] font-bold ${data.tier === t.key ? tierConfig[t.key]?.text || 'text-foreground' : 'text-muted-foreground'}`}>
                  {t.min}+
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Points Breakdown */}
      <motion.div variants={slamIn}>
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-4 w-4 text-accent" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">পয়েন্ট ব্রেকডাউন</p>
          </div>
          <div className="space-y-2.5">
            {pointItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-center gap-3 py-2 px-3 rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors"
              >
                <div className={`h-7 w-7 rounded-lg bg-muted/20 flex items-center justify-center`}>
                  <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.labelEn}</p>
                </div>
                <span className={`text-sm font-bold font-mono-data ${item.positive ? 'text-success' : 'text-destructive'}`}>
                  {item.positive ? '+' : ''}{item.value}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Multipliers & Modifiers */}
      <motion.div variants={slamIn}>
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">মডিফায়ার</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'ম্যাচিউরিটি', value: `${(b.maturity_multiplier * 100).toFixed(0)}%`, icon: Clock, desc: 'Account maturity' },
              { label: 'অ্যাক্টিভিটি', value: `${(b.activity_decay * 100).toFixed(0)}%`, icon: Zap, desc: 'Temporal decay' },
              { label: 'কনফিডেন্স', value: `${(b.confidence * 100).toFixed(0)}%`, icon: Shield, desc: 'Data confidence' },
            ].map((mod, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-muted/10">
                <mod.icon className="h-4 w-4 mx-auto mb-1.5 text-muted-foreground" />
                <p className="text-lg font-bold stat-number">{mod.value}</p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50 mt-0.5">{mod.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tier Ladder */}
      <motion.div variants={slamIn}>
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-4">টিয়ার ল্যাডার</p>
          <div className="space-y-2">
            {tierThresholds.map((t) => {
              const tc2 = tierConfig[t.key] || tierConfig.verified;
              const isCurrent = data.tier === t.key;
              const TIcon = tc2.icon;
              return (
                <div
                  key={t.key}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                    isCurrent ? `${tc2.border} border bg-muted/20` : 'opacity-50'
                  }`}
                >
                  <TIcon className={`h-4 w-4 ${isCurrent ? tc2.text : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <p className={`text-xs font-semibold ${isCurrent ? tc2.text : ''}`}>{t.labelBn}</p>
                    <p className="text-[10px] text-muted-foreground">{t.min}+ পয়েন্ট</p>
                  </div>
                  <span className="text-[10px] font-mono-data text-muted-foreground">ভোট {t.weight}</span>
                  {isCurrent && (
                    <motion.div
                      className={`h-2 w-2 rounded-full bg-gradient-to-r ${tc2.gradient}`}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
