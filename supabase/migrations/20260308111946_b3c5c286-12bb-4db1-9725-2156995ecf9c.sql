
-- Track all user actions for anti-farming, burst detection, target satiation
CREATE TABLE public.user_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type text NOT NULL DEFAULT 'vote', -- vote, report, comment, support
  target_id uuid NOT NULL,
  target_type text NOT NULL DEFAULT 'report', -- report, project, repair
  weight numeric NOT NULL DEFAULT 1.0,
  lat double precision,
  lng double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own actions" ON public.user_actions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own actions" ON public.user_actions
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Index for fast lookups
CREATE INDEX idx_user_actions_user_id ON public.user_actions(user_id);
CREATE INDEX idx_user_actions_target ON public.user_actions(target_id, target_type);
CREATE INDEX idx_user_actions_created ON public.user_actions(created_at);

-- Add computed score columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS effective_trust numeric DEFAULT 50;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reputation_raw numeric DEFAULT 50;

-- Add truth_probability and authenticity_score to reports  
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS truth_probability numeric DEFAULT 0.5;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS authenticity_score numeric DEFAULT 0.5;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS approval_decision text DEFAULT 'pending';

-- Add risk scores to tenders
ALTER TABLE public.tenders ADD COLUMN IF NOT EXISTS win_rate_anomaly numeric DEFAULT 0;
ALTER TABLE public.tenders ADD COLUMN IF NOT EXISTS bid_rotation_risk numeric DEFAULT 0;
ALTER TABLE public.tenders ADD COLUMN IF NOT EXISTS hhi_index numeric DEFAULT 0;
ALTER TABLE public.tenders ADD COLUMN IF NOT EXISTS execution_risk numeric DEFAULT 0;
