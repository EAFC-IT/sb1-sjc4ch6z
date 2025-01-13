/*
  # Add emprunts insert policy

  1. Changes
    - Add RLS policy to allow authenticated users to insert new emprunts
    - Add RLS policy to allow authenticated users to update emprunts
*/

-- Allow authenticated users to insert new emprunts
CREATE POLICY "Authenticated users can insert emprunts"
  ON emprunts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update emprunts
CREATE POLICY "Authenticated users can update emprunts"
  ON emprunts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);