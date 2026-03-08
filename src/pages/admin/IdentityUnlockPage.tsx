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
import { Unlock, Check, X, User, ShieldAlert } from 'lucide-react';

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
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
          <Unlock className="h-5 w-5 text-warning" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('identityUnlock')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">পরিচয় আনলক (শুধুমাত্র সুপারঅ্যাডমিন)</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchUnlockRequests} />}

      {loading ? <LoadingSkeleton rows={4} type="list" /> : unlockRequests.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Unlock className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">{t('noData')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {unlockRequests.map(req => (
            <Card key={req.id} className="border-border/60 hover:shadow-sm transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-warning" />
                    </div>
                    <CardTitle className="text-sm leading-snug">ব্যবহারকারী: {req.targetUserId}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">{req.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-xl bg-muted/50 space-y-1.5 text-sm">
                  <p className="text-muted-foreground"><span className="font-medium text-foreground">কারণ:</span> {req.reason}</p>
                  <p className="text-xs text-muted-foreground">অনুরোধকারী: {req.requestedBy}</p>
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" onClick={() => setAction({ id: req.id, approved: true })} className="gap-1.5 gradient-primary border-0">
                      <Check className="h-3.5 w-3.5" />{t('approve')}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setAction({ id: req.id, approved: false })} className="gap-1.5">
                      <X className="h-3.5 w-3.5" />{t('reject')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="p-3.5 rounded-xl bg-warning/5 border border-warning/15 flex items-start gap-2.5 text-xs text-muted-foreground">
        <ShieldAlert className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <p>পরিচয় আনলক সিদ্ধান্ত অডিট লগে স্বয়ংক্রিয়ভাবে রেকর্ড হয়।</p>
      </div>

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
