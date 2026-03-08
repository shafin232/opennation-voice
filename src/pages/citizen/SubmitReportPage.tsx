import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReports } from '@/hooks/useReports';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { SecureLinkAnimation } from '@/components/shared/SecureLinkAnimation';
import { toast } from 'sonner';
import { FileText, Upload, MapPin, Send, AlertTriangle, ArrowRight, ArrowLeft, CheckCircle, Shield, X, Image, File, EyeOff } from 'lucide-react';
import type { ReportCategory } from '@/types';

const categories: { value: ReportCategory; label: string; emoji: string }[] = [
  { value: 'infrastructure', label: 'অবকাঠামো', emoji: '🏗️' },
  { value: 'corruption', label: 'দুর্নীতি', emoji: '⚖️' },
  { value: 'health', label: 'স্বাস্থ্য', emoji: '🏥' },
  { value: 'education', label: 'শিক্ষা', emoji: '📚' },
  { value: 'environment', label: 'পরিবেশ', emoji: '🌳' },
  { value: 'safety', label: 'নিরাপত্তা', emoji: '🛡️' },
  { value: 'governance', label: 'শাসন', emoji: '🏛️' },
  { value: 'other', label: 'অন্যান্য', emoji: '📋' },
];

export default function SubmitReportPage() {
  const { submitReport, loading, error } = useReports();
  const { t } = useLanguage();
  const { crisisMode } = useApp();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReportCategory>('other');
  const [district, setDistrict] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleSubmit = async () => {
    if (crisisMode.active) return;
    try {
      await submitReport({
        title, description, category,
        location: { district },
        evidence: files.length > 0 ? files : undefined,
      });
      setSubmitted(true);
      toast.success(t('reportSubmitted'));
    } catch { /* handled */ }
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  if (crisisMode.active) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-destructive font-bold text-lg">{t('crisisNotice')}</p>
          <p className="text-muted-foreground text-sm mt-2">ক্রাইসিস মোড চলাকালীন জমাদান বন্ধ</p>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
          <div className="relative inline-block">
            <div className="h-24 w-24 mx-auto rounded-3xl bg-success/10 flex items-center justify-center glow-neon">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
          </div>
        </motion.div>
        <h2 className="text-2xl font-bold tracking-tight">রিপোর্ট জমা হয়েছে!</h2>
        <p className="text-sm text-muted-foreground">AI সত্যতা যাচাই স্বয়ংক্রিয়ভাবে চলছে</p>
        <SecureLinkAnimation show={true} message="নিরাপদভাবে জমা সম্পন্ন" />
        <Button
          onClick={() => { setSubmitted(false); setStep(0); setTitle(''); setDescription(''); setCategory('other'); setDistrict(''); setFiles([]); }}
          className="mt-4 bg-primary text-primary-foreground btn-glow glow-neon gap-2 rounded-xl"
        >
          <FileText className="h-4 w-4" /> নতুন রিপোর্ট
        </Button>
      </div>
    );
  }

  const steps = [
    { title: 'বিবরণ', icon: FileText },
    { title: 'শ্রেণী ও অবস্থান', icon: MapPin },
    { title: 'প্রমাণ ও জমা', icon: Upload },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-xl gradient-neon flex items-center justify-center glow-neon">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('submitReport')}</h1>
            <p className="text-sm text-muted-foreground">আপনার এলাকার সমস্যা রিপোর্ট করুন</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex-1 space-y-2">
              <div className={`h-1 rounded-full transition-all duration-500 ${
                i < step ? 'bg-success' : i === step ? 'bg-primary glow-neon' : 'bg-muted/30'
              }`} />
              <div className={`flex items-center gap-1.5 transition-colors ${
                i <= step ? 'text-foreground' : 'text-muted-foreground/30'
              }`}>
                <s.icon className="h-3 w-3" />
                <span className="text-[10px] font-bold tracking-wide">{s.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="glass-panel rounded-2xl p-6 shine-top relative">
          {error && <ErrorBanner message={error} />}

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{t('reportTitle')}</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} className="h-12 bg-muted/10 border-border/40 rounded-xl" placeholder="সংক্ষিপ্ত শিরোনাম" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{t('reportDescription')}</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} className="bg-muted/10 border-border/40 rounded-xl resize-none text-sm leading-relaxed" placeholder="বিস্তারিত বিবরণ..." />
                  <p className="text-[10px] text-muted-foreground/40 text-right font-mono-data">{description.length}</p>
                </div>
                <Button onClick={() => setStep(1)} disabled={!title.trim() || !description.trim()} className="w-full h-12 gap-2 bg-primary text-primary-foreground rounded-xl btn-glow font-semibold">
                  পরবর্তী <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{t('reportCategory')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setCategory(c.value)}
                        className={`p-3.5 rounded-xl border text-left transition-all duration-300 ${
                          category === c.value
                            ? 'border-primary bg-primary/8 glow-neon'
                            : 'border-border/30 bg-muted/5 hover:border-primary/20 hover:bg-muted/10'
                        }`}
                      >
                        <span className="text-lg">{c.emoji}</span>
                        <p className={`text-xs font-bold mt-1.5 ${category === c.value ? 'text-primary' : 'text-foreground/70'}`}>{c.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{t('reportLocation')}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={district} onChange={e => setDistrict(e.target.value)} className="h-12 bg-muted/10 pl-10 border-border/40 rounded-xl" placeholder="জেলার নাম" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)} className="flex-1 h-12 gap-2 border-border/40 rounded-xl font-semibold">
                    <ArrowLeft className="h-4 w-4" /> পূর্ববর্তী
                  </Button>
                  <Button onClick={() => setStep(2)} className="flex-1 h-12 gap-2 bg-primary text-primary-foreground rounded-xl btn-glow font-semibold">
                    পরবর্তী <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{t('reportEvidence')}</Label>
                  <div
                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${
                      dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border/30 hover:border-primary/30'
                    }`}
                    onClick={() => document.getElementById('file-input')?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <motion.div animate={dragOver ? { scale: 1.1 } : { scale: 1 }} className="h-14 w-14 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-3">
                      <Upload className={`h-7 w-7 ${dragOver ? 'text-primary' : 'text-muted-foreground/50'}`} />
                    </motion.div>
                    <p className="text-sm font-semibold text-muted-foreground">ছবি বা ফাইল আপলোড করুন</p>
                    <p className="text-[10px] text-muted-foreground/40 mt-1">Drag & drop or click</p>
                    <Input id="file-input" type="file" multiple onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files || [])])} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" />
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {files.map((file, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/10 border border-border/30"
                        >
                          <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                            {file.type.startsWith('image') ? <Image className="h-4 w-4 text-primary" /> : <File className="h-4 w-4 text-primary" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{file.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono-data">{(file.size / 1024).toFixed(0)} KB</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="h-6 w-6 rounded-md hover:bg-destructive/10 flex items-center justify-center transition-colors">
                            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 gap-2 border-border/40 rounded-xl font-semibold">
                    <ArrowLeft className="h-4 w-4" /> পূর্ববর্তী
                  </Button>
                  <Button className="flex-1 h-12 font-semibold gap-2 bg-primary text-primary-foreground glow-neon btn-glow rounded-xl" onClick={handleSubmit} disabled={loading}>
                    {loading ? t('loading') : <><Send className="h-4 w-4" />{t('submit')}</>}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
