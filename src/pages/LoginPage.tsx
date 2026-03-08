import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Shield, LogIn, UserPlus, ArrowRight, Fingerprint, Eye, EyeOff } from 'lucide-react';

const BD_DISTRICTS = [
  'Bagerhat','Bandarban','Barguna','Barisal','Bhola','Bogra','Brahmanbaria','Chandpur',
  'Chapainawabganj','Chittagong','Comilla','Cox\'s Bazar','Dhaka','Dinajpur','Faridpur',
  'Feni','Gaibandha','Gazipur','Gopalganj','Habiganj','Jamalpur','Jessore','Jhalokati',
  'Jhenaidah','Joypurhat','Khagrachari','Khulna','Kishoreganj','Kurigram','Kushtia',
  'Lakshmipur','Lalmonirhat','Madaripur','Magura','Manikganj','Meherpur','Moulvibazar',
  'Munshiganj','Mymensingh','Naogaon','Narail','Narayanganj','Narsingdi','Natore',
  'Nawabganj','Netrokona','Nilphamari','Noakhali','Pabna','Panchagarh','Patuakhali',
  'Pirojpur','Rajbari','Rajshahi','Rangamati','Rangpur','Satkhira','Shariatpur',
  'Sherpur','Sirajganj','Sunamganj','Sylhet','Tangail','Thakurgaon',
];

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [nid, setNid] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hashNid = async (raw: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(raw.trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
        toast.success('Login successful');
        navigate('/app');
      } else {
        // Validate BD phone
        const cleanPhone = phone.replace(/\s/g, '');
        if (!/^(\+?880|0)1[3-9]\d{8}$/.test(cleanPhone)) {
          toast.error('সঠিক বাংলাদেশি ফোন নম্বর দিন (e.g. 01712345678)');
          setLoading(false);
          return;
        }
        // Validate NID (10 or 17 digits)
        const cleanNid = nid.trim();
        if (cleanNid && !/^\d{10}$|^\d{17}$/.test(cleanNid)) {
          toast.error('NID নম্বর ১০ অথবা ১৭ ডিজিটের হতে হবে');
          setLoading(false);
          return;
        }

        const nidHash = cleanNid ? await hashNid(cleanNid) : '';
        await signUp(email, password, { name, district, phone: cleanPhone, nid_hash: nidHash });
        toast.success('অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল ভেরিফাই করুন।');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "h-12 bg-muted/20 border-border/50 rounded-xl text-sm focus:border-primary/50 focus:ring-primary/20 transition-all";

  return (
    <div className="min-h-screen flex mesh-cinematic grain relative overflow-hidden">
      {/* Left — Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full bg-accent/5 blur-3xl top-20 right-20"
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-md text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">OpenNation</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            AI-powered civic intelligence platform for national transparency & accountability
          </p>
          <div className="flex items-center justify-center gap-6 mt-10">
            {['Encrypted', 'AI Verified', 'Real-time'].map((label, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-2 text-xs text-muted-foreground/60"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                {label}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-10">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">OpenNation</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'login' ? 'Sign in to your citizen portal' : 'Join the transparency movement'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="আপনার পুরো নাম"
                    required
                    maxLength={100}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    required
                    maxLength={15}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">District (জেলা)</Label>
                  <Select value={district} onValueChange={setDistrict} required>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="জেলা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {BD_DISTRICTS.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    NID Number <span className="text-muted-foreground/50 normal-case tracking-normal">(ঐচ্ছিক)</span>
                  </Label>
                  <Input
                    value={nid}
                    onChange={e => setNid(e.target.value.replace(/\D/g, ''))}
                    placeholder="১০ অথবা ১৭ ডিজিট"
                    maxLength={17}
                    className={inputClass}
                  />
                  <p className="text-[10px] text-muted-foreground/50">🔒 SHA-256 হ্যাশ করে সংরক্ষণ করা হবে</p>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                maxLength={255}
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || (mode === 'signup' && !district)}
              className="w-full h-12 rounded-xl text-sm font-semibold gap-2 bg-primary text-primary-foreground btn-glow glow-neon"
            >
              {loading ? (
                <motion.div
                  className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setMode(m => m === 'login' ? 'signup' : 'login')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <span className="font-semibold text-primary">
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
