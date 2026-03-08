
-- Project votes table with 3-category voting
CREATE TABLE public.project_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('need', 'modify', 'reject')),
  voter_district TEXT NOT NULL DEFAULT '',
  weight NUMERIC NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);

ALTER TABLE public.project_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes viewable by all authenticated" ON public.project_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can cast project votes" ON public.project_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change own project votes" ON public.project_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Add impact metrics and vote counts to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS need_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS modify_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS reject_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS approval_percent NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS impact_income TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS impact_environment TEXT NOT NULL DEFAULT 'neutral';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS impact_displacement INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS affected_population INTEGER NOT NULL DEFAULT 0;

-- Trigger to update vote counts and auto-status
CREATE OR REPLACE FUNCTION public.update_project_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  p_need INTEGER;
  p_modify INTEGER;
  p_reject INTEGER;
  p_total NUMERIC;
  p_approval NUMERIC;
  p_status TEXT;
BEGIN
  -- Calculate weighted counts
  SELECT 
    COALESCE(SUM(CASE WHEN vote_type = 'need' THEN weight ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN vote_type = 'modify' THEN weight ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN vote_type = 'reject' THEN weight ELSE 0 END), 0)
  INTO p_need, p_modify, p_reject
  FROM project_votes
  WHERE project_id = COALESCE(NEW.project_id, OLD.project_id);

  p_total := p_need + p_modify + p_reject;
  IF p_total > 0 THEN
    p_approval := ROUND((p_need::NUMERIC / p_total) * 100, 1);
  ELSE
    p_approval := 0;
  END IF;

  -- Auto status: if reject > 50% of total, set revision_required
  IF p_total >= 10 AND (p_reject::NUMERIC / p_total) > 0.5 THEN
    p_status := 'revision_required';
  ELSE
    p_status := NULL; -- don't change
  END IF;

  UPDATE projects SET
    need_count = p_need,
    modify_count = p_modify,
    reject_count = p_reject,
    approval_percent = p_approval,
    status = COALESCE(p_status, status)
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_project_votes_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.project_votes
FOR EACH ROW EXECUTE FUNCTION public.update_project_vote_counts();

-- Enable realtime for project_votes
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_votes;
