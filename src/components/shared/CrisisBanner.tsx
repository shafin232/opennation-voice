import { AlertTriangle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function CrisisBanner() {
  const { crisisMode } = useApp();
  const { t } = useLanguage();

  if (!crisisMode.active) return null;

  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-2.5 flex items-center justify-center gap-2.5 text-sm font-semibold animate-fade-in">
      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
        <AlertTriangle className="h-3 w-3 shrink-0" />
      </div>
      <span>{t('crisisActive')} — {t('crisisNotice')}</span>
    </div>
  );
}
