/*
  # Fix emprunts table RLS policies

  1. Changes
    - Drop all existing policies for emprunts table
    - Create new comprehensive policies for all operations
  
  2. Security
    - Enable RLS on emprunts table
    - Add policies for SELECT, INSERT, UPDATE, DELETE operations
    - All operations require authentication
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "emprunts_select_policy" ON emprunts;
DROP POLICY IF EXISTS "emprunts_insert_policy" ON emprunts;
DROP POLICY IF EXISTS "emprunts_update_policy" ON emprunts;
DROP POLICY IF EXISTS "emprunts_delete_policy" ON emprunts;

-- Create new comprehensive policies
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