/*
  # Schéma initial de la médiathèque scolaire

  1. Nouvelles Tables
    - `categories` : Catégories des items (livre, DVD, CD, matériel, jeu)
    - `items` : Tous les items de la médiathèque
    - `professeurs` : Liste des professeurs
    - `emprunts` : Historique des emprunts

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques de lecture pour les utilisateurs authentifiés
*/

-- Table des catégories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des items
CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  description text,
  categorie_id uuid REFERENCES categories(id),
  quantite_totale integer NOT NULL DEFAULT 1,
  quantite_disponible integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des professeurs
CREATE TABLE professeurs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des emprunts
CREATE TABLE emprunts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES items(id),
  professeur_id uuid REFERENCES professeurs(id),
  date_emprunt timestamptz DEFAULT now(),
  date_retour timestamptz,
  status text DEFAULT 'en_cours',
  created_at timestamptz DEFAULT now()
);

-- Activation RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE professeurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE emprunts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Lecture publique des catégories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Lecture publique des items"
  ON items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Lecture publique des professeurs"
  ON professeurs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Lecture publique des emprunts"
  ON emprunts FOR SELECT
  TO authenticated
  USING (true);

-- Données initiales pour les catégories
INSERT INTO categories (nom) VALUES
  ('Livre'),
  ('DVD'),
  ('CD'),
  ('Matériel'),
  ('Jeu');