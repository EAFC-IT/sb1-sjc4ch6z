/*
  # Ajout du champ cartes détenues pour les professeurs

  1. Changements
    - Ajoute une colonne cartes_detenues à la table professeurs
    - Définit une valeur par défaut de 0
    - Ajoute une contrainte pour empêcher les valeurs négatives

  2. Notes
    - La colonne est de type integer pour stocker un nombre entier
    - La valeur par défaut est 0
    - Une contrainte CHECK empêche les valeurs négatives
*/

ALTER TABLE professeurs
ADD COLUMN cartes_detenues integer NOT NULL DEFAULT 0
CHECK (cartes_detenues >= 0);