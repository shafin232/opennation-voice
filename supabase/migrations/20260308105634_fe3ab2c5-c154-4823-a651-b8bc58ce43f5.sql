
-- ============================================
-- OpenNation Database Schema
-- ============================================

-- 1. Role enum & user_roles table (RBAC)
CREATE TYPE public.app_role AS ENUM ('citizen', 'moderator', 'admin', 'superadmin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'citizen',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email TEXT,
  district TEXT NOT NULL DEFAULT '',
  trust_score INTEGER NOT NULL DEFAULT 50,
  truth_score INTEGER NOT NULL DEFAULT 50,
  avatar_url TEXT,
  language TEXT NOT NULL DEFAULT 'bn',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by all authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    NEW.phone
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'citizen');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  district TEXT NOT NULL DEFAULT '',
  upazila TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  support_count INTEGER NOT NULL DEFAULT 0,
  doubt_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reports viewable by all authenticated" ON public.reports
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own reports" ON public.reports
  FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Admins can update any report" ON public.reports
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete reports" ON public.reports
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. Evidence table
CREATE TABLE public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'image',
  url TEXT NOT NULL,
  blurred BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Evidence viewable by all authenticated" ON public.evidence
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can add evidence to own reports" ON public.evidence
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.reports WHERE id = report_id AND author_id = auth.uid())
  );

-- 5. Votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('support', 'doubt')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (report_id, user_id)
);
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes viewable by all authenticated" ON public.votes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can cast votes" ON public.votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change own votes" ON public.votes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 6. Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT '',
  budget BIGINT NOT NULL DEFAULT 0,
  district TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'proposed',
  start_date DATE,
  end_date DATE,
  opinion_count INTEGER NOT NULL DEFAULT 0,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  is_frozen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects viewable by all authenticated" ON public.projects
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage projects" ON public.projects
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. Project opinions
CREATE TABLE public.project_opinions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opinion TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.project_opinions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Opinions viewable by all authenticated" ON public.project_opinions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can add opinions" ON public.project_opinions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 8. RTI requests
CREATE TABLE public.rti_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'submitted',
  response TEXT,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rti_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own RTI requests" ON public.rti_requests
  FOR SELECT TO authenticated USING (auth.uid() = submitted_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create RTI requests" ON public.rti_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Admins can update RTI requests" ON public.rti_requests
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 9. Hospitals
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  district TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'government',
  total_beds INTEGER NOT NULL DEFAULT 0,
  available_beds INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  services TEXT[] NOT NULL DEFAULT '{}',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hospitals viewable by all authenticated" ON public.hospitals
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage hospitals" ON public.hospitals
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 10. Community repairs
CREATE TABLE public.community_repairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  district TEXT NOT NULL DEFAULT '',
  upazila TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  category TEXT NOT NULL DEFAULT 'other',
  status TEXT NOT NULL DEFAULT 'reported',
  support_count INTEGER NOT NULL DEFAULT 0,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.community_repairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Repairs viewable by all authenticated" ON public.community_repairs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create repair requests" ON public.community_repairs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own repairs" ON public.community_repairs
  FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Admins can manage repairs" ON public.community_repairs
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 11. Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 12. Moderation queue
CREATE TABLE public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  flag_reason TEXT NOT NULL,
  flagged_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  flagged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
);
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view moderation queue" ON public.moderation_queue
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can flag reports" ON public.moderation_queue
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = flagged_by);
CREATE POLICY "Admins can update moderation items" ON public.moderation_queue
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 13. Tenders
CREATE TABLE public.tenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_title TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT '',
  estimated_cost BIGINT NOT NULL DEFAULT 0,
  actual_cost BIGINT NOT NULL DEFAULT 0,
  risk_score INTEGER NOT NULL DEFAULT 0,
  risk_factors TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'low_risk',
  awarded_to TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenders viewable by admins" ON public.tenders
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage tenders" ON public.tenders
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 14. Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_by_role TEXT NOT NULL DEFAULT 'citizen',
  target_type TEXT NOT NULL DEFAULT '',
  target_id TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs viewable by admins" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- 15. Identity unlock requests
CREATE TABLE public.identity_unlock_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.identity_unlock_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view unlock requests" ON public.identity_unlock_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create unlock requests" ON public.identity_unlock_requests
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Superadmins can update unlock requests" ON public.identity_unlock_requests
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'superadmin'));

-- 16. Vote anomalies
CREATE TABLE public.vote_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  report_title TEXT NOT NULL DEFAULT '',
  anomaly_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  details TEXT NOT NULL DEFAULT '',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vote_anomalies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view anomalies" ON public.vote_anomalies
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 17. Crisis mode
CREATE TABLE public.crisis_mode (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active BOOLEAN NOT NULL DEFAULT false,
  activated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activated_at TIMESTAMPTZ,
  reason TEXT
);
ALTER TABLE public.crisis_mode ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Crisis mode viewable by all authenticated" ON public.crisis_mode
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage crisis mode" ON public.crisis_mode
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 18. Integrity metrics
CREATE TABLE public.integrity_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district TEXT NOT NULL UNIQUE,
  trust_score INTEGER NOT NULL DEFAULT 50,
  truth_score INTEGER NOT NULL DEFAULT 50,
  total_reports INTEGER NOT NULL DEFAULT 0,
  verified_reports INTEGER NOT NULL DEFAULT 0,
  resolved_reports INTEGER NOT NULL DEFAULT 0,
  active_projects INTEGER NOT NULL DEFAULT 0,
  rti_response_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.integrity_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Integrity metrics viewable by all authenticated" ON public.integrity_metrics
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage integrity metrics" ON public.integrity_metrics
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Evidence storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', true);
CREATE POLICY "Evidence files publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'evidence');
CREATE POLICY "Authenticated users can upload evidence" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'evidence');

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rti_requests_updated_at BEFORE UPDATE ON public.rti_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_repairs_updated_at BEFORE UPDATE ON public.community_repairs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_integrity_metrics_updated_at BEFORE UPDATE ON public.integrity_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
