import express from 'express'; // Import express for routing
import db from '../db.mjs'; // Import the database connection
import httpErrors from 'http-errors'; // Import http-errors for error handling
import {getDistancesFromEvents} from '../distance-getter.mjs'; // Import the distance calculation utility

const router = express.Router();

/* GET events page */
router.get('/', async function(req, res, next) {
	let database;
	try {
		database = new db(); // Create a new database instance
		let searchMode = false; // Default to search mode
		const eventName = req.query.name ? String(req.query.name).trim() : null;
		const priceMin = req.query.minPrice ? Number(req.query.minPrice) : null;
		const priceMax = req.query.maxPrice ? Number(req.query.maxPrice) : null;
		const dataMin = req.query.dataMin ? new Date(req.query.dataMin) : null;
		const dataMax = req.query.dataMax ? new Date(req.query.dataMax) : null;
		const schoolName = req.query.schoolName ? String(req.query.schoolName).trim() : null;
		const location = req.query.location ? String(req.query.location).trim() : null;
		const lat = req.query.lat ? parseFloat(req.query.lat) : null;
		const lng = req.query.lng ? parseFloat(req.query.lng) : null;
		let events;

		// If any filter is applied, set searchMode to true and filter events accordingly
		if (lat && lng) {
			searchMode = true;
			events = await getDistancesFromEvents(lat, lng); // Get distances from events to the provided coordinates
		} else if (eventName || (priceMin && priceMax) || (dataMin && dataMax) || schoolName || location) {
			searchMode = true;
			events = await database.filterEvents(eventName, priceMin, priceMax, dataMin, dataMax, schoolName, location);
		} else {
			events = await database.fetchAllEvents();
		}

		// Render the events page with the fetched events and user information
		res.render('eventi', { user: req.user, events: events, searchMode });
	} catch (error) {
		next(httpErrors(500, 'Errore durante la gestione degli eventi.' + error.message));
	}finally {
		if(database){
			database.close(); // Ensure the database connection is closed
		}
	}
});

export default router;