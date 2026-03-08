import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="bg-destructive/5 border border-destructive/15 rounded-xl px-4 py-3.5 flex items-center gap-3 animate-scale-in">
      <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
        <AlertCircle className="h-4 w-4 text-destructive" />
      </div>
      <span className="flex-1 text-sm text-foreground">{message}</span>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0">
          <RefreshCw className="h-3.5 w-3.5" />
          পুনরায়
        </Button>
      )}
    </div>
  );
}
