/*
  # Fix RLS policies for emprunts table

  1. Changes
    - Drop all existing policies
    - Create correct policies for all operations
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Lecture publique des emprunts" ON emprunts;
DROP POLICY IF EXISTS "Manage emprunts" ON emprunts;
DROP POLICY IF EXISTS "Authenticated users can insert emprunts" ON emprunts;
DROP POLICY IF EXISTS "Authenticated users can update emprunts" ON emprunts;
DROP POLICY IF EXISTS "Users can create emprunts" ON emprunts;
DROP POLICY IF EXISTS "Users can update emprunts" ON emprunts;

-- Create comprehensive policies
CREATE POLICY "emprunts_select_policy" 
  ON emprunts FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "emprunts_insert_policy" 
  ON emprunts FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "emprunts_update_policy" 
  ON emprunts FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "emprunts_delete_policy" 
  ON emprunts FOR DELETE 
  TO authenticated 
  USING (true);