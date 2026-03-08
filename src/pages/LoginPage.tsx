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
import { Shield, ArrowRight, KeyRound, Phone } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-primary opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--gradient-accent)/0.15),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(var(--gradient-end)/0.2),_transparent_50%)]" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white/90 tracking-tight">{t('appName')}</span>
        </div>
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-[420px] animate-slide-up">
          <Card className="glass-strong shadow-glow border-white/10 dark:border-white/5">
            <CardHeader className="text-center space-y-4 pb-2">
              <div className="mx-auto relative">
                <div className="h-16 w-16 rounded-2xl gradient-accent flex items-center justify-center shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success border-2 border-card" />
              </div>
              <div>
                <CardTitle className="text-2xl font-extrabold tracking-tight">{t('appName')}</CardTitle>
                <CardDescription className="mt-1.5 text-sm">{t('appTagline')}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              {error && <ErrorBanner message={error} />}

              {!otpSent ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('phone')}
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={t('enterPhone')}
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                        className="pl-10 h-12 text-base bg-muted/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full h-12 text-base font-semibold gap-2 gradient-primary hover:opacity-90 transition-opacity shadow-lg" 
                    onClick={handleSendOTP} 
                    disabled={submitting || !phone.trim()}
                  >
                    {submitting ? t('loading') : t('sendOTP')}
                    {!submitting && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center p-3 rounded-xl bg-muted/50 border border-border/50">
                    <p className="text-xs text-muted-foreground">{t('otpSent')}</p>
                    <p className="font-semibold text-foreground mt-0.5 text-lg tracking-wide">{phone}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('enterOTP')}
                    </Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="• • • • • •"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()}
                        className="pl-10 h-12 text-center text-xl tracking-[0.5em] font-mono bg-muted/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full h-12 text-base font-semibold gap-2 gradient-primary hover:opacity-90 transition-opacity shadow-lg" 
                    onClick={handleVerifyOTP} 
                    disabled={submitting || !otp.trim()}
                  >
                    {submitting ? t('loading') : t('verifyOTP')}
                    {!submitting && <ArrowRight className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground" onClick={() => { setOtpSent(false); setOtp(''); }}>
                    {t('cancel')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trust indicators */}
          <div className="mt-6 flex items-center justify-center gap-6 text-white/50 text-xs">
            <span className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-success" />
              নিরাপদ সংযোগ
            </span>
            <span>·</span>
            <span>এন্ড-টু-এন্ড এনক্রিপ্টেড</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-white/40">
        {t('appName')} © 2026 — জাতীয় স্বচ্ছতা প্ল্যাটফর্ম
      </footer>
    </div>
  );
}
