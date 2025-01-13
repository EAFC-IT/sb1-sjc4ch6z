/*
  # Ajout du champ carte RFID pour les professeurs

  1. Changements
    - Ajoute une colonne carte_rfid à la table professeurs
    - La colonne est optionnelle pour permettre aux professeurs de ne pas avoir de carte

  2. Notes
    - Le champ est de type text pour supporter différents formats de cartes RFID
*/

ALTER TABLE professeurs
ADD COLUMN carte_rfid text;