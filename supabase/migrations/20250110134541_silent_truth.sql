/*
  # Système de logs d'actions

  1. Nouvelle Table
    - `action_logs`
      - `id` (uuid, primary key)
      - `action_type` (text) - Type d'action (EMPRUNT, RETOUR, etc.)
      - `description` (text) - Description détaillée de l'action
      - `user_id` (uuid) - ID de l'utilisateur qui a effectué l'action
      - `item_id` (uuid, nullable) - ID de l'item concerné
      - `professeur_id` (uuid, nullable) - ID du professeur concerné
      - `metadata` (jsonb) - Données supplémentaires
      - `created_at` (timestamptz) - Date de création du log

  2. Security
    - Enable RLS
    - Add policy for authenticated users to read logs
    - Add policy for authenticated users to create logs
*/

-- Création de la table des logs
CREATE TABLE action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  description text NOT NULL,
  user_id uuid,
  item_id uuid REFERENCES items(id),
  professeur_id uuid REFERENCES professeurs(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Activation RLS
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Lecture des logs"
  ON action_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Création des logs"
  ON action_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fonction pour créer un log
CREATE OR REPLACE FUNCTION create_log(
  p_action_type text,
  p_description text,
  p_user_id uuid DEFAULT NULL,
  p_item_id uuid DEFAULT NULL,
  p_professeur_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO action_logs (
    action_type,
    description,
    user_id,
    item_id,
    professeur_id,
    metadata
  ) VALUES (
    p_action_type,
    p_description,
    p_user_id,
    p_item_id,
    p_professeur_id,
    p_metadata
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;