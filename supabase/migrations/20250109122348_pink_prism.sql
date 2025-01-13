/*
  # Ajout de la table Sections

  1. Nouvelle Table
    - `sections`
      - `id` (uuid, primary key)
      - `nom` (text, unique)
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS sur la table `sections`
    - Ajout d'une policy pour la lecture publique
*/

-- Création de la table sections
CREATE TABLE sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activation RLS
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Création de la policy de lecture
CREATE POLICY "Lecture publique des sections"
  ON sections FOR SELECT
  TO authenticated
  USING (true);

-- Insertion des données
INSERT INTO sections (nom) VALUES
  ('Français'),
  ('Anglais'),
  ('Néerlandais'),
  ('Italien'),
  ('Allemand');