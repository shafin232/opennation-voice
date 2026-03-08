import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, BarChart3, FileText, Users, Zap } from 'lucide-react';

const features = [
  { icon: FileText, title: 'Citizen Reports', desc: 'AI-verified civic reporting with truth scoring' },
  { icon: BarChart3, title: 'Integrity Index', desc: 'Real-time transparency metrics per district' },
  { icon: Users, title: 'Community Repair', desc: 'Collective infrastructure issue tracking' },
  { icon: Zap, title: 'Smart Alerts', desc: 'AI-powered anomaly detection & notifications' },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen mesh-cinematic grain relative overflow-hidden">
      {/* Floating orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl -top-40 -left-40"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl bottom-0 right-0"
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            className="h-20 w-20 rounded-3xl gradient-neon flex items-center justify-center mx-auto mb-8 glow-neon"
            animate={{ rotate: [0, 3, -3, 0], y: [0, -4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Shield className="h-10 w-10 text-primary-foreground" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            <span className="gradient-text-neon">Open</span>Nation
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            AI-powered national transparency platform.
            <br />
            <span className="text-foreground/80 font-medium">Empowering citizens. Ensuring accountability.</span>
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">
            <Button
              onClick={() => navigate('/login')}
              className="h-13 px-8 rounded-xl text-base font-semibold gap-2 bg-primary text-primary-foreground btn-glow glow-neon"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="h-13 px-8 rounded-xl text-base font-medium border-border/50 hover:bg-muted/20"
            >
              Sign In
            </Button>
          </div>
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl"
        >
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-panel-hover p-6 rounded-2xl cursor-default"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center mb-4">
                <feat.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-base mb-1 tracking-tight">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center gap-8 mt-16"
        >
          {['End-to-end Encrypted', 'AI Truth Engine', 'Open Source'].map(tag => (
            <span key={tag} className="text-[11px] text-muted-foreground/40 font-medium tracking-wide uppercase">
              {tag}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
