/*
  # Suppression des doublons dans la table des catégories

  1. Changements
    - Supprime les entrées en double dans la table des catégories
    - Conserve l'entrée la plus ancienne pour chaque nom de catégorie
    - Met à jour les références dans la table items

  2. Sécurité
    - Utilise une approche sécurisée pour gérer les doublons
    - Préserve l'intégrité référentielle
*/

DO $$ 
DECLARE
    r RECORD;
    first_id uuid;
BEGIN
    -- Pour chaque nom de catégorie en double
    FOR r IN (
        SELECT LOWER(nom) as nom_lower
        FROM categories
        GROUP BY LOWER(nom)
        HAVING COUNT(*) > 1
    ) LOOP
        -- Trouver l'ID de la première occurrence (la plus ancienne)
        SELECT id INTO first_id
        FROM categories
        WHERE LOWER(nom) = r.nom_lower
        ORDER BY created_at
        LIMIT 1;

        -- Mettre à jour les références dans la table items
        UPDATE items
        SET categorie_id = first_id
        WHERE categorie_id IN (
            SELECT id
            FROM categories
            WHERE LOWER(nom) = r.nom_lower
            AND id != first_id
        );

        -- Supprimer les doublons
        DELETE FROM categories
        WHERE LOWER(nom) = r.nom_lower
        AND id != first_id;
    END LOOP;
END $$;