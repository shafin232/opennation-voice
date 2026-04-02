-- Allow superadmins to delete roles (needed for role changes)
CREATE POLICY "Superadmins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Allow superadmins to insert roles
CREATE POLICY "Superadmins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));