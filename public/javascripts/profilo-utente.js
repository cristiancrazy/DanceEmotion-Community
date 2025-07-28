/**
 * @author Cristian Capraro
 * @version 1.0.0
 * @file profilo-utente.js
 * @description Script per il funzionamento della pagina del profilo utente.
 * Gestisce la visualizzazione e la modifica delle informazioni del profilo dell'utente.
 */

document.addEventListener('DOMContentLoaded', function () {

    // Apri il modal quando si clicca su un bottone "Materiali del corso"
    document.querySelectorAll('button[title="Materiali del corso"]').forEach(btn => {
        btn.addEventListener('click', function () {
            var modal = new bootstrap.Modal(document.getElementById('materialiCorsoModal'));
            // Get the course ID from the button attribute
            var courseId = btn.getAttribute('data-course-attachment-id');
            // Fetch attachments for the course
            var attachments = JSON.parse(document.getElementById('attachmentsData').textContent);
            // console.log(attachments);
            var courseAttachments = attachments.filter(attachment => attachment.IDCorso === parseInt(courseId));
            var modalBody = document.querySelector('#materialiCorsoModal .modal-body');
            modalBody.innerHTML = ''; // Clear previous content
            if (courseAttachments.length == 0) {
                modalBody.innerHTML = '<div class="text-center text-muted">Nessun materiale disponibile per questo corso.</div>';
                modal.show();
                return;
            };
            courseAttachments.forEach(attachment => {
                var listItem = document.createElement('li');
                listItem.className = 'list-group-item d-flex align-items-center my-3 flex-wrap';
                listItem.innerHTML = `
                        ${attachment.Tipologia.split('/')[0] === 'video' ? '<i class="bi bi-play-circle-fill text-primary me-2"></i>' : '<i class="bi bi-file-earmark-music-fill me-2"></i>'}
                        <span>${attachment.NomeFile}</span>
                        <a href="/profilo/download-allegato/${attachment.IDAllegato}" class="btn btn-outline-primary btn-sm ms-auto align-self-center">
                            <i class="bi bi-eye"></i> Scarica
                        </a>
                    `;
                modalBody.appendChild(listItem);
            });
            modal.show();
        });
    });

    // Apri il modal quando si clicca su un bottone "Lascia una recensione"
    document.querySelectorAll('button[title="Lascia una recensione"]').forEach(btn => {
        btn.addEventListener('click', function () {
            var modal = new bootstrap.Modal(document.getElementById('recensioneModal'));
            // Imposta l'ID del corso nella form
            document.getElementById('IDCorsoRecensione').value = btn.getAttribute('data-course-id');
            // Resetta il contenuto del textarea e la valutazione
            document.getElementById('recensione').value = '';
            document.getElementById('valutazione').value = '5'; // Imposta la valutazione predefinita a 5 stelle
            modal.show();
        });
    });

    // Apri il modal quando si clicca su un bottone "Dettagli evento" e ha il logo del calendario
    document.querySelectorAll(
        '.card:has(.bi-calendar-check-fill) button[title="Dettagli evento"]'
    ).forEach(btn => {
        btn.addEventListener('click', function () {
            var modal = new bootstrap.Modal(document.getElementById('locandinaEventoModal'));
            // Imposta l'immagine della locandina
            var locandinaUrl = btn.getAttribute('data-event-poster');
            document.getElementById('locandinaEventoImg').src = locandinaUrl;
            // Imposta il link per aprire in una nuova scheda
            document.getElementById('locandinaEventoLink').href = locandinaUrl;
            // Mostra il modal
            modal.show();
        });
    });


});