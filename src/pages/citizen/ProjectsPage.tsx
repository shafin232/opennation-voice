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
import { Building2 } from 'lucide-react';

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

  const statusVariant = (status: string) => {
    if (status === 'frozen') return 'destructive' as const;
    if (status === 'completed') return 'default' as const;
    return 'secondary' as const;
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">{t('projects')}</h1>
      {error && <ErrorBanner message={error} onRetry={fetchProjects} />}
      {loading ? <LoadingSkeleton rows={4} /> : projects.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t('noData')}</p>
      ) : (
        <div className="grid gap-4">
          {projects.map(project => (
            <Card key={project.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">{project.title}</CardTitle>
                  </div>
                  <Badge variant={statusVariant(project.status)}>{t(project.status as any) || project.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{project.description}</p>
                <div className="text-xs text-muted-foreground flex gap-4">
                  <span>বিভাগ: {project.department}</span>
                  <span>বাজেট: ৳{project.budget.toLocaleString('bn-BD')}</span>
                  <span>জেলা: {project.district}</span>
                </div>
                {!project.isFrozen && !crisisMode.active && (
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="আপনার মতামত দিন..."
                      value={opinionText[project.id] || ''}
                      onChange={e => setOpinionText(prev => ({ ...prev, [project.id]: e.target.value }))}
                      rows={2}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleSubmitOpinion(project.id)}
                      disabled={submitting === project.id || !opinionText[project.id]?.trim()}
                      size="sm"
                    >
                      {t('submit')}
                    </Button>
                  </div>
                )}
                {project.isFrozen && (
                  <p className="text-xs text-destructive">{t('frozen')} — মতামত দেওয়া বন্ধ</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
