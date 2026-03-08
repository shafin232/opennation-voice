import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, BarChart3, FileText, Users, Zap, Eye, Lock,
  ChevronDown, CheckCircle2, MessageSquare, ChevronRight, Plus, Minus,
  Globe, Smartphone, Server, Award, TrendingUp, Heart
} from 'lucide-react';


/* ═══════ DATA ═══════ */
const features = [
  { icon: FileText, title: 'Citizen Reports', desc: 'AI-verified civic reporting with real-time truth scoring engine', tag: 'Core' },
  { icon: BarChart3, title: 'Integrity Index', desc: 'Per-district transparency metrics updated in real-time', tag: 'Analytics' },
  { icon: Users, title: 'Community Repair', desc: 'Collective infrastructure issue tracking & resolution', tag: 'Community' },
  { icon: Zap, title: 'Smart Alerts', desc: 'ML-powered anomaly detection for vote manipulation', tag: 'AI' },
  { icon: Eye, title: 'Evidence Vault', desc: 'Tamper-proof media storage with blockchain hashing', tag: 'Security' },
  { icon: Lock, title: 'RTI Engine', desc: 'Streamlined Right to Information request processing', tag: 'Gov' },
];

const stats = [
  { value: '64', label: 'Districts', suffix: '' },
  { value: '99.9', label: 'Uptime', suffix: '%' },
  { value: '< 2s', label: 'AI Scoring', suffix: '' },
  { value: '256', label: 'Bit Encryption', suffix: '' },
];

const howItWorks = [
  { step: '01', title: 'Submit a Report', desc: 'Citizens report corruption, infrastructure issues, or governance problems with evidence.', icon: FileText },
  { step: '02', title: 'AI Verification', desc: 'Our truth engine analyzes reports using NLP, cross-referencing, and community votes.', icon: Zap },
  { step: '03', title: 'Community Voting', desc: 'Citizens support or doubt reports. Weighted voting prevents manipulation.', icon: Users },
  { step: '04', title: 'Accountability', desc: 'Verified reports feed into district integrity scores, driving real policy change.', icon: TrendingUp },
];

const testimonials = [
  { name: 'রহিম আহমেদ', role: 'নাগরিক সাংবাদিক, ঢাকা', quote: 'OpenNation আমাদের এলাকার রাস্তা মেরামত করতে সাহায্য করেছে। মাত্র ২ সপ্তাহে সমাধান হয়েছে!', avatar: 'র' },
  { name: 'ফাতেমা খান', role: 'শিক্ষক, চট্টগ্রাম', quote: 'RTI ইঞ্জিন দিয়ে স্কুলের বাজেট তথ্য পেতে আগে ৬ মাস লাগত, এখন ৩ দিন।', avatar: 'ফ' },
  { name: 'কামাল হোসেন', role: 'প্রকৌশলী, রাজশাহী', quote: 'AI সত্যতা যাচাই সিস্টেম ভুয়া রিপোর্ট ফিল্টার করে দেয়। এটা game changer!', avatar: 'ক' },
];

const faqs = [
  { q: 'OpenNation কি সরকারি প্ল্যাটফর্ম?', a: 'না, OpenNation একটি স্বতন্ত্র নাগরিক প্ল্যাটফর্ম যা সরকারি তথ্যের স্বচ্ছতা নিশ্চিত করতে কাজ করে।' },
  { q: 'রিপোর্ট করলে কি আমার পরিচয় প্রকাশ পাবে?', a: 'না। সব রিপোর্ট বেনামে করা যায়। শুধুমাত্র আদালতের আদেশে এবং ৩ জন অ্যাডমিনের সম্মতিতে পরিচয় প্রকাশ সম্ভব।' },
  { q: 'AI কিভাবে সত্যতা যাচাই করে?', a: 'আমাদের Truth Engine NLP বিশ্লেষণ, ক্রস-রেফারেন্সিং, কমিউনিটি ভোটিং এবং প্যাটার্ন ডিটেকশন ব্যবহার করে ০-১০০% সত্যতা স্কোর দেয়।' },
  { q: 'এটি কি ফ্রি?', a: 'হ্যাঁ, নাগরিকদের জন্য সম্পূর্ণ বিনামূল্যে। রিপোর্ট জমা, ভোট দেওয়া, RTI আবেদন — সব কিছু ফ্রি।' },
  { q: 'কোন জেলায় পাওয়া যায়?', a: 'বর্তমানে বাংলাদেশের সব ৬৪ জেলায় OpenNation সক্রিয়।' },
];

const partners = ['UNDP', 'TIB', 'a2i', 'ICT Division', 'BRAC'];

/* ═══════ COMPONENTS ═══════ */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/20 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-semibold text-sm md:text-base pr-4 group-hover:text-primary transition-colors">{q}</span>
        <div className={`h-7 w-7 rounded-lg bg-muted/20 flex items-center justify-center shrink-0 transition-all duration-300 ${open ? 'bg-primary/10 rotate-0' : 'rotate-0'}`}>
          {open ? <Minus className="h-3.5 w-3.5 text-primary" /> : <Plus className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <p className="text-sm text-muted-foreground leading-relaxed pb-5 pr-10">{a}</p>
      </motion.div>
    </div>
  );
}

/* ═══════ MAIN ═══════ */
const Index = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">

      {/* ═══════ STICKY NAVBAR ═══════ */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'backdrop-blur-2xl bg-background/80 border-b border-border/30 shadow-lg shadow-background/20' : ''
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="OpenNation" className="h-8 object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it Works', 'FAQ'].map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-sm font-medium h-9 px-4 hidden sm:flex"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/login')}
              className="h-9 px-5 rounded-xl text-sm font-bold bg-primary text-primary-foreground btn-glow glow-neon gap-1.5"
            >
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 mesh-cinematic" />
        <div className="absolute inset-0 grain" />

        {/* Floating orbs */}
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--neon) / 0.08), transparent 70%)' }}
          animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl top-1/4 right-0"
          style={{ background: 'radial-gradient(circle, hsl(var(--neon-amber) / 0.06), transparent 70%)' }}
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="absolute inset-0 grid-lines opacity-[0.03]" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/40 bg-muted/10 backdrop-blur-md mb-8"
          >
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Platform Live — 64 Districts</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] mb-6">
              <span className="gradient-text-neon">Open</span>
              <span className="text-foreground">Nation</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-4"
          >
            AI-powered civic intelligence platform for
            <span className="text-foreground font-semibold"> national transparency </span>
            &<span className="text-foreground font-semibold"> accountability</span>
          </motion.p>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground/50 mb-10 font-mono-data"
          >
            Built for 170M+ citizens of Bangladesh
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={() => navigate('/login')}
              className="h-14 px-10 rounded-2xl text-base font-bold gap-2.5 bg-primary text-primary-foreground btn-glow glow-neon"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="h-14 px-10 rounded-2xl text-base font-medium border-border/40 hover:bg-muted/10 backdrop-blur-md"
            >
              Sign In
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-8 md:gap-14 mt-16"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="stat-number text-2xl md:text-3xl text-foreground">
                  {stat.value}<span className="text-primary">{stat.suffix}</span>
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-20"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2 text-muted-foreground/30"
            >
              <span className="text-[9px] font-bold uppercase tracking-widest">Scroll</span>
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section id="features" className="relative py-32 px-6">
        <div className="absolute inset-0 mesh-cinematic opacity-50" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4 block">Capabilities</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
              Everything you need for<br />
              <span className="gradient-text-neon">civic transparency</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Six core modules working together to create an unprecedented layer of public accountability.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="glass-panel-hover p-7 rounded-2xl cursor-default group"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="h-11 w-11 rounded-xl bg-primary/8 flex items-center justify-center group-hover:glow-neon transition-all duration-500">
                    <feat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 px-2.5 py-1 rounded-md bg-muted/10 border border-border/30">
                    {feat.tag}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 tracking-tight group-hover:text-primary transition-colors">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section id="how-it-works" className="relative py-32 px-6">
        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4 block">Process</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
              How it <span className="gradient-text-neon">works</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              From report to resolution — a transparent, AI-powered pipeline.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-panel p-7 rounded-2xl relative group"
              >
                <div className="flex items-start gap-5">
                  <div className="shrink-0">
                    <span className="stat-number text-4xl text-primary/15 group-hover:text-primary/30 transition-colors">{item.step}</span>
                  </div>
                  <div>
                    <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center mb-3 group-hover:glow-neon transition-all duration-500">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-base mb-2 tracking-tight">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 mesh-cinematic opacity-30" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4 block">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
              নাগরিকদের <span className="gradient-text-neon">কণ্ঠস্বর</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Real stories from citizens using OpenNation across Bangladesh.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-panel-hover p-6 rounded-2xl cursor-default"
              >
                <MessageSquare className="h-5 w-5 text-primary/30 mb-4" />
                <p className="text-sm leading-relaxed text-foreground/80 mb-6 font-bengali">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gradient-neon flex items-center justify-center text-primary-foreground font-bold text-sm font-bengali">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold font-bengali">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground font-bengali">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section id="faq" className="relative py-32 px-6">
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4 block">FAQ</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
              সাধারণ <span className="gradient-text-neon">প্রশ্নাবলী</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel rounded-2xl p-6 md:p-8"
          >
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ PARTNERS ═══════ */}
      <section className="relative py-20 px-6 border-t border-border/10">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 mb-8">Trusted by leading organizations</p>
          <div className="flex items-center justify-center gap-10 md:gap-16 flex-wrap">
            {partners.map(p => (
              <motion.span
                key={p}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-lg md:text-xl font-bold text-muted-foreground/15 tracking-tight hover:text-muted-foreground/30 transition-colors cursor-default"
              >
                {p}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="relative py-32 px-6">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-panel rounded-3xl p-12 md:p-16 shine-top relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10">
              <motion.div
                className="mx-auto mb-8"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img src={logoImg} alt="OpenNation" className="h-16 object-contain mx-auto" />
              </motion.div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">
                Join the movement
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-10">
                Be part of the largest civic transparency initiative. Every report matters.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => navigate('/login')}
                  className="h-14 px-12 rounded-2xl text-base font-bold gap-2.5 bg-primary text-primary-foreground btn-glow glow-neon"
                >
                  Create Free Account <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground/40 mt-6 font-mono-data">No credit card required · Free forever for citizens</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="relative py-16 px-6 border-t border-border/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <img src={logoImg} alt="OpenNation" className="h-9 object-contain" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                AI-powered civic intelligence platform ensuring national transparency and accountability for every citizen of Bangladesh.
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-4">Platform</p>
              <ul className="space-y-2.5">
                {['Citizen Reports', 'Integrity Index', 'RTI Engine', 'Community Repair'].map(link => (
                  <li key={link}>
                    <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-4">Company</p>
              <ul className="space-y-2.5">
                {['About', 'Privacy Policy', 'Terms of Service', 'Contact'].map(link => (
                  <li key={link}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{link}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-border/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-muted-foreground/30">© 2026 OpenNation. All rights reserved.</p>
            <div className="flex items-center gap-8">
              {['End-to-end Encrypted', 'AI Truth Engine', 'Open Source'].map(tag => (
                <span key={tag} className="text-[10px] text-muted-foreground/20 font-medium tracking-wider uppercase hidden sm:block">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
