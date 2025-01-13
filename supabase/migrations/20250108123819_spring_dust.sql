/*
  # Add triggers for item quantity management

  1. Changes
    - Add trigger to update quantite_disponible on emprunt insert
    - Add trigger to update quantite_disponible on emprunt status change
    - Add function to maintain item quantities
*/

-- Function to maintain item quantities
CREATE OR REPLACE FUNCTION update_item_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- When a new emprunt is created
    UPDATE items
    SET quantite_disponible = quantite_disponible - 1
    WHERE id = NEW.item_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- When an emprunt status changes
    IF OLD.status = 'en_cours' AND NEW.status = 'retourne' THEN
      UPDATE items
      SET quantite_disponible = quantite_disponible + 1
      WHERE id = NEW.item_id;
    ELSIF OLD.status = 'retourne' AND NEW.status = 'en_cours' THEN
      UPDATE items
      SET quantite_disponible = quantite_disponible - 1
      WHERE id = NEW.item_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_item_quantity_on_emprunt ON emprunts;

-- Create trigger for insert
CREATE TRIGGER update_item_quantity_on_emprunt
  AFTER INSERT OR UPDATE OF status
  ON emprunts
  FOR EACH ROW
  EXECUTE FUNCTION update_item_quantity();

-- Recalculate all item quantities
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