import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe, Moon, Sun, Settings } from 'lucide-react';

export default function SettingsPage() {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useApp();

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('settings')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">অ্যাপ কাস্টমাইজেশন</p>
        </div>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('language')}</CardTitle>
          <CardDescription className="text-xs">আপনার পছন্দের ভাষা নির্বাচন করুন</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button 
            variant={lang === 'bn' ? 'default' : 'outline'} 
            onClick={() => setLang('bn')} 
            className={`gap-1.5 flex-1 ${lang === 'bn' ? 'gradient-primary border-0' : ''}`}
          >
            <Globe className="h-4 w-4" />{t('bengali')}
          </Button>
          <Button 
            variant={lang === 'en' ? 'default' : 'outline'} 
            onClick={() => setLang('en')} 
            className={`gap-1.5 flex-1 ${lang === 'en' ? 'gradient-primary border-0' : ''}`}
          >
            <Globe className="h-4 w-4" />{t('english')}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{theme === 'dark' ? t('darkMode') : t('lightMode')}</CardTitle>
          <CardDescription className="text-xs">ডার্ক বা লাইট থিম পরিবর্তন করুন</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-warning" />}
              <Label className="text-sm font-medium">
                {theme === 'dark' ? t('darkMode') : t('lightMode')}
              </Label>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
