import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, BarChart3, FileText, Users, Zap, Eye, Lock, Globe, ChevronDown, Activity, TrendingUp } from 'lucide-react';

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

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated mesh bg */}
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
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full blur-3xl bottom-20 left-1/4"
          style={{ background: 'radial-gradient(circle, hsl(var(--neon) / 0.05), transparent 70%)' }}
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-lines opacity-[0.03]" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/40 bg-muted/10 backdrop-blur-md mb-8"
          >
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Platform Live</span>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
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

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground/50 mb-10 font-mono-data"
          >
            Built for 170M+ citizens of Bangladesh
          </motion.p>

          {/* CTA */}
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

          {/* Stats strip */}
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

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
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
      <section className="relative py-32 px-6">
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
              Everything you need for
              <br />
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

      {/* ═══════ CTA SECTION ═══════ */}
      <section className="relative py-32 px-6">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-panel rounded-3xl p-12 md:p-16 shine-top relative overflow-hidden"
          >
            {/* BG glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            
            <div className="relative z-10">
              <motion.div
                className="h-16 w-16 rounded-2xl gradient-neon flex items-center justify-center mx-auto mb-8 glow-neon"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Shield className="h-8 w-8 text-primary-foreground" />
              </motion.div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">
                Join the movement
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-10">
                Be part of the largest civic transparency initiative. Every report matters.
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="h-14 px-12 rounded-2xl text-base font-bold gap-2.5 bg-primary text-primary-foreground btn-glow glow-neon"
              >
                Create Free Account <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="relative py-12 px-6 border-t border-border/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg gradient-neon flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold tracking-tight text-sm">OpenNation</span>
          </div>
          <div className="flex items-center gap-8">
            {['End-to-end Encrypted', 'AI Truth Engine', 'Open Source'].map(tag => (
              <span key={tag} className="text-[10px] text-muted-foreground/30 font-medium tracking-wider uppercase hidden sm:block">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/30">© 2026 OpenNation</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
