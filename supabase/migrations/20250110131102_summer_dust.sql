/*
  # Table des variables d'environnement

  1. Nouvelle Table
    - `env_variables` pour stocker les variables d'environnement de manière sécurisée
    - Champs : id, key, value, created_at
  
  2. Sécurité
    - Enable RLS
    - Politique de lecture pour les utilisateurs authentifiés
*/

-- Création de la table pour les variables d'environnement
CREATE TABLE env_variables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activation RLS
ALTER TABLE env_variables ENABLE ROW LEVEL SECURITY;

-- Politique de lecture
CREATE POLICY "Lecture des variables d'environnement"
  ON env_variables FOR SELECT
  TO authenticated
  USING (true);