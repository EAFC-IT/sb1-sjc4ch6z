/*
  # Ajout de la gestion des sections pour les items

  1. Nouvelle Table
    - `items_sections` (table de liaison)
      - `item_id` (uuid, référence items)
      - `section_id` (uuid, référence sections)
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS
    - Add policy for public access
*/

-- Création de la table de liaison items_sections
CREATE TABLE items_sections (
  item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  section_id uuid REFERENCES sections(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (item_id, section_id)
);

-- Activation RLS
ALTER TABLE items_sections ENABLE ROW LEVEL SECURITY;

-- Création de la policy pour l'accès public
CREATE POLICY "enable_public_access"
ON items_sections
FOR ALL
TO public
USING (true)
WITH CHECK (true);