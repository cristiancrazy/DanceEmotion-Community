import express from 'express'; // Import express for routing
import createError from 'http-errors'; // Import createError for error handling
import db from '../db.mjs'; // Import database module
import validator from 'express-validator'; // Import validator for input validation
import flash from 'connect-flash'; // Import flash for flash messages
import multer from 'multer'; // Import multer for handling file uploads
import sharp from 'sharp'; // Import sharp for image processing
import fs, { appendFile } from 'fs'; // Import fs for file system operations
import CalendarFormatter from '../calendar-formatter.mjs'; // Import the CalendarFormatter module
import path from 'path'; // Import path for handling file paths

const router = express.Router();

// USEFUL CONSTANTS
const LivelloCorsi = ['Principiante', 'Intermedio', 'Avanzato', 'Open', 'Personalizzato'];
const TipiCorsi = ['Periodica', 'Singola', 'Privata'];
const CategoriaCorso = [
    'Urban', 'Latino & Caraibico', 'Classico & Moderno', 'Coreografico',
    'Social & Swing', 'Gruppo & Fitness', 'Danze Orientali & Etniche',
    'Folklore & Tradizione', 'Teatrale & Performativo', 'Acrobatico & Espressivo'
];
const Regions = ['Lazio', 'Campania', 'Sicilia', 'Lombardia', 'Piemonte', 'Emilia Romagna', 'Toscana', 'Liguria', 'Marche', 'Abruzzo', 'Umbria', 'Calabria', 'Basilicata', 'Puglia', 'Molise', 'Sardegna', 'Friuli Venezia Giulia', 'Trentino Alto Adige', 'Valle d\'Aosta'];
const BookingStatus = ['Richiesta', 'Accettata', 'Rifiutata', 'Terminata'];

/* GET dancers profile page */
router.get('/', async function(req, res, next) {
    if(!req.isAuthenticated()) {
        return res.redirect('/accesso'); // Redirect to login if not authenticated
    }

    // Render the dancers profile page
    if (req.user.IDBallerino) {
        // Fetch users useful data if available
        let database = null;
        let preferred = null;
        let courses = null;
        let events = null;
        let calendarFormatter = new CalendarFormatter();
        let calendarCourses = [];
        let attachments = null;
        let notification = null;
        try{
            database = new db();
            // Fetch preferred schools for the user
            preferred = await database.fetchPreferredSchools(req.user.IDBallerino);
            // Fetch courses for the user
            courses = await database.fetchBookedCourses(req.user.IDBallerino);
            // Fetch events for the user
            events = await database.fetchBookedEvents(req.user.IDBallerino);
            // Fetch calendar courses for the user
            calendarCourses = await calendarFormatter.fetchCoursesForUser(req.user.IDBallerino);
            // Fetch attachments for the user's courses
            attachments = await database.fetchAttachmentsByDancer(req.user.IDBallerino);
            // Fetch notifications for the user
            notification = await database.fetchUserNotifications(req.user.IDBallerino);
        }catch (error) {
            console.error('Error fetching data:', error);
            return next(createError(500, 'Errore durante il recupero delle informazioni'));
        }finally {
            database.close();
        }

        res.render('dancers/profilo-utente', { user: req.user, preferred: preferred, bookedEvents: events, bookedCourses: courses, calendarCourses: calendarCourses, attachments: attachments, notification: notification, success: req.flash('success'), error: req.flash('error') });
    } else if (req.user.IDScuola) {
        // Fetch schools useful data if available
        let database = null;
        let courses = null;
        let events = null;
        let bookedCoursesDetails = null;
        let bookedEventsDetails = null;
        let coursesFeedback = null;
        let calendarFormatter = new CalendarFormatter();
        let calendarCourses = [];
        let attachments = null;
        try {
            database = new db();
            // Fetch courses for the school
            courses = await database.fetchSchoolCourses(req.user.IDScuola);
            // Fetch events for the school
            events = await database.fetchSchoolEvents(req.user.IDScuola);
            // Fetch booked courses for the school and booked events
            bookedCoursesDetails = await database.fetchCourseBookingsDetailsBySchool(req.user.IDScuola);
            bookedEventsDetails = await database.fetchEventBookingsDetailsBySchool(req.user.IDScuola);
            // Fetch and format courses for the calendar
            calendarCourses = await calendarFormatter.fetchCoursesForSchool(req.user.IDScuola);
            // Fetch feedback for courses
            coursesFeedback = await database.fetchFeedbackBySchool(req.user.IDScuola);
            // Fetch attachments for courses
            attachments = await database.fetchAttachmentsBySchool(req.user.IDScuola);
        } catch (error) {
            console.error('Error fetching courses:', error);
            return next(createError(500, 'Errore durante il recupero delle informazioni'));
        } finally {
            database.close();
        }

        res.render('schools/profilo-scuola', { user: req.user, courses: courses, events: events, calendarCourses: calendarCourses, bookedCoursesDetails: bookedCoursesDetails, bookedEventsDetails: bookedEventsDetails, coursesFeedback: coursesFeedback, attachments: attachments, success: req.flash('success'), error: req.flash('error') });
    } else {
        // Unauthorized access
        next(createError(401, 'Accesso non autorizzato'));
    }
});

/* ===================== DANCER PROFILE ==================== */

const dancerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './upload/dancer/'); // Set the destination for dancer photos
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original file name
    }
});

const dancerUpload = multer({ storage: dancerStorage });

// Modify the dancer profile
router.post('/modifica-ballerino', [
    validator.body('nome').notEmpty().withMessage('Il nome del ballerino è obbligatorio.'),
    validator.body('cognome').notEmpty().withMessage('Il cognome del ballerino è obbligatorio.'),
    validator.body('email').isEmail().withMessage('L\'email del ballerino deve essere valida.'),
    validator.body('dataNascita').isISO8601().withMessage('La data di nascita del ballerino deve essere valida.'),
    validator.body('telefono').isMobilePhone().withMessage('Il numero di telefono deve essere valido.'),
    validator.body('password').optional({values: 'falsy'}).isLength({ min: 6 }).withMessage('La password deve essere di almeno 6 caratteri.')
], async function(req, res, next) {
    // Check if the user is authenticated and has a dancer ID
    if(!req.isAuthenticated() || !req.user.IDBallerino) {
        return next(createError(401, 'Accesso non autorizzato'));
    }

    // Validate the request body
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }

    // Extract data from the request body
    const { nome, cognome, email, dataNascita, telefono, password } = req.body;

    // Update the dancer's profile in the database
    let database = null;
    try {
        database = new db();
        await database.updateDancerProfile(req.user.IDBallerino, nome, cognome, email, telefono, dataNascita, password);
        req.flash('success', 'Profilo del ballerino aggiornato con successo!');
    } catch (error) {
        console.error('Error updating dancer profile:', error);
        req.flash('error', 'Errore durante l\'aggiornamento del profilo del ballerino');
    } finally {
        database.close();
    }

    // Redirect to the profile page after update
    res.redirect('/profilo');
});

// Modify the dancer's photo
router.post('/modifica-foto-ballerino', dancerUpload.single('fotoBallerino'), async function(req, res, next) {
    // Check if the user is authenticated and has a dancer ID
    if(!req.isAuthenticated() || !req.user.IDBallerino) {
        return next(createError(401, 'Accesso non autorizzato'));
    }
    // Check if a file was uploaded
    if (!req.file) {
        req.flash('error', 'Nessun file caricato.');
        return res.redirect('/profilo');
    }
    // Validate the uploaded file
    if (!req.file.mimetype.startsWith('image/')) {
        req.flash('error', 'Il file caricato non è un\'immagine valida.');
        return res.redirect('/profilo');
    }
    // Process the image using sharp
    try {
        // Convert image to WebP format with quality 80
        const processedImage = await sharp(req.file.path).resize(
            {
                width: 500,
                height: 500,
                fit: sharp.fit.contain, // Maintain aspect ratio
                position: 'center' // Center the image
            } // Resize to 500x500 pixels
        ).webp({ quality: 85 }).toBuffer();
        // Save the processed image back to the file system
        await sharp(processedImage).toFile('./public/dancer/' + req.user.IDBallerino + '.webp');
        // Delete the original uploaded file
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('Error deleting original file:', err);
                req.flash('error', 'Errore durante l\'eliminazione del file originale.');
            }
        });
        // Update the dancer's photo in the database
        let database = null;
        try {
            database = new db();
            await database.updateDancerPhoto(req.user.IDBallerino, '/dancer/' + req.user.IDBallerino + '.webp');
            req.flash('success', 'Foto del ballerino aggiornata con successo!');
        } catch (error) {
            console.error('Error updating dancer photo:', error);
            req.flash('error', 'Errore durante l\'aggiornamento della foto del ballerino');
        } finally {
            database.close();
        }
        // Redirect to the profile page after upload
        res.redirect('/profilo');
    } catch (error) {
        console.error('Error processing image:', error);
        req.flash('error', 'Errore durante l\'elaborazione dell\'immagine: ' + error.message);
        res.redirect('/profilo');
    }
});

// Delete dancer profile
router.post('/elimina-ballerino', async function(req, res, next) {
    // Check if the user is authenticated and has a dancer ID
    if(!req.isAuthenticated() || !req.user.IDBallerino) {
        return next(createError(401, 'Accesso non autorizzato'));
    }
    // Get the dancer ID from the request body
    const { IDBallerino } = req.body;
    // Validate the dancer ID
    if(req.user.IDBallerino != IDBallerino) {
        req.flash('error', 'ID del ballerino non valido.');
        return res.redirect('/profilo');
    }
    // Delete the dancer profile from the database
    let database = null;
    try {
        database = new db();
        await database.deleteDancer(IDBallerino);
        req.flash('success', 'Profilo del ballerino eliminato con successo!');
        // Logout the user after deleting the school profile
        req.logout((err) => {
            if (err) {
                console.error('Error logging out:', err);
            }
            return res.redirect('/');
        });
    } catch (error) {
        console.error('Error deleting dancer profile:', error);
        req.flash('error', 'Errore durante l\'eliminazione del profilo del ballerino');
        return res.redirect('/');
    } finally {
        database.close();
    }
});

// Delete dancer subscription to a course
router.post('/elimina-iscrizione', [
    validator.body('IDIscrizione').notEmpty().withMessage('L\'ID dell\'iscrizione è obbligatorio.')
], async function(req, res, next) {
    // Check if the user is authenticated and has a dancer ID
    if(!req.isAuthenticated() || !req.user.IDBallerino) {
        return next(createError(401, 'Accesso non autorizzato'));
    }

    // Validate the request body
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }

    const { IDIscrizione } = req.body;

    // Delete the subscription from the database
    let database = null;
    try {
        database = new db();

        // Check if the dancer has the ownership of the subscription
        let subscriptions = await database.fetchBookedCourses(req.user.IDBallerino);
        if (!subscriptions || subscriptions.length === 0 || !subscriptions.some(s => s.IDIscrizione == IDIscrizione)) {
            req.flash('error', 'Non puoi eliminare un\'iscrizione che non ti appartiene.');
            return res.redirect('/profilo');
        }

        // Proceed to delete the subscription
        await database.cancelCourseBooking(IDIscrizione);
        req.flash('success', 'Iscrizione eliminata con successo!');
    } catch (error) {
        console.error('Error deleting subscription:', error);
        req.flash('error', 'Errore durante l\'eliminazione dell\'iscrizione');
    } finally {
        database.close();
    }

    // Redirect to the profile page after deletion
    res.redirect('/profilo');
});

// Delete dancer booking for an event
router.post('/elimina-prenotazione', [
    validator.body('IDPrenotazione').notEmpty().withMessage('L\'ID della prenotazione è obbligatorio.')
], async function(req, res, next) {
    // Check if the user is authenticated and has a dancer ID
    if(!req.isAuthenticated() || !req.user.IDBallerino) {
        return next(createError(401, 'Accesso non autorizzato'));
    }
    // Validate the request body
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }
    const { IDPrenotazione } = req.body;
    // Delete the booking from the database
    let database = null;
    try {
        database = new db();

        // Check if the dancer has the ownership of the booking
        let bookings = await database.fetchBookedEvents(req.user.IDBallerino);
        if (!bookings || bookings.length === 0 || !bookings.some(b => b.IDPrenotazione == IDPrenotazione)) {
            req.flash('error', 'Non puoi eliminare una prenotazione che non ti appartiene.');
            return res.redirect('/profilo');
        }

        // Proceed to delete the booking
        await database.cancelEventBooking(IDPrenotazione);
        req.flash('success', 'Prenotazione eliminata con successo!');
    } catch (error) {
        console.error('Error deleting booking:', error);
        req.flash('error', 'Errore durante l\'eliminazione della prenotazione');
    } finally {
        database.close();
    }

    // Redirect to the profile page after deletion
    res.redirect('/profilo');
});

// Create a new review for a course
router.post('/nuova-recensione', [
    validator.body('IDCorso').notEmpty().withMessage('L\'ID del corso è obbligatorio.'),
    validator.body('Valutazione').isInt({ min: 1, max: 5 }).withMessage('La valutazione deve essere un numero tra 1 e 5.'),
    validator.body('Corpo').notEmpty().withMessage('Il commento è obbligatorio.')
], async function(req, res, next) {
    // Check if the user is authenticated and has a dancer ID
    if(!req.isAuthenticated() || !req.user.IDBallerino) {
        return next(createError(401, 'Accesso non autorizzato'));
    }
    // Validate the request body
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }
    // Extract data from the request body
    const { IDCorso, Valutazione, Corpo } = req.body;
    // Create a new review in the database
    let database = null;
    try {
        database = new db();

        // Check if the dancer has booked the course
        let subscriptions = await database.fetchBookedCourses(req.user.IDBallerino);
        if (!subscriptions || subscriptions.length === 0 || !subscriptions.some(s => s.IDCorso == IDCorso)) {
            req.flash('error', 'Non puoi inviare una recensione per un corso che non hai prenotato.');
            return res.redirect('/profilo');
        }

        await database.createFeedback(req.user.IDBallerino, IDCorso, Valutazione, Corpo);
        req.flash('success', 'Recensione inviata con successo!');
    } catch (error) {
        console.error('Error creating review:', error);
        req.flash('error', 'Errore durante l\'invio della recensione: ' + error.error);
    } finally {
        database.close();
    }
    // Redirect to the profile page after submission
    res.redirect('/profilo');
});

// Download an attachment
router.get('/download-allegato/:idAllegato', [
    validator.param('idAllegato').isInt().withMessage('ID dell\'allegato non valido') // Validate that the attachment ID is an integer
], async function(req, res, next) {
    // Check if the user is authenticated and has a dancer ID
    if(!req.isAuthenticated() || !req.user.IDBallerino) {
        return next(createError(401, 'Accesso non autorizzato'));
    }

    // Validate the request parameters
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }

    // Get the attachment details
    let database = null;
    try {
        database = new db();
        let attachment = await database.fetchAttachmentsByDancer(req.user.IDBallerino);
        // Check if the attachment exists
        if (!attachment || attachment.length === 0) {
            req.flash('error', 'Allegato non trovato.');
            return res.redirect('/profilo');
        }

        // Check provided attachment
        if(attachment.filter(a => a.IDAllegato == req.params.idAllegato).length === 0) {
            req.flash('error', 'Allegato non trovato.');
            return res.redirect('/profilo');
        }

        let filePath = attachment.filter(a => a.IDAllegato == req.params.idAllegato)[0].Percorso;
        if(filePath == null || filePath == undefined) {
            req.flash('error', 'Percorso dell\'allegato non trovato.');
            return res.redirect('/profilo');
        }
        
        // Send the file for download
        res.download(filePath, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                req.flash('error', 'Errore durante il download dell\'allegato.');
            }
        });
    } catch (error) {
        console.error('Error fetching attachment:', error);
        req.flash('error', 'Errore durante il recupero dell\'allegato');
    } finally {
        if(database)
            database.close();
    }
});

/* ==================== SCHOOL PROFILE ==================== */

const schoolStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './upload/school/'); // Set the destination for school photos
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original file name
    }
});

const schoolUpload = multer({ storage: schoolStorage });

// Create a new event
router.post('/crea-evento', schoolUpload.single('locandinaEvento'), [
    validator.body('nomeEvento').notEmpty().withMessage('Il nome dell\'evento è obbligatorio.'),
    validator.body('descrizioneEvento').notEmpty().withMessage('La descrizione dell\'evento è obbligatoria.'),
    validator.body('luogoEvento').notEmpty().withMessage('Il luogo dell\'evento è obbligatorio.'),
    validator.body('prezzoEvento').isNumeric().withMessage('Il prezzo dell\'evento deve essere un numero.'),
    validator.body('dataOraEvento').isISO8601().withMessage('La data e ora dell\'evento devono essere valide.')
], async function(req, res, next) {
    // Check if the user is authenticated and has a school ID
    if(!req.isAuthenticated() || !req.user.IDScuola) {
        return next(createError(401, 'Accesso non autorizzato'));
    }

    // Validate the request body
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }

    const { nomeEvento, descrizioneEvento, luogoEvento, prezzoEvento, dataOraEvento } = req.body;

    // Check if a file was uploaded
    let file = req.file?.path || null;

    // Management without file
    if(!file){
        // Create a new event in the database
        let database = null;
        try {
            database = new db();
            await database.createEvent(nomeEvento, descrizioneEvento, luogoEvento,
                prezzoEvento, new Date(dataOraEvento), req.user.IDScuola);
            req.flash('success', 'Evento creato con successo, senza locandina!');
            // Notification: new event created without poster
            await database.newNotification(req.user.IDScuola, null, 'Evento', "La scuola ha creato un nuovo evento: " + nomeEvento);
        } catch (error) {
            console.error('Error creating event:', error);
            req.flash('error', 'Errore durante la creazione dell\'evento');
        } finally {
            database.close();
        }
        return res.redirect('/profilo');
    } else {
        // Validate the uploaded file
        if (!req.file.mimetype.startsWith('image/')) {
            req.flash('error', 'Il file caricato non è un\'immagine valida.');
            return res.redirect('/profilo');
        }

        // Process the image using sharp
        try {
            // Convert image to WebP format with quality 80
            const processedImage = await sharp(req.file.path).resize(
                {
                    width: 1500, 
                    height: 2100, 
                    fit: sharp.fit.contain, // Maintain aspect ratio
                    position: 'center'
                } // Resize to 1500x2100 pixels
            ).webp({ quality: 85 }).toBuffer();

            // Create a new event in the database
            let database = null;
            try {
                database = new db();
                const result = await database.createEvent(nomeEvento, descrizioneEvento, luogoEvento,
                    prezzoEvento, new Date(dataOraEvento), req.user.IDScuola);
                // Use the returned ID if needed
                console.log('Event created with ID:', result.id);
                
                // Save the processed image back to the file system
                await sharp(processedImage).toFile('./public/images/locandina-' + result.id + '.webp');

                // Delete the original uploaded file
                fs.unlink(req.file.path, (err) => {
                    if (err) {
                        console.error('Error deleting original file:', err);
                        req.flash('error', 'Errore durante l\'eliminazione del file originale.');
                    }
                });

                database.updateEventPoster(result.id, '/images/locandina-' + result.id + '.webp');
                req.flash('success', 'Evento creato con successo!');

                // Notification: new event created with poster
                await database.newNotification(req.user.IDScuola, null, 'Evento', "La scuola ha creato un nuovo evento: " + nomeEvento);
            } catch (error) {
                console.error('Error creating event:', error);
                req.flash('error', 'Errore durante la creazione dell\'evento');
            } finally {
                database.close();
            }
            // Redirect to the profile page after upload
            res.redirect('/profilo');
        } catch (error) {
            console.error('Error processing image:', error);
            req.flash('error', 'Errore durante l\'elaborazione dell\'immagine: ' + error.message);
            res.redirect('/profilo');
        }
    }
});

// Modify the school's profile details
router.post('/modifica-scuola', [
    validator.body('nome').notEmpty().withMessage('Il nome della scuola è obbligatorio.'),
    validator.body('telefono').isMobilePhone().withMessage('Il numero di telefono deve essere valido.'),
    validator.body('email').isEmail().withMessage('L\'email della scuola deve essere valida.'),
    validator.body('indirizzo').notEmpty().withMessage('L\'indirizzo della scuola è obbligatorio.'),
    validator.body('citta').notEmpty().withMessage('La città della scuola è obbligatoria.'),
    validator.body('provincia').notEmpty().withMessage('La provincia della scuola è obbligatoria.'),
    validator.body('cap').isPostalCode('IT').withMessage('Il CAP della scuola deve essere valido.'),
    validator.body('regione').notEmpty().isIn(Regions).withMessage('La regione della scuola non è valida.'),
    validator.body('password').optional({values: 'falsy'}).isLength({ min: 6 }).withMessage('La password deve essere di almeno 6 caratteri.')
], async function(req, res, next) {
    // Check if the user is authenticated and has a school ID
    if(!req.isAuthenticated() || !req.user.IDScuola) {
        return next(createError(401, 'Accesso non autorizzato'));
    }
    // Validate the request body
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }
    // Extract data from the request body
    const { nome, telefono, email, indirizzo, citta, provincia, cap, regione, password } = req.body;
    // Update the school's profile in the database
    let database = null;
    try {
        database = new db();
        await database.updateSchoolProfile(req.user.IDScuola, nome, email, telefono, indirizzo, citta, cap, provincia, regione, password);
        req.flash('success', 'Profilo della scuola aggiornato con successo!');
    } catch (error) {
        console.error('Error updating school profile:', error);
        req.flash('error', 'Errore durante l\'aggiornamento del profilo della scuola');
    } finally {
        database.close();
    }
    // Redirect to the profile page after update
    res.redirect('/profilo');
});
    
// Modify the school's photo
router.post('/modifica-foto-scuola', schoolUpload.single('fotoScuola'), async function(req, res, next) {
    // Check if the user is authenticated and has a school ID
    if(!req.isAuthenticated() || !req.user.IDScuola) {
        return next(createError(401, 'Accesso non autorizzato'));
    }
    // Check if a file was uploaded
    if (!req.file) {
        req.flash('error', 'Nessun file caricato.');
        return res.redirect('/profilo');
    }
    // Validate the uploaded file
    if (!req.file.mimetype.startsWith('image/')) {
        req.flash('error', 'Il file caricato non è un\'immagine valida.');
        return res.redirect('/profilo');
    }

    // Process the image using sharp
    try {
        // Convert image to WebP format with quality 80
        const processedImage = await sharp(req.file.path).resize(
            {
                width: 500, 
                height: 500, 
                fit: sharp.fit.contain, // Maintain aspect ratio
                position: 'center' 
            } // Resize to 500x500 pixels
        ).webp({ quality: 85 }).toBuffer();

        // Save the processed image back to the file system
        await sharp(processedImage).toFile('./public/school/' + req.user.IDScuola + '.webp');

        // Delete the original uploaded file
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('Error deleting original file:', err);
                req.flash('error', 'Errore durante l\'eliminazione del file originale.');
            }
        });

        // Update the school's photo in the database
        let database = null;
        try {
            database = new db();
            await database.updateSchoolPhoto(req.user.IDScuola, '/school/' + req.user.IDScuola + '.webp');
            req.flash('success', 'Foto della scuola aggiornata con successo!');
        } catch (error) {
            console.error('Error updating school photo:', error);
            req.flash('error', 'Errore durante l\'aggiornamento della foto della scuola');
        } finally {
            database.close();
        }
        // Redirect to the profile page after upload
        res.redirect('/profilo');
    }catch (error) {
        console.error('Error processing image:', error);
        req.flash('error', 'Errore durante l\'elaborazione dell\'immagine: ' + error.message);
        res.redirect('/profilo');
    }
});

// Create a new course
router.post('/nuovo-corso', [
    validator.body('Nome').notEmpty().withMessage('Il nome del corso è obbligatorio.'),
    validator.body('Istruttore').notEmpty().withMessage('L\'istruttore del corso è obbligatorio.'),
    validator.body('Tipologia').isIn(TipiCorsi).withMessage('Tipo di corso non valido.'),
    validator.body('Livello').isIn(LivelloCorsi).withMessage('Livello del corso non valido.'),
    validator.body('Prezzo').isNumeric().withMessage('Il prezzo del corso deve essere un numero.'),
    validator.body('DateInizio').optional().isISO8601().withMessage('La data di inizio del corso deve essere valida.'),
    validator.body('DateFine').optional().isISO8601().withMessage('La data di fine del corso deve essere valida.'),
    validator.body('OrarioInizio').optional().isTime().withMessage('L\'orario di inizio del corso deve essere valido.'),
    validator.body('OrarioFine').optional().isTime().withMessage('L\'orario di fine del corso deve essere valido.'),
    validator.body('Categoria').isIn(CategoriaCorso).withMessage('Categoria del corso non valida.')
], async function(req, res, next) {
    // Check if the user is authenticated and has a school ID
    if(!req.isAuthenticated() || !req.user.IDScuola) {
        return next(createError(401, 'Accesso non autorizzato'));
    }

    // Validate the request body
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        // If there are validation errors, redirect back with error messages
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }
    
    // Extract course data from the request body
    const {
        Nome, Istruttore, Tipologia, Livello, Prezzo,
        DateInizio, DateFine, OrarioInizio, OrarioFine, Categoria
    } = req.body;

    // Others validations
    if(DateInizio) {
        const now = new Date();
        if(new Date(DateInizio) < now) { // Ensure start date is not in the past
            req.flash('error', 'La data di inizio non può essere nel passato.');
            return res.redirect('/profilo');
        }
    }


    if(DateInizio && DateFine){ // Check if both dates are provided
        if(new Date(DateInizio) > new Date(DateFine)) { // Ensure start date is not after end date
            req.flash('error', 'La data di inizio non può essere successiva alla data di fine.');
            return res.redirect('/profilo');
        }
    }   
    // Ensure OrarioInizio and OrarioFine are provided for periodic or single courses
    if((Tipologia === 'Periodica' || Tipologia === 'Singola') && (!OrarioInizio || !OrarioFine)) {
        // Ensure OrarioInizio and OrarioFine are provided for periodic or single courses
        req.flash('error', 'Orari di inizio e fine sono obbligatori per i corsi periodici o singoli.');
        return res.redirect('/profilo');
    }

    if(OrarioInizio && OrarioFine) { // Validate time format
        const baseDate = '2000-01-01'; // Dummy date for time validation

        const inizio = new Date(`${baseDate}T${OrarioInizio}:00`);
        const fine = new Date(`${baseDate}T${OrarioFine}:00`);
        // Ensure OrarioInizio is before OrarioFine
        if (inizio.getTime() >= fine.getTime()) {
            req.flash('error', "L'orario di inizio non può essere successivo o uguale all'orario di fine.");
            return res.redirect('/profilo');
        }
    }

    // Create a new course
    let database = null;
    try {
        database = new db();
        await database.createCourse(Nome, Istruttore, Tipologia, Livello, Prezzo,
            DateInizio, DateFine, OrarioInizio, OrarioFine, Categoria,
            req.user.IDScuola);
        req.flash('success', 'Corso creato con successo!');
        // Notification: new course created
        await database.newNotification(req.user.IDScuola, null, 'Corso', "La scuola ha creato un nuovo corso: " + Nome);
    } catch (error) {
        console.error('Error creating course:', error);
        req.flash('error', 'Errore durante la creazione del corso');
    } finally {
        database.close();
    }

    // Redirect to the user profile page
    res.redirect('/profilo');
});

// Modify an existing course
router.post('/modifica-corso', [
    validator.body('idCorsoMod').notEmpty().withMessage('ID del corso da modificare è obbligatorio.'),
    validator.body('nomeCorsoMod').notEmpty().withMessage('Il nome del corso è obbligatorio.'),
    validator.body('istruttoreMod').notEmpty().withMessage('L\'istruttore del corso è obbligatorio.'),
    validator.body('tipologiaMod').isIn(TipiCorsi).withMessage('Tipo di corso non valido.'),
    validator.body('livelloMod').isIn(LivelloCorsi).withMessage('Livello del corso non valido.'),
    validator.body('prezzoMod').isNumeric().withMessage('Il prezzo del corso deve essere un numero.'),
    validator.body('dataInizioMod').optional().isISO8601().withMessage('La data di inizio del corso deve essere valida.'),
    validator.body('dataFineMod').optional().isISO8601().withMessage('La data di fine del corso deve essere valida.'),
    validator.body('orarioInizioMod').optional().isTime().withMessage('L\'orario di inizio del corso deve essere valido.'),
    validator.body('orarioFineMod').optional().isTime().withMessage('L\'orario di fine del corso deve essere valido.'),
    validator.body('categoriaMod').isIn(CategoriaCorso).withMessage('Categoria del corso non valida.'),
], async function(req, res, next) {
    // Check if the user is authenticated and has a school ID
    if(!req.isAuthenticated() || !req.user.IDScuola) {
        return next(createError(401, 'Accesso non autorizzato'));
    }

    // Validate the request body
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }

    // Extract course data from the request body
    const {
        idCorsoMod, nomeCorsoMod, istruttoreMod, tipologiaMod, livelloMod,
        prezzoMod, dataInizioMod, dataFineMod, orarioInizioMod, orarioFineMod, categoriaMod
    } = req.body;

    // Validate dates and times
    if(dataInizioMod) {
        const now = new Date();
        if(new Date(dataInizioMod) < now) { // Ensure start date is not in the past
            req.flash('error', 'La data di inizio non può essere nel passato.');
            return res.redirect('/profilo');
        }
    }

    if(dataInizioMod && dataFineMod){ // Check if both dates are provided
        if(new Date(dataInizioMod) > new Date(dataFineMod)) { // Ensure start date is not after end date
            req.flash('error', 'La data di inizio non può essere successiva alla data di fine.');
            return res.redirect('/profilo');
        }
    }   

    if(orarioInizioMod && orarioFineMod) { // Validate time format
        const baseDate = '2000-01-01'; // Dummy date for time validation

        const inizio = new Date(`${baseDate}T${orarioInizioMod}:00`);
        const fine = new Date(`${baseDate}T${orarioFineMod}:00`);
        // Ensure OrarioInizio is before OrarioFine
        if (inizio.getTime() >= fine.getTime()) {
            req.flash('error', "L'orario di inizio non può essere successivo o uguale all'orario di fine.");
            return res.redirect('/profilo');
        }
    }

    // Update the course
    let database = null;
    try {
        database = new db();

        // Check if the school has the ownership of the course
        let course = await database.fetchSchoolCourses(req.user.IDScuola);
        if (!course || course.length === 0 || !course.some(c => c.IDCorso == idCorsoMod)) {
            req.flash('error', 'Non puoi modificare un corso che non ti appartiene.');
            return res.redirect('/profilo');
        }

        await database.updateCourse(idCorsoMod, req.user.IDScuola, nomeCorsoMod, istruttoreMod, tipologiaMod, livelloMod,
            prezzoMod, dataInizioMod, dataFineMod, orarioInizioMod, orarioFineMod, categoriaMod);
        req.flash('success', 'Corso modificato con successo!');
        res.redirect('/profilo');
    } catch (error) {
        console.error('Error updating course:', error);
        req.flash('error', 'Errore durante la modifica del corso');
        res.redirect('/profilo');
    }
    finally {
        database.close();
    }
});

// Modify the school's description
router.post('/modifica-descrizione-scuola', [
    validator.body('Descrizione').notEmpty().withMessage('La descrizione della scuola è obbligatoria.')
], async function(req, res, next) {
    // Check if the user is authenticated and has a school ID
    if(!req.isAuthenticated() || !req.user.IDScuola) {
        return next(createError(401, 'Accesso non autorizzato'));
    }

    // Validate the request body
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }

    // Update the school's description
    const { Descrizione } = req.body;
    let database = null;
    try {
        database = new db();
        await database.updateSchoolDescription(req.user.IDScuola, Descrizione);
        req.flash('success', 'Descrizione della scuola aggiornata con successo!');
    } catch (error) {
        console.error('Error updating school description:', error);
        req.flash('error', 'Errore durante l\'aggiornamento della descrizione della scuola');
    } finally {
        database.close();
    }

    // Redirect to the user profile page
    res.redirect('/profilo');
});

// Delete a course
router.post('/elimina-corso', [
    validator.body('courseID').notEmpty().withMessage('ID del corso da eliminare è obbligatorio.')
], async function(req, res, next) {
    // Check if the user is authenticated and has a school ID
    if(!req.isAuthenticated() || !req.user.IDScuola) {
        return next(createError(401, 'Accesso non autorizzato'));
    }

    // Validate the request body
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }

    // Extract course ID from the request body
    const { courseID } = req.body;

    // Delete the course
    let database = null;
    try {
        database = new db();

        // Check if the school has the ownership of the course
        let course = await database.fetchSchoolCourses(req.user.IDScuola);
        if (!course || course.length === 0 || !course.some(c => c.IDCorso == courseID)) {
            req.flash('error', 'Non puoi eliminare un corso che non ti appartiene.');
            return res.redirect('/profilo');
        }

        await database.deleteCourse(courseID, req.user.IDScuola);
        req.flash('success', 'Corso eliminato con successo!');
    } catch (error) {
        console.error('Error deleting course:', error);
        req.flash('error', 'Errore durante l\'eliminazione del corso');
    } finally {
        database.close();
    }

    // Redirect to the user profile page
    res.redirect('/profilo');
});

// Modify an existing event
router.post('/modifica-evento', schoolUpload.single('locandinaEventoMod'), [
    validator.body('IDEventoMod').notEmpty().withMessage('ID dell\'evento da modificare è obbligatorio.'),
    validator.body('nomeEventoMod').notEmpty().withMessage('Il nome dell\'evento è obbligatorio.'),
    validator.body('descrizioneEventoMod').notEmpty().withMessage('La descrizione dell\'evento è obbligatoria.'),
    validator.body('luogoEventoMod').notEmpty().withMessage('Il luogo dell\'evento è obbligatorio.'),
    validator.body('prezzoEventoMod').isNumeric().withMessage('Il prezzo dell\'evento deve essere un numero.'),
    validator.body('dataOraEventoMod').isISO8601().withMessage('La data e ora dell\'evento devono essere valide.')
], async function(req, res, next) {
    // Check if the user is authenticated and has a school ID
    if(!req.isAuthenticated() || !req.user.IDScuola) {
        return next(createError(401, 'Accesso non autorizzato'));
    }
    // Validate the request body
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }
    // Extract event data from the request body
    const { IDEventoMod, nomeEventoMod, descrizioneEventoMod, luogoEventoMod, prezzoEventoMod, dataOraEventoMod } = req.body;
    console.log('Modifica evento:', IDEventoMod, nomeEventoMod, descrizioneEventoMod, luogoEventoMod, prezzoEventoMod, dataOraEventoMod);

    // Check if a file was uploaded
    let file = req.file?.path || null;

    // Management without file
    if(!file){
        // Create a new event in the database
        let database = null;
        try {
            database = new db();
            await database.updateEvent(IDEventoMod, nomeEventoMod, descrizioneEventoMod, luogoEventoMod, prezzoEventoMod, new Date(dataOraEventoMod));

            // Check if the school has the ownership of the event
            let events = await database.fetchSchoolEvents(req.user.IDScuola);
            if (!events || events.length === 0 || !events.some(e => e.IDEvento == IDEventoMod)) {
                req.flash('error', 'Non puoi modificare un evento che non ti appartiene.');
                return res.redirect('/profilo');
            }
            
            req.flash('success', 'Evento modificato con successo (locandina invariata)!');
        } catch (error) {
            console.error('Error modifying event:', error);
            req.flash('error', 'Errore durante la modifica dell\'evento');
        } finally {
            database.close();
        }
        return res.redirect('/profilo');
    } else {
        // Validate the uploaded file
        if (!req.file.mimetype.startsWith('image/')) {
            req.flash('error', 'Il file caricato non è un\'immagine valida.');
            return res.redirect('/profilo');
        }

        // Process the image using sharp
        try {
            // Convert image to WebP format with quality 80
            const processedImage = await sharp(req.file.path).resize(
                {
                    width: 1500, 
                    height: 2100, 
                    fit: sharp.fit.contain, // Maintain aspect ratio
                    position: 'center'
                } // Resize to 1500x2100 pixels
            ).webp({ quality: 85 }).toBuffer();

            // Create a new event in the database
            let database = null;
            try {
                database = new db();

                // Check if the school has the ownership of the event
                let events = await database.fetchSchoolEvents(req.user.IDScuola);
                if (!events || events.length === 0 || !events.some(e => e.IDEvento == IDEventoMod)) {
                    req.flash('error', 'Non puoi modificare un evento che non ti appartiene.');
                    return res.redirect('/profilo');
                }

                await database.updateEvent(IDEventoMod, nomeEventoMod, descrizioneEventoMod, luogoEventoMod, prezzoEventoMod, new Date(dataOraEventoMod));
                // Save the processed image back to the file system
                await sharp(processedImage).toFile('./public/images/locandina-' + IDEventoMod + '.webp');

                // Delete the original uploaded file
                fs.unlink(req.file.path, (err) => {
                    if (err) {
                        console.error('Error deleting original file:', err);
                        req.flash('error', 'Errore durante l\'eliminazione del file originale.');
                    }
                });

                await database.updateEventPoster(IDEventoMod, '/images/locandina-' + IDEventoMod + '.webp');
                req.flash('success', 'Evento modificato con successo!');
            } catch (error) {
                console.error('Error modifying event:', error);
                req.flash('error', 'Errore durante la modifica dell\'evento');
            } finally {
                database.close();
            }
            // Redirect to the profile page after upload
            res.redirect('/profilo');
        } catch (error) {
            console.error('Error processing image:', error);
            req.flash('error', 'Errore durante l\'elaborazione dell\'immagine: ' + error.message);
            res.redirect('/profilo');
        }
    }
});

// Delete an event
router.post('/elimina-evento', [
    validator.body('IDEvento').notEmpty().withMessage('ID dell\'evento da eliminare è obbligatorio.')
], async function(req, res, next) {
    // Check if the user is authenticated and has a school ID
    if(!req.isAuthenticated() || !req.user.IDScuola) {
        return next(createError(401, 'Accesso non autorizzato'));
    }

    // Validate the request body
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }

    // Extract event ID from the request body
    const { IDEvento } = req.body;

    // Delete the event
    let database = null;
    try {
        database = new db();

        // Check if the school has the ownership of the event
        let events = await database.fetchSchoolEvents(req.user.IDScuola);
        if (!events || events.length === 0 || !events.some(e => e.IDEvento == IDEvento)) {
            req.flash('error', 'Non puoi eliminare un evento che non ti appartiene.');
            return res.redirect('/profilo');
        }


        await database.deleteEvent(IDEvento);
        req.flash('success', 'Evento eliminato con successo!');
    } catch (error) {
        console.error('Error deleting event:', error);
        req.flash('error', 'Errore durante l\'eliminazione dell\'evento');
    } finally {
        database.close();
    }

    // Redirect to the user profile page
    res.redirect('/profilo');
});

// Update the booking status for an event
router.post('/aggiorna-stato-prenotazione', [
    validator.body('IDPrenotazione').notEmpty().withMessage('ID della prenotazione è obbligatorio.'),
    validator.body('Stato').isIn(BookingStatus).withMessage('Stato della prenotazione non valido.')
], async function(req, res, next) {
    // Check if the user is authenticated and has a school ID
    if(!req.isAuthenticated() || !req.user.IDScuola) {
        return next(createError(401, 'Accesso non autorizzato'));
    }

    // Validate the request body
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }

    // Extract booking data from the request body
    const { IDPrenotazione, Stato } = req.body;

    // Update the booking status
    let database = null;
    try {
        database = new db();

        // Check if the school has the ownership of the booking
        let bookings = await database.fetchEventBookingsDetailsBySchool(req.user.IDScuola);
        if (!bookings || bookings.length === 0 || !bookings.some(b => b.IDPrenotazione == IDPrenotazione)) {
            req.flash('error', 'Non puoi aggiornare una prenotazione che non ti appartiene.');
            return res.redirect('/profilo');
        }

        await database.updateEventBookingStatus(IDPrenotazione, Stato);
        req.flash('success', 'Stato della prenotazione aggiornato con successo!');
    } catch (error) {
        console.error('Error updating booking status:', error);
        req.flash('error', 'Errore durante l\'aggiornamento dello stato della prenotazione');
    } finally {
        database.close();
    }

    // Redirect to the user profile page
    res.redirect('/profilo');
});

// Modify the booking status for a course
router.post('/aggiorna-stato-iscrizione', [
    validator.body('IDIscrizione').notEmpty().withMessage('ID dell\'iscrizione è obbligatorio.'),
    validator.body('Stato').isIn(BookingStatus).withMessage('Stato dell\'iscrizione non valido.')
], async function(req, res, next) {
    // Check if the user is authenticated and has a school ID
    if(!req.isAuthenticated() || !req.user.IDScuola) {
        return next(createError(401, 'Accesso non autorizzato'));
    }

    // Validate the request body
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }

    // Extract booking data from the request body
    const { IDIscrizione, Stato } = req.body;

    // Update the booking status
    let database = null;
    try {
        database = new db();

        // Check if the school has the ownership of the booking
        let bookings = await database.fetchCourseBookingsDetailsBySchool(req.user.IDScuola);
        if (!bookings || bookings.length === 0 || !bookings.some(b => b.IDIscrizione == IDIscrizione)) {
            req.flash('error', 'Non puoi aggiornare un\'iscrizione che non ti appartiene.');
            return res.redirect('/profilo');
        }

        await database.updateCourseBookingStatus(IDIscrizione, Stato);
        req.flash('success', 'Stato dell\'iscrizione aggiornato con successo!');
    } catch (error) {
        console.error('Error updating booking status:', error);
        req.flash('error', 'Errore durante l\'aggiornamento dello stato dell\'iscrizione');
    } finally {
        database.close();
    }

    // Redirect to the user profile page
    res.redirect('/profilo');
});

// Answer feedback from dancers
router.post('/rispondi-feedback', [
    validator.body('IDRecensione').notEmpty().withMessage('ID della recensione è obbligatorio.'),
    validator.body('Corpo').notEmpty().withMessage('La risposta alla recensione è obbligatoria.')
], async function(req, res, next) {
    // Check if the user is authenticated
    if (!req.isAuthenticated() || !req.user.IDScuola) {
        return next(createError(401, 'Accesso non autorizzato'));
    }

    // Validate the request body
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }

    // Extract feedback data from the request body
    const { IDRecensione, Corpo } = req.body;

    // Respond to the feedback
    let database = null;
    try {
        database = new db();
        await database.answerFeedback(IDRecensione, Corpo);

        // Check if the school has the ownership of the feedback
        let feedbacks = await database.fetchFeedbackBySchool(req.user.IDScuola);
        if (!feedbacks || feedbacks.length === 0 || !feedbacks.some(f => f.IDRecensione == IDRecensione)) {
            req.flash('error', 'Non puoi rispondere a una recensione che non ti appartiene.');
            return res.redirect('/profilo');
        }

        req.flash('success', 'Risposta alla recensione inviata con successo!');
        try {
            let userID = await database.fetchDancerIDByFeedbackID(IDRecensione);
            // Create a notification for the dancer
            if(userID) {
                await database.newNotification(req.user.IDScuola, userID, 'Risposta', "Hai ricevuto una risposta alla tua recensione.");
            }
        } catch (error) {
            console.error('Error fetching dancer ID by feedback ID:', error);
        }
    } catch (error) {
        console.error('Error responding to feedback:', error);
        req.flash('error', 'Errore durante l\'invio della risposta alla recensione');
    } finally {
        database.close();
    }

    // Redirect to the user profile page
    res.redirect('/profilo');
});

/* == Attachment Upload Management == */
const attachmentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './upload/attachment'); // Set the destination for attachments
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original file name
    }
});

const attachmentUpload = multer({ storage: attachmentStorage });

// Upload a new attachment for a course
router.post('/nuovo-allegato', attachmentUpload.single('Allegato'), [
    validator.body('IDCorso').notEmpty().withMessage('La selezione del corso è obbligatoria.'),
], async function(req, res, next) {
    // Check if the user is authenticated and has a school ID
    if(!req.isAuthenticated() || !req.user.IDScuola) {
        return next(createError(401, 'Accesso non autorizzato'));
    }

    // Validate the request body
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }

    // Check if a file was uploaded
    if (!req.file) {
        req.flash('error', 'Nessun file caricato.');
        return res.redirect('/profilo');
    }

    // Validate the uploaded file
    if (!req.file.mimetype.startsWith('audio/') && !req.file.mimetype.startsWith('video/')) {
        req.flash('error', 'Il file caricato non è un\'audio o un video valido.');
        // Delete
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('Error deleting invalid file:', err);
                req.flash('error', 'Errore durante l\'eliminazione del file non valido.');
            }
        });
        return res.redirect('/profilo');
    }

    // Setup filename and renaming
    let originalPath = req.file.path;
    let filename = req.file.originalname;
    let mime = req.file.mimetype;
    let processedFilePath = `./upload/attachment/course_${req.body.IDCorso}_${Date.now()}${path.extname(req.file.originalname)}`;
    // Rename the file to ensure it has a unique name
    fs.renameSync(originalPath, processedFilePath);
    // Create a new attachment in the database
    let database = null;
    try {
        database = new db();

        // Check course ownership
        let courses = await database.fetchSchoolCourses(req.user.IDScuola);
        if (!courses || courses.length === 0 || !courses.some(c => c.IDCorso == req.body.IDCorso)) {
            req.flash('error', 'Non puoi caricare un allegato per un corso che non ti appartiene.');
            return res.redirect('/profilo');
        }

        await database.newAttachment(req.body.IDCorso, filename, mime, processedFilePath);
        req.flash('success', 'Allegato caricato con successo!');
    } catch (error) {
        console.error('Error creating attachment:', error);
        req.flash('error', 'Errore durante il caricamento dell\'allegato');
    } finally {
        if(database)
            database.close();
    }
    // Redirect to the profile page after upload
    res.redirect('/profilo');
});

// Delete course's attachment
router.post('/elimina-allegato/:idAllegato', [
    validator.param('idAllegato').notEmpty().withMessage('ID dell\'allegato da eliminare è obbligatorio.')
], async function(req, res, next) {
    // Check if the user is authenticated and has a school ID
    if(!req.isAuthenticated() || !req.user.IDScuola) {
        return next(createError(401, 'Accesso non autorizzato'));
    }

    // Validate the request parameters
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }

    // Get the attachment details

    // Delete the attachment
    let database = null;
    try {
        database = new db();

        // Check if the school has the ownership of the attachment
        let attachments = await database.fetchAttachmentsBySchool(req.user.IDScuola);
        if (!attachments || attachments.length === 0 || !attachments.some(a => a.IDAllegato == req.params.idAllegato)) {
            req.flash('error', 'Non puoi eliminare un allegato che non ti appartiene.');
            return res.redirect('/profilo');
        }

        let attachment = await database.fetchAttachmentsBySchool(req.user.IDScuola);
        // Check if the attachment exists
        if (!attachment || attachment.length === 0) {
            req.flash('error', 'Allegato non trovato.');
            return res.redirect('/profilo');
        }
        // console.log('Attachments found:', attachment);
        let filePath = attachment.filter(a => a.IDAllegato == req.params.idAllegato)[0].Percorso;
        if(filePath == null || filePath == undefined) {
            req.flash('error', 'Percorso dell\'allegato non trovato.');
            return res.redirect('/profilo');
        }

        //console.log('Deleting attachment with ID:', req.params.idAllegato, 'at path:', filePath);

        if(!filePath) {
            req.flash('error', 'Percorso dell\'allegato non trovato.');
            return res.redirect('/profilo');
        }

        // Delete the file from the filesystem
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                req.flash('error', 'Errore durante l\'eliminazione del file allegato.');
                return res.redirect('/profilo');
            }
        });
        // Delete the attachment from the database
        await database.deleteAttachment(req.params.idAllegato);
        req.flash('success', 'Allegato eliminato con successo!');

    } catch (error) {
        console.error('Error deleting attachment:', error);
        req.flash('error', 'Errore durante l\'eliminazione dell\'allegato');
    } finally {
        if(database)
            database.close();
    }
    // Redirect to the profile page after deletion
    res.redirect('/profilo');
});

// Download attachment (for school)
router.get('/download-allegato-scuola/:idAllegato', [
    validator.param('idAllegato').notEmpty().withMessage('ID dell\'allegato da scaricare è obbligatorio.')
], async function(req, res, next) {
    // Check if the user is authenticated and has a school ID
    if(!req.isAuthenticated() || !req.user.IDScuola) {
        return next(createError(401, 'Accesso non autorizzato'));
    }

    // Validate the request parameters
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/profilo');
    }

    // Get the attachment details
    let database = null;
    try {
        database = new db();
        let attachment = await database.fetchAttachmentsBySchool(req.user.IDScuola);
        // Check if the attachment exists
        if (!attachment || attachment.length === 0) {
            req.flash('error', 'Allegato non trovato.');
            return res.redirect('/profilo');
        }

        // Check provided attachment
        if(attachment.filter(a => a.IDAllegato == req.params.idAllegato).length === 0) {
            req.flash('error', 'Allegato non trovato.');
            return res.redirect('/profilo');
        }


        let filePath = attachment.filter(a => a.IDAllegato == req.params.idAllegato)[0].Percorso;
        if(filePath == null || filePath == undefined) {
            req.flash('error', 'Percorso dell\'allegato non trovato.');
            return res.redirect('/profilo');
        }
        
        // Send the file for download
        res.download(filePath, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                req.flash('error', 'Errore durante il download dell\'allegato.');
            }
        });
    } catch (error) {
        console.error('Error fetching attachment:', error);
        req.flash('error', 'Errore durante il recupero dell\'allegato');
    } finally {
        if(database)
            database.close();
    }
});

// Delete school profile
router.post('/elimina-scuola', async function(req, res, next) {
    // Check if the user is authenticated and has a school ID
    if(!req.isAuthenticated() || !req.user.IDScuola) {
        return next(createError(401, 'Accesso non autorizzato'));
    }

    // Validate the request body
    const { IDScuola } = req.body;
    if (!IDScuola) {
        req.flash('error', 'ID della scuola è obbligatorio.');
        return res.redirect('/profilo');
    }

    // Check if the school ID matches the user's school ID
    if (IDScuola != req.user.IDScuola) {
        req.flash('error', 'ID della scuola non corrisponde al tuo profilo.');
        return res.redirect('/profilo');
    }

    // Delete the school profile
    let database = null;
    try {
        database = new db();
        await database.deleteSchool(IDScuola);
        req.flash('success', 'Profilo della scuola eliminato con successo!');
        // Logout the user after deleting the school profile
        req.logout((err) => {
            if (err) {
                console.error('Error logging out:', err);
            }
            res.redirect('/');
        });
    } catch (error) {
        console.error('Error deleting school profile:', error);
        req.flash('error', 'Errore durante l\'eliminazione del profilo della scuola');
        res.redirect('/profilo');
    } finally {
        database.close();
    }
});

export default router;