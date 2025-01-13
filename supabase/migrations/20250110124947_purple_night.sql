-- Ajout d'une contrainte d'unicité sur la colonne carte_rfid
ALTER TABLE professeurs
ADD CONSTRAINT unique_carte_rfid UNIQUE (carte_rfid);

-- Permettre des valeurs NULL (pas de carte attribuée)
ALTER TABLE professeurs
ALTER COLUMN carte_rfid DROP NOT NULL;