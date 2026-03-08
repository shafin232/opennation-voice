import { useEffect } from 'react';
import { useHospitals } from '@/hooks/useHospitals';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Hospital, Bed, Star, MapPin } from 'lucide-react';

export default function HospitalsPage() {
  const { hospitals, loading, error, fetchHospitals } = useHospitals();
  const { t } = useLanguage();

  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
          <Hospital className="h-5 w-5 text-success" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('hospitals')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">হাসপাতাল ও স্বাস্থ্যসেবা তথ্য</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={() => fetchHospitals()} />}

      {loading ? <LoadingSkeleton rows={4} /> : hospitals.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Hospital className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">{t('noData')}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {hospitals.map(h => {
            const occupancy = ((h.totalBeds - h.availableBeds) / h.totalBeds) * 100;
            const isHigh = occupancy > 80;
            return (
              <Card key={h.id} className="border-border/60 hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${h.type === 'government' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                        <Hospital className={`h-4 w-4 ${h.type === 'government' ? 'text-primary' : 'text-accent'}`} />
                      </div>
                      <CardTitle className="text-sm leading-snug">{h.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">{h.type === 'government' ? 'সরকারি' : 'বেসরকারি'}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-warning" />{h.rating}/5
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{h.district}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="flex items-center gap-1 font-medium"><Bed className="h-3 w-3" />শয্যা ব্যবহার</span>
                      <span className={isHigh ? 'text-destructive font-semibold' : 'text-muted-foreground'}>{h.availableBeds}/{h.totalBeds} খালি</span>
                    </div>
                    <Progress value={occupancy} className={`h-2.5 rounded-full ${isHigh ? '[&>div]:bg-destructive' : '[&>div]:bg-success'}`} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {h.services.slice(0, 4).map(s => (
                      <Badge key={s} variant="outline" className="text-[10px] font-normal px-2 py-0.5">{s}</Badge>
                    ))}
                    {h.services.length > 4 && <Badge variant="outline" className="text-[10px] font-normal px-2 py-0.5">+{h.services.length - 4}</Badge>}
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
