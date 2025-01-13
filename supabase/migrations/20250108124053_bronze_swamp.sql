/*
  # Fix quantity updates logic

  1. Changes
    - Drop existing trigger and function
    - Create new trigger function with proper locking
    - Add new trigger
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS update_item_quantity_on_emprunt ON emprunts;
DROP FUNCTION IF EXISTS update_item_quantity();

-- Create new trigger function with proper locking
CREATE OR REPLACE FUNCTION update_item_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quantite_disponible int;
BEGIN
  -- Lock the items row
  SELECT quantite_disponible INTO v_quantite_disponible
  FROM items
  WHERE id = NEW.item_id
  FOR UPDATE;
  
  IF TG_OP = 'INSERT' THEN
    -- Vérifier la disponibilité
    IF v_quantite_disponible <= 0 THEN
      RAISE EXCEPTION 'Item non disponible';
    END IF;
    
    -- Mettre à jour la quantité
    UPDATE items
    SET quantite_disponible = quantite_disponible - 1
    WHERE id = NEW.item_id;
    
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'en_cours' AND NEW.status = 'retourne' THEN
      UPDATE items
      SET quantite_disponible = quantite_disponible + 1
      WHERE id = NEW.item_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create new trigger
CREATE TRIGGER update_item_quantity_on_emprunt
  BEFORE INSERT OR UPDATE OF status
  ON emprunts
  FOR EACH ROW
  EXECUTE FUNCTION update_item_quantity();

-- Reset quantities
DO $$
BEGIN
  -- Reset all quantities to total
  UPDATE items SET quantite_disponible = quantite_totale;
  
  -- Subtract current emprunts
  UPDATE items i
  SET quantite_disponible = i.quantite_totale - COALESCE(e.emprunts_count, 0)
  FROM (
    SELECT item_id, COUNT(*) as emprunts_count
    FROM emprunts
    WHERE status = 'en_cours'
    GROUP BY item_id
  ) e
  WHERE i.id = e.item_id;
END $$;