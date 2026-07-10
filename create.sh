#!/bin/bash

# Caricamento dell'immagine Docker dal file locale .tar
echo "Caricamento dell'immagine Docker in corso..."
docker load -i ./danceemotionweb.tar

# Creazione delle cartelle nella directory corrente (con -p per evitare errori se esistono già)
echo "Creazione della struttura delle cartelle..."
mkdir -p ./videos    # Creazione cartella video (public del sito)
mkdir -p ./images    # Creazione cartella immagini (public del sito)
mkdir -p ./dancer    # Creazione cartella dancer (public del sito)
mkdir -p ./school    # Creazione cartella school (public del sito)
mkdir -p ./uploads   # Creazione cartella upload
mkdir -p ./uploads/attachment # Creazione cartella allegati (files)
mkdir -p ./uploads/dancer     # Creazione cartella ballerini (files)
mkdir -p ./uploads/school      # Creazione cartella scuole (files)

# Creazione del secret della sessione
echo "Creazione file .env..."
echo "Inserire nuovo secret per le sessioni:"
read secret

echo "Inserire API KEY per servizi Google Maps:"
read googleapikey

# Creazione del file .env
touch .env
cat <<EOF > .env
ADDRESS="0.0.0.0"
PORT='6568'
SESSIONSS="$secret"
GOOGLEAPIKEY="$googleapikey"
EOF

# Assegnazione permessi
echo "Avvio del container tramite start.sh..."

chmod +x ./start.sh
chmod +x ./stop.sh

# Avvio dello script start.sh
./start.sh
