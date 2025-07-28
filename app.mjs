/**
 * @author Cristian Capraro, 20054593
 * @version 1.0.0
 * @file app.mjs
 * @description Main application file for the Dance School Management System.
 * This file sets up the Express application, configures middleware, and defines routes.
 * It also initializes Passport for authentication and handles errors.
 * The application serves static files, handles user sessions, and provides a view engine for rendering HTML.
 */

'use strict';

import createError from 'http-errors';
import express from 'express';
import compression from 'compression'; // Compression middleware to reduce response size
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import passport from 'passport'; // Passport for authentication
import Strategy from 'passport-local'; // Local strategy for username/password authenticatio
import session from 'express-session'; // Session management
import DatabaseHandler from './db.mjs'; // Import the database handler module
import flash from 'connect-flash'; // Flash messages for user feedback

import dotenv from 'dotenv';
dotenv.config({quiet: true}); // Load environment variables from .env file

// Get the google API Key
let googleApiKey = process.env.GOOGLEAPIKEY;

// Importing the fileURLToPath and dirname functions to handle module paths
// This is necessary to resolve the __dirname equivalent in ES modules
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const db = new DatabaseHandler(); // Create an instance of the DatabaseHandler

/* Routers */
import indexRouter from './routes/index.mjs';
import schoolsRouter from './routes/schools.mjs';
import eventsRouter from './routes/events.mjs';
import contactsRouter from './routes/contacts.mjs';
import faqRouter from './routes/faq.mjs';
import signupRouter from './routes/signup.mjs';
import loginRouter from './routes/login.mjs';
import schoolSpecRouter from './routes/school-spec.mjs';
import userProfileRouter from './routes/userProfile.mjs';
import logoutRouter from './routes/logout.mjs'; // Import logout route dynamically
import coursesRouter from './routes/courses.mjs'; // Import courses route

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(compression()); // Use compression middleware to compress responses
app.use(logger('dev')); // Use morgan for logging requests
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(session({
	secret: (process.env.SESSIONSS), // Use environment variable for session secret
	resave: false,
	saveUninitialized: false,
})); // Use express-session for session management

app.use(flash()); // Use connect-flash for flash messages

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Configure the local strategy for dancer authentication
// This strategy uses email as the username field and validates the password
// If the credentials are valid, it returns the user object; otherwise, it returns false with an error message
passport.use('dancer&school', new Strategy(
    { passReqToCallback: true, usernameField: 'email' },
    (req, email, password, done) => {
        // Determine the user type from the request body
        // It could be 'dancer' or 'school' based on the form submission
        const userType = req.body.type;

        if(userType == 'dancer') {
            // Validate dancer credentials
            console.log('Authenticating dancer with email:', email);

            db.validateDancerCredentials(email, password)
                .then(user => {
                    if (!user) {
                        // Flash message for invalid credentials
                        req.flash('error', 'Credenziali non valide.');
                        // Return error to the done callback
                        return done(null, false, { message: 'Credenziali non valide.' });
                    }
                    user.type = 'dancer'; // Set user type for dancer
                    return done(null, user);
                })
                .catch(err => {
                    console.error('Error during authentication:', err.error);
                    // Flash message for error handling
                    req.flash('error', 'Errore durante l\'autenticazione: ' + err.error);
                    // Return error to the done callback
                    return done(null, false, { message: 'Errore durante l\'autenticazione: ' + err.error });
                });
        } else if(userType == 'school') {
            // Validate school credentials (assuming a similar method exists for schools)
            console.log('Authenticating school with email:', email);
            db.validateSchoolCredentials(email, password)
                .then(user => {
                    if (!user) {
                        // Flash message for invalid credentials
                        req.flash('error', 'Credenziali non valide.');
                        // Return error to the done callback
                        return done(null, false, { message: 'Credenziali non valide.' });
                    }
                    user.type = 'school'; // Set user type for school
                    return done(null, user);
                })
                .catch(err => {
                    console.error('Error during authentication:', err.error);
                    // Flash message for error handling
                    req.flash('error', 'Errore durante l\'autenticazione: ' + err.error);
                    // Return error to the done callback
                    return done(null, false, { message: 'Errore durante l\'autenticazione: ' + err.error });
                });
        } else {
            // User type is not recognized
            console.error('Unknown user type:', userType);
            req.flash('error', 'Errore di accesso - Inconsistenza utente.');
            return done(null, false, { message: 'Errore di accesso - riprovare' });
        }
    }
));

// Serialize user for session
passport.serializeUser((user, done) => {
    if (user.type === 'dancer') {
        // Store the user ID in the session
        done(null, { id: user.IDBallerino, type: 'dancer' });
    } else if (user.type === 'school') {
        // Store the school ID in the session
        done(null, { id: user.IDScuola, type: 'school' });
    } else {
        done(new Error('Invalid user type'));
    }
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
    // Fetch the user from the database using the ID stored in the session
    if( id.type === 'dancer') {
        db.fetchDancerById(id.id)
            .then(user => {
                if (!user) {
                    return done(new Error('User not found'));
                }
                done(null, user);
            })
            .catch(err => {
                console.error('Error during deserialization:', err);
                done(err);
            });
    } else if (id.type === 'school') {
        db.fetchSchoolById(id.id)
            .then(school => {
                if (!school) {
                    return done(new Error('School not found'));
                }
                done(null, school);
            })
            .catch(err => {
                console.error('Error during deserialization:', err);
                done(err);
            });
    } else {
        done(new Error('Invalid user type'));
    }
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route handlers
app.use('/', indexRouter);
app.use('/scuole', schoolsRouter);
app.use('/scuola-spec', schoolSpecRouter);
app.use('/eventi', eventsRouter);
app.use('/contattaci', contactsRouter);
app.use('/registrazione', signupRouter);
app.use('/accesso', loginRouter);
app.use('/faq', faqRouter);
app.use('/profilo', userProfileRouter);
app.use('/logout', logoutRouter);
app.use('/corsi', coursesRouter); // Use the courses router

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('errore', { user: req.user });
});

export { googleApiKey }; // Export the Google API key for use in other modules
export default app;