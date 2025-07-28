import express from 'express'; // Import express for routing
import db from '../db.mjs'; // Import the database module
import httpErrors from 'http-errors'; // Import http-errors for error handling
import flash from 'connect-flash'; // Import connect-flash for flash messages
import validator from 'express-validator'; // Import express-validator for input validation
import CalendarFormatter from '../calendar-formatter.mjs'; // Import the CalendarFormatter class


const router = express.Router();

/* GET schools public profile page. */
router.get('/:id', async function (req, res, next) {
	const schoolID = req.params.id; // Get the school ID from the request parameters
	const database = new db(); // Create a new instance of the database
	try {
		let school = await database.fetchSchoolById(schoolID);
		let following = null;
		let courses = await database.fetchSchoolCourses(schoolID); // Fetch courses for the school
		let events = await database.fetchSchoolEvents(schoolID); // Fetch events for the school
		let calendarFormatter = new CalendarFormatter(); // Create an instance of CalendarFormatter
		let calendarCourses = await calendarFormatter.fetchCoursesForSchool(schoolID); // Fetch and format courses for the calendar
		let allFeedback = await database.fetchFeedbackBySchool(schoolID); // Fetch all feedback for the school
		let coursesFeedback = await database.fetchRatingsBySchool(schoolID); // Fetch feedback for courses
		let feedbackAnswers = await database.fetchFeedbackAnswerBySchool(schoolID); // Fetch feedback answers for the school
		// console.log('Courses fetched:', courses);
		// Check if the user is logged in and fetch their follow status
		if (req.user && req.user.IDBallerino) {
			following = await database.checkUserFollowSchool(req.user.IDBallerino, schoolID); // Check if the user follows the school
		}
		// console.log('Calendar courses:', calendarCourses); // Log the formatted calendar courses
		res.render('scuola-spec', { school: school, user: req.user, following: following, courses: courses, events: events, calendarCourses: calendarCourses, globalFeedback: allFeedback, courseRating: coursesFeedback, feedbackAnswers: feedbackAnswers, success: req.flash('success'), error: req.flash('error') });

	} catch (error) {
		console.error('Error fetching school:', error);
		next(httpErrors(400, 'Scuola non trovata.'));
	} finally {
		database.close(); // Close the database connection
	}
});

router.post('/:id/segui', async function (req, res, next) {
	/* Checkings */
	if (!req.isAuthenticated()) {
		httpErrors(401, 'Accesso non autorizzato'); // Ensure the user is authenticated
		return;
	}
	if (!req.user.IDBallerino) {
		httpErrors(403, 'Azione non consentita'); // Ensure the user is a dancer
		return;
	}
	if (!req.params.id) {
		httpErrors(400, 'ID della scuola mancante'); // Ensure the school ID is provided
		return;
	}

	const schoolID = req.params.id; // Get the school ID from the request parameters
	const userID = req.user.IDBallerino; // Get the user ID from the session
	const database = new db(); // Create a new instance of the database
	try {
		await database.followSchool(userID, schoolID);
		req.flash('success', 'Ora segui la scuola');
		res.redirect(`/scuola-spec/${schoolID}/`); // Redirect to the school's public profile page
	} catch (error) {
		req.flash('error', 'Impossibile seguire la scuola: ' + error.error);
		res.redirect(`/scuola-spec/${schoolID}/`); // Redirect to the school's public profile page
	} finally {
		database.close(); // Close the database connection
	}
});

router.post('/:id/smetti-seguire', async function (req, res, next) {
	/* Checkings */
	if (!req.isAuthenticated()) {
		httpErrors(401, 'Accesso non autorizzato'); // Ensure the user is authenticated
		return;
	}
	if (!req.user.IDBallerino) {
		httpErrors(403, 'Azione non consentita'); // Ensure the user is a dancer
		return;
	}
	if (!req.params.id) {
		httpErrors(400, 'ID della scuola mancante'); // Ensure the school ID is provided
		return;
	}

	const schoolID = req.params.id; // Get the school ID from the request parameters
	const userID = req.user.IDBallerino; // Get the user ID from the session
	const database = new db(); // Create a new instance of the database
	try {
		await database.unfollowSchool(userID, schoolID);
		req.flash('success', 'Non segui più la scuola');
		res.redirect(`/scuola-spec/${schoolID}/`); // Redirect to the school's public profile page
	} catch (error) {
		req.flash('error', 'Impossibile smettere di seguire la scuola: ' + error.error);
		res.redirect(`/scuola-spec/${schoolID}/`); // Redirect to the school's public profile page
	}
	finally {
		database.close(); // Close the database connection
	}
});

// Book an Event
router.post('/:id/prenota-evento', [
	validator.body('IDEvento').notEmpty().withMessage('ID dell\'evento mancante') // Validate that event ID is provided
], async function (req, res, next) {
	/* Checkings */
	if (!req.isAuthenticated()) {
		httpErrors(401, 'Accesso non autorizzato'); // Ensure the user is authenticated
		return;
	}
	if (!req.user.IDBallerino) {
		httpErrors(403, 'Azione non consentita'); // Ensure the user is a dancer
		return;
	}
	if (!req.params.id) {
		httpErrors(400, 'ID della scuola mancante'); // Ensure the school ID is provided
		return;
	}

	const schoolID = req.params.id; // Get the school ID from the request parameters
	const eventID = req.body.IDEvento; // Get the event ID from the request body
	const userID = req.user.IDBallerino; // Get the user ID from the session
	const database = new db(); // Create a new instance of the database
	try {
		await database.bookEvent(userID, eventID);
		req.flash('success', 'Prenotazione evento effettuata con successo');
		res.redirect(`/scuola-spec/${schoolID}/`); // Redirect to the school's public profile page
	} catch (error) {
		req.flash('error', 'Impossibile prenotare l\'evento: ' + error.error);
		res.redirect(`/scuola-spec/${schoolID}/`); // Redirect to the school's public profile page
	} finally {
		database.close(); // Close the database connection
	}
});

// Book a Course
router.post('/:id/prenota-corso', [
	validator.body('IDCorso').notEmpty().withMessage('ID del corso mancante') // Validate that course ID is provided
], async function (req, res, next) {
	/* Checkings */
	if (!req.isAuthenticated()) {
		httpErrors(401, 'Accesso non autorizzato'); // Ensure the user is authenticated
		return;
	}
	if (!req.user.IDBallerino) {
		httpErrors(403, 'Azione non consentita'); // Ensure the user is a dancer
		return;
	}
	if (!req.params.id) {
		httpErrors(400, 'ID della scuola mancante'); // Ensure the school ID is provided
		return;
	}

	const schoolID = req.params.id; // Get the school ID from the request parameters
	const courseID = req.body.IDCorso; // Get the course ID from the request body
	const userID = req.user.IDBallerino; // Get the user ID from the session
	const database = new db(); // Create a new instance of the database
	try {
		await database.bookCourse(userID, courseID);
		req.flash('success', 'Prenotazione corso effettuata con successo');
		res.redirect(`/scuola-spec/${schoolID}/`); // Redirect to the school's public profile page
	} catch (error) {
		req.flash('error', 'Impossibile prenotare il corso: ' + error.error);
		res.redirect(`/scuola-spec/${schoolID}/`); // Redirect to the school's public profile page
	} finally {
		database.close(); // Close the database connection
	}
});

export default router;