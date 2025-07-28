/**
 * @author Cristian Capraro
 * @version 1.0.0
 * @file scuola-spec.js
 * @description Script per la pagina di una scuola di danza.
 * Gestisce la visualizzazione della pagina.
 */

"use strict";

// After DOM loaded
document.addEventListener('DOMContentLoaded', function () {
    // Associa i dati dei corsi ai campi del modal
    document.querySelectorAll('.course-button').forEach(button => {
        button.addEventListener('click', function () {
            const courseId = button.getAttribute('data-course-id');
            const courseName = button.getAttribute('data-course-name');
            const courseInstructor = button.getAttribute('data-course-instructor');
            const courseLevel = button.getAttribute('data-course-level');
            const courseTime = button.getAttribute('data-course-time');
            const courseFrequency = button.getAttribute('data-course-frequency');
            const coursePrice = button.getAttribute('data-course-price');

            document.getElementById("modal-course-title").textContent = courseName;
            document.getElementById("modal-course-instructor").textContent = courseInstructor;
            document.getElementById("modal-course-level").textContent = courseLevel;
            document.getElementById("modal-course-time").textContent = courseTime;
            document.getElementById("modal-course-frequency").textContent = courseFrequency;
            document.getElementById("modal-course-price").textContent = '€' + coursePrice;
            document.getElementById("modal-course-id").value = courseId;

            // Show the modal
            const courseModal = new bootstrap.Modal(document.getElementById('courseModal'));
            courseModal.show();
        });
    });

    // Associa i dati degli eventi ai campi del modal
    document.querySelectorAll('.event-button').forEach(button => {
        button.addEventListener('click', function () {
            const eventId = button.getAttribute('data-event-id');
            const eventPoster = button.getAttribute('data-event-poster');
            const eventName = button.getAttribute('data-event-name');
            const eventDescrizione = button.getAttribute('data-event-descrizione');
            const eventDate = button.getAttribute('data-event-date');
            const eventLocation = button.getAttribute('data-event-location');
            const eventPrice = button.getAttribute('data-event-price');

            document.getElementById("modal-event-title").textContent = eventName;
            document.getElementById("modal-event-description").textContent = eventDescrizione;
            document.getElementById("modal-event-date").textContent = eventDate;
            document.getElementById("modal-event-location").textContent = eventLocation;
            document.getElementById("modal-event-price").textContent = eventPrice;
            // Poster
            if (!eventPoster) {
                document.getElementById("modal-event-poster").src = '/images/default-locandina.webp';
            } else {
                document.getElementById("modal-event-poster").src = eventPoster;
            }

            // Event ID for booking
            if (document.getElementById("modal-event-id"))
                document.getElementById("modal-event-id").value = eventId;


            // Show the modal
            const eventModal = new bootstrap.Modal(document.getElementById('eventModal'));
            eventModal.show();
        });
    });
    
});