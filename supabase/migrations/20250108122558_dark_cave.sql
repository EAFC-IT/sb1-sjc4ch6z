CREATE OR REPLACE FUNCTION create_emprunt(p_item_id uuid, p_professeur_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier si l'item est disponible
  IF (SELECT quantite_disponible FROM items WHERE id = p_item_id) <= 0 THEN
    RAISE EXCEPTION 'Item non disponible';
  END IF;

  -- Créer l'emprunt
  INSERT INTO emprunts (item_id, professeur_id, status)
  VALUES (p_item_id, p_professeur_id, 'en_cours');

  -- Mettre à jour la quantité disponible
  UPDATE items
  SET quantite_disponible = quantite_disponible - 1
  WHERE id = p_item_id;
END;
$$;