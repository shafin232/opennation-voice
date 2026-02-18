import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AlertTriangle, Power } from 'lucide-react';

export default function CrisisModePage() {
  const { toggleCrisisMode, loading, error } = useAdmin();
  const { crisisMode, refreshCrisisMode } = useApp();
  const { t } = useLanguage();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => { refreshCrisisMode(); }, [refreshCrisisMode]);

  const handleToggle = async () => {
    try {
      await toggleCrisisMode(!crisisMode.active, reason);
      await refreshCrisisMode();
      toast.success(t('success'));
      setConfirmOpen(false);
      setReason('');
    } catch { /* handled */ }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-6 w-6 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">{t('crisisMode')}</h1>
      </div>

      {error && <ErrorBanner message={error} />}

      <Card className={crisisMode.active ? 'border-destructive' : ''}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Power className={`h-5 w-5 ${crisisMode.active ? 'text-destructive' : 'text-green-600'}`} />
            {crisisMode.active ? t('crisisActive') : 'ক্রাইসিস মোড নিষ্ক্রিয়'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {crisisMode.active && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p>সক্রিয়কারী: {crisisMode.activatedBy}</p>
              <p>সময়: {crisisMode.activatedAt && new Date(crisisMode.activatedAt).toLocaleString('bn-BD')}</p>
              {crisisMode.reason && <p>কারণ: {crisisMode.reason}</p>}
            </div>
          )}

          {!crisisMode.active && (
            <Textarea placeholder="কারণ উল্লেখ করুন (ঐচ্ছিক)" value={reason} onChange={e => setReason(e.target.value)} rows={3} />
          )}

          <Button
            variant={crisisMode.active ? 'outline' : 'destructive'}
            className="w-full"
            onClick={() => setConfirmOpen(true)}
          >
            {crisisMode.active ? t('crisisDeactivate') : t('crisisActivate')}
          </Button>
        </CardContent>
      </Card>

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={crisisMode.active ? t('crisisDeactivate') : t('crisisActivate')}
        description={crisisMode.active ? 'এটি ভোটদান ও জমাদান পুনরায় সক্রিয় করবে।' : 'এটি প্ল্যাটফর্মজুড়ে ভোটদান ও জমাদান বন্ধ করবে।'}
        onConfirm={handleToggle}
        destructive={!crisisMode.active}
        loading={loading}
      />
    </div>
  );
}
