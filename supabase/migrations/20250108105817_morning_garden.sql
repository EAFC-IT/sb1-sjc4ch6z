/*
  # Suppression des doublons dans la table items

  1. Modifications
    - Suppression des entrées dupliquées dans la table items
*/

-- Supprimer les doublons en gardant l'entrée la plus ancienne
WITH DuplicateItems AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY titre, description, categorie_id
           ORDER BY created_at
         ) as row_num
  FROM items
)
DELETE FROM items
WHERE id IN (
  SELECT id 
  FROM DuplicateItems 
  WHERE row_num > 1
);