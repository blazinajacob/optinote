/*
  # Add insert policy for users table
  
  1. Security
    - Add RLS policy allowing users to insert their own record into the users table
    - This fixes the issue where new users can't be created during signup
    - The policy ensures that a user can only insert a row where the id matches their auth.uid()
*/

-- Create policy to allow authenticated users to insert their own record
CREATE POLICY "Users can insert their own data"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);