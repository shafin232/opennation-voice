import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Archive, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/apiClient';
import type { Evidence, PaginatedResponse } from '@/types';

export default function EvidenceVaultPage() {
  const { t } = useLanguage();
  const [evidence, setEvidence] = useState<(Evidence & { reportTitle: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const fetchEvidence = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await apiClient.get<PaginatedResponse<Evidence & { reportTitle: string }>>('/admin/evidence');
      setEvidence(data.data);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvidence(); }, []);

  const toggleReveal = async (id: string) => {
    if (revealed.has(id)) {
      setRevealed(prev => { const n = new Set(prev); n.delete(id); return n; });
    } else {
      try {
        await apiClient.post(`/admin/evidence/${id}/reveal`);
        setRevealed(prev => new Set(prev).add(id));
      } catch { /* handled */ }
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Archive className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t('evidenceVault')}</h1>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchEvidence} />}

      {loading ? <LoadingSkeleton rows={4} /> : evidence.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t('noData')}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {evidence.map(e => (
            <Card key={e.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">{e.reportTitle}</CardTitle>
                  <Badge variant="secondary">{e.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className={`h-32 rounded-md bg-muted flex items-center justify-center overflow-hidden ${e.blurred && !revealed.has(e.id) ? 'blur-lg' : ''}`}>
                  {e.type === 'image' ? (
                    <img src={e.url} alt="Evidence" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted-foreground text-sm">{e.type}</span>
                  )}
                </div>
                {e.blurred && (
                  <Button size="sm" variant="outline" onClick={() => toggleReveal(e.id)} className="gap-1 w-full">
                    {revealed.has(e.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {revealed.has(e.id) ? 'ব্লার করুন' : 'দেখুন'}
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
