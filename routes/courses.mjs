import express from 'express'; // Import express for routing
import db from '../db.mjs'; // Import the database connection
import httpErrors from 'http-errors'; // Import http-errors for error handling

const router = express.Router();

/* GET events page */
router.get('/', async function(req, res, next) {
  let database;
  let courses;
  try {
    database = new db(); // Create a new database instance

    let searchMode = false; // Default to search mode
    const courseName = req.query.name ? String(req.query.name || '').trim() : null;
    let tipology = req.query.tipologia ? String(req.query.tipologia || '').trim() : null;
    let category = req.query.categoria ? String(req.query.categoria || '').trim() : null;
    let level = req.query.livello ? String(req.query.livello || '').trim() : null;
    let priceMin = req.query.prezzoMin ? Number(req.query.prezzoMin || '') : null;
    let priceMax = req.query.prezzoMax ? Number(req.query.prezzoMax || '') : null;

    if (courseName || tipology || category || level || priceMin || priceMax) {
      searchMode = true; // If any filter is applied, set searchMode to true
      courses = await database.filterCourses(courseName, tipology, category, level, priceMin, priceMax);
    } else {
      searchMode = false; // No filters applied, fetch all courses
      courses = await database.fetchAllCourses();
    }
    // Render the courses page with the fetched courses and user information
    res.render('corsi', {user: req.user, courses: courses, searchMode});
  } catch (error) {
    return next(httpErrors(500, 'Errore durante il caricamento: ' + error.message));
  } finally {
    if (database) {
      database.close(); // Ensure the database connection is closed
    }
  }
});

export default router;