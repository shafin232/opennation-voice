import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
      className="gap-1.5 text-xs font-medium px-2.5"
    >
      <Globe className="h-3.5 w-3.5" />
      {lang === 'bn' ? 'EN' : 'বাং'}
    </Button>
  );
}
