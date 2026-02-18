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
import { Shield, Eye, EyeOff, Check } from 'lucide-react';

export default function ModerationPage() {
  const { moderationQueue, loading, error, fetchModerationQueue, moderateReport } = useAdmin();
  const { t } = useLanguage();
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'approve' | 'hide' | 'restore' } | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchModerationQueue(); }, [fetchModerationQueue]);

  const handleAction = async () => {
    if (!confirmAction) return;
    setProcessing(true);
    try {
      await moderateReport(confirmAction.id, confirmAction.action);
      toast.success(t('success'));
    } catch { /* handled */ }
    finally { setProcessing(false); setConfirmAction(null); }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t('moderation')}</h1>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchModerationQueue} />}

      {loading ? <LoadingSkeleton rows={4} /> : moderationQueue.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t('noData')}</p>
      ) : (
        <div className="space-y-3">
          {moderationQueue.map(item => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">{item.report.title}</CardTitle>
                  <Badge variant="secondary">{item.report.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{item.report.description}</p>
                <p className="text-xs text-destructive">কারণ: {item.flagReason}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="default" onClick={() => setConfirmAction({ id: item.id, action: 'approve' })} className="gap-1">
                    <Check className="h-3.5 w-3.5" />{t('approve')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmAction({ id: item.id, action: 'hide' })} className="gap-1">
                    <EyeOff className="h-3.5 w-3.5" />{t('hide')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmAction({ id: item.id, action: 'restore' })} className="gap-1">
                    <Eye className="h-3.5 w-3.5" />{t('restore')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!confirmAction}
        onOpenChange={open => !open && setConfirmAction(null)}
        title="নিশ্চিত করুন"
        description={`আপনি কি এই রিপোর্ট ${confirmAction?.action === 'hide' ? 'লুকাতে' : confirmAction?.action === 'approve' ? 'অনুমোদন করতে' : 'পুনরুদ্ধার করতে'} চান?`}
        onConfirm={handleAction}
        destructive={confirmAction?.action === 'hide'}
        loading={processing}
      />
    </div>
  );
}
