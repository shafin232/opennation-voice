import { useEffect, useState } from 'react';
import { useRTI } from '@/hooks/useRTI';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { FileSearch, Send } from 'lucide-react';

export default function RTIResponsePage() {
  const { requests, loading, error, fetchRequests } = useRTI();
  const { respondToRTI, loading: responding } = useAdmin();
  const { t } = useLanguage();
  const [responses, setResponses] = useState<Record<string, string>>({});

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleRespond = async (id: string) => {
    const text = responses[id]?.trim();
    if (!text) return;
    try {
      await respondToRTI(id, text);
      toast.success(t('success'));
      setResponses(prev => ({ ...prev, [id]: '' }));
      fetchRequests();
    } catch { /* handled */ }
  };

  const pendingRequests = requests.filter(r => r.status !== 'responded' && r.status !== 'closed');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileSearch className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('rtiResponse')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">তথ্য অধিকার প্রতিক্রিয়া</p>
        </div>
        {pendingRequests.length > 0 && (
          <Badge variant="secondary" className="ml-auto">{pendingRequests.length} অপেক্ষমাণ</Badge>
        )}
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchRequests} />}

      {loading ? <LoadingSkeleton rows={4} /> : pendingRequests.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-success/10 flex items-center justify-center mb-4">
            <FileSearch className="h-8 w-8 text-success" />
          </div>
          <p className="text-muted-foreground font-medium">সব আবেদনে প্রতিক্রিয়া দেওয়া হয়েছে</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingRequests.map(req => (
            <Card key={req.id} className="border-border/60 hover:shadow-sm transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-sm leading-snug">{req.subject}</CardTitle>
                  <Badge variant="secondary" className="shrink-0 text-xs">{req.department}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{req.body}</p>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="প্রতিক্রিয়া লিখুন..."
                    value={responses[req.id] || ''}
                    onChange={e => setResponses(prev => ({ ...prev, [req.id]: e.target.value }))}
                    rows={2}
                    className="flex-1 bg-muted/30 resize-none"
                  />
                  <Button
                    onClick={() => handleRespond(req.id)}
                    disabled={responding || !responses[req.id]?.trim()}
                    size="sm"
                    className="gap-1.5 self-end gradient-primary border-0"
                  >
                    <Send className="h-3.5 w-3.5" />{t('submit')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
