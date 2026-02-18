import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Unlock, Check, X } from 'lucide-react';

export default function IdentityUnlockPage() {
  const { unlockRequests, loading, error, fetchUnlockRequests, processUnlock } = useAdmin();
  const { t } = useLanguage();
  const [action, setAction] = useState<{ id: string; approved: boolean } | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchUnlockRequests(); }, [fetchUnlockRequests]);

  const handleAction = async () => {
    if (!action) return;
    setProcessing(true);
    try {
      await processUnlock(action.id, action.approved);
      toast.success(t('success'));
      setAction(null);
    } catch { /* handled */ }
    finally { setProcessing(false); }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Unlock className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t('identityUnlock')}</h1>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchUnlockRequests} />}

      {loading ? <LoadingSkeleton rows={4} type="list" /> : unlockRequests.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t('noData')}</p>
      ) : (
        <div className="space-y-3">
          {unlockRequests.map(req => (
            <Card key={req.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">ব্যবহারকারী: {req.targetUserId}</CardTitle>
                  <Badge variant="secondary">{req.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">কারণ: {req.reason}</p>
                <p className="text-xs text-muted-foreground">অনুরোধকারী: {req.requestedBy}</p>
                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setAction({ id: req.id, approved: true })} className="gap-1">
                      <Check className="h-3.5 w-3.5" />{t('approve')}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setAction({ id: req.id, approved: false })} className="gap-1">
                      <X className="h-3.5 w-3.5" />{t('reject')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!action}
        onOpenChange={open => !open && setAction(null)}
        title={action?.approved ? t('approve') : t('reject')}
        description="এই পরিচয় আনলক সিদ্ধান্ত অডিট লগে রেকর্ড হবে।"
        onConfirm={handleAction}
        destructive={!action?.approved}
        loading={processing}
      />
    </div>
  );
}
