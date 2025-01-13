/*
  # Mise à jour des politiques RLS pour les professeurs

  1. Changements
    - Ajout d'une politique permettant la lecture publique des professeurs
*/

-- Mettre à jour les politiques RLS pour permettre l'accès public aux professeurs
DROP POLICY IF EXISTS "Lecture publique des professeurs" ON professeurs;
CREATE POLICY "Lecture publique des professeurs"
  ON professeurs FOR SELECT
  USING (true);