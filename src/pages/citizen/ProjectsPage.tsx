import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useProjects } from '@/hooks/useProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Building2, Send, Lock, Banknote, MapPin, Layers, ArrowUpRight } from 'lucide-react';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const slamIn = {
  hidden: { scale: 0.92, opacity: 0, y: 12 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 28 } },
};

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

  const statusColor: Record<string, string> = {
    frozen: 'bg-destructive/8 text-destructive',
    completed: 'bg-success/8 text-success',
    active: 'bg-primary/8 text-primary',
    pending: 'bg-warning/8 text-warning',
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Projects</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-[0.95]">{t('projects')}</h1>
        <p className="text-sm text-muted-foreground mt-2">সরকারি প্রকল্প ও নাগরিক মতামত</p>
      </motion.div>

      {error && <ErrorBanner message={error} onRetry={fetchProjects} />}

      {loading ? <LoadingSkeleton rows={4} /> : projects.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24">
          <div className="h-20 w-20 rounded-3xl glass-panel flex items-center justify-center mx-auto mb-6">
            <Layers className="h-10 w-10 text-primary/25" />
          </div>
          <h3 className="text-lg font-bold mb-2">কোনো প্রকল্প নেই</h3>
          <p className="text-sm text-muted-foreground">{t('noData')}</p>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4">
          {projects.map(project => (
            <motion.div key={project.id} variants={slamIn}>
              <div className="glass-panel-hover p-6 rounded-2xl shine-top relative group">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-base font-bold leading-snug tracking-tight">{project.title}</h3>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${statusColor[project.status] || statusColor.pending}`}>
                    {t(project.status as any) || project.status}
                  </span>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground/60 mb-4">
                  <span className="flex items-center gap-1.5"><Building2 className="h-3 w-3" />{project.department}</span>
                  <span className="flex items-center gap-1.5 font-mono-data"><Banknote className="h-3 w-3" />৳{project.budget.toLocaleString('bn-BD')}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{project.district}</span>
                </div>
                {!project.isFrozen && !crisisMode.active && (
                  <div className="flex gap-3 pt-4 border-t border-border/20">
                    <Textarea
                      placeholder="আপনার মতামত দিন..."
                      value={opinionText[project.id] || ''}
                      onChange={e => setOpinionText(prev => ({ ...prev, [project.id]: e.target.value }))}
                      rows={2}
                      className="flex-1 bg-muted/5 resize-none border-border/30 rounded-xl text-[13px]"
                    />
                    <Button
                      onClick={() => handleSubmitOpinion(project.id)}
                      disabled={submitting === project.id || !opinionText[project.id]?.trim()}
                      size="sm"
                      className="self-end gap-1.5 bg-primary text-primary-foreground btn-glow rounded-xl"
                    >
                      <Send className="h-3.5 w-3.5" />{t('submit')}
                    </Button>
                  </div>
                )}
                {project.isFrozen && (
                  <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 rounded-xl px-4 py-2.5 mt-3 border border-destructive/10">
                    <Lock className="h-3.5 w-3.5" />
                    <span>{t('frozen')} — মতামত দেওয়া বন্ধ</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
