
-- Add citizen_alias and nid_hash to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS citizen_alias TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nid_hash TEXT;

-- Add is_anonymous to reports
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;

-- Function to generate unique citizen alias
CREATE OR REPLACE FUNCTION public.generate_citizen_alias()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  adjectives TEXT[] := ARRAY['Green', 'Blue', 'Red', 'Silver', 'Gold', 'Iron', 'Brave', 'Swift', 'Bold', 'Calm', 'Noble', 'Free', 'True', 'Wise', 'Fair', 'Strong', 'Sharp', 'Deep', 'Pure', 'Bright'];
  nouns TEXT[] := ARRAY['Eagle', 'Tiger', 'River', 'Star', 'Shield', 'Arrow', 'Hawk', 'Wolf', 'Lion', 'Falcon', 'Phoenix', 'Storm', 'Thunder', 'Light', 'Wave', 'Peak', 'Flame', 'Oak', 'Stone', 'Dawn'];
  alias TEXT;
  attempt INT := 0;
BEGIN
  LOOP
    alias := adjectives[1 + floor(random() * array_length(adjectives, 1))::int] || '-' ||
             nouns[1 + floor(random() * array_length(nouns, 1))::int] || '-' ||
             (10 + floor(random() * 90))::int;
    -- Check uniqueness
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE citizen_alias = alias) THEN
      RETURN alias;
    END IF;
    attempt := attempt + 1;
    IF attempt > 100 THEN
      RETURN 'Citizen-' || floor(random() * 100000)::int;
    END IF;
  END LOOP;
END;
$$;

-- Update handle_new_user to set citizen_alias
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, phone, citizen_alias)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    NEW.phone,
    public.generate_citizen_alias()
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'citizen');
  RETURN NEW;
END;
$$;

-- Generate aliases for existing profiles that don't have one
UPDATE public.profiles SET citizen_alias = public.generate_citizen_alias() WHERE citizen_alias IS NULL;
