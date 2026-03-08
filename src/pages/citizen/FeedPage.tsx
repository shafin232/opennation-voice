import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReports } from '@/hooks/useReports';
import { useVoting } from '@/hooks/useVoting';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Report } from '@/types';
import {
  ThumbsUp, ThumbsDown, MapPin, Clock, Newspaper, FileText,
  ArrowUpRight, Shield, CheckCircle2, AlertCircle, Eye, Plus, Users, Zap,
  MessageCircle, Share2, MoreHorizontal, User2, Send, Image as ImageIcon, X
} from 'lucide-react';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const slamIn = {
  hidden: { scale: 0.96, opacity: 0, y: 16 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 350, damping: 30 } },
};

const approvalConfig: Record<string, { icon: typeof CheckCircle2; label: string; color: string; bg: string }> = {
  auto_approved: { icon: CheckCircle2, label: 'যাচাইকৃত', color: 'text-success', bg: 'bg-success/10' },
  human_review: { icon: Eye, label: 'পর্যালোচনায়', color: 'text-warning', bg: 'bg-warning/10' },
  auto_rejected: { icon: AlertCircle, label: 'প্রত্যাখ্যাত', color: 'text-destructive', bg: 'bg-destructive/10' },
  pending: { icon: Clock, label: 'অপেক্ষমাণ', color: 'text-muted-foreground', bg: 'bg-muted/30' },
  approved: { icon: CheckCircle2, label: 'অনুমোদিত', color: 'text-success', bg: 'bg-success/10' },
  rejected: { icon: AlertCircle, label: 'প্রত্যাখ্যাত', color: 'text-destructive', bg: 'bg-destructive/10' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'এইমাত্র';
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ঘণ্টা আগে`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} দিন আগে`;
  if (days < 30) return `${Math.floor(days / 7)} সপ্তাহ আগে`;
  return new Date(dateStr).toLocaleDateString('bn-BD');
}

const catConfig: Record<string, { label: string; emoji: string }> = {
  infrastructure: { label: 'অবকাঠামো', emoji: '🏗️' },
  corruption: { label: 'দুর্নীতি', emoji: '⚠️' },
  health: { label: 'স্বাস্থ্য', emoji: '🏥' },
  education: { label: 'শিক্ষা', emoji: '📚' },
  environment: { label: 'পরিবেশ', emoji: '🌿' },
  safety: { label: 'নিরাপত্তা', emoji: '🛡️' },
  governance: { label: 'শাসন', emoji: '🏛️' },
  human_rights: { label: 'মানবাধিকার', emoji: '✊' },
  public_service: { label: 'জনসেবা', emoji: '🏢' },
  other: { label: 'অন্যান্য', emoji: '📌' },
};

interface Comment {
  id: string;
  body: string;
  userName: string;
  userAlias: string;
  createdAt: string;
  userId: string;
}

function CommentSection({ reportId, commentCount }: { reportId: string; commentCount: number }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const loadComments = async () => {
    setLoading(true);
    console.log('[Comments] Loading for report', reportId);
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((c: any) => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, citizen_alias')
        .in('user_id', userIds);
      const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));

      setComments(data.map((c: any) => {
        const p = profileMap.get(c.user_id);
        return {
          id: c.id,
          body: c.body,
          userName: p?.citizen_alias || p?.name || 'Anonymous',
          userAlias: p?.citizen_alias || 'Citizen',
          createdAt: c.created_at,
          userId: c.user_id,
        };
      }));
    } else {
      setComments([]);
    }
    setLoading(false);
  };

  const handleToggle = () => {
    if (!open) loadComments();
    setOpen(!open);
  };

  const handleSubmit = async () => {
    if (!text.trim() || !user) return;
    setSubmitting(true);
    console.log('[Comments] Submitting comment for report', reportId);
    const { error } = await supabase.from('comments').insert({
      report_id: reportId,
      user_id: user.id,
      body: text.trim(),
    });
    if (error) {
      toast.error('মন্তব্য পোস্ট করতে ব্যর্থ');
    } else {
      setText('');
      await loadComments();
    }
    setSubmitting(false);
  };

  return (
    <div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleToggle}
        className="flex-1 gap-1.5 rounded-xl text-xs h-9 text-muted-foreground hover:text-foreground"
      >
        <MessageCircle className="h-4 w-4" />
        মন্তব্য {commentCount > 0 && `(${commentCount})`}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-border/20">
              {loading ? (
                <div className="text-center py-3 text-xs text-muted-foreground">লোড হচ্ছে...</div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto mb-3">
                  {comments.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">এখনো কোনো মন্তব্য নেই</p>
                  ) : comments.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <div className="h-7 w-7 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                        <User2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-muted/15 rounded-xl px-3 py-2">
                          <p className="text-xs font-semibold">{c.userAlias || c.userName}</p>
                          <p className="text-xs text-foreground/80">{c.body}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 ml-1">{timeAgo(c.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment input */}
              <div className="flex gap-2">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="মন্তব্য লিখুন..."
                  className="text-xs h-9 rounded-xl bg-muted/10"
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
                />
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!text.trim() || submitting}
                  className="h-9 w-9 p-0 rounded-xl bg-primary text-primary-foreground"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EvidenceGallery({ evidence }: { evidence: Report['evidence'] }) {
  const [selected, setSelected] = useState<string | null>(null);
  
  const images = evidence.filter(e => e.type === 'image');
  const videos = evidence.filter(e => e.type === 'video');

  if (images.length === 0 && videos.length === 0) return null;

  return (
    <>
      <div className={`px-4 pb-3 grid gap-1.5 ${
        images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
      }`}>
        {images.slice(0, 4).map((e, i) => (
          <div
            key={e.id}
            className="relative rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => setSelected(e.url)}
          >
            <img
              src={e.url}
              alt="Evidence"
              className={`w-full object-cover ${images.length === 1 ? 'max-h-72' : 'h-36'} group-hover:scale-105 transition-transform duration-300`}
              loading="lazy"
            />
            {e.blurred && (
              <div className="absolute inset-0 backdrop-blur-xl bg-background/40 flex items-center justify-center">
                <Eye className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            {i === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <span className="text-lg font-bold">+{images.length - 4}</span>
              </div>
            )}
          </div>
        ))}
        {videos.map((v) => (
          <div key={v.id} className="rounded-xl overflow-hidden">
            <video src={v.url} controls className="w-full max-h-72 rounded-xl" preload="metadata" />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-4 right-4 text-foreground"
              onClick={() => setSelected(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            <img src={selected} alt="Evidence" className="max-w-full max-h-[85vh] rounded-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function FeedPage() {
  const { reports, loading, error, fetchReports, loadMore, hasMore } = useReports();
  const { vote, loading: voteLoading, error: voteError } = useVoting();
  const { t } = useLanguage();
  const { crisisMode } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const feedRef = useRef<HTMLDivElement>(null);
  const [votingId, setVotingId] = useState<string | null>(null);

  useEffect(() => { fetchReports(1, true); }, [fetchReports]);

  // Realtime subscription for new reports
  useEffect(() => {
    const channel = supabase
      .channel('feed-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        fetchReports(1, true);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchReports]);

  useEffect(() => {
    if (voteError) toast.error(voteError);
  }, [voteError]);

  const handleVote = async (reportId: string, type: 'support' | 'doubt') => {
    setVotingId(reportId);
    const result = await vote({ reportId, type });
    if (result) fetchReports(1, true);
    setVotingId(null);
  };

  const handleShare = (report: Report) => {
    const text = `${report.title} - ${report.location.district}`;
    if (navigator.share) {
      navigator.share({ title: report.title, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${report.title}\n${report.description}`);
      toast.success('কপি হয়েছে!');
    }
  };

  const stats = [
    { icon: FileText, label: 'মোট রিপোর্ট', value: reports.length, color: 'text-primary' },
    { icon: CheckCircle2, label: 'যাচাইকৃত', value: reports.filter(r => r.status === 'verified').length, color: 'text-success' },
    { icon: Users, label: 'সক্রিয় ভোট', value: reports.reduce((a, r) => a + r.supportCount + r.doubtCount, 0), color: 'text-accent' },
    { icon: Zap, label: 'অপেক্ষমাণ', value: reports.filter(r => r.status === 'pending').length, color: 'text-warning' },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto" ref={feedRef}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">লাইভ ফিড</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter leading-[0.95]">
            {user ? (
              <>স্বাগতম, <span className="gradient-text-neon">{user.name?.split(' ')[0]}</span></>
            ) : 'ফিড'}
          </h1>
        </div>
        <Button
          onClick={() => navigate('/app/submit-report')}
          className="hidden sm:flex gap-2 bg-primary text-primary-foreground rounded-xl btn-glow glow-neon h-10 px-5 font-semibold text-sm"
        >
          <Plus className="h-4 w-4" /> রিপোর্ট করুন
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-4 gap-2">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={slamIn}>
            <div className="glass-panel p-3 rounded-xl text-center">
              <stat.icon className={`h-4 w-4 ${stat.color} mx-auto mb-1`} />
              <p className="stat-number text-xl text-foreground">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {error && <ErrorBanner message={error} onRetry={() => fetchReports(1, true)} />}

      {loading && reports.length === 0 ? (
        <LoadingSkeleton rows={5} />
      ) : reports.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <motion.div
            className="h-20 w-20 rounded-2xl glass-panel flex items-center justify-center mx-auto mb-5"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Newspaper className="h-10 w-10 text-primary/25" />
          </motion.div>
          <h3 className="text-lg font-bold mb-2">কোনো রিপোর্ট নেই</h3>
          <p className="text-sm text-muted-foreground mb-6">প্রথম রিপোর্ট জমা দিয়ে পরিবর্তন শুরু করুন!</p>
          <Button
            onClick={() => navigate('/app/submit-report')}
            className="bg-primary text-primary-foreground glow-neon btn-glow gap-2 h-11 px-6 rounded-xl font-semibold"
          >
            <FileText className="h-4 w-4" /> প্রথম রিপোর্ট জমা দিন
          </Button>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          <AnimatePresence mode="popLayout">
            {reports.map((report) => {
              const approval = approvalConfig[report.approvalDecision ?? 'pending'] || approvalConfig.pending;
              const ApprovalIcon = approval.icon;
              const truthPct = Math.round((report.truthProbability ?? 0.5) * 100);
              const cat = catConfig[report.category] || catConfig.other;
              const isOwnPost = user?.id === report.authorId;
              const isVoting = votingId === report.id;

              return (
                <motion.div key={report.id} variants={slamIn} layout>
                  <div className="glass-panel rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    {/* Post header */}
                    <div className="p-4 pb-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-2 ring-primary/20 overflow-hidden">
                        {report.authorAvatar ? (
                          <img src={report.authorAvatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <User2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground truncate">{report.authorName}</span>
                          {isOwnPost && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/30 text-primary">আপনি</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{timeAgo(report.createdAt)}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{report.location.district || 'অজানা'}</span>
                        </div>
                      </div>
                      <Badge className={`shrink-0 text-[10px] font-medium px-2 py-0.5 border-0 ${approval.bg} ${approval.color}`}>
                        <ApprovalIcon className="h-2.5 w-2.5 mr-1" />
                        {approval.label}
                      </Badge>
                    </div>

                    {/* Category */}
                    <div className="px-4 pb-2">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground">
                        {cat.emoji} {cat.label}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="px-4 pb-3 cursor-pointer" onClick={() => navigate(`/app/report/${report.id}`)}>
                      <h3 className="text-base font-bold text-foreground mb-1.5 leading-snug hover:text-primary transition-colors">{report.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{report.description}</p>
                    </div>

                    {/* Evidence gallery */}
                    <EvidenceGallery evidence={report.evidence} />

                    {/* Truth meter */}
                    <div className="mx-4 mb-3 p-3 rounded-xl bg-muted/10 border border-border/20">
                      <div className="flex items-center justify-between text-[10px] mb-1.5">
                        <span className="font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                          <Shield className="h-3 w-3" /> সত্যতা সূচক
                        </span>
                        <span className={`font-mono font-bold text-sm ${truthPct >= 70 ? 'text-success' : truthPct >= 40 ? 'text-warning' : 'text-destructive'}`}>
                          {truthPct}%
                        </span>
                      </div>
                      <Progress
                        value={truthPct}
                        className={`h-1.5 rounded-full bg-muted/30 ${
                          truthPct >= 70 ? '[&>div]:bg-success' : truthPct >= 40 ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'
                        }`}
                      />
                    </div>

                    {/* Engagement stats */}
                    <div className="px-4 pb-2 flex items-center gap-4 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3 text-primary" /> {report.supportCount} সমর্থন
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsDown className="h-3 w-3 text-destructive/70" /> {report.doubtCount} সন্দেহ
                      </span>
                      {(report.commentCount ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {report.commentCount} মন্তব্য
                        </span>
                      )}
                    </div>

                    {/* Action bar */}
                    <div className="border-t border-border/20 mx-4" />
                    <div className="px-2 py-1.5 flex items-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleVote(report.id, 'support')}
                        disabled={crisisMode.active || isVoting || isOwnPost}
                        className={`flex-1 gap-1.5 rounded-xl text-xs h-9 transition-all ${
                          report.userVote === 'support'
                            ? 'text-primary bg-primary/10 font-bold'
                            : isOwnPost ? 'text-muted-foreground/40 cursor-not-allowed' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                        }`}
                      >
                        <ThumbsUp className={`h-4 w-4 ${report.userVote === 'support' ? 'fill-primary' : ''}`} />
                        সমর্থন
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleVote(report.id, 'doubt')}
                        disabled={crisisMode.active || isVoting || isOwnPost}
                        className={`flex-1 gap-1.5 rounded-xl text-xs h-9 transition-all ${
                          report.userVote === 'doubt'
                            ? 'text-destructive bg-destructive/10 font-bold'
                            : isOwnPost ? 'text-muted-foreground/40 cursor-not-allowed' : 'text-muted-foreground hover:text-destructive hover:bg-destructive/5'
                        }`}
                      >
                        <ThumbsDown className={`h-4 w-4 ${report.userVote === 'doubt' ? 'fill-destructive' : ''}`} />
                        সন্দেহ
                      </Button>
                      <CommentSection reportId={report.id} commentCount={report.commentCount ?? 0} />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleShare(report)}
                        className="flex-1 gap-1.5 rounded-xl text-xs h-9 text-muted-foreground hover:text-foreground"
                      >
                        <Share2 className="h-4 w-4" />
                        শেয়ার
                      </Button>
                    </div>

                    {isOwnPost && (
                      <div className="px-4 pb-3">
                        <p className="text-[10px] text-muted-foreground/50 text-center">নিজের রিপোর্টে ভোট দেওয়া যায় না</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {hasMore && (
        <Button
          variant="outline"
          className="w-full h-11 rounded-2xl border-dashed border-border/40 hover:border-primary/30 transition-all font-semibold text-sm"
          onClick={loadMore}
          disabled={loading}
        >
          {loading ? 'লোড হচ্ছে...' : 'আরো রিপোর্ট দেখুন'}
        </Button>
      )}

      {/* Mobile FAB */}
      <motion.div
        className="fixed bottom-24 right-4 z-40 sm:hidden"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.3 }}
      >
        <Button
          onClick={() => navigate('/app/submit-report')}
          className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground glow-neon btn-glow p-0 shadow-xl"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>
    </div>
  );
}
