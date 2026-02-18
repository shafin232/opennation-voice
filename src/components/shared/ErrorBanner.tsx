import { AlertCircle } from 'lucide-react';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 flex items-center gap-3">
      <AlertCircle className="h-5 w-5 shrink-0" />
      <span className="flex-1 text-sm">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-medium underline underline-offset-2 hover:opacity-80">
          পুনরায় চেষ্টা করুন
        </button>
      )}
    </div>
  );
}
