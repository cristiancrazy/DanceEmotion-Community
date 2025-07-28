/**
 * @author Cristian Capraro
 * @version 1.0.0
 * @file db.mjs
 * @description Database connection module for the DanceEmotion School Management System.
 */

'use strict';

import knex from 'knex'; // Import knex for SQL query building
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing

// Constants
const NUMBER_OF_ROUNDS = 10; // Number of rounds for bcrypt hashing
const DATABASE_FILE = './database/danceemotion.db'; // Path to the SQLite database file

// Checking Constants

class DatabaseHandler {

	constructor() {
		// Initialize knex for SQLite database connection
		this.knex = knex({
			client: 'sqlite3',
			connection: {
				filename: DATABASE_FILE
			},
			useNullAsDefault: true // SQLite requires this option
		});
	}

	// Method to close the database connection
	close() {
		// Close the Knex connection
		this.knex.destroy()
			.then(() => {
				console.log('Knex connection closed.');
			})
			.catch((error) => {
				console.error('Error closing Knex connection: ' + error.message);
			});
	}

	/* =======================[CREATE ENTITY]=========================== */

	/**
	 * @description Creates a new dancer in the database.
	 * @param {string} name - The first name of the dancer.
	 * @param {string} surname - The surname of the dancer.
	 * @param {string} email - The email address of the dancer.
	 * @param {string} password - The password for the dancer, which will be hashed.
	 * @param {Date} bornDate - The date of birth of the dancer.
	 * @param {string} phone - The phone number of the dancer.
	 * @returns {Promise<Object>} A promise that resolves with dancer creation success message or rejects with an error message.
	 */
	createDancer(name, surname, email, password, bornDate, phone) {
		return new Promise((resolve, reject) => {
			// Check if the dancer already exists
			this.fetchDancerByEmail(email)
				.then(() => {
					// If the dancer already exists, reject with an error
					reject({ error: 'L\'utente esiste già.' });
					return;
				}).catch(() => {
					// If the dancer does not exist, do nothing and proceed to create a new dancer
				});
			
			// Insert the new dancer into the database
			this.knex('Ballerini')
				.insert({
					Nome: name,
					Cognome: surname,
					Email: email,
					Password: bcrypt.hashSync(password, NUMBER_OF_ROUNDS), // Hash the password
					DataNascita: bornDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
					Telefono: phone
				})
				.then(() => {
					resolve({ message: 'Ballerino creato con successo'}); // Return the last inserted ID
				})
				.catch((error) => {
					reject({ error: 'Errore creazione ballerino: ' + error.message });
				});
		});
	}

	/**
	 * Creates a new school in the database.
	 * @param {string} name - The name of the school.
	 * @param {string} email - The email address of the school.
	 * @param {string} password - The password for the school.
	 * @param {string} phone - The phone number of the school.
	 * @param {string} address - The address of the school.
	 * @param {string} city - The city where the school is located.
	 * @param {string} cap - The postal code of the school.
	 * @param {string} province - The province where the school is located.
	 * @param {string} region - The region where the school is located.
	 * @returns {Promise<Object>} A promise that resolves with the school creation success message or rejects with an error message.
	 */
	createSchool(name, email, password, phone, address, city, cap, province, region) {
		return new Promise((resolve, reject) => {
			// Check if the school already exists
			this.fetchSchoolByEmail(email)
				.then(() => {
					// If the school already exists, reject with an error
					reject({ error: 'La scuola esiste già.' });
					return;
				}).catch(() => {
					// If the school does not exist, do nothing and proceed to create a new school
				});

			// Insert the new school into the database
			this.knex('Scuole')
				.insert({
					Nome: name,
					Email: email,
					Password: bcrypt.hashSync(password, NUMBER_OF_ROUNDS), // Hash the password
					Telefono: phone,
					Indirizzo: address,
					Citta: city,
					CAP: cap,
					Provincia: province,
					Regione: region
				})
				.then(() => {
					resolve({ message: 'Scuola creata con successo' });
				})
				.catch((error) => {
					reject({ error: 'Errore creazione scuola: ' + error.message });
				});
		});
	}

	/**
	 * @description Creates a new course in the database.
	 * @param {string} name - The name of the course.
	 * @param {string} instructor - The name of the instructor for the course.
	 * @param {string} type - The type of the course 
	 * @param {string} level - The level of the course
	 * @param {number} price - The price of the course.
	 * @param {Date} startDate - The start date of the course.
	 * @param {Date} endDate - The end date of the course.
	 * @param {string} startTime - The start time of the course.
	 * @param {string} endTime - The end time of the course.
	 * @param {string} category - The category of the course.
	 * @param {number} school - The ID of the school offering the course.
	 * @returns {Promise<Object>} A promise that resolves with the course creation success message or rejects with an error message.
	 */
	createCourse(name, instructor, type, level, price, startDate, endDate, startTime, endTime, category, school) {
		return new Promise((resolve, reject) => {
			// Insert the new course into the database
			this.knex('Corsi')
				.insert({
					Nome: name,
					Istruttore: instructor,
					Tipologia: type,
					Livello: level,
					Prezzo: price,
					DataInizio: startDate,
					DataFine: endDate,
					OrarioInizio: startTime,
					OrarioFine: endTime,
					CategoriaCorso: category,
					IDScuola: school
				})
				.then(() => {
					resolve({ message: 'Corso creato con successo' });
				})
				.catch((error) => {
					reject({ error: 'Errore creazione corso: ' + error.message });
				});
		});
	}


	/**
	 * @description Creates a new event in the database.
	 * @param {string} name - The name of the event.
	 * @param {string} description - The description of the event.
	 * @param {string} location - The location of the event.
	 * @param {string} price - The price of the event.
	 * @param {Date} dateTime - The date and time of the event.
	 * @param {number} schoolID - The ID of the school hosting the event.
	 * @returns {Promise<Object>} A promise that resolves with the event creation success message and the ID or rejects with an error message.
	 */
	createEvent(name, description, location, price, dateTime, schoolID) {
		return new Promise((resolve, reject) => {
			// Insert the new event into the database
			this.knex('Eventi')
				.insert({
					Nome: name,
					Descrizione: description,
					Luogo: location,
					Prezzo: price,
					DataOra: dateTime,
					IDScuola: schoolID
				})
				.then(([id]) => {
					resolve({ message: 'Evento creato con successo', id: id }); // Return the last inserted ID
				})
				.catch((error) => {
					reject({ error: 'Errore creazione evento: ' + error.message });
				});
		});
	}

	/**
	 * @description Follows a school for a dancer.
	 * @param {number} userID - The ID of the dancer who is following the school.
	 * @param {number} schoolID - The ID of the school to be followed
	 * @return {Promise<void>} A promise that resolves when the school is successfully followed or rejects with an error message.
	 */
	followSchool(userID, schoolID) {		
		return new Promise((resolve, reject) => {
			// Check if the dancer is already following the school
			this.knex('Preferiti')
				.where({ IDBallerino: userID, IDScuola: schoolID })
				.first() // Get the first matching record
				.then((follow) => {
					if (follow) {
						// If the dancer is already following the school, reject with an error
						reject({ error: 'La scuola è già seguita.' });
					} else {
						// If not, insert a new follow record
						this.knex('Preferiti')
							.insert({
								IDBallerino: userID,
								IDScuola: schoolID,
							})
							.then(() => {
								resolve(); // Successfully followed the school
							})
							.catch((error) => {
								reject({ error: 'Errore durante il tentativo di seguire la scuola: ' + error.message });
							});
					}
				})
				.catch((error) => {
					reject({ error: 'Errore durante il controllo della scuola seguita: ' + error.message });
				});
		});
	}

	/**
	 * @description Book a course for a dancer.
	 * @param {number} userID - The ID of the dancer who is booking the course.
	 * @param {number} courseID - The ID of the course to be booked.
	 * @return {Promise<void>} A promise that resolves when the course is successfully booked or rejects with an error message.
	 */
	bookCourse(userID, courseID) {
		// Table: Iscrizioni
		return new Promise((resolve, reject) => {
			// Check if the dancer is already booked for the course
			this.knex('Iscrizioni')
				.where({ IDBallerino: userID, IDCorso: courseID })
				.first() // Get the first matching record
				.then((booking) => {
					if (booking) {
						// If the dancer is already booked for the course, reject with an error
						reject({ error: 'Il corso è già prenotato.' });
						return;
					}
					// If not, insert a new booking record
					this.knex('Iscrizioni')
						.insert({
							IDBallerino: userID,
							IDCorso: courseID
						})
						.then(() => {
							resolve();
						})
						.catch((error) => {
							reject({ error: 'Errore durante la prenotazione del corso: ' + error.message });
						});
				})
				.catch((error) => {
					reject({ error: 'Errore durante il controllo della prenotazione del corso: ' + error.message });
				});
		});
	}

	/**
	 * @description Book an event for a dancer.
	 * @param {number} userID - The ID of the dancer who is booking the event.
	 * @param {number} eventID - The ID of the event to be booked.
	 * @return {Promise<void>} A promise that resolves when the event is successfully booked or rejects with an error message.
	 */
	bookEvent(userID, eventID) {
		// Table: Prenotazioni
		return new Promise((resolve, reject) => {
			// Check if the dancer is already booked for the event
			this.knex('Prenotazioni')
				.where({ IDBallerino: userID, IDEvento: eventID })
				.first() // Get the first matching record
				.then((booking) => {
					if (booking) {
						// If the dancer is already booked for the event, reject with an error
						reject({ error: 'L\'evento è già prenotato.' });
						return;
					}
					// If not, insert a new booking record
					this.knex('Prenotazioni')
						.insert({
							IDBallerino: userID,
							IDEvento: eventID
						})
						.then(() => {
							resolve();
						})
						.catch((error) => {
							reject({ error: 'Errore durante la prenotazione dell\'evento: ' + error.message });
						});
				})
				.catch((error) => {
					reject({ error: 'Errore durante il controllo della prenotazione dell\'evento: ' + error.message });
				});
		});
	}

	/**
	 * @description Creates a new feedback for a course.
	 * @param {number} userID - The ID of the dancer providing the feedback.
	 * @param {number} courseID - The ID of the course for which the feedback is provided.
	 * @param {number} rating - The rating given by the dancer (1 to 5).
	 * @param {string} body - The body of the feedback.
	 * @returns {Promise<Object>} A promise that resolves with the feedback creation success message or rejects with an error message.
	 */
	createFeedback(userID, courseID, rating, body) {
		return new Promise((resolve, reject) => {
			// Check if the feedback was already provided by the dancer for the course
			this.knex('Recensioni')
				.where({ IDBallerino: userID, IDCorso: courseID })
				.first() // Get the first matching record
				.then((feedback) => {
					if (feedback) {
						// If the feedback already exists, reject with an error
						reject({ error: 'Recensione già esistente.' });
						return;
					}
					
					// If not, proceed to create a new feedback

					// Insert the new feedback into the database
					this.knex('Recensioni')
					.insert({
						IDBallerino: userID,
						IDCorso: courseID,
						Valutazione: rating,
						Corpo: body
					})
					.then(() => {
						resolve({ message: 'Recensione creata con successo' });
					})
					.catch((error) => {
						reject({ error: 'Errore creazione recensione: ' + error.message });
					});
				})
				.catch((error) => {
					reject({ error: 'Errore durante il controllo della recensione: ' + error.message });
				});
		});
	}
	/**
	 * @description Answers a feedback.
	 * @param {number} feedbackID the ID of the feedback to answer
	 * @param {string} body the body of the answer
	 * @returns {Promise<Object>} A promise that resolves with the success message or rejects with an error message.
	 */
	answerFeedback(feedbackID, body) {
		return new Promise((resolve, reject) => {
			// Check if the answer already exists for the feedback
			this.knex('Risposte')
				.where({ IDRecensione: feedbackID })
				.first() // Get the first matching record
				.then((answer) => {
					if (answer) {
						// If the answer already exists, reject with an error
						reject({ error: 'Risposta già esistente.' });
						return;
					}
					
					// If not, proceed to create a new answer

					// Insert the new answer into the database
					this.knex('Risposte')
						.insert({
							IDRecensione: feedbackID,
							Corpo: body
						})
						.then(() => {
							resolve({ message: 'Risposta alla recensione inviata con successo' });
						})
						.catch((error) => {
							reject({ error: 'Errore invio risposta alla recensione: ' + error.message });
						});
				})
				.catch((error) => {
					reject({ error: 'Errore durante il controllo della risposta alla recensione: ' + error.message });
				});
		});
	}

	/*
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

	*/

	/**
	 * Creates a new attachment for a course.
	 * @param {*} courseID - The ID of the course to which the attachment belongs.
	 * @param {*} fileName - The name of the file being attached.
	 * @param {*} fileType - The MIME type of the file being attached.
	 * @param {*} filePath - The file path where the attachment is stored.
	 * @returns {Promise<Object>} A promise that resolves with the success message or rejects with an error message.
	 */
	newAttachment(courseID, fileName, fileType, filePath) {
		return new Promise((resolve, reject) => {
			// Insert the new attachment into the database
			this.knex('Allegati')
				.insert({
					IDCorso: courseID,
					NomeFile: fileName,
					Tipologia: fileType,
					Percorso: filePath
				})
				.then(() => {
					resolve({ message: 'Allegato creato con successo' });
				})
				.catch((error) => {
					reject({ error: 'Errore creazione allegato: ' + error.message });
				});
		});
	}

	/**
	 * @description Creates a new notification for a dancer.
	 * @param {number} schoolID - The ID of the school sending the notification.
	 * @param {number} dancerID - The ID of the dancer receiving the notification (OPTINAL)
	 * @param {string} type - The type of the notification ('Evento', 'Corso', 'News', 'Risposta').
	 * @param {string} message - The message content of the notification.
	 * @returns {Promise<Object>} A promise that resolves with the notification creation success message or rejects with an error message.
	 */
	newNotification(schoolID, dancerID, type, message) {
		return new Promise((resolve, reject) => {
			// Insert the new notification into the database
			this.knex('Notifiche')
				.insert({
					IDScuola: schoolID,
					IDBallerino: dancerID,
					Tipo: type,
					Messaggio: message
				})
				.then(() => {
					resolve({ message: 'Notifica creata con successo' });
				})
				.catch((error) => {
					reject({ error: 'Errore creazione notifica: ' + error.message });
				});
		});
	}

	/* =======================[FETCH ENTITY]=========================== */

	/**
	 * @description Fetches a dancer by their email.
	 * @param {string} email - The email address of the dancer to fetch.
	 * @returns {Promise<Object>} A promise that resolves with the dancer's details or rejects with an error message.
	 */
	fetchDancerByEmail(email) {
		return new Promise((resolve, reject) => {
			this.knex('Ballerini')
				.where({ Email: email })
				.first() // Get the first matching record
				.then((dancer) => {
					if (dancer) {
						resolve(dancer);
					} else {
						reject({ error: 'Ballerino non trovato' });
					}
				})
				.catch((error) => {
					reject({ error: 'Errore caricamento ballerino: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches a dancer by their ID.
	 * @param {number} id - The ID of the dancer to fetch.
	 * @returns {Promise<Object>} A promise that resolves with the dancer's details or rejects with an error message.
	 */
	fetchDancerById(id) {
		return new Promise((resolve, reject) => {
			this.knex('Ballerini')
				.where({ IDBallerino: id })
				.first() // Get the first matching record
				.then((dancer) => {
					if (dancer) {
						resolve(dancer);
					} else {
						reject({ error: 'Ballerino non trovato' });
					}
				})
				.catch((error) => {
					reject({ error: 'Errore caricamento ballerino: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches a dancer's ID by their feedback ID.
	 * @param {number} feedbackID - The ID of the feedback to fetch the dancer ID for.
	 * @returns {Promise<number>} A promise that resolves with the dancer's ID or rejects with an error message.
	 */
	fetchDancerIDByFeedbackID(feedbackID) {
  		return this.knex('Recensioni')
    		.where({ IDRecensione: feedbackID })
    		.select('IDBallerino')
    		.first().then((result) => {
	  			if (result) {
					return result.IDBallerino; // Return the dancer ID
	  			} else {
					throw new Error('Recensione non trovata');
	  			}
			}
		).catch((error) => {
			throw new Error('Errore durante il recupero dell\'ID del ballerino: ' + error.message);
		});
	}

	/**
	 * @description Fetches a school by its email.
	 * @param {string} email - The email address of the school to fetch.
	 * @returns {Promise<Object>} A promise that resolves with the school's details or rejects with
	 * an error message.
	 */
	fetchSchoolByEmail(email) {
		return new Promise((resolve, reject) => {
			this.knex('Scuole')
				.where({ Email: email })
				.first() // Get the first matching record
				.then((school) => {
					if (school) {
						resolve(school);
					} else {
						reject({ error: 'Scuola non trovata' });
					}
				})
				.catch((error) => {
					reject({ error: 'Errore caricamento scuola: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches a school by its ID.
	 * @param {number} id - The ID of the school to fetch.
	 * @returns {Promise<Object>} A promise that resolves with the school's details or rejects with
	 * an error message.
	 */
	fetchSchoolById(id) {
		return new Promise((resolve, reject) => {
			this.knex('Scuole')
				.where({ IDScuola: id })
				.first() // Get the first matching record
				.then((school) => {
					if (school) {
						resolve(school);
					} else {
						reject({ error: 'Scuola non trovata' });
					}
				})
				.catch((error) => {
					reject({ error: 'Errore caricamento scuola: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches all schools from the database.
	 * @returns {Promise<Array>} A promise that resolves with an array of schools' details
	 * or rejects with an error message.
	 */
	fetchAllSchools() {
		return new Promise((resolve, reject) => {
			this.knex('Scuole')
				.select('*') // Select all columns
				.then((schools) => {
					resolve(schools);
				})
				.catch((error) => {
					reject({ error: 'Error fetching schools: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches all dancers from the database.
	 * @returns {Promise<Array>} A promise that resolves with an array of dancers' details or rejects with an error message.
	 */
	fetchAllDancers() {
		return new Promise((resolve, reject) => {
			this.knex('Ballerini')
				.select('*') // Select all columns
				.then((dancers) => {
					resolve(dancers);
				})
				.catch((error) => {
					reject({ error: 'Error fetching dancers: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches all preferred schools for a dancer.
	 * @param {number} userID - The ID of the dancer whose preferred schools are
	 * to be fetched.
	 * @returns {Promise<Array>} A promise that resolves with an array of preferred schools or
	 * rejects with an error message.
	 * */
	fetchPreferredSchools(userID) {
		return new Promise((resolve, reject) => {
			this.knex('Preferiti')
				.join('Scuole', 'Preferiti.IDScuola', 'Scuole.IDScuola')
				.where({ IDBallerino: userID })
				.select('Scuole.*') // Select all columns from the Scuole table
				.then((preferredSchools) => {
					if (preferredSchools.length > 0) {
						resolve(preferredSchools); // Return the list of preferred schools
					} else {
						resolve([]); // No preferred schools found, return an empty array
					}
				})
				.catch((error) => {
					reject({ error: 'Errore durante il caricamento delle scuole preferite: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches all courses for a specific school.
	 * @param {number} schoolID - The ID of the school whose courses are to be fetched.
	 * @return {Promise<Array>} A promise that resolves with an array of courses or rejects with an error message.
	 */
	fetchSchoolCourses(schoolID) {
		return new Promise((resolve, reject) => {
			this.knex('Corsi')
				.where({ IDScuola: schoolID })
				.select('*') // Select all columns from the Corsi table
				.then((courses) => {
					resolve(courses);
				})
				.catch((error) => {
					reject({ error: 'Errore durante il caricamento dei corsi: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches all courses from the database.
	 * @returns {Promise<Array>} A promise that resolves with an array of courses or rejects
	 * with an error message.
	 */
	fetchAllCourses() {
		return new Promise((resolve, reject) => {
			this.knex('Corsi')
				.join('Scuole', 'Corsi.IDScuola', 'Scuole.IDScuola') // Join with Scuole table to get school details
				.leftJoin('Recensioni', 'Corsi.IDCorso', 'Recensioni.IDCorso') // Left join with Recensioni table to get feedback details
				.groupBy('Corsi.IDCorso', 'Scuole.IDScuola') // Group by course and school IDs
				.orderBy('Corsi.IDCorso', 'desc') // Order by course ID
				.select('Corsi.*', 'Scuole.Nome AS NomeScuola', this.knex.raw('AVG(Recensioni.Valutazione) AS MediaValutazione')) // Select all columns from the Corsi table and the school name
				.then((courses) => {
					resolve(courses);
				})
				.catch((error) => {
					reject({ error: 'Errore durante il caricamento dei corsi: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches all events from the database.
	 * @returns {Promise<Array>} A promise that resolves with an array of events or rejects
	 * with an error message.
	 */
	fetchAllEvents() {
		return new Promise((resolve, reject) => {
			this.knex('Eventi')
				.join('Scuole', 'Eventi.IDScuola', 'Scuole.IDScuola') // Join with Scuole table to get school details
				.select('Eventi.*', 'Scuole.Nome AS NomeScuola') // Select all columns from the Eventi table and the school name
				.then((events) => {
					resolve(events);
				})
				.catch((error) => {
					reject({ error: 'Errore durante il caricamento degli eventi: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches all events for a specific school.
	 * @param {number} schoolID - The ID of the school whose events are to be fetched.
	 * @return {Promise<Array>} A promise that resolves with an array of events or rejects with an error message.
	 */
	fetchSchoolEvents(schoolID) {
		return new Promise((resolve, reject) => {
			this.knex('Eventi')
				.where({ IDScuola: schoolID })
				.select('*') // Select all columns from the Eventi table
				.then((events) => {
					resolve(events);
				})
				.catch((error) => {
					reject({ error: 'Errore durante il caricamento degli eventi della scuola: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches all courses booked by a dancer.
	 * @param {number} userID - The ID of the dancer whose booked courses are to be fetched.
	 * @returns {Promise<Array>} A promise that resolves with an array of booked courses or rejects with an error message.
	 */
	fetchBookedCourses(userID) {
		return new Promise((resolve, reject) => {
			this.knex('Iscrizioni')
				.join('Corsi', 'Iscrizioni.IDCorso', 'Corsi.IDCorso') // Join with Corsi table to get course details
				.join('Scuole', 'Corsi.IDScuola', 'Scuole.IDScuola') // Join with Scuole table to get school details
				.where({ IDBallerino: userID })
				.select('Corsi.*', 'Iscrizioni.Stato', 'Iscrizioni.IDIscrizione', 'Scuole.Nome AS NomeScuola') // Select all columns from the Corsi table and the school name
				.orderBy('Iscrizioni.IDIscrizione', 'desc') // Order by booking ID in descending order
				.then((bookedCourses) => {
					if (bookedCourses.length > 0) {
						console.log('Booked courses:', bookedCourses); // Log the booked courses for debugging
						resolve(bookedCourses); // Return the list of booked courses
					} else {
						resolve([]); // No booked courses found, return an empty array
					}
				})
				.catch((error) => {
					reject({ error: 'Errore durante il caricamento dei corsi prenotati: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches all events booked by a dancer.
	 * @param {number} userID - The ID of the dancer whose booked events are to be fetched.
	 * @returns {Promise<Array>} A promise that resolves with an array of booked events or rejects with an error message.
	 */
	fetchBookedEvents(userID) {
		return new Promise((resolve, reject) => {
			this.knex('Prenotazioni')
				.join('Eventi', 'Prenotazioni.IDEvento', 'Eventi.IDEvento') // Join with Eventi table to get event details
				.join('Scuole', 'Eventi.IDScuola', 'Scuole.IDScuola') // Join with Scuole table to get school details
				.where({ IDBallerino: userID })
				.select('Eventi.*', 'Prenotazioni.Stato', 'Prenotazioni.IDPrenotazione', 'Scuole.Nome AS NomeScuola') // Select all columns from the Eventi table and the school name
				.then((bookedEvents) => {
					if (bookedEvents.length > 0) {
						console.log('Booked events:', bookedEvents); // Log the booked events for debugging
						resolve(bookedEvents); // Return the list of booked events
					} else {
						resolve([]); // No booked events found, return an empty array
					}
				})
				.catch((error) => {
					reject({ error: 'Errore durante il caricamento degli eventi prenotati: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches all course bookings details for a specific school.
	 * @param {number} schoolID - The ID of the school whose course bookings are to be fetched.
	 * @returns {Promise<Array>} A promise that resolves with an array of course bookings details or rejects with an error message.
	 */
	fetchCourseBookingsDetailsBySchool(schoolID) {
		return new Promise((resolve, reject) => {
			this.knex('Iscrizioni')
				.join('Corsi', 'Iscrizioni.IDCorso', 'Corsi.IDCorso') // Join with Corsi table to get course details
				.join('Ballerini', 'Iscrizioni.IDBallerino', 'Ballerini.IDBallerino') // Join with Ballerini table to get dancer details
				.where({ 'Corsi.IDScuola': schoolID }) // Filter by school ID
				.select('Iscrizioni.*', 'Corsi.Nome AS NomeCorso', 'Ballerini.Nome AS NomeBallerino', 'Ballerini.Email AS EmailBallerino', 'Ballerini.Cognome AS CognomeBallerino') // Select relevant columns
				.orderBy('Iscrizioni.IDIscrizione', 'desc') // Order by booking ID in descending order
				.then((bookings) => {
					if (bookings.length > 0) {
						console.log('Course bookings:', bookings); // Log the course bookings for debugging
						resolve(bookings); // Return the list of course bookings
					} else {
						resolve([]); // No course bookings found, return an empty array
					}
				})
				.catch((error) => {
					reject({ error: 'Errore durante il caricamento delle prenotazioni dei corsi: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches all event bookings details for a specific school.
	 * @param {number} schoolID - The ID of the school whose event bookings are to be fetched.
	 * @returns {Promise<Array>} A promise that resolves with an array of event bookings details or rejects with an error message.
	 */
	fetchEventBookingsDetailsBySchool(schoolID) {
		return new Promise((resolve, reject) => {
			this.knex('Prenotazioni')
				.join('Eventi', 'Prenotazioni.IDEvento', 'Eventi.IDEvento') // Join with Eventi table to get event details
				.join('Ballerini', 'Prenotazioni.IDBallerino', 'Ballerini.IDBallerino') // Join with Ballerini table to get dancer details
				.where({ 'Eventi.IDScuola': schoolID }) // Filter by school ID
				.select('Prenotazioni.*', 'Eventi.Nome AS NomeEvento', 'Ballerini.Nome AS NomeBallerino', 'Ballerini.Email AS EmailBallerino', 'Ballerini.Cognome AS CognomeBallerino') // Select relevant columns
				.orderBy('Prenotazioni.IDPrenotazione', 'desc') // Order by booking ID in descending order
				.then((bookings) => {
					if (bookings.length > 0) {
						console.log('Event bookings:', bookings); // Log the event bookings for debugging
						resolve(bookings); // Return the list of event bookings
					} else {
						resolve([]); // No event bookings found, return an empty array
					}
				})
				.catch((error) => {
					reject({ error: 'Errore durante il caricamento delle prenotazioni degli eventi: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches all feedback for a specific school.
	 * @param {number} schoolID - The ID of the school whose feedback is to be fetched.
	 * @returns {Promise<Array>} A promise that resolves with an array of feedback or rejects
	 * with an error message.
	 */
	fetchFeedbackBySchool(schoolID) {
		return new Promise((resolve, reject) => {
			this.knex('Recensioni')
				.join('Ballerini', 'Recensioni.IDBallerino', 'Ballerini.IDBallerino') // Join with Ballerini table to get dancer details
				.join('Corsi', 'Recensioni.IDCorso', 'Corsi.IDCorso') // Join with Corsi table to get course details
				.leftJoin('Risposte', 'Recensioni.IDRecensione', 'Risposte.IDRecensione') // Left join with Risposte table to get feedback answers
				.where({ 'Corsi.IDScuola': schoolID }) // Filter by school ID
				.select('Recensioni.*', 'Risposte.IDRisposta AS IDRisposta', 'Ballerini.Nome AS NomeBallerino', 'Ballerini.Email AS EmailBallerino', 'Ballerini.Cognome AS CognomeBallerino', 'Corsi.Nome AS NomeCorso') // Select relevant columns
				.orderBy('Recensioni.DataCreazione', 'desc') // Order by creation date in descending order
				.then((feedback) => {
					if (feedback.length > 0) {
						resolve(feedback); // Return the list of feedback
					} else {
						resolve([]); // No feedback found, return an empty array
					}
				})
				.catch((error) => {
					reject({ error: 'Errore durante il caricamento delle recensioni: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches all answers to feedback for a specific school.
	 * @param {number} schoolID - The ID of the school whose feedback answers are to be fetched.
	 * @returns {Promise<Array>} A promise that resolves with an array of feedback answers or rejects with an error message.
	 */
	fetchFeedbackAnswerBySchool(schoolID) {
		return new Promise((resolve, reject) => {
			this.knex('Risposte')
				.join('Recensioni', 'Risposte.IDRecensione', 'Recensioni.IDRecensione') // Join with Recensioni table to get feedback details
				.join('Corsi', 'Recensioni.IDCorso', 'Corsi.IDCorso') // Join with Corsi table to get course details
				.where({ 'Corsi.IDScuola': schoolID }) // Filter by school ID
				.select('Risposte.*', 'Recensioni.Corpo AS CorpoRecensione', 'Corsi.Nome AS NomeCorso') // Select relevant columns
				.orderBy('Risposte.DataCreazione', 'desc') // Order by creation date in descending order
				.then((answers) => {
					if (answers.length > 0) {
						resolve(answers); // Return the list of answers
					} else {
						resolve([]); // No answers found, return an empty array
					}
				})
				.catch((error) => {
					reject({ error: 'Errore durante il caricamento delle risposte: ' + error.message });
				});
		});
	}

	
	/**
	 * @description Fetches all grouped ratings for all courses provided by a specific school.
	 * @param {number} schoolID - The ID of the school whose course ratings are to be fetched.
	 * @returns {Promise<Array>} A promise that resolves with an array of grouped ratings or rejects with an error message.
	 */
	fetchRatingsBySchool(schoolID) {
		return new Promise((resolve, reject) => {
			this.knex('Recensioni')
				.join('Corsi', 'Recensioni.IDCorso', 'Corsi.IDCorso') // Join with Corsi table to get course details
				.where({ 'Corsi.IDScuola': schoolID }) // Filter by school ID
				.groupBy('Recensioni.IDCorso') // Group by course ID
				.select('Recensioni.IDCorso', this.knex.raw('AVG(Recensioni.Valutazione) as AverageRating')) // Select course ID and average rating
				.orderBy('AverageRating', 'desc') // Order by average rating in descending order
				.then((ratings) => {
					if (ratings.length > 0) {
						resolve(ratings); // Return the list of ratings
					} else {
						resolve([]); // No ratings found, return an empty array
					}
				})
				.catch((error) => {
					reject({ error: 'Errore durante il caricamento delle valutazioni: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches all ratings for all schools.
	 * @returns {Promise<Array>} A promise that resolves with an array of school ratings or rejects with an error message.
	 */
	fetchAllSchoolsRatings() {
		return new Promise((resolve, reject) => {
			this.knex('Scuole')
				.leftJoin('Corsi', 'Scuole.IDScuola', 'Corsi.IDScuola') // Left join with Corsi table to get course details
				.leftJoin('Recensioni', 'Corsi.IDCorso', 'Recensioni.IDCorso') // Left join with Recensioni table to get ratings
				.groupBy('Scuole.IDScuola') // Group by school ID
				.select('Scuole.IDScuola', 'Scuole.Nome', this.knex.raw('AVG(Recensioni.Valutazione) as AverageRating')) // Select school ID, name, and average rating
				.orderBy('AverageRating', 'desc') // Order by average rating in descending order
				.then((ratings) => {
					if (ratings.length > 0) {
						resolve(ratings); // Return the list of ratings
					} else {
						resolve([]); // No ratings found, return an empty array
					}
				})
				.catch((error) => {
					reject({ error: 'Errore durante il caricamento delle valutazioni delle scuole: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches all attachments for a specific school.
	 * @param {number} schoolID - The ID of the school whose attachments are to be fetched.
	 * @returns {Promise<Array>} A promise that resolves with an array of attachments or rejects with an error message.
	 */
	fetchAttachmentsBySchool(schoolID) {
		return new Promise((resolve, reject) => {
			this.knex('Allegati')
				.join('Corsi', 'Allegati.IDCorso', 'Corsi.IDCorso') // Join with Corsi table to get course details
				.where({ 'Corsi.IDScuola': schoolID }) // Filter by school ID
				.select('Allegati.*', 'Corsi.Nome AS NomeCorso', 'Corsi.IDCorso AS IDCorso') // Select relevant columns
				.orderBy('Allegati.DataUpload', 'desc') // Order by upload date in descending order
				.then((attachments) => {
					if (attachments.length > 0) {
						resolve(attachments); // Return the list of attachments
					} else {
						resolve([]); // No attachments found, return an empty array
					}
				})
				.catch((error) => {
					reject({ error: 'Errore durante il caricamento degli allegati: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches all attachments for a specific dancer.
	 * @param {number} userID - The ID of the dancer whose attachments are to be fetched.
	 * @returns {Promise<Array>} A promise that resolves with an array of attachments or rejects with an error message.
	 */
	fetchAttachmentsByDancer(userID) {
		return new Promise((resolve, reject) => {
			this.knex('Allegati')
				.join('Corsi', 'Allegati.IDCorso', 'Corsi.IDCorso') // Join with Corsi table to get course details
				.join('Scuole', 'Corsi.IDScuola', 'Scuole.IDScuola') // Join with Scuole table to get school details
				.join('Iscrizioni', 'Allegati.IDCorso', 'Iscrizioni.IDCorso') // Join with Iscrizioni table to get dancer details
				.where({ 'Iscrizioni.IDBallerino': userID, 'Iscrizioni.Stato': "Accettata" }) // Filter by dancer ID
				.select('Allegati.*', 'Corsi.IDCorso AS IDCorso', 'Corsi.Nome AS NomeCorso', 'Scuole.Nome AS NomeScuola')
				.then((attachments) => {
					if (attachments.length > 0) {
						resolve(attachments); // Return the list of attachments
					} else {
						resolve([]); // No attachments found, return an empty array
					}
				})
				.catch((error) => {
					reject({ error: 'Errore durante il caricamento degli allegati: ' + error.message });
				});
		});
	}

	/**
	 * @description Fetches all notifications for a specific dancer.
	 * @param {number} userID - The ID of the dancer whose notifications are to be fetched.
	 * @returns {Promise<Array>} A promise that resolves with an array of notifications or rejects with an error message.
	 */
	fetchUserNotifications(dancerID) {
		const knex = this.knex; // Salvo l'istanza Knex per usarla correttamente dentro le callback

		return knex('Notifiche')
			.join('Scuole', 'Notifiche.IDScuola', 'Scuole.IDScuola')
			.leftJoin('Preferiti', function () {
			this.on('Notifiche.IDScuola', '=', 'Preferiti.IDScuola')
				.andOn('Preferiti.IDBallerino', '=', knex.raw('?', [dancerID]));
			})
			.where(function () {
			this.where('Notifiche.IDBallerino', dancerID) // 🔹 Notifiche dirette al ballerino
				.orWhere(function () {
				this.whereNull('Notifiche.IDBallerino') // 🔹 Notifiche generiche
					.andWhere('Preferiti.IDBallerino', dancerID)
					.andWhere('Notifiche.DataInvio', '>=', knex.ref('Preferiti.DataCreazione'));
				});
			})
			.select('Notifiche.*', 'Scuole.Nome AS NomeScuola')
			.orderBy('Notifiche.DataInvio', 'desc')
			.then((notifications) => {
				if (notifications.length > 0) {
					return notifications; // Return the list of notifications
				} else {
					return []; // No notifications found, return an empty array
				}
			})
			.catch((error) => {
				throw { error: 'Errore nel recupero delle notifiche: ' + error.message };
			});
	}

	/* =======================[UPDATE ENTITY]=========================== */

	/**
	 * @description Update school profile information.
	 * @param {number} schoolID - The ID of the school whose profile is to be updated.
	 * @param {string} name - The new name of the school.
	 * @param {string} email - The new email address of the school.
	 * @param {string} phone - The new phone number of the school.
	 * @param {string} address - The new address of the school.
	 * @param {string} city - The new city of the school.
	 * @param {string} cap - The new postal code of the school.
	 * @param {string} province - The new province of the school.
	 * @param {string} region - The new region of the school.
	 * @param {string} password - The new password for the school (optional).
	 * @returns {Promise<Object>} A promise that resolves when the profile is successfully updated
	 * or rejects with an error message.
	 */
	updateSchoolProfile(schoolID, name, email, phone, address, city, cap, province, region, password) {
		return new Promise((resolve, reject) => {
			// Update the school's profile information in the database
			this.knex('Scuole')
				.where({ IDScuola: schoolID })
				.update({
					Nome: name,
					Email: email,
					Telefono: phone,
					Indirizzo: address,
					Citta: city,
					CAP: cap,
					Provincia: province,
					Regione: region,
					Password: password ? bcrypt.hashSync(password, NUMBER_OF_ROUNDS) : undefined // If password is provided, hash it
				})
				.then(() => {
					resolve({ message: 'Profilo della scuola aggiornato con successo' }); // Successfully updated the school profile
				})
				.catch((error) => {
					reject({ error: 'Errore durante l\'aggiornamento del profilo della scuola: ' + error.message });
				});
		});
	}

	/**
	 * @description Update school profile photo
	 * @param {number} schoolID - The ID of the school whose profile photo is to be updated.
	 * @param {string} photoPath - The path to the new profile photo.
	 * @returns {Promise<void>} A promise that resolves when the profile photo is successfully updated
	 * or rejects with an error message.
	 */
	updateSchoolPhoto(schoolID, photoPath) {
		return new Promise((resolve, reject) => {
			// Update the school's profile photo in the database
			this.knex('Scuole')
				.where({ IDScuola: schoolID })
				.update({ ImmagineProfilo: photoPath })
				.then(() => {
					resolve(); // Successfully updated the profile photo
				})
				.catch((error) => {
					reject({ error: 'Errore durante l\'aggiornamento della foto profilo della scuola: ' + error.message });
				});
		});
	}

	/**
	 * @description Update dancer profile information.
	 * @param {number} userID - The ID of the dancer whose profile is to be updated.
	 * @param {string} name - The new name of the dancer.
	 * @param {string} surname - The new surname of the dancer.
	 * @param {string} email - The new email address of the dancer.
	 * @param {string} phone - The new phone number of the dancer.
	 * @param {Date} bornDate - The new date of birth of the dancer.
	 * @param {string} password - The new password for the dancer.
	 * @returns {Promise<void>} A promise that resolves when the profile is successfully updated
	 * or rejects with an error message.
	 */
	updateDancerProfile(userID, name, surname, email, phone, bornDate, password) {
		return new Promise((resolve, reject) => {
			// Update the dancer's profile information in the database
			this.knex('Ballerini')
				.where({ IDBallerino: userID })
				.update({
					Nome: name,
					Cognome: surname,
					Email: email,
					Telefono: phone,
					DataNascita: bornDate,
					// If password is provided, hash it and update, otherwise keep the existing password
					Password: password ? bcrypt.hashSync(password, NUMBER_OF_ROUNDS) : undefined
				})
				.then(() => {
					resolve({message: "Profilo aggiornato con successo"}); // Successfully updated the profile
				})
				.catch((error) => {
					reject({ error: 'Errore durante l\'aggiornamento del profilo del ballerino: ' + error.message });
				});
		});
	}

	/**
	 * @description Update dancer profile photo
	 * @param {number} userID - The ID of the dancer whose profile photo is to be updated.
	 * @param {string} photoPath - The path to the new profile photo.
	 * @returns {Promise<void>} A promise that resolves when the profile photo is successfully updated
	 * or rejects with an error message.
	 */
	updateDancerPhoto(userID, photoPath) {
		return new Promise((resolve, reject) => {
			// Update the dancer's profile photo in the database
			this.knex('Ballerini')
				.where({ IDBallerino: userID })
				.update({ ImmagineProfilo: photoPath })
				.then(() => {
					resolve(); // Successfully updated the profile photo
				})
				.catch((error) => {
					reject({ error: 'Errore durante l\'aggiornamento della foto profilo del ballerino: ' + error.message });
				});
		});
	}

	/**
	 * @description Updates the poster of an event.
	 * @param {number} eventID - The ID of the event to update.
	 * @param {string} posterPath - The new path to the event poster.
	 * @returns {Promise<void>} A promise that resolves when the event poster is successfully updated
	 * or rejects with an error message.
	 */
	updateEventPoster(eventID, posterPath) {
		return new Promise((resolve, reject) => {
			// Update the event's poster in the database
			this.knex('Eventi')
				.where({ IDEvento: eventID })
				.update({ Locandina: posterPath })
				.then(() => {
					resolve(); // Successfully updated the event poster
				})
				.catch((error) => {
					reject({ error: 'Errore durante l\'aggiornamento della locandina dell\'evento: ' + error.message });
				});
		});
	}

	/**
	 * @description Update school description.
	 * @param {number} schoolID - The ID of the school to update.
	 * @param {string} description - The new description for the school.
	 * @returns {Promise<void>} A promise that resolves when the school description is successfully updated
	 * or rejects with an error message.
	 */
	updateSchoolDescription(schoolID, description) {
		return new Promise((resolve, reject) => {
			// Update the school's description in the database
			this.knex('Scuole')
				.where({ IDScuola: schoolID })
				.update({ Descrizione: description })
				.then(() => {
					resolve(); // Successfully updated the school description
				})
				.catch((error) => {
					reject({ error: 'Errore durante l\'aggiornamento della descrizione della scuola: ' + error.message });
				});
		});
	}

	/**
	 * @description Update course details by its ID.
	 * @param {number} courseID - The ID of the course to update.
	 * @param {number} schoolID - The ID of the school whose courses are to be updated.
	 * @param {string} name - The new name of the course.
	 * @param {string} instructor - The new instructor for the course.
	 * @param {string} type - The new type of the course.
	 * @param {string} level - The new level of the course.
	 * @param {number} price - The new price of the course.
	 * @param {Date} startDate - The new start date of the course.
	 * @param {Date} endDate - The new end date of the course.
	 * @param {string} startTime - The new start time of the course.
	 * @param {string} endTime - The new end time of the course.
	 * @param {string} category - The new category of the course.
	 * @returns {Promise<void>} A promise that resolves when the course is successfully updated or
	 * rejects with an error message.
	 */
	updateCourse(courseID, schoolID, name, instructor, type, level, price, startDate, endDate, startTime, endTime, category) {
		return new Promise((resolve, reject) => {
			// Update the course details in the database
			this.knex('Corsi')
				.where({ IDCorso: courseID, IDScuola: schoolID })
				.update({
					Nome: name,
					Istruttore: instructor,
					Tipologia: type,
					Livello: level,
					Prezzo: price,
					DataInizio: startDate,
					DataFine: endDate,
					OrarioInizio: startTime,
					OrarioFine: endTime,
					CategoriaCorso: category
				})
				.then(() => {
					resolve({message: 'Corso aggiornato con successo'}); // Successfully updated the course
				})
				.catch((error) => {
					reject({ error: 'Errore durante l\'aggiornamento del corso: ' + error.message });
				});
		});
	}

	/**
	 * @description Updates the details of an event.
	 * @param {number} eventID - The ID of the event to update.
	 * @param {string} name - The new name of the event.
	 * @param {string} description - The new description of the event.
	 * @param {string} location - The new location of the event.
	 * @param {string} price - The new price of the event.
	 * @param {Date} dateTime - The new date and time of the event.
	 * @returns {Promise<Object>} A promise that resolves with a success message or rejects with
	 * an error message.
	 */
	updateEvent(eventID, name, description, location, price, dateTime) {
		return new Promise((resolve, reject) => {
			// Update the event details in the database
			this.knex('Eventi')
				.where({ IDEvento: eventID })
				.update({
					Nome: name,
					Descrizione: description,
					Luogo: location,
					Prezzo: price,
					DataOra: dateTime
				})
				.then(() => {
					resolve({ message: 'Evento aggiornato con successo' }); // Successfully updated the event
				})
				.catch((error) => {
					reject({ error: 'Errore durante l\'aggiornamento dell\'evento: ' + error.message });
				});
		});
	}
	
	/**
	 * @description Updates the booking status of a course.
	 * @param {number} bookingID - The ID of the course booking to update.
	 * @param {string} status - The new status of the booking ['Richiesta', 'Accettata', 'Rifiutata', 'Terminata'].
	 * @returns {Promise<Object>} A promise that resolves with a success message or rejects with an error message.
	 */
	updateCourseBookingStatus(bookingID, status) {
		return new Promise((resolve, reject) => {
			// Update the booking status in the database
			this.knex('Iscrizioni')
				.where({ IDIscrizione: bookingID })
				.update({ Stato: status })
				.then(() => {
					resolve({ message: 'Stato della prenotazione del corso aggiornato con successo' }); // Successfully updated the booking status
				})
				.catch((error) => {
					reject({ error: 'Errore durante l\'aggiornamento dello stato della prenotazione del corso: ' + error.message });
				});
		});
	}
	
	/**
	 * @description Updates the booking status of an event.
	 * @param {number} bookingID - The ID of the event booking to update.
	 * @param {string} status - The new status of the booking ['Richiesta', 'Accettata', 'Rifiutata', 'Terminata'].
	 * @returns {Promise<Object>} A promise that resolves with a success message or rejects with an error message.
	 */
	updateEventBookingStatus(bookingID, status) {
		return new Promise((resolve, reject) => {
			// Update the booking status in the database
			this.knex('Prenotazioni')
				.where({ IDPrenotazione: bookingID })
				.update({ Stato: status })
				.then(() => {
					resolve({ message: 'Stato della prenotazione dell\'evento aggiornato con successo' }); // Successfully updated the booking status
				})
				.catch((error) => {
					reject({ error: 'Errore durante l\'aggiornamento dello stato della prenotazione dell\'evento: ' + error.message });
				});
		});
	}

	/* =======================[DELETE ENTITY]=========================== */

	/**
	 * @description Unfollows a school for a dancer.
	 * @param {number} userID - The ID of the dancer who is unfollow
	 * @param {number} schoolID - The ID of the school to be unfollowed
	 * @returns {Promise<void>} A promise that resolves when the school is successfully unfollowed or rejects with an error message.
	 */
	unfollowSchool(userID, schoolID) {
		return new Promise((resolve, reject) => {
			// Check if the dancer is following the school
			this.knex('Preferiti')
				.where({ IDBallerino: userID, IDScuola: schoolID })
				.first() // Get the first matching record
				.then((follow) => {
					if (follow) {
						// If the dancer is following the school, delete the follow record
						this.knex('Preferiti')
							.where({ IDBallerino: userID, IDScuola: schoolID })
							.del() // Delete the record
							.then(() => {
								resolve(); // Successfully unfollowed the school
							})
							.catch((error) => {
								reject({ error: 'Errore durante il tentativo di smettere di seguire la scuola: ' + error.message });
							});
					} else {
						// If the dancer is not following the school, reject with an error
						reject({ error: 'La scuola non è seguita.' });
					}
				})
				.catch((error) => {
					reject({ error: 'Errore durante il controllo della scuola seguita: ' + error.message });
				});
		});
	}

	/**
	 * @description Deletes a course by its ID.
	 * @param {number} courseID - The ID of the course to delete.
	 * @param {number} schoolID - The ID of the school whose course is to be deleted.
	 * @returns {Promise<void>} A promise that resolves when the course is successfully deleted or
	 * rejects with an error message.
	 * */
	deleteCourse(courseID, schoolID) {
		return new Promise((resolve, reject) => {
			// Delete the course from the database
			this.knex('Corsi')
				.where({ IDCorso: courseID, IDScuola: schoolID })
				.del() // Delete the record
				.then(() => {
					resolve({ message: 'Corso eliminato con successo' }); // Successfully deleted the course
				})
				.catch((error) => {
					reject({ error: 'Errore durante l\'eliminazione del corso: ' + error.message });
				});
		});
	}

	/**
	 * @description Deletes an event by its ID.
	 * @param {number} eventID - The ID of the event to delete.
	 * @returns {Promise<void>} A promise that resolves when the event is successfully deleted or
	 * rejects with an error message.
	 */
	deleteEvent(eventID) {
		return new Promise((resolve, reject) => {
			// Delete the event from the database
			this.knex('Eventi')
				.where({ IDEvento: eventID })
				.del() // Delete the record
				.then(() => {
					resolve({ message: 'Evento eliminato con successo' }); // Successfully deleted the event
				})
				.catch((error) => {
					reject({ error: 'Errore durante l\'eliminazione dell\'evento: ' + error.message });
				});
		});
	}

	/**
	 * @description Cancels a course booking by its ID.
	 * @param {number} bookingID - The ID of the course booking to cancel.
	 * @returns {Promise<Object>} A promise that resolves with a success message or rejects with
	 * an error message.
	 */
	cancelCourseBooking(bookingID) {
		return new Promise((resolve, reject) => {
			// Cancel the course booking by updating its status to 'Annullata'
			this.knex('Iscrizioni')
				.where({ IDIscrizione: bookingID })
				.del() // Delete the booking record
				.then(() => {
					resolve({ message: 'Iscrizione al corso annullata con successo' }); // Successfully cancelled the course booking
				})
				.catch((error) => {
					reject({ error: 'Errore durante l\'annullamento dell\'iscrizione del corso: ' + error.message });
				});
		});
	}

	/**
	 * @description Cancels an event booking by its ID.
	 * @param {number} bookingID - The ID of the event booking to cancel.
	 * @returns {Promise<Object>} A promise that resolves with a success message or rejects with
	 * an error message.
	 */
	cancelEventBooking(bookingID) {
		return new Promise((resolve, reject) => {
			// Cancel the event booking by updating its status to 'Annullata'
			this.knex('Prenotazioni')
				.where({ IDPrenotazione: bookingID })
				.del() // Delete the booking record
				.then(() => {
					resolve({ message: 'Prenotazione dell\'evento annullata con successo' }); // Successfully cancelled the event booking
				})
				.catch((error) => {
					reject({ error: 'Errore durante l\'annullamento della prenotazione dell\'evento: ' + error.message });
				});
		});
	}

	/**
	 * @description Deletes attachment by its ID.
	 * @param {number} attachmentID - The ID of the attachment to delete.
	 * @returns {Promise<void>} A promise that resolves when the attachment is successfully deleted
	 * or rejects with an error message.
	 */
	deleteAttachment(attachmentID) {
		return new Promise((resolve, reject) => {
			// Delete the attachment from the database
			this.knex('Allegati')
				.where({ IDAllegato: attachmentID })
				.del() // Delete the record
				.then(() => {
					resolve({ message: 'Allegato eliminato con successo' }); // Successfully deleted the attachment
				})
				.catch((error) => {
					reject({ error: 'Errore durante l\'eliminazione dell\'allegato: ' + error.message });
				});
		});
	}

	/**
	 * Deletes a dancer by their ID.
	 * @param {number} userID - The ID of the dancer to delete.
	 * @returns {Promise<Object>} A promise that resolves with a success message or rejects with an error message.
	 */
	deleteDancer(userID) {
		return new Promise((resolve, reject) => {
			// Delete the dancer from the database
			this.knex('Ballerini')
				.where({ IDBallerino: userID })
				.del() // Delete the record
				.then(() => {
					resolve({ message: 'Ballerino eliminato con successo' });
				})
				.catch((error) => {
					reject({ error: 'Errore durante l\'eliminazione del ballerino: ' + error.message });
				});
		});
	}

	/**
	 * @description Deletes a school by its ID.
	 * @param {number} schoolID - The ID of the school to delete.
	 * @returns {Promise<Object>} A promise that resolves with a success message or rejects with
	 * an error message.
	 */
	deleteSchool(schoolID) {
		return new Promise((resolve, reject) => {
			// Delete the school from the database
			this.knex('Scuole')
				.where({ IDScuola: schoolID })
				.del() // Delete the record
				.then(() => {
					resolve({ message: 'Scuola eliminata con successo' });
				})
				.catch((error) => {
					reject({ error: 'Errore durante l\'eliminazione della scuola: ' + error.message });
				});
		});
	}				

	/* =======================[LOGIN USERS]=========================== */

	/**
	 * @description Validates a dancer's login credentials.
	 * @param {string} email - The email address of the dancer.
	 * @param {string} password - The password of the dancer.
	 * @returns {Promise<Object>} A promise that resolves with the dancer's details if credentials are valid or rejects with an error message.
	 */
	validateDancerCredentials(email, password) {
		return new Promise((resolve, reject) => {
			this.fetchDancerByEmail(email)
				.then((dancer) => {
					// Compare the provided password with the stored hashed password
					if (bcrypt.compareSync(password, dancer.Password)) {
						resolve(dancer); // Credentials are valid
					} else {
						reject({ error: 'Email/Password non validi' });
					}
				})
				.catch(() => {
					reject({ error: 'Email/Password non validi' });
				});
		});
	}
	

	/**
	 * @description Validates a school's login credentials.
	 * @param {string} email - The email address of the school.
	 * @param {string} password - The password of the school.
	 * @returns {Promise<Object>} A promise that resolves with the school's details if credentials are
	 * valid or rejects with an error message.
	 */
	validateSchoolCredentials(email, password) {
		return new Promise((resolve, reject) => {
			this.knex('Scuole')
				.where({ Email: email })
				.first() // Get the first matching record
				.then((school) => {
					if (school) {
						// Compare the provided password with the stored hashed password
						if (bcrypt.compareSync(password, school.Password)) {
							resolve(school); // Credentials are valid
						} else {
							reject({ error: 'Email/Password non validi' });
						}
					} else {
						// School not found
						reject({ error: 'Email/Password non validi' });
					}
				})
				.catch(() => {
					reject({ error: 'Email/Password non validi' });
				});
		});
	}

	/* =======================[OTHER CHECKINGS]=========================== */

	/**
	 * @description Checks if a dancer is following a school.
	 * @param {number} userID - The ID of the dancer.
	 * @param {number} schoolID - The ID of the school to check.
	 * @returns {Promise<boolean>} A promise that resolves with true if the dancer is following
	 * the school, or false if not.
	 */
	checkUserFollowSchool(userID, schoolID) {
		return new Promise((resolve, reject) => {
			this.knex('Preferiti')
				.where({ IDBallerino: userID, IDScuola: schoolID })
				.first() // Get the first matching record
				.then((follow) => {
					if (follow) {
						resolve(true); // User is following the school
					} else {
						resolve(false); // User is not following the school
					}
				})
				.catch((error) => {
					reject({ error: 'Errore durante il controllo della scuola seguita: ' + error.message });
				});
		});
	}

	/* ==============================[SEARCH]================================= */

	/**
	 * @description Fetches schools by name.
	 * @param {string} name - The name of the school to search for.
	 * @param {string} city - The city of the school (optional).
	 * @returns {Promise<Array>} A promise that resolves with an array of matching schools.
	 */
	filterSchools(name, city) {
		return new Promise((resolve, reject) => {
			let query = this.knex('Scuole')
				.select('*') // Select all columns from the Scuole table
				.where((builder) => {
					if (name) {
						builder.whereLike('Nome', `%${name}%`); // Filter by school name
					}
					if (city) {
						builder.whereLike('Citta', `%${city}%`); // Filter by city
					}
				});

			// Execute the query to fetch schools
			query.then((schools) => {
				if (schools.length > 0) {
					resolve(schools); // Return the list of schools
				} else {
					resolve([]); // No schools found, return an empty array
				}
			})
			.catch((error) => {
				reject({ error: 'Errore durante la ricerca delle scuole: ' + error.message });
			});
		});
	}

	/**
	 * @description Fetch events by name
	 * @param {string} name - The name of the event to search for.
	 * @returns {Promise<Array>} A promise that resolves with an array of matching events.
	 */
	fetchEventsByName(name) {
		return new Promise((resolve, reject) => {
			this.knex('Eventi')
				.join('Scuole', 'Eventi.IDScuola', 'Scuole.IDScuola') // Join with Scuole table to get school details
				.select('Eventi.*', 'Scuole.Nome AS NomeScuola') // Select all columns from the Eventi table and the school name
				// Use LIKE for partial matching (SQLite returns case-insensitive matches)
				.whereLike('Eventi.Nome', `%${name}%`)
				.then((events) => {
					console.log('Events found:', events);
					resolve(events);
				})
				.catch((error) => {
					reject({ error: 'Errore durante la ricerca degli eventi: ' + error.message });
				});
		});
	}

	/**
	 * @description Filter events based on various criteria.
	 * @param {string} name - The name of the event to filter by.
	 * @param {number} priceMin - The minimum price of the event.
	 * @param {number} priceMax - The maximum price of the event.
	 * @param {Date} dataMin - The minimum date of the event.
	 * @param {Date} dataMax - The maximum date of the event.
	 * @param {string} schoolName - The name of the school hosting the event.
	 * @param {string} location - The location of the event.
	 * @returns {Promise<Array>} A promise that resolves with an array of filtered events.
	 */
	filterEvents(name, priceMin, priceMax, dataMin, dataMax, schoolName, location){
		return new Promise((resolve, reject) => {
			let query = this.knex('Eventi')
				.join('Scuole', 'Eventi.IDScuola', 'Scuole.IDScuola') // Join with Scuole table to get school details
				.select('Eventi.*', 'Scuole.Nome AS NomeScuola'); // Select all columns from the Eventi table and the school name

			if (name) {
				query = query.whereLike('Eventi.Nome', `%${name}%`);
			}
			if (priceMin && priceMax) {
				query = query.whereBetween('Eventi.Prezzo', [priceMin, priceMax]);
			}
			if (dataMin && dataMax) {
				query = query.whereBetween('Eventi.DataOra', [dataMin, dataMax]);
			}
			if (schoolName) {
				query = query.whereLike('Scuole.Nome', `%${schoolName}%`);
			}
			if (location) {
				query = query.whereLike('Eventi.Luogo', `%${location}%`);
			}

			query.then((events) => {
				resolve(events);
			})
			.catch((error) => {
				reject({ error: 'Errore durante il filtraggio degli eventi: ' + error.message });
			});
		});

	}

	/**
	 * @description Filters courses based on various criteria.
	 * @param {string} name - The name of the course to filter by.
	 * @param {string} tipology - The type of the course.
	 * @param {string} category - The category of the course.
	 * @param {string} level - The level of the course.
	 * @param {number} priceMin - The minimum price of the course.
	 * @param {number} priceMax - The maximum price of the course.
	 * @returns {Promise<Array>} A promise that resolves with an array of filtered courses.
	 */
	filterCourses(name, tipology, category, level, priceMin, priceMax) {
		return new Promise((resolve, reject) => {
			this.knex('Corsi')
				.join('Scuole', 'Corsi.IDScuola', 'Scuole.IDScuola') // Join with Scuole table to get school details
				.leftJoin('Recensioni', 'Corsi.IDCorso', 'Recensioni.IDCorso') // Left join with Recensioni table to get feedback details
				.groupBy('Corsi.IDCorso', 'Scuole.IDScuola') // Group by course and school IDs
				.orderBy('Corsi.IDCorso', 'desc') // Order by course ID
				.select('Corsi.*', 'Scuole.Nome AS NomeScuola', this.knex.raw('AVG(Recensioni.Valutazione) AS MediaValutazione')) // Select all columns from the Corsi table and the school name
				.where((builder) => {
					if (name) {
						builder.whereLike('Corsi.Nome', `%${name}%`); // Filter by course name
					}
					if (tipology) {
						builder.where('Corsi.Tipologia', tipology); // Filter by course type
					}
					if (category) {
						builder.where('Corsi.CategoriaCorso', category); // Filter by course category
					}
					if (level) {
						builder.where('Corsi.Livello', level); // Filter by course level
					}
					if (priceMin && priceMax) {
						builder.whereBetween('Corsi.Prezzo', [priceMin, priceMax]); // Filter by course price range
					}
				})
				.then((courses) => {
					resolve(courses);
				})
				.catch((error) => {
					reject({ error: 'Errore durante il caricamento dei corsi: ' + error.message });
				});
		});
	}
}

export default DatabaseHandler; // Export the DatabaseHandler class for use in other modules