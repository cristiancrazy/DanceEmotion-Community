/**
 * @author Cristian Capraro
 * @version 1.0.0
 * @file distance-getter.mjs
 * @description Calculate distances with Google Maps API.
 */

import axios from 'axios';
import db from './db.mjs';
import {googleApiKey} from './app.mjs';

/**
 * Calcola la distanza tra una posizione GPS e un indirizzo.
 * @param {number} originLat - Latitudine dell'origine
 * @param {number} originLng - Longitudine dell'origine
 * @param {string} destinationAddress - Indirizzo della destinazione
 * @returns {Promise<Object>} - Distanza testuale e in metri
 */
async function getDistanceFromCoordsToAddress(originLat, originLng, destinationAddress) {

	const apiKey = googleApiKey;

	const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${encodeURIComponent(destinationAddress)}&key=${apiKey}`;

  	try {
		const response = await axios.get(url);
		const data = response.data;

		if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
	  		const distanceText = data.rows[0].elements[0].distance.text;
	  		const distanceValue = data.rows[0].elements[0].distance.value;
	  		return {
				testo: distanceText,
				metri: distanceValue
	  	};
		} else {
	  		throw new Error("Errore nella risposta API: " + JSON.stringify(data));
		}
  	} catch (error) {
		console.error("Errore nel calcolo distanza:", error.message);
		return null;
  	}
}

/**
 * Calcola la distanza tra le scuole nel database e una posizione GPS.
 * @param {number} originLat - Latitudine dell'origine
 * @param {number} originLng - Longitudine dell'origine
 * @returns {Promise<Array>} - Array di scuole con le distanze calcolate
 */
async function getDistancesFromSchools(originLat, originLng) {
	// Fetch all schools from the database
	let database;
	let schools;
	try {
		database = new db();
		schools = await database.fetchAllSchools();
		for (let school of schools) {
			const distance = await getDistanceFromCoordsToAddress(originLat, originLng, school.Indirizzo + ', ' + school.Citta + ', ' + school.CAP + ', ' + school.Provincia + ', ' + school.Regione);
			if (distance) {
				// Push distance inside the school
				school.distance = distance;
			}
	}
	}catch (error) {
		console.error("Errore durante la connessione al database:", error);
		return [];
	}finally {
		if (database) {
			database.close(); // Ensure the database connection is closed
		}
	}
	// Return the schools with distances
	return schools?.sort((a, b) => {
		if(!a.distance) {
			return 1; // If distance is not available, do not sort
		}
		if(!b.distance) {
			return -1; // If distance is not available, do not sort
		}
		// Sort by distance in ascending order
		return a.distance.metri - b.distance.metri;
	});
}

/**
 * Calcola la distanza tra tutti gli eventi e una posizione GPS.
 * @param {number} originLat - Latitudine dell'origine
 * @param {number} originLng - Longitudine dell'origine
 * @returns {Promise<Array>} - Array di eventi con le distanze calcolate
 */
async function getDistancesFromEvents(originLat, originLng) {
	let database;
	let events;
	try {
		database = new db();
		events = await database.fetchAllEvents();
		for (let event of events) {
			const distance = await getDistanceFromCoordsToAddress(originLat, originLng, event.Luogo);
			if (distance) {
				// Push distance inside the event
				event.distance = distance;
			}
		}
	} catch (error) {
		console.error("Errore durante la connessione al database:", error);
		return [];
	} finally {
		if (database) {
			database.close(); // Ensure the database connection is closed
		}
	}
	return events?.sort((a, b) => {
		if(!a.distance) {
			return 1; // If distance is not available, do not sort
		}
		if(!b.distance) {
			return -1; // If distance is not available, do not sort
		}
		return a.distance.metri - b.distance.metri;
	});
}

export { getDistanceFromCoordsToAddress, getDistancesFromSchools, getDistancesFromEvents };