# Contratto proposto per le prenotazioni

## Verifica del repository

Alla revisione di main 82397c0, database/setup.js definisce soltanto facilities;
backend/app.js espone soltanto GET /facilities e GET /facilities/:id.
README.md rinvia le prenotazioni agli sviluppi del corso. Il frontend non
contiene un modello di prenotazione. Non esiste quindi un contratto già approvato
da verificare: questa suite è una proposta test-first, da validare prima di
implementare il backend. Non introduce endpoint o tabelle di produzione.

## Proposta verificata dai test

POST /bookings riceve un oggetto JSON con:

| Campo | Tipo e vincolo proposto |
| --- | --- |
| facilityId | Intero positivo sicuro, riferito a facilities.id |
| date | Stringa YYYY-MM-DD, data di calendario esistente |
| startTime | Stringa HH:mm, da 00:00 a 23:59 |
| endTime | Stesso formato, strettamente successivo a startTime nella stessa data |

Risposta 201: oggetto con id intero positivo e i quattro campi ricevuti.
Errori JSON con proprietà error contenente un messaggio non vuoto: 400 per
body/campi non validi, 404 per impianto inesistente, 409 per conflitto.
Le richieste rifiutate non devono occupare la fascia oraria.

Il conflitto riguarda lo stesso impianto e la stessa data, quando
new.startTime < existing.endTime e new.endTime > existing.startTime.
Gli intervalli sono [inizio, fine): fasce adiacenti sono ammesse. La suite copre
uguaglianza, sovrapposizioni da entrambi i lati, contenimento in entrambe le
direzioni, impianti diversi e date diverse.

## Esecuzione e stato

Eseguire npm ci e npm test. Ogni nuovo test crea il database SQLite :memory:
con initializeDatabase, usa un server su porta casuale e chiude entrambi.
Non vengono creati file SQLite e non si simula l'API con mock.
I test esistenti rimangono invariati. I nuovi test sono intenzionalmente attivi
e falliscono finché POST /bookings non viene implementata: non saltarli per
rendere verde la suite. Nessuna modifica al package-lock è necessaria.

## Requisiti da decidere

- Approvazione di endpoint, nomi dei campi, schema delle risposte e codici HTTP.
- Identità del prenotante, autenticazione, autorizzazioni e dati obbligatori.
- Fuso orario del centro e gestione dell'ora legale.
- Date passate, anticipo minimo e orizzonte massimo prenotabile.
- Orari di apertura, durata minima/massima, granularità delle fasce e mezzanotte.
- Conferma della regola di esclusività per impianto e delle fasce adiacenti.
- Stati (in attesa/confermata/annullata), cancellazione e modifica: quali occupano spazio.
- Elenco/dettaglio prenotazioni e relativo trattamento degli ID inesistenti:
  oggi il solo ID riferibile al modello esistente è quello dell'impianto.
- Campi sconosciuti, JSON malformato e Content-Type non supportato.
- Persistenza definitiva, migrazioni, idempotenza e protezione atomica dai conflitti
  fra richieste concorrenti/processi: i test sequenziali non ne provano la sicurezza.

Dopo tali decisioni aggiornare il contratto e aggiungere i test corrispondenti.
