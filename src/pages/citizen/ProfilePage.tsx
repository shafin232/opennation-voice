import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, Shield, Phone, MapPin, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Card className="border-border/60 overflow-hidden">
        <div className="h-24 gradient-primary relative">
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
            <div className="h-16 w-16 rounded-2xl bg-card border-4 border-card flex items-center justify-center shadow-lg">
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
        <CardHeader className="text-center pt-12 pb-3">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <Badge variant="secondary" className="mx-auto mt-1 text-xs">{user.role}</Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{t('phone')}</p>
                <p className="text-sm font-medium">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">জেলা</p>
                <p className="text-sm font-medium">{user.district}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium">{t('trustScore')}</span>
                <span className={`font-bold ${user.trustScore >= 70 ? 'text-success' : 'text-warning'}`}>{user.trustScore}%</span>
              </div>
              <Progress value={user.trustScore} className={`h-2.5 rounded-full ${user.trustScore >= 70 ? '[&>div]:bg-success' : '[&>div]:bg-warning'}`} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium">{t('truthScore')}</span>
                <span className={`font-bold ${user.truthScore >= 70 ? 'text-success' : 'text-warning'}`}>{user.truthScore}%</span>
              </div>
              <Progress value={user.truthScore} className={`h-2.5 rounded-full ${user.truthScore >= 70 ? '[&>div]:bg-success' : '[&>div]:bg-warning'}`} />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
            <Calendar className="h-3 w-3" />
            যোগদান: {new Date(user.createdAt).toLocaleDateString('bn-BD')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
