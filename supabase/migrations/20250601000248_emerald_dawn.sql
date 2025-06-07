-- Drop the policy causing infinite recursion
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Create a new policy that achieves the same goal without recursion
CREATE POLICY "Admins can view all users" 
ON public.users
FOR SELECT
TO public
USING (
  -- Check if the user's role in auth.jwt() metadata is 'admin'
  -- This avoids querying the users table itself in the policy
  (auth.jwt() ->> 'role')::text = 'admin' OR auth.uid() = id
);