/**
 * @author Cristian Capraro
 * @version 1.0.0
 * @file eventi.js
 * @description Script per il funzionamento della pagina degli eventi.
 * Gestisce la visualizzazione dei dettagli degli eventi in un modal e l'ingrandimento delle locandine.
 */

"use strict";


// Attende il caricamento del DOM prima di eseguire il codice
document.addEventListener('DOMContentLoaded', () => {

    // Script to handle image click for modal enlargement
    document.querySelectorAll('.card-img-top').forEach(function (img) {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', function () {
            document.getElementById('coverModalImg').src = this.src;
            document.getElementById('coverModalImg').alt = this.alt;
            var modal = new bootstrap.Modal(document.getElementById('coverModal'));
            modal.show();
        });
    });


    // Modal dettagli evento: popola i dati quando viene aperto
    document.querySelectorAll('[data-bs-target="#eventDetailsModal"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            let data = {};
            try {
                data = JSON.parse(this.getAttribute('data-event'));
            } catch (e) {
                console.error('Errore nel parsing dei dati dell\'evento:', e);
            }
            document.getElementById('eventDetailsImg').src = data.img || '';
            document.getElementById('eventDetailsImg').alt = data.title || '';
            document.getElementById('eventDetailsTitle').textContent = data.title || '';
            document.getElementById('eventDetailsDesc').textContent = data.desc || '';
            document.getElementById('eventDetailsDate').textContent = data.date || '';
            document.getElementById('eventDetailsTime').textContent = data.time || '';
            document.getElementById('eventDetailsPrice').textContent = data.price || '';
            document.getElementById('eventDetailsCity').textContent = data.city || '';
            document.getElementById('eventDetailsAddress').textContent = data.address || '';
            document.getElementById('eventDetailsSchool').textContent = data.school || '';
            document.getElementById('eventDetailsSchoolBtn').href = data.schoolUrl || '#';
        });
    });

});