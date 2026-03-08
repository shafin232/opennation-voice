import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useVoting } from '@/hooks/useVoting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  ArrowLeft, MapPin, Clock, Shield, ThumbsUp, ThumbsDown, User2, Share2,
  CheckCircle2, AlertCircle, Eye, MessageCircle, Send, X, Image as ImageIcon, EyeOff
} from 'lucide-react';
import { Input } from '@/components/ui/input';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'এইমাত্র';
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ঘণ্টা আগে`;
  const days = Math.floor(hours / 24);
  return `${days} দিন আগে`;
}

const catConfig: Record<string, { label: string; emoji: string }> = {
  infrastructure: { label: 'অবকাঠামো', emoji: '🏗️' },
  corruption: { label: 'দুর্নীতি', emoji: '⚠️' },
  health: { label: 'স্বাস্থ্য', emoji: '🏥' },
  education: { label: 'শিক্ষা', emoji: '📚' },
  environment: { label: 'পরিবেশ', emoji: '🌿' },
  human_rights: { label: 'মানবাধিকার', emoji: '✊' },
  public_service: { label: 'জনসেবা', emoji: '🏢' },
  other: { label: 'অন্যান্য', emoji: '📌' },
};

interface Comment {
  id: string; body: string; userName: string; createdAt: string; userId: string;
}

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vote } = useVoting();
  const [report, setReport] = useState<any>(null);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [author, setAuthor] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadReport();
  }, [id]);

  const loadReport = async () => {
    console.log('[ReportDetail] Loading report', id);
    const [reportRes, evidenceRes] = await Promise.all([
      supabase.from('reports').select('*').eq('id', id).single(),
      supabase.from('evidence').select('*').eq('report_id', id),
    ]);

    if (reportRes.data) {
      setReport(reportRes.data);
      if (!(reportRes.data as any).is_anonymous) {
        const { data: profile } = await supabase
          .from('profiles').select('name, avatar_url, trust_score, citizen_alias')
          .eq('user_id', reportRes.data.author_id).single();
        setAuthor(profile);
      }
    }
    setEvidence(evidenceRes.data ?? []);
    await loadComments();
    setLoading(false);
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments').select('*')
      .eq('report_id', id).order('created_at', { ascending: true });

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles').select('user_id, name, citizen_alias').in('user_id', userIds);
      const map = new Map((profiles ?? []).map(p => [p.user_id, p]));

      setComments(data.map(c => {
        const p = map.get(c.user_id);
        return {
          id: c.id, body: c.body,
          userName: (p as any)?.citizen_alias || p?.name || 'Anonymous',
          createdAt: c.created_at, userId: c.user_id,
        };
      }));
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !user) return;
    const { error } = await supabase.from('comments').insert({
      report_id: id, user_id: user.id, body: commentText.trim(),
    });
    if (error) toast.error('মন্তব্য পোস্ট ব্যর্থ');
    else { setCommentText(''); await loadComments(); }
  };

  const handleVote = async (type: 'support' | 'doubt') => {
    if (!id) return;
    const result = await vote({ reportId: id, type });
    if (result) await loadReport();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-2xl" />)}
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">রিপোর্ট পাওয়া যায়নি</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">ফিরে যান</Button>
      </div>
    );
  }

  const cat = catConfig[report.category] || catConfig.other;
  const truthPct = Math.round((report.truth_probability ?? 0.5) * 100);
  const isAnon = (report as any).is_anonymous === true;
  const isOwn = !isAnon && user?.id === report.author_id;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> ফিরে যান
      </Button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl overflow-hidden">
        {/* Author */}
        <div className="p-5 flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20 overflow-hidden">
            {author?.avatar_url ? (
              <img src={author.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <User2 className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{author?.name || 'Anonymous'}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{timeAgo(report.created_at)}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{report.district}</span>
              {report.upazila && <><span>·</span><span>{report.upazila}</span></>}
            </div>
          </div>
          <Badge className={`text-[10px] ${report.approval_decision === 'approved' ? 'bg-success/10 text-success' : report.approval_decision === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-muted/30 text-muted-foreground'}`}>
            {report.approval_decision === 'approved' ? 'অনুমোদিত' : report.approval_decision === 'rejected' ? 'প্রত্যাখ্যাত' : 'অপেক্ষমাণ'}
          </Badge>
        </div>

        {/* Category + Content */}
        <div className="px-5 pb-3">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground">{cat.emoji} {cat.label}</span>
        </div>
        <div className="px-5 pb-4">
          <h1 className="text-xl font-bold mb-2">{report.title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{report.description}</p>
        </div>

        {/* Evidence */}
        {evidence.length > 0 && (
          <div className={`px-5 pb-4 grid gap-2 ${evidence.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {evidence.map(e => (
              <div key={e.id} className="rounded-xl overflow-hidden cursor-pointer" onClick={() => e.type === 'image' && setSelectedImage(e.url)}>
                {e.type === 'image' ? (
                  <img src={e.url} alt="" className="w-full h-48 object-cover hover:scale-105 transition-transform" loading="lazy" />
                ) : e.type === 'video' ? (
                  <video src={e.url} controls className="w-full rounded-xl" preload="metadata" />
                ) : (
                  <a href={e.url} target="_blank" rel="noopener" className="text-xs text-primary underline">ডকুমেন্ট দেখুন</a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Truth + scores */}
        <div className="mx-5 mb-4 p-4 rounded-xl bg-muted/10 border border-border/20 space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-bold flex items-center gap-1"><Shield className="h-3 w-3" /> সত্যতা সূচক</span>
              <span className={`font-mono font-bold ${truthPct >= 70 ? 'text-success' : truthPct >= 40 ? 'text-warning' : 'text-destructive'}`}>{truthPct}%</span>
            </div>
            <Progress value={truthPct} className={`h-2 ${truthPct >= 70 ? '[&>div]:bg-success' : truthPct >= 40 ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'}`} />
          </div>
          <div className="flex gap-6 text-xs">
            <span>Authenticity: <strong>{Math.round((report.authenticity_score ?? 0.5) * 100)}%</strong></span>
            <span>Support: <strong>{report.support_count}</strong></span>
            <span>Doubt: <strong>{report.doubt_count}</strong></span>
          </div>
        </div>

        {/* Vote actions */}
        <div className="border-t border-border/20 mx-5" />
        <div className="px-3 py-2 flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleVote('support')} disabled={isOwn}
            className="flex-1 gap-1.5 rounded-xl text-xs h-9 text-muted-foreground hover:text-primary hover:bg-primary/5">
            <ThumbsUp className="h-4 w-4" /> সমর্থন ({report.support_count})
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleVote('doubt')} disabled={isOwn}
            className="flex-1 gap-1.5 rounded-xl text-xs h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5">
            <ThumbsDown className="h-4 w-4" /> সন্দেহ ({report.doubt_count})
          </Button>
          <Button size="sm" variant="ghost" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('লিংক কপি হয়েছে!');
          }} className="flex-1 gap-1.5 rounded-xl text-xs h-9 text-muted-foreground">
            <Share2 className="h-4 w-4" /> শেয়ার
          </Button>
        </div>
      </motion.div>

      {/* Comments */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" /> মন্তব্য ({comments.length})
        </h3>

        <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
          {comments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্য করুন!</p>
          ) : comments.map(c => (
            <div key={c.id} className="flex gap-2.5">
              <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                <User2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="bg-muted/15 rounded-xl px-3 py-2">
                  <p className="text-xs font-semibold">{c.userName}</p>
                  <p className="text-sm text-foreground/80">{c.body}</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 ml-1">{timeAgo(c.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={commentText} onChange={e => setCommentText(e.target.value)}
            placeholder="মন্তব্য লিখুন..."
            className="text-sm h-10 rounded-xl bg-muted/10"
            onKeyDown={e => e.key === 'Enter' && handleComment()}
          />
          <Button onClick={handleComment} disabled={!commentText.trim()} className="h-10 w-10 p-0 rounded-xl bg-primary text-primary-foreground">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}>
            <Button size="sm" variant="ghost" className="absolute top-4 right-4" onClick={() => setSelectedImage(null)}>
              <X className="h-5 w-5" />
            </Button>
            <img src={selectedImage} alt="" className="max-w-full max-h-[85vh] rounded-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
