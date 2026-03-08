-- Allow all authenticated users to view tenders (transparency)
CREATE POLICY "Tenders viewable by all authenticated" ON public.tenders FOR SELECT TO authenticated USING (true);

-- Drop the admin-only select policy since we now have a broader one
DROP POLICY IF EXISTS "Tenders viewable by admins" ON public.tenders;