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
import { toast } from 'sonner';
import { CheckCircle, X, Banknote, MapPin, Building2 } from 'lucide-react';

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
      await approveProject(action.id, action.approved);
      toast.success(t('success'));
      setAction(null); setNotes('');
      fetchProjects();
    } catch { /* handled */ }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
          <CheckCircle className="h-5 w-5 text-success" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('projectApproval')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">প্রকল্প অনুমোদন কেন্দ্র</p>
        </div>
        {pendingProjects.length > 0 && (
          <Badge variant="secondary" className="ml-auto">{pendingProjects.length} অপেক্ষমাণ</Badge>
        )}
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchProjects} />}

      {loading ? <LoadingSkeleton rows={4} /> : pendingProjects.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-success/10 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <p className="text-muted-foreground font-medium">সব প্রকল্প অনুমোদন সম্পন্ন</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingProjects.map(p => (
            <Card key={p.id} className="border-border/60 hover:shadow-sm transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-sm leading-snug">{p.title}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">{p.department}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Banknote className="h-3 w-3" />৳{p.budget.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.district}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={() => setAction({ id: p.id, approved: true })} className="gap-1.5 gradient-primary border-0">
                    <CheckCircle className="h-3.5 w-3.5" />{t('approve')}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setAction({ id: p.id, approved: false })} className="gap-1.5">
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
