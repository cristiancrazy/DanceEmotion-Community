/*
    Author: Cristian Capraro, 20054593@studenti.uniupo.it
    Date:    06/2025 - 07/2025
    Version: 1.0.1
    Changelog:
        - 1.0.0: Initial creation of the DanceEmotion database structure.
        - 1.0.1: Added missings foreign key constraints and updated table structures.

    Description:
    > The following script will create the structure for the DanceEmotion database.
    > Using the SQLLite3 database.
*/

-- Tabella Ballerini
CREATE TABLE Ballerini (
    IDBallerino INTEGER PRIMARY KEY AUTOINCREMENT,
    Nome TEXT NOT NULL,
    Cognome TEXT NOT NULL,
    DataNascita DATE NOT NULL,
    Email TEXT NOT NULL,
    Password TEXT NOT NULL,
    Telefono TEXT NOT NULL,
    ImmagineProfilo TEXT NOT NULL DEFAULT ''
);

-- Tabella Scuole
CREATE TABLE Scuole (
    IDScuola INTEGER PRIMARY KEY AUTOINCREMENT,
    Nome TEXT NOT NULL,
    Email TEXT NOT NULL,
    Password TEXT NOT NULL,
    Telefono TEXT NOT NULL,
    ImmagineProfilo TEXT NOT NULL DEFAULT '',
    Descrizione TEXT,
    Indirizzo TEXT NOT NULL,
    Citta TEXT NOT NULL,
    CAP TEXT NOT NULL,
    Provincia TEXT NOT NULL,
    Regione TEXT NOT NULL
);

-- Tabella Corsi
CREATE TABLE Corsi (
    IDCorso INTEGER PRIMARY KEY AUTOINCREMENT,
    Nome TEXT NOT NULL,
    Istruttore TEXT NOT NULL,
    Tipologia TEXT NOT NULL CHECK (
        Tipologia IN ('Periodica', 'Singola', 'Privata')
    ),
    Livello TEXT NOT NULL CHECK (
        Livello IN ('Principiante', 'Intermedio', 'Avanzato', 'Open', 'Personalizzato')
    ),
    Prezzo DECIMAL NOT NULL,
    DataInizio DATE,
    DataFine DATE,
    OrarioInizio TIME,
    OrarioFine TIME,
    CategoriaCorso TEXT NOT NULL DEFAULT 'Urban' CHECK (
        CategoriaCorso IN (
            'Urban', 'Latino & Caraibico', 'Classico & Moderno', 'Coreografico',
            'Social & Swing', 'Gruppo & Fitness', 'Danze Orientali & Etniche',
            'Folklore & Tradizione', 'Teatrale & Performativo', 'Acrobatico & Espressivo'
        )
    ),
    IDScuola INTEGER NOT NULL,
    FOREIGN KEY (IDScuola) REFERENCES Scuole(IDScuola)
    ON UPDATE CASCADE 
    ON DELETE CASCADE
);

-- Tabella Eventi
CREATE TABLE Eventi (
    IDEvento INTEGER PRIMARY KEY AUTOINCREMENT,
    Nome TEXT NOT NULL,
    Descrizione TEXT NOT NULL,
    Luogo TEXT NOT NULL,
    Prezzo DECIMAL NOT NULL,
    DataOra DATETIME NOT NULL,
    Locandina TEXT NOT NULL DEFAULT '',
    IDScuola INTEGER NOT NULL,
    FOREIGN KEY (IDScuola) REFERENCES Scuole(IDScuola)
    ON UPDATE CASCADE 
    ON DELETE CASCADE
);

-- Tabella Iscrizioni
CREATE TABLE Iscrizioni (
    IDIscrizione INTEGER PRIMARY KEY AUTOINCREMENT,
    IDCorso INTEGER NOT NULL,
    IDBallerino INTEGER NOT NULL,
    Stato TEXT NOT NULL DEFAULT 'Richiesta' CHECK (
        Stato IN ('Richiesta', 'Accettata', 'Rifiutata', 'Terminata')
    ),
    FOREIGN KEY (IDCorso) REFERENCES Corsi(IDCorso)
    ON UPDATE CASCADE 
    ON DELETE CASCADE,
    FOREIGN KEY (IDBallerino) REFERENCES Ballerini(IDBallerino)
    ON UPDATE CASCADE 
    ON DELETE CASCADE
);

-- Tabella Prenotazioni
CREATE TABLE Prenotazioni (
    IDPrenotazione INTEGER PRIMARY KEY AUTOINCREMENT,
    IDEvento INTEGER NOT NULL,
    IDBallerino INTEGER NOT NULL,
    Stato TEXT NOT NULL DEFAULT 'Richiesta' CHECK (
        Stato IN ('Richiesta', 'Accettata', 'Rifiutata', 'Terminata')
    ),
    FOREIGN KEY (IDEvento) REFERENCES Eventi(IDEvento)
    ON UPDATE CASCADE 
    ON DELETE CASCADE,
    FOREIGN KEY (IDBallerino) REFERENCES Ballerini(IDBallerino)
    ON UPDATE CASCADE 
    ON DELETE CASCADE
);

-- Tabella Allegati
CREATE TABLE Allegati (
    IDAllegato INTEGER PRIMARY KEY AUTOINCREMENT,
    IDCorso INTEGER NOT NULL,
    NomeFile TEXT NOT NULL,
    Tipologia TEXT NOT NULL DEFAULT 'video/mp4' CHECK (
        Tipologia IN (
            'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg',
            'audio/mpeg', 'audio/ogg', 'audio/wav'
        )
    ),
    Percorso TEXT NOT NULL,
    DataUpload DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IDCorso) REFERENCES Corsi(IDCorso)
    ON UPDATE CASCADE 
    ON DELETE CASCADE
);

-- Tabella Recensioni
CREATE TABLE Recensioni (
    IDRecensione INTEGER PRIMARY KEY AUTOINCREMENT,
    IDBallerino INTEGER NOT NULL,
    IDCorso INTEGER NOT NULL,
    Valutazione INTEGER NOT NULL CHECK (Valutazione BETWEEN 1 AND 5),
    Corpo TEXT NOT NULL,
    DataCreazione DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IDBallerino) REFERENCES Ballerini(IDBallerino)
    ON UPDATE CASCADE 
    ON DELETE CASCADE,
    FOREIGN KEY (IDCorso) REFERENCES Corsi(IDCorso)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- Tabella Risposte
CREATE TABLE Risposte (
    IDRisposta INTEGER PRIMARY KEY AUTOINCREMENT,
    IDRecensione INTEGER NOT NULL,
    Corpo TEXT NOT NULL,
    DataCreazione DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IDRecensione) REFERENCES Recensioni(IDRecensione)
    ON UPDATE CASCADE 
    ON DELETE CASCADE
);

-- Tabella Preferiti
CREATE TABLE Preferiti (
    IDPreferito INTEGER PRIMARY KEY AUTOINCREMENT,
    IDBallerino INTEGER NOT NULL,
    IDScuola INTEGER NOT NULL,
    DataCreazione DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IDBallerino) REFERENCES Ballerini(IDBallerino),
    FOREIGN KEY (IDScuola) REFERENCES Scuole(IDScuola)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- Tabella Notifiche
CREATE TABLE Notifiche (
    IDNotifica INTEGER PRIMARY KEY AUTOINCREMENT,
    IDScuola INTEGER NOT NULL,
    IDBallerino INTEGER,
    Tipo TEXT NOT NULL CHECK (
        Tipo IN ('Evento', 'Corso', 'News', 'Risposta')
    ),
    Messaggio TEXT NOT NULL,
    DataInvio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IDScuola) REFERENCES Scuole(IDScuola)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
    FOREIGN KEY (IDBallerino) REFERENCES Ballerini(IDBallerino)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);