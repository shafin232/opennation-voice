
-- 1. Unique constraint on votes for upsert
ALTER TABLE public.votes ADD CONSTRAINT votes_report_user_unique UNIQUE (report_id, user_id);

-- 2. Comments table for feed
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments viewable by all authenticated" ON public.comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can add comments" ON public.comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3. Allow system/admin to insert notifications
CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = user_id
  );

-- 4. Add comment_count to reports
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS comment_count INTEGER NOT NULL DEFAULT 0;

-- 5. Trigger to update comment count
CREATE OR REPLACE FUNCTION public.update_report_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE reports SET comment_count = (SELECT count(*) FROM comments WHERE report_id = OLD.report_id) WHERE id = OLD.report_id;
    RETURN OLD;
  ELSE
    UPDATE reports SET comment_count = (SELECT count(*) FROM comments WHERE report_id = NEW.report_id) WHERE id = NEW.report_id;
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER update_comment_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_report_comment_count();
