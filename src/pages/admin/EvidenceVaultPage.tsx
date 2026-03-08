import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Archive, Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Evidence } from '@/types';

export default function EvidenceVaultPage() {
  const { t } = useLanguage();
  const [evidence, setEvidence] = useState<(Evidence & { reportTitle: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const fetchEvidence = async () => {
    setLoading(true); setError(null);
    try {
      const { data, error: err } = await supabase
        .from('evidence')
        .select('*, reports(title)')
        .order('created_at', { ascending: false });

      if (err) throw err;

      setEvidence((data ?? []).map((e: any) => ({
        id: e.id,
        type: e.type,
        url: e.url,
        blurred: e.blurred,
        reportTitle: e.reports?.title || 'Unknown',
      })));
    } catch (err: any) { setError(err.message || 'Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvidence(); }, []);

  const toggleReveal = (id: string) => {
    if (revealed.has(id)) {
      setRevealed(prev => { const n = new Set(prev); n.delete(id); return n; });
    } else {
      setRevealed(prev => new Set(prev).add(id));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
          <Archive className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('evidenceVault')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">সুরক্ষিত প্রমাণাদি সংরক্ষণ</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchEvidence} />}

      {loading ? <LoadingSkeleton rows={4} /> : evidence.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Archive className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">{t('noData')}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {evidence.map(e => (
            <Card key={e.id} className="border-border/60 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm leading-snug">{e.reportTitle}</CardTitle>
                  <Badge variant="secondary" className="shrink-0 text-xs">{e.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`h-36 rounded-xl bg-muted flex items-center justify-center overflow-hidden relative transition-all ${e.blurred && !revealed.has(e.id) ? 'blur-xl' : ''}`}>
                  {e.type === 'image' ? (
                    <img src={e.url} alt="Evidence" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted-foreground text-sm">{e.type}</span>
                  )}
                  {e.blurred && !revealed.has(e.id) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center">
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
                {e.blurred && (
                  <Button size="sm" variant="outline" onClick={() => toggleReveal(e.id)} className="gap-1.5 w-full">
                    {revealed.has(e.id) ? <><EyeOff className="h-3.5 w-3.5" />ব্লার করুন</> : <><Eye className="h-3.5 w-3.5" />দেখুন</>}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
