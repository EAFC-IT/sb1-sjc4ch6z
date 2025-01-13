/*
  # Add RLS policies for emprunts table

  1. Security Changes
    - Add policy for inserting new emprunts
    - Add policy for updating existing emprunts
*/

-- Allow authenticated users to insert new emprunts
CREATE POLICY "Users can create emprunts"
  ON emprunts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update emprunts
CREATE POLICY "Users can update emprunts"
  ON emprunts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);