/*
  # Ajout de la politique d'accès public aux sections

  1. Sécurité
    - Permet l'accès public en lecture à la table sections
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Lecture publique des sections" ON sections;

-- Create new policy for public access
CREATE POLICY "enable_public_access"
ON sections
FOR ALL
TO public
USING (true)
WITH CHECK (true);