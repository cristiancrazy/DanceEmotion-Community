/**
 * @author Cristian Capraro
 * @version 1.0.0
 * @file calendar-formatter.mjs
 * @description Module to format calendar data for frontend display in the Dance School Management System.
 * This module provides a class that formats calendar data into a structure suitable for rendering in the frontend
 */

import db from './db.mjs';

class CalendarFormatter {

    /**
     * This class is responsible for formatting calendar data.
     * Such as:
     * {
     *   date: "YYYY-MM-DD", // Date of the activity
     *   name: "Activity Name", // Name of the activity
     *   time: "HH:MM - HH:MM", // Time of the activity
     *   className: "CSS class name" // CSS class for styling
     * }
     */

    constructor() {
        this.activities = [];
    }

    /**
     * Fetch courses for a specific user and format them for the calendar.
     * @param {string} userId - The ID of the user whose courses are to be fetched.
     * @returns {Promise<Array>} - A promise that resolves to an array of formatted calendar activities.
     */
    async fetchCoursesForUser(userId) {
        let database;
        try {
            database = new db(); // Connect to the database
            // Fetch courses from the database
            const courses = await database.fetchBookedCourses(userId);

            if (!courses || courses.length === 0) {
                return []; // Return an empty array if no courses are found
            }

            // Format the courses into a structure suitable for the calendar
            courses.forEach(course => {
                if(course.Stato == 'Accettata' || course.Stato == 'Terminata')
                    if(course.Tipologia == 'Periodica'){
                        // Repeat for the same weekday until the end date
                        const startDate = new Date(course.DataInizio);
                        const endDate = new Date(course.DataFine);
                        const dayOfWeek = startDate.getDay(); // Get the day of the week
                        const currentDate = new Date(startDate);
                        while (currentDate <= endDate) {
                            if (currentDate.getDay() === dayOfWeek) {
                                this.activities.push({
                                    date: currentDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
                                    name: course.Nome,
                                    time: `${course.OrarioInizio} - ${course.OrarioFine}`,
                                    className: 'bg-primary' // CSS class for styling
                                });
                            }
                            currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
                        }
                    }else if (course.Tipologia == 'Singola'){
                        // Single course
                        this.activities.push({
                            date: new Date(course.DataInizio).toISOString().split('T')[0], // Format date as YYYY-MM-DD
                            name: course.Nome,
                            time: `${course.OrarioInizio} - ${course.OrarioFine}`,
                            className: 'bg-secondary' // CSS class for styling
                        });
                    }else if (course.Tipologia == 'Privata'){
                        if (course.DataInizio) {
                            // Private course with a specific date
                            this.activities.push({
                                date: new Date(course.DataInizio).toISOString().split('T')[0],
                                name: course.Nome,
                                time: `${course.OrarioInizio} - ${course.OrarioFine}`,
                                className: 'bg-success' // CSS class for styling
                            });
                        }
                    }
            });

            return this.activities;
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw error;
        } finally {
            if (database) {
                database.close(); // Ensure the database connection is closed
            }
        }
    }

    /**
     * Fetch courses for a specific school and format them for the calendar.
     * @param {string} schoolId - The ID of the school whose courses are to be fetched.
     * @returns {Promise<Array>} - A promise that resolves to an array of formatted calendar activities.
     */
    async fetchCoursesForSchool(schoolId) {
        let database;
        try {
            database = new db(); // Connect to the database
            // Fetch courses from the database
            const courses = await database.fetchSchoolCourses(schoolId);

            if (!courses || courses.length === 0) {
                return []; // Return an empty array if no courses are found
            }

            // Format the courses into a structure suitable for the calendar
            courses.forEach(course => {
                if(course.Tipologia == 'Periodica'){
                    // Repeat for the same weekday until the end date
                    const startDate = new Date(course.DataInizio);
                    const endDate = new Date(course.DataFine);
                    const dayOfWeek = startDate.getDay(); // Get the day of the week
                    const currentDate = new Date(startDate);
                    while (currentDate <= endDate) {
                        if (currentDate.getDay() === dayOfWeek) {
                            this.activities.push({
                                date: currentDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
                                name: course.Nome,
                                time: `${course.OrarioInizio} - ${course.OrarioFine}`,
                                className: 'bg-primary' // CSS class for styling
                            });
                        }
                        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
                    }
                }else if (course.Tipologia == 'Singola'){
                    // Single course
                    this.activities.push({
                        date: new Date(course.DataInizio).toISOString().split('T')[0], // Format date as YYYY-MM-DD
                        name: course.Nome,
                        time: `${course.OrarioInizio} - ${course.OrarioFine}`,
                        className: 'bg-secondary' // CSS class for styling
                    });
                }else if (course.Tipologia == 'Privata'){
                    if (course.DataInizio) {
                        // Private course with a specific date
                        this.activities.push({
                            date: new Date(course.DataInizio).toISOString().split('T')[0],
                            name: course.Nome,
                            time: `${course.OrarioInizio} - ${course.OrarioFine}`,
                            className: 'bg-success' // CSS class for styling
                        });
                    }
                }
            });

            return this.activities;
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw error;
        } finally {
            if (database) {
                database.close(); // Ensure the database connection is closed
            }
        }
    }
}

export default CalendarFormatter;