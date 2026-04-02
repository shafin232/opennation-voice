import { Shield, Award, Star, Crown } from 'lucide-react';

interface ReputationBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const tiers = [
  { min: 0, label: 'ব্রোঞ্জ', icon: Shield, gradient: 'from-amber-800 to-amber-600', text: 'text-amber-200' },
  { min: 40, label: 'সিলভার', icon: Award, gradient: 'from-gray-400 to-gray-300', text: 'text-gray-700' },
  { min: 70, label: 'গোল্ড', icon: Star, gradient: 'from-yellow-500 to-amber-400', text: 'text-amber-900' },
  { min: 90, label: 'প্লাটিনাম', icon: Crown, gradient: 'from-slate-300 to-white', text: 'text-slate-800' },
];

export function ReputationBadge({ score, size = 'md' }: ReputationBadgeProps) {
  const tier = [...tiers].reverse().find(t => score >= t.min) || tiers[0];
  const Icon = tier.icon;

  const sizes = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-7 w-7',
    lg: 'h-10 w-10',
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`${sizes[size]} rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-lg`}
        style={{
          boxShadow: '0 4px 14px -2px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)',
        }}
      >
        <Icon className={`${iconSizes[size]} ${tier.text}`} />
      </div>
      <div className="text-center">
        <p className="text-xs font-bengali font-semibold text-foreground">{tier.label}</p>
        <p className="text-[10px] font-mono-data text-muted-foreground">{score}%</p>
      </div>
    </div>
  );
}
