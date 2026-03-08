import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AlertTriangle, Power, Shield, Clock, User } from 'lucide-react';

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
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${crisisMode.active ? 'bg-destructive/10' : 'bg-success/10'}`}>
          <AlertTriangle className={`h-5 w-5 ${crisisMode.active ? 'text-destructive' : 'text-success'}`} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('crisisMode')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">জরুরি প্ল্যাটফর্ম নিয়ন্ত্রণ</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <Card className={`border-border/60 ${crisisMode.active ? 'border-destructive/40 shadow-lg shadow-destructive/5' : ''}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${crisisMode.active ? 'bg-destructive/10' : 'bg-success/10'}`}>
              <Power className={`h-6 w-6 ${crisisMode.active ? 'text-destructive' : 'text-success'}`} />
            </div>
            <div>
              <CardTitle className="text-base">
                {crisisMode.active ? t('crisisActive') : 'ক্রাইসিস মোড নিষ্ক্রিয়'}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {crisisMode.active ? 'ভোটদান ও জমাদান বন্ধ আছে' : 'প্ল্যাটফর্ম স্বাভাবিকভাবে চলছে'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {crisisMode.active && (
            <div className="space-y-2 p-3.5 rounded-xl bg-destructive/5 border border-destructive/15">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5" />সক্রিয়কারী: <span className="font-medium text-foreground">{crisisMode.activatedBy}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />সময়: <span className="font-medium text-foreground">{crisisMode.activatedAt && new Date(crisisMode.activatedAt).toLocaleString('bn-BD')}</span>
              </div>
              {crisisMode.reason && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />কারণ: <span className="font-medium text-foreground">{crisisMode.reason}</span>
                </div>
              )}
            </div>
          )}

          {!crisisMode.active && (
            <Textarea placeholder="কারণ উল্লেখ করুন (ঐচ্ছিক)" value={reason} onChange={e => setReason(e.target.value)} rows={3} className="bg-muted/30 resize-none" />
          )}

          <Button
            variant={crisisMode.active ? 'outline' : 'destructive'}
            className={`w-full h-12 text-base font-semibold ${!crisisMode.active ? 'shadow-lg' : ''}`}
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
