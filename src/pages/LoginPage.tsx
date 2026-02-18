import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { isAuthenticated, user, sendOTP, verifyOTP, loading } = useAuth();
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'citizen' ? '/app' : '/admin'} replace />;
  }

  const handleSendOTP = async () => {
    if (!phone.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await sendOTP(phone);
      setOtpSent(true);
      toast.success(t('otpSent'));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await verifyOTP(phone, otp);
    } catch (err: any) {
      setError(err.response?.data?.message || t('invalidOTP'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-end gap-2 p-4">
        <LanguageToggle />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{t('appName')}</CardTitle>
            <CardDescription>{t('appTagline')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <ErrorBanner message={error} />}

            {!otpSent ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t('enterPhone')}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                  />
                </div>
                <Button className="w-full" onClick={handleSendOTP} disabled={submitting || !phone.trim()}>
                  {submitting ? t('loading') : t('sendOTP')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  {t('otpSent')}: <span className="font-medium text-foreground">{phone}</span>
                </p>
                <div className="space-y-2">
                  <Label htmlFor="otp">{t('enterOTP')}</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="••••••"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()}
                    className="text-center text-lg tracking-widest"
                  />
                </div>
                <Button className="w-full" onClick={handleVerifyOTP} disabled={submitting || !otp.trim()}>
                  {submitting ? t('loading') : t('verifyOTP')}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => { setOtpSent(false); setOtp(''); }}>
                  {t('cancel')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="text-center py-4 text-xs text-muted-foreground">
        {t('appName')} © 2026
      </footer>
    </div>
  );
}
