/*
  # Ajout d'items de test

  1. Ajouts
    - 5 livres
    - 5 DVDs
    - 4 CDs
    - 3 matériels
    - 3 jeux
*/

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
    ('1984', 'Le chef-d''œuvre de George Orwell', livre_id, 2, 2),
    ('Harry Potter à l''école des sorciers', 'Le premier tome de la série', livre_id, 4, 4),
    ('Les Misérables', 'L''œuvre majeure de Victor Hugo', livre_id, 2, 2),
    ('Le Comte de Monte-Cristo', 'Une histoire de vengeance par Alexandre Dumas', livre_id, 2, 2);

    -- DVDs
    INSERT INTO items (titre, description, categorie_id, quantite_totale, quantite_disponible) VALUES
    ('Le Roi Lion', 'Le classique de Disney', dvd_id, 2, 2),
    ('La Liste de Schindler', 'Le film de Steven Spielberg', dvd_id, 1, 1),
    ('Le Seigneur des Anneaux', 'La trilogie complète', dvd_id, 2, 2),
    ('Les Temps Modernes', 'Le chef-d''œuvre de Charlie Chaplin', dvd_id, 1, 1),
    ('E.T.', 'Le film culte de Steven Spielberg', dvd_id, 2, 2);

    -- CDs
    INSERT INTO items (titre, description, categorie_id, quantite_totale, quantite_disponible) VALUES
    ('Les Quatre Saisons', 'Vivaldi par l''Orchestre National de France', cd_id, 2, 2),
    ('The Dark Side of the Moon', 'Album mythique de Pink Floyd', cd_id, 1, 1),
    ('Thriller', 'L''album légendaire de Michael Jackson', cd_id, 2, 2),
    ('La Flûte Enchantée', 'Mozart par l''Opéra de Vienne', cd_id, 1, 1);

    -- Matériel
    INSERT INTO items (titre, description, categorie_id, quantite_totale, quantite_disponible) VALUES
    ('Microscope numérique', 'Microscope avec connexion USB et caméra HD', materiel_id, 3, 3),
    ('Kit de robotique éducatif', 'Kit complet pour l''initiation à la robotique', materiel_id, 2, 2),
    ('Télescope', 'Pour l''observation des étoiles', materiel_id, 1, 1);

    -- Jeux
    INSERT INTO items (titre, description, categorie_id, quantite_totale, quantite_disponible) VALUES
    ('Échecs pédagogiques', 'Jeu d''échecs avec guide d''apprentissage', jeu_id, 4, 4),
    ('Timeline Histoire', 'Jeu de cartes éducatif sur l''histoire', jeu_id, 2, 2),
    ('Scrabble', 'Version française', jeu_id, 3, 3);
END $$;