-- Add trigger to update report vote counts when votes change
CREATE OR REPLACE FUNCTION public.update_report_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update support_count and doubt_count on the report
  IF TG_OP = 'DELETE' THEN
    UPDATE reports SET
      support_count = (SELECT count(*) FROM votes WHERE report_id = OLD.report_id AND vote_type = 'support'),
      doubt_count = (SELECT count(*) FROM votes WHERE report_id = OLD.report_id AND vote_type = 'doubt')
    WHERE id = OLD.report_id;
    RETURN OLD;
  ELSE
    UPDATE reports SET
      support_count = (SELECT count(*) FROM votes WHERE report_id = NEW.report_id AND vote_type = 'support'),
      doubt_count = (SELECT count(*) FROM votes WHERE report_id = NEW.report_id AND vote_type = 'doubt')
    WHERE id = NEW.report_id;
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER on_vote_change
AFTER INSERT OR UPDATE OR DELETE ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.update_report_vote_counts();

-- Add trigger to update project opinion count
CREATE OR REPLACE FUNCTION public.update_project_opinion_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE projects SET opinion_count = (SELECT count(*) FROM project_opinions WHERE project_id = OLD.project_id) WHERE id = OLD.project_id;
    RETURN OLD;
  ELSE
    UPDATE projects SET opinion_count = (SELECT count(*) FROM project_opinions WHERE project_id = NEW.project_id) WHERE id = NEW.project_id;
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER on_opinion_change
AFTER INSERT OR DELETE ON public.project_opinions
FOR EACH ROW
EXECUTE FUNCTION public.update_project_opinion_count();