import { AlertTriangle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function CrisisBanner() {
  const { crisisMode } = useApp();
  const { t } = useLanguage();

  if (!crisisMode.active) return null;

  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-2 flex items-center gap-2 text-sm font-medium">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>{t('crisisActive')} — {t('crisisNotice')}</span>
    </div>
  );
}
