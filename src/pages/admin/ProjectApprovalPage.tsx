import { useEffect, useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CheckCircle, X } from 'lucide-react';

export default function ProjectApprovalPage() {
  const { projects, loading, error, fetchProjects } = useProjects();
  const { approveProject, loading: actionLoading } = useAdmin();
  const { t } = useLanguage();
  const [action, setAction] = useState<{ id: string; approved: boolean } | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const pendingProjects = projects.filter(p => p.approvalStatus === 'pending');

  const handleAction = async () => {
    if (!action) return;
    try {
      await approveProject(action.id, action.approved, notes);
      toast.success(t('success'));
      setAction(null); setNotes('');
      fetchProjects();
    } catch { /* handled */ }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t('projectApproval')}</h1>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchProjects} />}

      {loading ? <LoadingSkeleton rows={4} /> : pendingProjects.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t('noData')}</p>
      ) : (
        <div className="space-y-3">
          {pendingProjects.map(p => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">{p.title}</CardTitle>
                  <Badge variant="secondary">{p.department}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{p.description}</p>
                <div className="text-xs text-muted-foreground">বাজেট: ৳{p.budget.toLocaleString()} · জেলা: {p.district}</div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setAction({ id: p.id, approved: true })} className="gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />{t('approve')}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setAction({ id: p.id, approved: false })} className="gap-1">
                    <X className="h-3.5 w-3.5" />{t('reject')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {action && (
        <ConfirmModal
          open={!!action}
          onOpenChange={open => !open && setAction(null)}
          title={action.approved ? t('approve') : t('reject')}
          description={action.approved ? 'প্রকল্প অনুমোদন করতে চান?' : 'প্রকল্প প্রত্যাখ্যান করতে চান?'}
          onConfirm={handleAction}
          destructive={!action.approved}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
