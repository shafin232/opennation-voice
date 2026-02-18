import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <User className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-xl">{user.name}</CardTitle>
          <Badge variant="secondary">{user.role}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">{t('phone')}</span><p className="font-medium">{user.phone}</p></div>
            <div><span className="text-muted-foreground">জেলা</span><p className="font-medium">{user.district}</p></div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{t('trustScore')}</span><span>{user.trustScore}%</span>
              </div>
              <Progress value={user.trustScore} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{t('truthScore')}</span><span>{user.truthScore}%</span>
              </div>
              <Progress value={user.truthScore} className="h-2" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            যোগদান: {new Date(user.createdAt).toLocaleDateString('bn-BD')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
