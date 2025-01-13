-- Mise à jour des données des sections
INSERT INTO sections (nom) VALUES
  ('Français'),
  ('Anglais'),
  ('Néerlandais'),
  ('Italien'),
  ('Allemand')
ON CONFLICT (nom) DO NOTHING;