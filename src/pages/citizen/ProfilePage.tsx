import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ReputationBadge } from '@/components/shared/ReputationBadge';
import { User, Phone, MapPin, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  const avgScore = Math.round((user.trustScore + user.truthScore) / 2);

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <Card className="glass-strong border-[hsl(var(--border-subtle))] overflow-hidden">
          <div className="h-24 gradient-primary relative" />
          <CardHeader className="text-center -mt-12 pb-3">
            <div className="mx-auto mb-3">
              <ReputationBadge score={avgScore} size="lg" />
            </div>
            <h2 className="text-xl font-bengali font-bold">{user.name}</h2>
            <Badge variant="secondary" className="mx-auto mt-1 text-xs bg-muted/50">{user.role}</Badge>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 p-3 rounded-xl glass">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{t('phone')}</p>
                  <p className="text-sm font-mono-data font-medium">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl glass">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">জেলা</p>
                  <p className="text-sm font-medium font-bengali">{user.district}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium font-bengali">{t('trustScore')}</span>
                  <span className={`font-bold font-mono-data ${user.trustScore >= 70 ? 'text-success' : 'text-warning'}`}>{user.trustScore}%</span>
                </div>
                <Progress value={user.trustScore} className={`h-2.5 rounded-full ${user.trustScore >= 70 ? '[&>div]:bg-success' : '[&>div]:bg-warning'}`} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium font-bengali">{t('truthScore')}</span>
                  <span className={`font-bold font-mono-data ${user.truthScore >= 70 ? 'text-success' : 'text-warning'}`}>{user.truthScore}%</span>
                </div>
                <Progress value={user.truthScore} className={`h-2.5 rounded-full ${user.truthScore >= 70 ? '[&>div]:bg-success' : '[&>div]:bg-warning'}`} />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-[hsl(var(--border-subtle))]">
              <Calendar className="h-3 w-3" />
              <span className="font-bengali">যোগদান: {new Date(user.createdAt).toLocaleDateString('bn-BD')}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
