/**
 * @author Cristian Capraro
 * @version 1.0.0
 * @file geolocalizzazione-eventi.js
 * @description Script per la geolocalizzazione degli eventi.
 * Gestisce la richiesta di geolocalizzazione dell'utente e il reindirizzamento alla pagina degli eventi con i parametri di latitudine e longitudine.
 */

"use strict";

// Attende il caricamento del DOM prima di eseguire il codice
document.addEventListener('DOMContentLoaded', () => {
    // Geolocalizzazione dell'utente: quando l'utente clicca sul pulsante di localizzazione, ottieni la posizione attuale e reindirizza alla pagina con i parametri lat e lng
    document.getElementById('locationButton').addEventListener('click', function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                // Redirect to the same page with lat and lng parameters
                window.location.href = `/eventi?lat=${lat}&lng=${lng}`;
            }, function (error) {
                console.error('Geolocation error:', error);
                alert('Impossibile ottenere la tua posizione. Assicurati di aver concesso i permessi necessari.');
            });
        } else {
            alert('La geolocalizzazione non è supportata dal tuo browser.');
        }
    });
});