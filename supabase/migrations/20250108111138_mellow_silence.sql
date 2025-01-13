/*
  # Fix duplicate RLS policies for emprunts table

  1. Changes
    - Drop duplicate policies
    - Create single unified policy for emprunts
*/

-- Drop existing duplicate policies
DROP POLICY IF EXISTS "Authenticated users can insert emprunts" ON emprunts;
DROP POLICY IF EXISTS "Authenticated users can update emprunts" ON emprunts;
DROP POLICY IF EXISTS "Users can create emprunts" ON emprunts;
DROP POLICY IF EXISTS "Users can update emprunts" ON emprunts;

-- Create single unified policy for emprunts
CREATE POLICY "Manage emprunts"
  ON emprunts
  TO authenticated
  USING (true)
  WITH CHECK (true);