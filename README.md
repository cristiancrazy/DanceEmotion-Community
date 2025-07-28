# DanceEmotion — Piattaforma per scuole di ballo e ballerini

## Descrizione

**DanceEmotion** è un'applicazione web progettata per favorire l'incontro tra ballerini e scuole di danza.  
Gli utenti possono scoprire corsi, eventi e materiali, prenotare lezioni, lasciare recensioni e ricevere aggiornamenti dalle scuole seguite.

---

## Video di presentazione

Nel seguente video di presentazione viene effettuata una breve panoramica del progetto, vengono discusse le **scelte progettuali adottate**: layout, struttura del database, componenti principali, logiche funzionali e scelte implementative.

- [DanceEmotion - Presentazione progetto](https://www.youtube.com/watch?v=Lqv96jZUZwA)

## Installazione

Per installare il progetto sarà necessario:

0. Accedere alla cartella del progetto

1. Scaricare il framework **Bootstrap 5** e **Bootstrap Icons** e inserirne il contenuto nelle directory `public/bs` e `public/bs-icons`, come indicato nei `README.txt`.

2. Lanciare il comando `npm install` e attendere l'installazione delle dipendenze.

3. Eseguire il comando `npm start` e attendere l'avvio del server.

### File `.env`

Nella cartella del progetto è presente un file nel quale dovranno essere specificati i seguenti parametri:

| Parametro     | Descrizione                                      |
|---------------|--------------------------------------------------|
| `ADDRESS`     | Indirizzo sul quale il server rimarrà in ascolto |
| `PORT`        | Porta sul quale il server rimarrà in ascolto     |
| `SESSIONS`    | Il secret per la gestione della sessione         |
| `GOOGLEAPIKEY`| L'API KEY per Distance Matrix API di Google      |

## Credenziali di esempio

| Email                                | Password            | Tipo         |
|--------------------------------------|---------------------|--------------|
| mario.rossi@email.com                | M!Rossi.            | Ballerino    |
| luca.gialli@email.com                | L!Gialli.           | Ballerino    |
| cristian.neri@email.com              | C!Neri.             | Ballerino    |

| Email                                | Password            | Tipo         |
|--------------------------------------|---------------------|--------------|
| latinfusion@email.com                | LF_School           | Scuola       |
| dancegalaxy@email.com                | DG_School           | Scuola       |
| flydance@email.com                   | FD_School           | Scuola       |

## Documentazione aggiuntiva 

È inoltre disponibile ulteriore documentazione tecnica nella cartella `/docs`.

La cartella `docs/` contiene tutti i materiali di supporto al progetto:

| Link                              | File               | Contenuto                                                          |
|-------------------------------------|-----------------------|-----------------------------------------------------------------------|
| [Leggi](docs/database.pdf)          | `database.pdf`        | Specifiche del database, struttura relazionale e dettagli implementativi |
| [Leggi](docs/diagramma.pdf)         | `diagramma.pdf`       | Diagramma del database, struttura e relazioni |

> Nota: nel `database.pdf` non era stato definito l'utilizzo di `Corsi.IDScuola` (chiave esterna che referenzia `Scuola`). 
