import express from 'express'; // Import express for routing
import flash from 'connect-flash'; // Import connect-flash for flash messages
import { body, validationResult } from 'express-validator'; // Import express-validator for input validation
import db from '../db.mjs'; // Import the database handler

const router = express.Router();

// USEFUL CONSTANTS
const Regions = ['Lazio', 'Campania', 'Sicilia', 'Lombardia', 'Piemonte', 'Emilia Romagna', 'Toscana', 'Liguria', 'Marche', 'Abruzzo', 'Umbria', 'Calabria', 'Basilicata', 'Puglia', 'Molise', 'Sardegna', 'Friuli Venezia Giulia', 'Trentino Alto Adige', 'Valle d\'Aosta'];

/* GET sign-up page */
router.get('/', function(req, res, next) {
	// Check if the user is already authenticated
	if (req.isAuthenticated()) {
		// If authenticated, redirect to the home page
		return res.redirect('/');
	}

	// Render the sign-up page with flash messages
    res.render('registrazione', { user: req.user, messages: req.flash('error') });
});

/* POST sign-up form for dancers */
router.post('/ballerini', [
    body('name').notEmpty().withMessage('Il nome è obbligatorio'),
    body('surname').notEmpty().withMessage('Il cognome è obbligatorio'),
    body('birthdate').isDate().withMessage('La data di nascita non è valida'),
    body('termsAccept').custom(value => {
        if (value !== 'on') {
            throw new Error('Devi accettare i termini e le condizioni');
        }
        return true;
    }),
    body('phone').isMobilePhone().withMessage('Il numero di telefono non è valido'),
    body('email').isEmail().withMessage('Indirizzo email non valido'),
    body('password').isLength({ min: 6 }).withMessage('La password deve contenere minimo 6 caratteri'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Le password non corrispondono');
        }
        return true;
    })
], async function(req, res, next) {
    // Check not authenticated
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/registrazione');
    }

    const database = new db();

    // Check if the user was already registered
    try {
        const existingDancer = await database.fetchDancerByEmail(req.body.email);
        if (existingDancer) {
            req.flash('error', 'Un ballerino con questo indirizzo email è già registrato.');
            return res.redirect('/registrazione');
        }
    }catch (error) {
        // Do nothing proceed with registration
    }


	try {
        const dancerData = {
            name: req.body.name,
            surname: req.body.surname,
            bornDate: new Date(req.body.birthdate),
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password, // Password will be hashed in the database handler
            termsAccept: req.body.termsAccept,
        };

		console.log('Dancer data:', dancerData);

        await database.createDancer(
            dancerData.name,
            dancerData.surname,
            dancerData.email,
            dancerData.password,
            dancerData.bornDate,
            dancerData.phone
        );

        res.redirect('/accesso');

    } catch (error) {
        console.error('Error during dancer registration:', error);
        req.flash('error', 'Errore durante la registrazione: ' + error.error);
        res.redirect('/registrazione');
    } finally {
        database.close();
    }
});

/* POST sign-up form for schools */
router.post('/scuole', [
    body('name').notEmpty().withMessage('Il nome della scuola è obbligatorio'),
    body('email').isEmail().withMessage('Indirizzo email non valido'),
    body('password').isLength({ min: 6 }).withMessage('La password deve contenere minimo 6 caratteri'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Le password non corrispondono');
        }
        return true;
    }),
    body('phone').isMobilePhone().withMessage('Il numero di telefono non è valido'),
    body('address').notEmpty().withMessage('L\'indirizzo è obbligatorio'),
    body('city').notEmpty().withMessage('La città è obbligatoria'),
    body('cap').isPostalCode('IT').withMessage('Il CAP non è valido'),
    body('province').notEmpty().withMessage('La provincia è obbligatoria'),
    body('region').isIn(Regions).withMessage('La regione non è valida'),
    body('termsAccept').custom(value => {
        if (value !== 'on') {
            throw new Error('Devi accettare i termini e le condizioni');
        }
        return true;
    })
], async function(req, res, next) {
    // Check not authenticated
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }

    // Validate the input data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/registrazione');
    }

    const database = new db();

    // Check if the school was already registered
    try {
        const existingSchool = await database.fetchSchoolByEmail(req.body.email);
        if (existingSchool) {
            req.flash('error', 'Una scuola con questo indirizzo email è già registrata.');
            return res.redirect('/registrazione');
        }
    } catch (error) {
        // Do nothing, proceed with registration
    }

    try {
        const schoolData = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password, // Password will be hashed in the database handler
            confirmPassword: req.body.confirmPassword,
            phone: req.body.phone,
            address: req.body.address,
            city: req.body.city,
            cap: req.body.cap,
            province: req.body.province,
            region: req.body.region,
            termsAccept: req.body.termsAccept,
        };

        console.log('School data:', schoolData);

        await database.createSchool(
            schoolData.name,
            schoolData.email,
            schoolData.password,
            schoolData.phone,
            schoolData.address,
            schoolData.city,
            schoolData.cap,
            schoolData.province,
            schoolData.region
        );

        res.redirect('/accesso');

    } catch (error) {
        console.error('Error during school registration:', error);
        req.flash('error', 'Errore durante la registrazione della scuola: ' + error.error);
        res.redirect('/registrazione');
    } finally {
        database.close();
    }
});

export default router;