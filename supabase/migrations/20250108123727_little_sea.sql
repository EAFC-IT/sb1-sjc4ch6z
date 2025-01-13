/*
  # Fix create_emprunt function

  1. Changes
    - Remove explicit transaction management
    - Add row-level locking
    - Update function to be more robust
    - Add proper error handling
*/

CREATE OR REPLACE FUNCTION create_emprunt(p_item_id uuid, p_professeur_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quantite_disponible int;
BEGIN
  -- Lock the items row to prevent concurrent updates
  SELECT quantite_disponible INTO v_quantite_disponible
  FROM items
  WHERE id = p_item_id
  FOR UPDATE;

  -- Vérifier si l'item existe
  IF v_quantite_disponible IS NULL THEN
    RAISE EXCEPTION 'Item non trouvé';
  END IF;

  -- Vérifier si l'item est disponible
  IF v_quantite_disponible <= 0 THEN
    RAISE EXCEPTION 'Item non disponible';
  END IF;

  -- Créer l'emprunt
  INSERT INTO emprunts (item_id, professeur_id, status)
  VALUES (p_item_id, p_professeur_id, 'en_cours');

  -- Mettre à jour la quantité disponible
  UPDATE items
  SET 
    quantite_disponible = quantite_disponible - 1,
    updated_at = now()
  WHERE id = p_item_id;
END;
$$;