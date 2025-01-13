-- Suppression de la contrainte d'unicité sur carte_rfid
ALTER TABLE professeurs DROP CONSTRAINT IF EXISTS unique_carte_rfid;

-- Suppression de la colonne carte_rfid
ALTER TABLE professeurs DROP COLUMN IF EXISTS carte_rfid;

-- Suppression de la colonne cartes_detenues
ALTER TABLE professeurs DROP COLUMN IF EXISTS cartes_detenues;