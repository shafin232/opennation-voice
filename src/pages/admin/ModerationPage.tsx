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
import { Shield, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react';

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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('moderation')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">পর্যালোচনা অপেক্ষমাণ প্রতিবেদন</p>
        </div>
        {moderationQueue.length > 0 && (
          <Badge variant="secondary" className="ml-auto">{moderationQueue.length} অপেক্ষমাণ</Badge>
        )}
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchModerationQueue} />}

      {loading ? <LoadingSkeleton rows={4} /> : moderationQueue.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-success/10 flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-success" />
          </div>
          <p className="text-muted-foreground font-medium">সব রিপোর্ট পর্যালোচনা সম্পন্ন</p>
        </div>
      ) : (
        <div className="space-y-3">
          {moderationQueue.map(item => (
            <Card key={item.id} className="border-border/60 hover:shadow-sm transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-sm leading-snug">{item.report.title}</CardTitle>
                  <Badge variant="secondary" className="shrink-0 text-xs">{item.report.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{item.report.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/5 rounded-lg px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5" />কারণ: {item.flagReason}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={() => setConfirmAction({ id: item.id, action: 'approve' })} className="gap-1.5 gradient-primary border-0">
                    <Check className="h-3.5 w-3.5" />{t('approve')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmAction({ id: item.id, action: 'hide' })} className="gap-1.5">
                    <EyeOff className="h-3.5 w-3.5" />{t('hide')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmAction({ id: item.id, action: 'restore' })} className="gap-1.5">
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
