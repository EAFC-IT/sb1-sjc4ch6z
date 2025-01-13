-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "emprunts_select_policy" ON emprunts;
DROP POLICY IF EXISTS "emprunts_insert_policy" ON emprunts;
DROP POLICY IF EXISTS "emprunts_update_policy" ON emprunts;
DROP POLICY IF EXISTS "emprunts_delete_policy" ON emprunts;

-- Create a single policy for all operations
CREATE POLICY "enable_all_access" ON emprunts
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);