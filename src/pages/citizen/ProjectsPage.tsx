import { useEffect, useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Building2, Send, Lock, Banknote, MapPin } from 'lucide-react';

export default function ProjectsPage() {
  const { projects, loading, error, fetchProjects, submitOpinion } = useProjects();
  const { t } = useLanguage();
  const { crisisMode } = useApp();
  const [opinionText, setOpinionText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleSubmitOpinion = async (projectId: string) => {
    const text = opinionText[projectId]?.trim();
    if (!text) return;
    setSubmitting(projectId);
    try {
      await submitOpinion({ projectId, opinion: text });
      toast.success(t('success'));
      setOpinionText(prev => ({ ...prev, [projectId]: '' }));
    } catch { /* handled */ }
    finally { setSubmitting(null); }
  };

  const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive'; className: string }> = {
    frozen: { variant: 'destructive', className: 'bg-destructive/10 text-destructive border-0' },
    completed: { variant: 'default', className: 'bg-success/10 text-success border-0' },
    active: { variant: 'secondary', className: 'bg-primary/10 text-primary border-0' },
    pending: { variant: 'secondary', className: '' },
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('projects')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">সরকারি প্রকল্প ও মতামত</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchProjects} />}
      {loading ? <LoadingSkeleton rows={4} /> : projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">{t('noData')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map(project => {
            const status = statusConfig[project.status] || statusConfig.pending;
            return (
              <Card key={project.id} className="border-border/60 hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <CardTitle className="text-base leading-snug">{project.title}</CardTitle>
                    </div>
                    <Badge variant={status.variant} className={status.className}>{t(project.status as any) || project.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{project.department}</span>
                    <span className="flex items-center gap-1"><Banknote className="h-3 w-3" />৳{project.budget.toLocaleString('bn-BD')}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{project.district}</span>
                  </div>
                  {!project.isFrozen && !crisisMode.active && (
                    <div className="flex gap-2 pt-1">
                      <Textarea
                        placeholder="আপনার মতামত দিন..."
                        value={opinionText[project.id] || ''}
                        onChange={e => setOpinionText(prev => ({ ...prev, [project.id]: e.target.value }))}
                        rows={2}
                        className="flex-1 bg-muted/30 resize-none"
                      />
                      <Button
                        onClick={() => handleSubmitOpinion(project.id)}
                        disabled={submitting === project.id || !opinionText[project.id]?.trim()}
                        size="sm"
                        className="self-end gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />{t('submit')}
                      </Button>
                    </div>
                  )}
                  {project.isFrozen && (
                    <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 rounded-lg px-3 py-2">
                      <Lock className="h-3.5 w-3.5" />
                      {t('frozen')} — মতামত দেওয়া বন্ধ
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
