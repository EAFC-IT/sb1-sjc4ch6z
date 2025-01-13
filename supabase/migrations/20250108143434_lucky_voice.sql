-- Add policy to allow item deletion
CREATE POLICY "Allow item deletion"
ON items
FOR DELETE
TO authenticated
USING (true);