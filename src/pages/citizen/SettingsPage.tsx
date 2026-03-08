import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe, Moon, Sun, Settings, Palette } from 'lucide-react';

const slamIn = {
  hidden: { scale: 0.92, opacity: 0, y: 12 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};

export default function SettingsPage() {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useApp();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Preferences</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tighter leading-[0.95]">{t('settings')}</h1>
        <p className="text-sm text-muted-foreground mt-2">অ্যাপ কাস্টমাইজেশন</p>
      </motion.div>

      <motion.div variants={slamIn} initial="hidden" animate="show">
        <div className="glass-panel p-6 rounded-2xl shine-top relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-xl bg-primary/8 flex items-center justify-center">
              <Globe className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{t('language')}</h3>
              <p className="text-[11px] text-muted-foreground">আপনার পছন্দের ভাষা নির্বাচন করুন</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={lang === 'bn' ? 'default' : 'outline'}
              onClick={() => setLang('bn')}
              className={`gap-1.5 flex-1 rounded-xl h-11 font-semibold ${lang === 'bn' ? 'bg-primary text-primary-foreground glow-neon' : 'border-border/40'}`}
            >
              বাংলা
            </Button>
            <Button
              variant={lang === 'en' ? 'default' : 'outline'}
              onClick={() => setLang('en')}
              className={`gap-1.5 flex-1 rounded-xl h-11 font-semibold ${lang === 'en' ? 'bg-primary text-primary-foreground glow-neon' : 'border-border/40'}`}
            >
              English
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={slamIn} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
        <div className="glass-panel p-6 rounded-2xl shine-top relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-xl bg-accent/8 flex items-center justify-center">
              <Palette className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{theme === 'dark' ? t('darkMode') : t('lightMode')}</h3>
              <p className="text-[11px] text-muted-foreground">ডার্ক বা লাইট থিম পরিবর্তন করুন</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-border/30">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-warning" />}
              <Label className="text-sm font-semibold">
                {theme === 'dark' ? t('darkMode') : t('lightMode')}
              </Label>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
