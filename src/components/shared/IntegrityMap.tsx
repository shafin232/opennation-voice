import { motion } from 'framer-motion';

interface HeatCluster {
  x: string;
  y: string;
  severity: 'low' | 'medium' | 'high';
  label?: string;
  size?: number;
}

const clusters: HeatCluster[] = [
  { x: '25%', y: '30%', severity: 'low', label: 'ঢাকা', size: 40 },
  { x: '60%', y: '20%', severity: 'medium', label: 'রাজশাহী', size: 30 },
  { x: '75%', y: '55%', severity: 'high', label: 'চট্টগ্রাম', size: 35 },
  { x: '40%', y: '60%', severity: 'low', label: 'খুলনা', size: 28 },
  { x: '55%', y: '75%', severity: 'medium', label: 'বরিশাল', size: 24 },
  { x: '30%', y: '50%', severity: 'low', label: 'ময়মনসিংহ', size: 22 },
  { x: '80%', y: '35%', severity: 'high', label: 'সিলেট', size: 32 },
];

const severityConfig = {
  low: 'bg-primary heat-glow-teal',
  medium: 'bg-accent heat-glow-amber',
  high: 'bg-destructive heat-glow-red',
};

export function IntegrityMap() {
  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden glass-strong">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: `
          linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      {/* Organic map shapes */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 400 400" preserveAspectRatio="none">
        <path d="M80,60 Q120,30 180,50 T280,80 Q320,100 300,160 T260,250 Q240,300 180,320 T80,280 Q40,240 50,180 T80,60Z" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1" />
        <path d="M120,100 Q160,80 200,100 T260,130 Q280,150 270,200 T230,260 Q200,280 160,270 T110,230 Q90,200 100,160 T120,100Z" fill="hsl(var(--teal))" fillOpacity="0.05" stroke="hsl(var(--teal))" strokeWidth="0.5" />
      </svg>

      {/* Heat clusters */}
      {clusters.map((cluster, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200 }}
          className="absolute flex flex-col items-center gap-1 group cursor-pointer"
          style={{ left: cluster.x, top: cluster.y, transform: 'translate(-50%, -50%)' }}
        >
          <div
            className={`rounded-full ${severityConfig[cluster.severity]} opacity-60 group-hover:opacity-90 transition-opacity`}
            style={{ width: cluster.size, height: cluster.size }}
          />
          {cluster.label && (
            <span className="text-[10px] font-bengali text-foreground/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {cluster.label}
            </span>
          )}
        </motion.div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-primary" />স্বচ্ছ</span>
        <span className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-accent" />মাঝারি</span>
        <span className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-destructive" />সংকটপূর্ণ</span>
      </div>
    </div>
  );
}
