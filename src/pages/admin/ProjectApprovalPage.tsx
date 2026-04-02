import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '@/hooks/useProjects';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  CheckCircle, X, Banknote, MapPin, Building2, Plus, ThumbsUp,
  Pencil, BarChart3, MessageCircle, Users, Lock, Unlock, ChevronDown,
  ChevronUp, Shield, AlertTriangle, Eye
} from 'lucide-react';

const slamIn = {
  hidden: { scale: 0.95, opacity: 0, y: 10 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  proposed: { label: 'প্রস্তাবিত', color: 'bg-warning/10 text-warning' },
  approved: { label: 'অনুমোদিত', color: 'bg-success/10 text-success' },
  ongoing: { label: 'চলমান', color: 'bg-primary/10 text-primary' },
  completed: { label: 'সম্পন্ন', color: 'bg-success/10 text-success' },
  frozen: { label: 'স্থগিত', color: 'bg-destructive/10 text-destructive' },
  revision_required: { label: 'সংশোধন প্রয়োজন', color: 'bg-destructive/10 text-destructive' },
};

interface ProjectOpinion {
  id: string; userName: string; opinion: string; createdAt: string;
}

function VoteResultBar({ need, modify, reject }: { need: number; modify: number; reject: number }) {
  const total = need + modify + reject;
  if (total === 0) return <p className="text-xs text-muted-foreground">কোনো ভোট নেই</p>;
  const needPct = Math.round((need / total) * 100);
  const modifyPct = Math.round((modify / total) * 100);
  const rejectPct = Math.round((reject / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex rounded-full h-3 overflow-hidden bg-muted/20">
        <div className="bg-success h-full" style={{ width: `${needPct}%` }} />
        <div className="bg-warning h-full" style={{ width: `${modifyPct}%` }} />
        <div className="bg-destructive h-full" style={{ width: `${rejectPct}%` }} />
      </div>
      <div className="grid grid-cols-3 text-[10px] font-bold text-center">
        <span className="text-success">✅ প্রয়োজন {needPct}% ({need})</span>
        <span className="text-warning">✏️ সংশোধন {modifyPct}% ({modify})</span>
        <span className="text-destructive">❌ প্রত্যাখ্যান {rejectPct}% ({reject})</span>
      </div>
      <p className="text-[10px] text-center text-muted-foreground font-mono-data">মোট {total} ভোট</p>
    </div>
  );
}

export default function ProjectApprovalPage() {
  const { projects, loading, error, fetchProjects } = useProjects();
  const { approveProject, loading: actionLoading } = useAdmin();
  const { t } = useLanguage();
  const [action, setAction] = useState<{ id: string; approved: boolean } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [opinions, setOpinions] = useState<Record<string, ProjectOpinion[]>>({});
  const [loadingOpinions, setLoadingOpinions] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending'>('all');

  // New project form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newImpactIncome, setNewImpactIncome] = useState('medium');
  const [newImpactEnv, setNewImpactEnv] = useState('neutral');
  const [newDisplacement, setNewDisplacement] = useState('0');
  const [newPopulation, setNewPopulation] = useState('0');
  const [addingProject, setAddingProject] = useState(false);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const filteredProjects = filter === 'pending'
    ? projects.filter(p => p.approvalStatus === 'pending')
    : projects;

  const handleAction = async () => {
    if (!action) return;
    try {
      await approveProject(action.id, action.approved);
      toast.success(action.approved ? 'প্রকল্প অনুমোদিত' : 'প্রকল্প প্রত্যাখ্যাত');
      setAction(null);
      fetchProjects();
    } catch {}
  };

  const handleAddProject = async () => {
    if (!newTitle.trim() || !newDesc.trim()) return;
    setAddingProject(true);
    try {
      const { error: err } = await supabase.from('projects').insert({
        title: newTitle.trim(),
        description: newDesc.trim(),
        department: newDept.trim() || 'সাধারণ',
        district: newDistrict.trim() || '',
        budget: parseInt(newBudget) || 0,
        impact_income: newImpactIncome,
        impact_environment: newImpactEnv,
        impact_displacement: parseInt(newDisplacement) || 0,
        affected_population: parseInt(newPopulation) || 0,
      } as any);
      if (err) throw err;
      toast.success('প্রকল্প যোগ হয়েছে!');
      setShowAddForm(false);
      setNewTitle(''); setNewDesc(''); setNewDept(''); setNewDistrict('');
      setNewBudget(''); setNewDisplacement('0'); setNewPopulation('0');
      fetchProjects();
    } catch (err: any) {
      toast.error(err.message || 'ব্যর্থ');
    }
    setAddingProject(false);
  };

  const handleToggleFreeze = async (projectId: string, freeze: boolean) => {
    const { error: err } = await supabase
      .from('projects')
      .update({ is_frozen: freeze })
      .eq('id', projectId);
    if (err) toast.error('ব্যর্থ');
    else { toast.success(freeze ? 'প্রকল্প স্থগিত করা হয়েছে' : 'প্রকল্প চালু করা হয়েছে'); fetchProjects(); }
  };

  const loadOpinions = async (projectId: string) => {
    if (expandedId === projectId) { setExpandedId(null); return; }
    setExpandedId(projectId);
    setLoadingOpinions(projectId);
    const { data } = await supabase
      .from('project_opinions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(o => o.user_id))];
      const { data: profiles } = await supabase
        .from('profiles').select('user_id, name, citizen_alias').in('user_id', userIds);
      const pMap = new Map((profiles ?? []).map(p => [p.user_id, p]));

      setOpinions(prev => ({
        ...prev,
        [projectId]: data.map(o => {
          const p = pMap.get(o.user_id);
          return {
            id: o.id,
            userName: (p as any)?.citizen_alias || p?.name || 'Anonymous',
            opinion: o.opinion,
            createdAt: o.created_at,
          };
        }),
      }));
    } else {
      setOpinions(prev => ({ ...prev, [projectId]: [] }));
    }
    setLoadingOpinions(null);
  };

  const pendingCount = projects.filter(p => p.approvalStatus === 'pending').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">প্রকল্প ম্যানেজমেন্ট</h1>
            <p className="text-xs text-muted-foreground mt-0.5">প্রকল্প যোগ, অনুমোদন, ভোট ফলাফল ও মতামত</p>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-1.5 bg-primary text-primary-foreground rounded-xl">
          <Plus className="h-4 w-4" /> নতুন প্রকল্প
        </Button>
      </div>

      {/* Add Project Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> নতুন প্রকল্প যোগ করুন</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">শিরোনাম *</Label>
                  <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="h-10 rounded-xl bg-muted/10" placeholder="প্রকল্পের নাম" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">বিভাগ</Label>
                  <Input value={newDept} onChange={e => setNewDept(e.target.value)} className="h-10 rounded-xl bg-muted/10" placeholder="যেমন: সড়ক বিভাগ" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">জেলা</Label>
                  <Input value={newDistrict} onChange={e => setNewDistrict(e.target.value)} className="h-10 rounded-xl bg-muted/10" placeholder="জেলার নাম" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">বাজেট (টাকা)</Label>
                  <Input type="number" value={newBudget} onChange={e => setNewBudget(e.target.value)} className="h-10 rounded-xl bg-muted/10" placeholder="0" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">বিবরণ *</Label>
                  <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} className="rounded-xl bg-muted/10 resize-none" placeholder="প্রকল্পের বিস্তারিত..." />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">আয় বন্টন প্রভাব</Label>
                  <select value={newImpactIncome} onChange={e => setNewImpactIncome(e.target.value)} className="w-full h-10 rounded-xl bg-muted/10 border border-border/40 px-3 text-sm">
                    <option value="low">নিম্ন আয়</option>
                    <option value="medium">মধ্যম আয়</option>
                    <option value="high">উচ্চ আয়</option>
                    <option value="all">সকল আয়</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">পরিবেশগত প্রভাব</Label>
                  <select value={newImpactEnv} onChange={e => setNewImpactEnv(e.target.value)} className="w-full h-10 rounded-xl bg-muted/10 border border-border/40 px-3 text-sm">
                    <option value="positive">পরিবেশ বান্ধব</option>
                    <option value="neutral">নিরপেক্ষ</option>
                    <option value="negative">ক্ষতিকর</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">উচ্ছেদিত পরিবার</Label>
                  <Input type="number" value={newDisplacement} onChange={e => setNewDisplacement(e.target.value)} className="h-10 rounded-xl bg-muted/10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">প্রভাবিত জনসংখ্যা</Label>
                  <Input type="number" value={newPopulation} onChange={e => setNewPopulation(e.target.value)} className="h-10 rounded-xl bg-muted/10" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAddProject} disabled={addingProject || !newTitle.trim() || !newDesc.trim()} className="gap-1.5 bg-primary text-primary-foreground rounded-xl">
                  <Plus className="h-3.5 w-3.5" /> যোগ করুন
                </Button>
                <Button variant="ghost" onClick={() => setShowAddForm(false)} className="rounded-xl">বাতিল</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => setFilter('all')}
          className={`rounded-full text-xs h-8 px-4 ${filter === 'all' ? 'bg-primary/10 text-primary font-bold border border-primary/30' : 'text-muted-foreground'}`}>
          সব ({projects.length})
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setFilter('pending')}
          className={`rounded-full text-xs h-8 px-4 ${filter === 'pending' ? 'bg-warning/10 text-warning font-bold border border-warning/30' : 'text-muted-foreground'}`}>
          অপেক্ষমাণ ({pendingCount})
        </Button>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchProjects} />}

      {loading ? <LoadingSkeleton rows={4} /> : filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-muted/20 flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <p className="text-muted-foreground font-medium">কোনো প্রকল্প নেই</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map(p => {
            const status = statusConfig[p.status] || statusConfig.proposed;
            const total = p.needCount + p.modifyCount + p.rejectCount;
            const isExpanded = expandedId === p.id;

            return (
              <motion.div key={p.id} variants={slamIn} initial="hidden" animate="show">
                <div className="glass-panel rounded-2xl overflow-hidden">
                  {/* Project info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold leading-snug">{p.title}</h3>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1"><Building2 className="h-2.5 w-2.5" />{p.department}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{p.district || '—'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`text-[10px] font-bold px-2 py-0.5 border-0 ${status.color}`}>{status.label}</Badge>
                        {p.isFrozen && <Badge className="text-[10px] bg-destructive/10 text-destructive border-0"><Lock className="h-2.5 w-2.5 mr-1" />স্থগিত</Badge>}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{p.description}</p>

                    {/* Budget + approval */}
                    <div className="flex gap-3 mb-4">
                      <div className="flex-1 p-2.5 rounded-xl bg-muted/10 border border-border/20 text-center">
                        <Banknote className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
                        <p className="text-xs font-bold font-mono-data">
                          ৳{p.budget >= 10000000 ? `${(p.budget / 10000000).toFixed(1)} কোটি` : p.budget.toLocaleString('bn-BD')}
                        </p>
                        <p className="text-[9px] text-muted-foreground">বাজেট</p>
                      </div>
                      <div className="flex-1 p-2.5 rounded-xl bg-muted/10 border border-border/20 text-center">
                        <Shield className={`h-3.5 w-3.5 mx-auto mb-1 ${p.approvalPercent >= 60 ? 'text-success' : p.approvalPercent >= 30 ? 'text-warning' : 'text-destructive'}`} />
                        <p className={`text-xs font-bold font-mono-data ${p.approvalPercent >= 60 ? 'text-success' : p.approvalPercent >= 30 ? 'text-warning' : 'text-destructive'}`}>
                          {p.approvalPercent}%
                        </p>
                        <p className="text-[9px] text-muted-foreground">জনমত</p>
                      </div>
                      <div className="flex-1 p-2.5 rounded-xl bg-muted/10 border border-border/20 text-center">
                        <Users className="h-3.5 w-3.5 text-accent mx-auto mb-1" />
                        <p className="text-xs font-bold font-mono-data">{total}</p>
                        <p className="text-[9px] text-muted-foreground">ভোট</p>
                      </div>
                      <div className="flex-1 p-2.5 rounded-xl bg-muted/10 border border-border/20 text-center">
                        <MessageCircle className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
                        <p className="text-xs font-bold font-mono-data">{p.opinionCount}</p>
                        <p className="text-[9px] text-muted-foreground">মতামত</p>
                      </div>
                    </div>

                    {/* Vote results */}
                    <VoteResultBar need={p.needCount} modify={p.modifyCount} reject={p.rejectCount} />

                    {/* Admin actions */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border/20">
                      {p.approvalStatus === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => setAction({ id: p.id, approved: true })} className="gap-1.5 bg-success/10 text-success hover:bg-success/20 rounded-xl text-xs">
                            <CheckCircle className="h-3.5 w-3.5" /> অনুমোদন
                          </Button>
                          <Button size="sm" onClick={() => setAction({ id: p.id, approved: false })} className="gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl text-xs">
                            <X className="h-3.5 w-3.5" /> প্রত্যাখ্যান
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleToggleFreeze(p.id, !p.isFrozen)} className="gap-1.5 rounded-xl text-xs text-muted-foreground">
                        {p.isFrozen ? <><Unlock className="h-3.5 w-3.5" /> চালু করুন</> : <><Lock className="h-3.5 w-3.5" /> স্থগিত করুন</>}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => loadOpinions(p.id)} className="gap-1.5 rounded-xl text-xs text-muted-foreground ml-auto">
                        <Eye className="h-3.5 w-3.5" /> মতামত দেখুন
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded opinions */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-border/20 pt-3">
                          <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5">
                            <MessageCircle className="h-3.5 w-3.5 text-primary" /> নাগরিক মতামত
                          </h4>
                          {loadingOpinions === p.id ? (
                            <p className="text-xs text-muted-foreground text-center py-3">লোড হচ্ছে...</p>
                          ) : (opinions[p.id] ?? []).length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-3">কোনো মতামত নেই</p>
                          ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {(opinions[p.id] ?? []).map(o => (
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
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {action && (
        <ConfirmModal
          open={!!action}
          onOpenChange={open => !open && setAction(null)}
          title={action.approved ? 'অনুমোদন' : 'প্রত্যাখ্যান'}
          description={action.approved ? 'এই প্রকল্প অনুমোদন করতে চান?' : 'এই প্রকল্প প্রত্যাখ্যান করতে চান?'}
          onConfirm={handleAction}
          destructive={!action.approved}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
