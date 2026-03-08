import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe, Moon, Sun, Settings, Palette } from 'lucide-react';

const slamIn = {
  hidden: { scale: 0.92, opacity: 0, y: 8 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};

export default function SettingsPage() {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useApp();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-muted/30 flex items-center justify-center">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bengali font-bold text-foreground tracking-tight leading-none">{t('settings')}</h1>
            <p className="text-sm text-muted-foreground mt-1 font-bengali">অ্যাপ কাস্টমাইজেশন</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={slamIn} initial="hidden" animate="show">
        <div className="glass-card p-6 rounded-2xl gradient-shine">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-4 w-4 text-primary" />
            <div>
              <h3 className="text-sm font-semibold font-bengali">{t('language')}</h3>
              <p className="text-[11px] text-muted-foreground font-bengali">আপনার পছন্দের ভাষা নির্বাচন করুন</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={lang === 'bn' ? 'default' : 'outline'}
              onClick={() => setLang('bn')}
              className={`gap-1.5 flex-1 btn-press rounded-xl ${lang === 'bn' ? 'bg-primary text-primary-foreground shadow-glow-teal' : 'border-[hsl(var(--border-subtle))]'}`}
            >
              <Globe className="h-4 w-4" />{t('bengali')}
            </Button>
            <Button
              variant={lang === 'en' ? 'default' : 'outline'}
              onClick={() => setLang('en')}
              className={`gap-1.5 flex-1 btn-press rounded-xl ${lang === 'en' ? 'bg-primary text-primary-foreground shadow-glow-teal' : 'border-[hsl(var(--border-subtle))]'}`}
            >
              <Globe className="h-4 w-4" />{t('english')}
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={slamIn} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
        <div className="glass-card p-6 rounded-2xl gradient-shine">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="h-4 w-4 text-primary" />
            <div>
              <h3 className="text-sm font-semibold font-bengali">{theme === 'dark' ? t('darkMode') : t('lightMode')}</h3>
              <p className="text-[11px] text-muted-foreground font-bengali">ডার্ক বা লাইট থিম পরিবর্তন করুন</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl glass">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-warning" />}
              <Label className="text-sm font-medium font-bengali">
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
