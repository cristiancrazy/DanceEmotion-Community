import express from 'express'; // Import express for routing
import db from '../db.mjs'; // Import the database connection
import httpErrors from 'http-errors'; // Import http-errors for error handling
import {getDistancesFromSchools} from '../distance-getter.mjs'; // Import the distance calculation utility

const router = express.Router();

/* GET schools page */
router.get('/', async function(req, res, next) {
	let database;
	try {
		database = new db(); // Create a new database instance
		let searchMode = false; // Default to search mode
		const schoolName = String(req.query.name || '').trim();
		const city = req.query.city ? String(req.query.city || '').trim() : null;
		const lat = req.query.lat ? parseFloat(req.query.lat) : null;
		const lng = req.query.lng ? parseFloat(req.query.lng) : null;
		let schools;
		let reviews = await database.fetchAllSchoolsRatings(); // Fetch all school ratings

		// If a school name is provided, perform a simple search; otherwise, fetch all schools
		if (lat && lng) {
			searchMode = true;
			schools = await getDistancesFromSchools(lat, lng); // Get distances from schools to the provided coordinates
		} else if (schoolName || city) {
			searchMode = true;
			schools = await database.filterSchools(schoolName, city); // Filter schools by name and city
		} else {
			schools = await database.fetchAllSchools();
		}

		res.render('scuole', { schools, user: req.user, searchMode, reviews });
	} catch (error) {
		next(httpErrors(500, 'Errore durante la gestione delle scuole.' + error.message));
	}finally {
		if(database){
			database.close(); // Ensure the database connection is closed
		}
	}
});

export default router;