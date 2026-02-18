import { useEffect } from 'react';
import { useHospitals } from '@/hooks/useHospitals';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Hospital, Bed, Star } from 'lucide-react';

export default function HospitalsPage() {
  const { hospitals, loading, error, fetchHospitals } = useHospitals();
  const { t } = useLanguage();

  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">{t('hospitals')}</h1>

      {error && <ErrorBanner message={error} onRetry={() => fetchHospitals()} />}

      {loading ? <LoadingSkeleton rows={4} /> : hospitals.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t('noData')}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {hospitals.map(h => {
            const occupancy = ((h.totalBeds - h.availableBeds) / h.totalBeds) * 100;
            return (
              <Card key={h.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Hospital className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-sm">{h.name}</CardTitle>
                    </div>
                    <Badge variant="secondary">{h.type === 'government' ? 'সরকারি' : 'বেসরকারি'}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 text-yellow-500" />{h.rating}/5 · {h.district}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="flex items-center gap-1"><Bed className="h-3 w-3" />শয্যা</span>
                      <span>{h.availableBeds}/{h.totalBeds} খালি</span>
                    </div>
                    <Progress value={occupancy} className="h-2" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {h.services.slice(0, 4).map(s => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
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
