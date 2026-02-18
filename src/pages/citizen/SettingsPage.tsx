import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useApp();

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-foreground">{t('settings')}</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">{t('language')}</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Button variant={lang === 'bn' ? 'default' : 'outline'} onClick={() => setLang('bn')} className="gap-1">
            <Globe className="h-4 w-4" />{t('bengali')}
          </Button>
          <Button variant={lang === 'en' ? 'default' : 'outline'} onClick={() => setLang('en')} className="gap-1">
            <Globe className="h-4 w-4" />{t('english')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{theme === 'dark' ? t('darkMode') : t('lightMode')}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            <Moon className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm text-muted-foreground">
              {theme === 'dark' ? t('darkMode') : t('lightMode')}
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
