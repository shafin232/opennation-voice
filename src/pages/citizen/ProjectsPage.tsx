import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '@/hooks/useProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import type { GovernmentProject, ProjectVoteType } from '@/types';
import {
  Building2, Send, Lock, Banknote, MapPin, Layers, Users, TreePine,
  Home, ThumbsUp, Pencil, X, MessageCircle, ChevronDown, ChevronUp,
  BarChart3, Shield, AlertTriangle, CheckCircle2, Clock, Filter
} from 'lucide-react';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const slamIn = {
  hidden: { scale: 0.92, opacity: 0, y: 12 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  proposed: { label: 'প্রস্তাবিত', color: 'bg-warning/10 text-warning', icon: Clock },
  approved: { label: 'অনুমোদিত', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  ongoing: { label: 'চলমান', color: 'bg-primary/10 text-primary', icon: BarChart3 },
  completed: { label: 'সম্পন্ন', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  frozen: { label: 'স্থগিত', color: 'bg-destructive/10 text-destructive', icon: Lock },
  revision_required: { label: 'সংশোধন প্রয়োজন', color: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
};

const voteConfig: Record<ProjectVoteType, { label: string; labelBn: string; emoji: string; color: string; activeBg: string; icon: typeof ThumbsUp }> = {
  need: { label: 'NEED', labelBn: 'প্রয়োজন', emoji: '✅', color: 'text-success', activeBg: 'bg-success/15 border-success/40 text-success', icon: ThumbsUp },
  modify: { label: 'MODIFY', labelBn: 'সংশোধন', emoji: '✏️', color: 'text-warning', activeBg: 'bg-warning/15 border-warning/40 text-warning', icon: Pencil },
  reject: { label: 'REJECT', labelBn: 'প্রত্যাখ্যান', emoji: '❌', color: 'text-destructive', activeBg: 'bg-destructive/15 border-destructive/40 text-destructive', icon: X },
};

const impactIncomeLabels: Record<string, string> = {
  low: 'নিম্ন আয়ের মানুষ বেশি উপকৃত',
  medium: 'মধ্যম আয়ের মানুষ বেশি উপকৃত',
  high: 'উচ্চ আয়ের মানুষ বেশি উপকৃত',
  all: 'সকল আয়ের মানুষ সমানভাবে উপকৃত',
};

const impactEnvLabels: Record<string, { label: string; color: string }> = {
  positive: { label: 'পরিবেশ বান্ধব', color: 'text-success' },
  neutral: { label: 'নিরপেক্ষ', color: 'text-muted-foreground' },
  negative: { label: 'পরিবেশ ক্ষতিকর', color: 'text-destructive' },
};

const statusFilters = [
  { value: 'all', label: 'সব' },
  { value: 'proposed', label: 'প্রস্তাবিত' },
  { value: 'ongoing', label: 'চলমান' },
  { value: 'completed', label: 'সম্পন্ন' },
  { value: 'revision_required', label: 'সংশোধন' },
];

function VoteBar({ project }: { project: GovernmentProject }) {
  const total = project.needCount + project.modifyCount + project.rejectCount;
  if (total === 0) return (
    <div className="text-center py-3">
      <p className="text-xs text-muted-foreground">এখনো কোনো ভোট পড়েনি</p>
    </div>
  );

  const needPct = (project.needCount / total) * 100;
  const modifyPct = (project.modifyCount / total) * 100;
  const rejectPct = (project.rejectCount / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex rounded-full h-3 overflow-hidden bg-muted/20">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${needPct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-success h-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${modifyPct}%` }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="bg-warning h-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${rejectPct}%` }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="bg-destructive h-full"
        />
      </div>
      <div className="flex justify-between text-[10px] font-bold">
        <span className="text-success">✅ {Math.round(needPct)}%</span>
        <span className="text-warning">✏️ {Math.round(modifyPct)}%</span>
        <span className="text-destructive">❌ {Math.round(rejectPct)}%</span>
      </div>
      <div className="text-center">
        <span className="text-[10px] text-muted-foreground font-mono-data">মোট {total} ভোট</span>
      </div>
    </div>
  );
}

function ImpactMetrics({ project }: { project: GovernmentProject }) {
  const env = impactEnvLabels[project.impactEnvironment] || impactEnvLabels.neutral;

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="p-3 rounded-xl bg-muted/10 border border-border/20 text-center">
        <Users className="h-4 w-4 mx-auto mb-1.5 text-primary" />
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">আয় বন্টন</p>
        <p className="text-[11px] font-semibold">{impactIncomeLabels[project.impactIncome] || 'তথ্য নেই'}</p>
      </div>
      <div className="p-3 rounded-xl bg-muted/10 border border-border/20 text-center">
        <TreePine className={`h-4 w-4 mx-auto mb-1.5 ${env.color}`} />
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">পরিবেশ</p>
        <p className={`text-[11px] font-semibold ${env.color}`}>{env.label}</p>
      </div>
      <div className="p-3 rounded-xl bg-muted/10 border border-border/20 text-center">
        <Home className="h-4 w-4 mx-auto mb-1.5 text-destructive" />
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">উচ্ছেদ</p>
        <p className="text-[11px] font-semibold">{project.impactDisplacement > 0 ? `${project.impactDisplacement} পরিবার` : 'নেই'}</p>
      </div>
    </div>
  );
}

function ProjectCard({ project, onVote, votingId, crisisActive }: {
  project: GovernmentProject;
  onVote: (id: string, type: ProjectVoteType) => void;
  votingId: string | null;
  crisisActive: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [opinionText, setOpinionText] = useState('');
  const [showOpinions, setShowOpinions] = useState(false);
  const { submitOpinion, fetchProjectOpinions, opinions } = useProjects();
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();

  const status = statusConfig[project.status] || statusConfig.proposed;
  const StatusIcon = status.icon;
  const isVoting = votingId === project.id;

  const handleOpinion = async () => {
    if (!opinionText.trim()) return;
    setSubmitting(true);
    try {
      await submitOpinion({ projectId: project.id, opinion: opinionText.trim() });
      toast.success('মতামত জমা হয়েছে!');
      setOpinionText('');
      fetchProjectOpinions(project.id);
    } catch {}
    setSubmitting(false);
  };

  const handleShowOpinions = () => {
    if (!showOpinions) fetchProjectOpinions(project.id);
    setShowOpinions(!showOpinions);
  };

  return (
    <div className="glass-panel-hover rounded-2xl overflow-hidden shine-top relative group">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-snug tracking-tight">{project.title}</h3>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{project.department}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{project.district}</span>
              </div>
            </div>
          </div>
          <Badge className={`shrink-0 text-[10px] font-bold px-2 py-0.5 border-0 ${status.color}`}>
            <StatusIcon className="h-2.5 w-2.5 mr-1" />
            {status.label}
          </Badge>
        </div>

        <p className="text-[13px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">{project.description}</p>

        {/* Budget + Approval */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 p-3 rounded-xl bg-muted/10 border border-border/20">
            <div className="flex items-center gap-1.5 mb-1">
              <Banknote className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">বাজেট</span>
            </div>
            <p className="text-lg font-bold font-mono-data tracking-tight">
              ৳{project.budget >= 10000000 
                ? `${(project.budget / 10000000).toFixed(1)} কোটি` 
                : project.budget >= 100000 
                  ? `${(project.budget / 100000).toFixed(1)} লক্ষ`
                  : project.budget.toLocaleString('bn-BD')}
            </p>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-muted/10 border border-border/20">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="h-3.5 w-3.5 text-success" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">জনমত</span>
            </div>
            <div className="flex items-center gap-2">
              <p className={`text-lg font-bold font-mono-data ${
                project.approvalPercent >= 60 ? 'text-success' : project.approvalPercent >= 30 ? 'text-warning' : 'text-destructive'
              }`}>
                {project.approvalPercent}%
              </p>
              <span className="text-[10px] text-muted-foreground">সমর্থন</span>
            </div>
          </div>
        </div>

        {/* Vote bar */}
        <VoteBar project={project} />
      </div>

      {/* Vote buttons */}
      {!project.isFrozen && !crisisActive && (
        <div className="px-5 pb-4">
          <div className="grid grid-cols-3 gap-2">
            {(['need', 'modify', 'reject'] as ProjectVoteType[]).map(type => {
              const cfg = voteConfig[type];
              const VIcon = cfg.icon;
              const isActive = project.userVote === type;
              return (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  disabled={isVoting}
                  onClick={() => onVote(project.id, type)}
                  className={`h-11 rounded-xl font-bold text-xs gap-1.5 transition-all border ${
                    isActive ? cfg.activeBg : 'border-border/30 hover:border-border/60'
                  }`}
                >
                  <span className="text-sm">{cfg.emoji}</span>
                  {cfg.labelBn}
                </Button>
              );
            })}
          </div>
          {project.userVote && (
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              আপনি <strong className={voteConfig[project.userVote].color}>{voteConfig[project.userVote].labelBn}</strong> ভোট দিয়েছেন
            </p>
          )}
        </div>
      )}

      {project.isFrozen && (
        <div className="mx-5 mb-4 flex items-center gap-2 text-xs text-destructive bg-destructive/5 rounded-xl px-4 py-2.5 border border-destructive/10">
          <Lock className="h-3.5 w-3.5" />
          <span>স্থগিত — ভোট ও মতামত দেওয়া বন্ধ</span>
        </div>
      )}

      {/* Expand for impact & opinions */}
      <div className="border-t border-border/20 mx-5" />
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-3 flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? 'কম দেখুন' : 'প্রভাব বিশ্লেষণ ও মতামত'}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* Impact metrics */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" /> প্রভাব বিশ্লেষণ
                </h4>
                <ImpactMetrics project={project} />
                {project.affectedPopulation > 0 && (
                  <div className="mt-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-[11px] text-primary flex items-center gap-1.5">
                      <Users className="h-3 w-3" />
                      আনুমানিক <strong>{project.affectedPopulation.toLocaleString('bn-BD')}</strong> জন প্রভাবিত হবে
                    </p>
                  </div>
                )}
              </div>

              {/* Geographic weight notice */}
              <div className="p-3 rounded-xl bg-accent/5 border border-accent/20">
                <p className="text-[11px] text-accent flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span><strong>ভৌগোলিক গুরুত্ব:</strong> {project.district} এর বাসিন্দাদের ভোটের ওজন ১.৫× বেশি</span>
                </p>
              </div>

              {/* Opinions section */}
              {!project.isFrozen && !crisisActive && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="আপনার মতামত দিন..."
                      value={opinionText}
                      onChange={e => setOpinionText(e.target.value)}
                      rows={2}
                      className="flex-1 bg-muted/5 resize-none border-border/30 rounded-xl text-[13px]"
                    />
                    <Button
                      onClick={handleOpinion}
                      disabled={submitting || !opinionText.trim()}
                      size="sm"
                      className="self-end gap-1.5 bg-primary text-primary-foreground btn-glow rounded-xl"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <Button variant="ghost" size="sm" onClick={handleShowOpinions}
                    className="gap-1.5 text-xs text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5" />
                    মতামত দেখুন ({project.opinionCount})
                  </Button>

                  <AnimatePresence>
                    {showOpinions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-2 max-h-60 overflow-y-auto"
                      >
                        {opinions.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-2">এখনো কোনো মতামত নেই</p>
                        ) : opinions.filter(o => o.projectId === project.id).map(o => (
                          <div key={o.id} className="p-3 rounded-xl bg-muted/10 border border-border/20">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold">{o.userName}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(o.createdAt).toLocaleDateString('bn-BD')}
                              </span>
                            </div>
                            <p className="text-[13px] text-foreground/80">{o.opinion}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProjectsPage() {
  const { projects, loading, error, fetchProjects, voteOnProject } = useProjects();
  const { t } = useLanguage();
  const { crisisMode } = useApp();
  const { user } = useAuth();
  const [votingId, setVotingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => { fetchProjects(activeFilter); }, [fetchProjects, activeFilter]);

  const handleVote = async (projectId: string, type: ProjectVoteType) => {
    setVotingId(projectId);
    await voteOnProject(projectId, type);
    setVotingId(null);
  };

  const totalProjects = projects.length;
  const avgApproval = totalProjects > 0
    ? Math.round(projects.reduce((a, p) => a + p.approvalPercent, 0) / totalProjects)
    : 0;
  const totalBudget = projects.reduce((a, p) => a + p.budget, 0);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">সরকারি প্রকল্প</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter leading-[0.95]">
          প্রকল্প <span className="gradient-text-neon">ভোটিং</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2">সরকারি প্রকল্পে আপনার মতামত দিন — Data-Driven Democracy</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-3 gap-2">
        {[
          { icon: Building2, label: 'মোট প্রকল্প', value: totalProjects, color: 'text-primary' },
          { icon: Shield, label: 'গড় জনমত', value: `${avgApproval}%`, color: 'text-success' },
          { icon: Banknote, label: 'মোট বাজেট', value: `৳${(totalBudget / 10000000).toFixed(0)} কোটি`, color: 'text-warning' },
        ].map((s, i) => (
          <motion.div key={i} variants={slamIn}>
            <div className="glass-panel p-3 rounded-xl text-center">
              <s.icon className={`h-4 w-4 ${s.color} mx-auto mb-1`} />
              <p className="stat-number text-lg text-foreground">{s.value}</p>
              <p className="text-[9px] text-muted-foreground font-medium">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {statusFilters.map(f => (
          <Button
            key={f.value}
            variant="ghost"
            size="sm"
            onClick={() => setActiveFilter(f.value)}
            className={`shrink-0 rounded-full text-xs h-8 px-3.5 font-bold transition-all ${
              activeFilter === f.value
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground border border-transparent'
            }`}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {error && <ErrorBanner message={error} onRetry={() => fetchProjects(activeFilter)} />}

      {loading ? <LoadingSkeleton rows={4} /> : projects.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24">
          <div className="h-20 w-20 rounded-3xl glass-panel flex items-center justify-center mx-auto mb-6">
            <Layers className="h-10 w-10 text-primary/25" />
          </div>
          <h3 className="text-lg font-bold mb-2">কোনো প্রকল্প নেই</h3>
          <p className="text-sm text-muted-foreground">এই ফিল্টারে কোনো প্রকল্প পাওয়া যায়নি</p>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          {projects.map(project => (
            <motion.div key={project.id} variants={slamIn}>
              <ProjectCard
                project={project}
                onVote={handleVote}
                votingId={votingId}
                crisisActive={crisisMode.active}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
