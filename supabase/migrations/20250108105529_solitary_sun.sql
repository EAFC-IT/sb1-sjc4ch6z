/*
  # Mise à jour des politiques RLS et ajout des données

  1. Modifications
    - Mise à jour des politiques RLS pour permettre l'accès public
    - Ajout de données de test pour les catégories et items
*/

-- Mettre à jour les politiques RLS pour permettre l'accès public
DROP POLICY IF EXISTS "Lecture publique des items" ON items;
CREATE POLICY "Lecture publique des items"
  ON items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Lecture publique des categories" ON categories;
CREATE POLICY "Lecture publique des categories"
  ON categories FOR SELECT
  USING (true);

-- Insérer les données de test
INSERT INTO categories (id, nom) VALUES
  (gen_random_uuid(), 'Livre'),
  (gen_random_uuid(), 'DVD'),
  (gen_random_uuid(), 'CD'),
  (gen_random_uuid(), 'Matériel'),
  (gen_random_uuid(), 'Jeu');

DO $$ 
DECLARE
    livre_id uuid;
    dvd_id uuid;
    cd_id uuid;
    materiel_id uuid;
    jeu_id uuid;
BEGIN
    SELECT id INTO livre_id FROM categories WHERE nom = 'Livre' LIMIT 1;
    SELECT id INTO dvd_id FROM categories WHERE nom = 'DVD' LIMIT 1;
    SELECT id INTO cd_id FROM categories WHERE nom = 'CD' LIMIT 1;
    SELECT id INTO materiel_id FROM categories WHERE nom = 'Matériel' LIMIT 1;
    SELECT id INTO jeu_id FROM categories WHERE nom = 'Jeu' LIMIT 1;

    -- Livres
    INSERT INTO items (titre, description, categorie_id, quantite_totale, quantite_disponible) VALUES
    ('Le Petit Prince', 'Un classique de la littérature française', livre_id, 3, 3),
    ('1984', 'Le chef-d''œuvre de George Orwell', livre_id, 2, 2);
END $$;