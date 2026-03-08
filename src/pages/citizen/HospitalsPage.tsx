import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useHospitals } from '@/hooks/useHospitals';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Hospital, Bed, Star, MapPin, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const slamIn = {
  hidden: { scale: 0.92, opacity: 0, y: 8 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};

export default function HospitalsPage() {
  const { hospitals, loading, error, fetchHospitals } = useHospitals();
  const { t } = useLanguage();

  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-success/15 flex items-center justify-center">
            <Hospital className="h-5 w-5 text-success" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bengali font-bold text-foreground tracking-tight leading-none">{t('hospitals')}</h1>
            <p className="text-sm text-muted-foreground mt-1 font-bengali">হাসপাতাল ও স্বাস্থ্যসেবা তথ্য</p>
          </div>
        </div>
      </motion.div>

      {error && <ErrorBanner message={error} onRetry={() => fetchHospitals()} />}

      {loading ? <LoadingSkeleton rows={4} /> : hospitals.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <div className="h-20 w-20 rounded-3xl glass-card flex items-center justify-center mx-auto mb-6">
            <HeartPulse className="h-10 w-10 text-success/40" />
          </div>
          <h3 className="text-lg font-bengali font-semibold text-foreground mb-2">কোনো হাসপাতাল তথ্য নেই</h3>
          <p className="text-sm text-muted-foreground font-bengali mb-6">{t('noData')}</p>
          <Button onClick={() => fetchHospitals()} className="bg-primary text-primary-foreground shadow-glow-teal font-bengali btn-press">পুনরায় লোড করুন</Button>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2">
          {hospitals.map(h => {
            const occupancy = ((h.totalBeds - h.availableBeds) / h.totalBeds) * 100;
            const isHigh = occupancy > 80;
            return (
              <motion.div key={h.id} variants={slamIn} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
                <div className="glass-card p-5 rounded-2xl gradient-shine transition-all duration-300 h-full">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${h.type === 'government' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                        <Hospital className={`h-4 w-4 ${h.type === 'government' ? 'text-primary' : 'text-accent'}`} />
                      </div>
                      <h3 className="text-sm font-semibold font-bengali leading-snug">{h.name}</h3>
                    </div>
                    <Badge className={`shrink-0 text-[10px] border ${h.type === 'government' ? 'bg-primary/10 text-primary border-primary/10' : 'bg-accent/10 text-accent border-accent/10'}`}>
                      {h.type === 'government' ? 'সরকারি' : 'বেসরকারি'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 text-warning" /><span className="font-mono-data">{h.rating}/5</span></span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{h.district}</span>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="flex items-center gap-1 font-medium font-bengali"><Bed className="h-3 w-3" />শয্যা ব্যবহার</span>
                      <span className={`font-mono-data font-semibold ${isHigh ? 'text-destructive' : 'text-success'}`}>{h.availableBeds}/{h.totalBeds}</span>
                    </div>
                    <Progress value={occupancy} className={`h-2 rounded-full ${isHigh ? '[&>div]:bg-destructive' : '[&>div]:bg-success'}`} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[hsl(var(--border-subtle))]">
                    {h.services.slice(0, 4).map(s => (
                      <Badge key={s} variant="outline" className="text-[10px] font-normal px-2 py-0.5 border-[hsl(var(--border-subtle))] rounded-lg">{s}</Badge>
                    ))}
                    {h.services.length > 4 && <Badge variant="outline" className="text-[10px] font-normal px-2 py-0.5 border-[hsl(var(--border-subtle))] rounded-lg">+{h.services.length - 4}</Badge>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
