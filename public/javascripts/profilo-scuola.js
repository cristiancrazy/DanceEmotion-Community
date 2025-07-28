/**
 * @author Cristian Capraro
 * @version 1.0.0
 * @file profilo-scuola.js
 * @description Script per il funzionamento della pagina del profilo scuola.
 * Gestisce la visualizzazione e la modifica delle informazioni del profilo della scuola.
 * Gestisce anche i filtri per corsi iscritti, allegati e prenotazioni eventi.
 * Gestisce la visualizzazione dei dettagli dei corsi e degli eventi in modal.
 */

// Filtro corsi iscritti
document.addEventListener('DOMContentLoaded', function () {
    const filtro = document.getElementById('filtro-corso'); // Get the filter select element
    // Select all rows in the table body
    const righe = document.querySelectorAll('#tabella-iscritti tbody tr');
    // console.log(righe);
    let numeroIscritti = 0; // Initialize the count with total rows
    document.getElementById('numero-iscritti').textContent = righe.length;
    filtro.addEventListener('change', function () {
        const val = filtro.value;
        righe.forEach(tr => {
            // Show all rows if 'tutti' is selected, otherwise filter by course
            if (val === 'tutti' || tr.dataset.corso === val) {
                tr.style.display = '';
                numeroIscritti++;
            } else {
                tr.style.display = 'none';
            }
        });
        document.getElementById('numero-iscritti').textContent = numeroIscritti;
        numeroIscritti = 0; // Reset count for next filter
    });
});

// Gestione del filtro per gli allegati e caricamento degli allegati
document.addEventListener('DOMContentLoaded', function () {
    const filtroCorsoFile = document.getElementById('filtro-corso-file');
    const idCorsoInput = document.getElementById('id-corso-aggiungi-allegato');
    filtroCorsoFile.addEventListener('change', function () {
        const selectedOption = filtroCorsoFile.options[filtroCorsoFile.selectedIndex];
        idCorsoInput.value = selectedOption.dataset.idCorso || '';
    });
    // Filter
    const righeAllegati = document.querySelectorAll('#tabella-allegati tbody tr');
    filtroCorsoFile.addEventListener('change', function () {
        const val = filtroCorsoFile.value;
        righeAllegati.forEach(tr => {
            // td:nth-child(2) is the course name column
            if (val === 'tutti' || tr.querySelector('td:nth-child(2)').textContent === val) {
                tr.style.display = '';
            } else {
                tr.style.display = 'none';
            }
        });
    });
});

// Filtro prenotazioni eventi
document.addEventListener('DOMContentLoaded', function () {
    const filtroEvento = document.getElementById('filtro-evento');
    const righePrenotazioni = document.querySelectorAll('#tabella-prenotazioni-eventi tbody tr');
    document.getElementById('numero-prenotazioni').textContent = righePrenotazioni.length;
    let numeroPrenotazioni = 0;
    if (filtroEvento) { // Check if the element exists
        filtroEvento.addEventListener('change', function () {
            const val = filtroEvento.value;
            righePrenotazioni.forEach(tr => {
                if (val === 'tutti' || tr.dataset.evento === val) {
                    tr.style.display = '';
                    numeroPrenotazioni++;
                } else {
                    tr.style.display = 'none';
                }
            });
            document.getElementById('numero-prenotazioni').textContent = numeroPrenotazioni;
            numeroPrenotazioni = 0; // Reset count for next filter
        });
    }
});

// Gestione del modal per la modifica degli eventi
document.addEventListener('DOMContentLoaded', function () {
    // Function to convert date to ISO format for datetime-local input
    function toDatetimeLocal(date) {
        //console.log(date);
        const pad = (num) => String(num).padStart(2, '0');
        return date.getFullYear() + '-' +
            pad(date.getMonth() + 1) + '-' +
            pad(date.getDate()) + 'T' +
            pad(date.getHours()) + ':' +
            pad(date.getMinutes());
    }

    // Update form fields when an event is selected
    const selectEvento = document.getElementById('selezionaEvento');
    selectEvento.addEventListener('change', function () {
        const selectedOption = selectEvento.options[selectEvento.selectedIndex];
        document.getElementById('nomeEventoMod').value = selectedOption.dataset.eventName;
        document.getElementById('descrizioneEventoMod').value = selectedOption.dataset.eventDescription;
        document.getElementById('luogoEventoMod').value = selectedOption.dataset.eventLocation;
        // Convert date string to ISO format for datetime-local input
        document.getElementById('dataOraEventoMod').value = toDatetimeLocal(new Date(selectedOption.dataset.eventDate));
        document.getElementById('prezzoEventoMod').value = selectedOption.dataset.eventPrice;
        const locandinaAttualeLink = document.getElementById('locandinaAttualeLink');
        locandinaAttualeLink.href = selectedOption.dataset.eventPoster || '/images/default-locandina.webp';
        locandinaAttualeLink.textContent = selectedOption.dataset.eventPoster ? 'Visualizza Locandina' : 'Default';
    });
});

// Mostra/nasconde i campi in base alla tipologia selezionata e alla checkbox appuntamento (MODAL AGGIUNGI CORSO)
document.addEventListener('DOMContentLoaded', function () {
    const tipologia = document.getElementById('tipologia');
    const tipologiaContainer = tipologia.closest('.col-md-6');
    const dateInizio = document.getElementById('dateInizio');
    const dateInizioContainer = dateInizio.closest('.col-md-6');
    const dateFine = document.getElementById('dateFine');
    const dateFineContainer = dateFine.closest('.col-md-6');
    const orarioInizio = document.getElementById('orarioInizio');
    const orarioInizioContainer = orarioInizio.closest('.col-md-6');
    const orarioFine = document.getElementById('orarioFine');
    const orarioFineContainer = orarioFine.closest('.col-md-6');
    const lezioneAppuntamento = document.getElementById('lezioneAppuntamento');
    const disclaimerPrezzo = document.getElementById('disclaimerPrezzo');

    function aggiornaCampi() {
        if (lezioneAppuntamento.checked) {
            // Disabilita e nascondi tipologia
            tipologia.disabled = true;
            tipologiaContainer.style.display = 'none';
            // Nascondi date
            dateInizio.disabled = true;
            dateInizioContainer.style.display = 'none';
            dateFine.disabled = true;
            dateFineContainer.style.display = 'none';
            dateInizio.required = false;
            dateFine.required = false;
            // Nascondi orari
            orarioInizio.disabled = true;
            orarioInizioContainer.style.display = 'none';
            orarioFine.disabled = true;
            orarioFineContainer.style.display = 'none';
            orarioInizio.required = false;
            orarioFine.required = false;
            // Mostra disclaimer prezzo
            disclaimerPrezzo.style.display = '';
        } else if (tipologia.value === 'Periodica') {
            tipologia.disabled = false;
            tipologiaContainer.style.display = '';
            dateInizio.disabled = false;
            dateInizioContainer.style.display = '';
            dateFine.disabled = false;
            dateFineContainer.style.display = '';
            dateInizio.required = true;
            dateFine.required = true;
            orarioInizio.disabled = false;
            orarioInizioContainer.style.display = '';
            orarioFine.disabled = false;
            orarioFineContainer.style.display = '';
            orarioInizio.required = true;
            orarioFine.required = true;
            disclaimerPrezzo.style.display = 'none';
        } else if (tipologia.value === 'Singola') {
            tipologia.disabled = false;
            tipologiaContainer.style.display = '';
            dateInizio.disabled = false;
            dateInizioContainer.style.display = '';
            dateFine.disabled = true;
            dateFineContainer.style.display = 'none';
            dateInizio.required = true;
            dateFine.required = false;
            orarioInizio.disabled = false;
            orarioInizioContainer.style.display = '';
            orarioFine.disabled = false;
            orarioFineContainer.style.display = '';
            orarioInizio.required = true;
            orarioFine.required = true;
            disclaimerPrezzo.style.display = 'none';
        } else if (tipologia.value === 'Privata') {
            tipologia.disabled = false;
            tipologiaContainer.style.display = '';
            dateInizio.disabled = false; // Data inizio potrebbe servire per sapere da quando è disponibile
            dateInizioContainer.style.display = '';
            dateFine.disabled = true;
            dateFineContainer.style.display = 'none';
            dateInizio.required = true; // O false se non necessaria per lezioni private generiche
            dateFine.required = false;
            orarioInizio.disabled = false; // Orari potrebbero essere indicativi o non richiesti
            orarioInizioContainer.style.display = '';
            orarioFine.disabled = false;
            orarioFineContainer.style.display = '';
            orarioInizio.required = true; // O false
            orarioFine.required = true; // O false
            disclaimerPrezzo.style.display = '';
        } else { // Caso di default o se nessuna tipologia è selezionata
            tipologia.disabled = false;
            tipologiaContainer.style.display = '';
            dateInizio.disabled = false;
            dateInizioContainer.style.display = '';
            dateFine.disabled = false;
            dateFineContainer.style.display = '';
            dateInizio.required = true;
            dateFine.required = false; // Generalmente non richiesta se non periodica
            orarioInizio.disabled = false;
            orarioInizioContainer.style.display = '';
            orarioFine.disabled = false;
            orarioFineContainer.style.display = '';
            orarioInizio.required = true;
            orarioFine.required = true;
            disclaimerPrezzo.style.display = 'none';
        }
    }

    tipologia.addEventListener('change', aggiornaCampi);
    lezioneAppuntamento.addEventListener('change', aggiornaCampi);
    aggiornaCampi(); // Chiamata iniziale per configurare i campi del modal AGGIUNGI
});

// Script per MODAL MODIFICA CORSO (simile a quello per AGGIUNGI)
document.addEventListener('DOMContentLoaded', function () {
    const tipologiaMod = document.getElementById('tipologiaMod');
    const tipologiaContainerMod = tipologiaMod.closest('.col-md-6');
    const dataInizioMod = document.getElementById('dataInizioMod');
    const dataInizioContainerMod = dataInizioMod.closest('.col-md-6');
    const dataFineMod = document.getElementById('dataFineMod');
    const dataFineContainerMod = dataFineMod.closest('.col-md-6');
    const orarioInizioMod = document.getElementById('orarioInizioMod');
    const orarioInizioContainerMod = orarioInizioMod.closest('.col-md-6');
    const orarioFineMod = document.getElementById('orarioFineMod');
    const orarioFineContainerMod = orarioFineMod.closest('.col-md-6');
    const lezioneAppuntamentoMod = document.getElementById('lezioneAppuntamentoMod');
    const disclaimerPrezzoMod = document.getElementById('disclaimerPrezzoMod');

    function aggiornaCampiModifica() {
        const isAppuntamento = lezioneAppuntamentoMod.checked;
        const tipoSelezionato = tipologiaMod.value;

        tipologiaMod.disabled = isAppuntamento;
        tipologiaContainerMod.style.display = isAppuntamento ? 'none' : '';

        dataInizioMod.disabled = isAppuntamento;
        dataInizioContainerMod.style.display = isAppuntamento ? 'none' : '';
        dataFineMod.disabled = isAppuntamento;
        dataFineContainerMod.style.display = isAppuntamento ? 'none' : '';

        orarioInizioMod.disabled = isAppuntamento;
        orarioInizioContainerMod.style.display = isAppuntamento ? 'none' : '';
        orarioFineMod.disabled = isAppuntamento;
        orarioFineContainerMod.style.display = isAppuntamento ? 'none' : '';

        disclaimerPrezzoMod.style.display = (isAppuntamento || (tipoSelezionato === 'Privata' && !isAppuntamento)) ? '' : 'none';


        if (!isAppuntamento) {
            if (tipoSelezionato === 'Periodica') {
                dataFineMod.disabled = false;
                dataFineContainerMod.style.display = '';
                dataInizioMod.required = true;
                dataFineMod.required = true;
                orarioInizioMod.required = true;
                orarioFineMod.required = true;
            } else if (tipoSelezionato === 'Singola') {
                dataFineMod.disabled = true;
                dataFineContainerMod.style.display = 'none';
                dataInizioMod.required = true;
                dataFineMod.required = false;
                orarioInizioMod.required = true;
                orarioFineMod.required = true;
            } else if (tipoSelezionato === 'Privata') {
                dataFineMod.disabled = true;
                dataFineContainerMod.style.display = 'none';
                dataInizioMod.required = true;
                dataFineMod.required = false;
                orarioInizioMod.required = true;
                orarioFineMod.required = true;
            } else { // Default o nessun tipo selezionato
                dataInizioMod.required = true;
                dataFineMod.required = false;
                orarioInizioMod.required = true;
                orarioFineMod.required = true;
            }
        } else { // Se è su appuntamento, tutti i campi data/ora non sono required
            dataInizioMod.required = false;
            dataFineMod.required = false;
            orarioInizioMod.required = false;
            orarioFineMod.required = false;
        }
    }

    tipologiaMod.addEventListener('change', aggiornaCampiModifica);
    lezioneAppuntamentoMod.addEventListener('change', aggiornaCampiModifica);
});


// Modifica la voce della tipologia "periodica" in "Lezione settimanale" (per entrambi i modal)
document.addEventListener('DOMContentLoaded', function () {
    const tipologia = document.getElementById('tipologia');
    const optionPeriodica = tipologia.querySelector('option[value="Periodica"]');
    if (optionPeriodica) {
        optionPeriodica.textContent = 'Lezione settimanale';
    }

    const tipologiaMod = document.getElementById('tipologiaMod');
    const optionPeriodicaMod = tipologiaMod.querySelector('option[value="Periodica"]');
    if (optionPeriodicaMod) {
        optionPeriodicaMod.textContent = 'Lezione settimanale';
    }
});

// Collega il bottone "Aggiungi Corso" al modal
document.addEventListener('DOMContentLoaded', function () {
    const btnsAggiungiCorso = document.querySelectorAll('button.btn.btn-success');
    btnsAggiungiCorso.forEach(btn => {
        if (btn.textContent.includes('Aggiungi Corso')) {
            btn.setAttribute('data-bs-toggle', 'modal');
            btn.setAttribute('data-bs-target', '#modalAggiungiCorso');
        }
    });

    // Gestione click sui bottoni "Elimina" nella tabella del modal #modalEliminaEvento
    document.getElementById('modalEliminaEvento').addEventListener('click', function (event) {
        if (event.target.closest('.delete-event-from-list-btn')) {
            const button = event.target.closest('.delete-event-from-list-btn');
            const eventRow = button.closest('tr');
            const eventName = eventRow.dataset.eventName;
            const eventId = eventRow.dataset.eventId;

            // Popola e mostra il modal di conferma eliminazione singolo evento
            document.getElementById('nomeEventoDaEliminareSingolo').textContent = eventName;
            const modalConfermaSingolo = new bootstrap.Modal(document.getElementById('modalConfermaEliminazioneSingoloEvento'));
            // Popola il form di conferma eliminazione con l'ID dell'evento
            document.getElementById('idEventoDaEliminareSingolo').value = eventId;

            // Passa l'ID dell'evento al bottone di conferma finale
            document.getElementById('confermaEliminazioneSingoloBtn').dataset.eventIdToDelete = eventId;

            modalConfermaSingolo.show();
        }
    });

    // Gestione MODAL MODIFICA CORSO
    const modalSelezionaModificaCorsoEl = document.getElementById('modalSelezionaModificaCorso');
    if (modalSelezionaModificaCorsoEl) {
        modalSelezionaModificaCorsoEl.addEventListener('click', function (event) {
            if (event.target.closest('.modify-course-from-list-btn')) {
                const button = event.target.closest('.modify-course-from-list-btn');
                const courseRow = button.closest('tr');
                const courseData = courseRow.dataset;

                // Popola il form di modifica corso
                document.getElementById('idCorsoMod').value = courseData.courseId;
                document.getElementById('nomeCorsoMod').value = courseData.courseName;
                document.getElementById('istruttoreMod').value = courseData.courseInstructor;
                document.getElementById('categoriaMod').value = courseData.courseCategory;
                //console.log('Popolamento dati corso:', courseData);
                document.getElementById('tipologiaMod').value = courseData.courseType;
                document.getElementById('livelloMod').value = courseData.courseLevel;
                document.getElementById('prezzoMod').value = courseData.coursePrice;
                document.getElementById('dataInizioMod').value = courseData.courseStartDate;
                document.getElementById('dataFineMod').value = courseData.courseEndDate;
                document.getElementById('orarioInizioMod').value = courseData.courseStartTime;
                document.getElementById('orarioFineMod').value = courseData.courseEndTime;
                document.getElementById('lezioneAppuntamentoMod').checked = (courseData.courseAppointment === 'true');

                // Aggiorna la visibilità dei campi nel modal di modifica
                // Trova la funzione aggiornaCampiModifica definita globalmente o passala/richiamala qui
                const tipologiaMod = document.getElementById('tipologiaMod');
                const lezioneAppuntamentoMod = document.getElementById('lezioneAppuntamentoMod');
                const disclaimerPrezzoMod = document.getElementById('disclaimerPrezzoMod');
                const dataFineContainerMod = document.getElementById('dataFineContainerMod');
                const dataInizioMod = document.getElementById('dataInizioMod');
                const dataFineMod = document.getElementById('dataFineMod');
                const orarioInizioMod = document.getElementById('orarioInizioMod');
                const orarioFineMod = document.getElementById('orarioFineMod');
                const tipologiaContainerMod = tipologiaMod.closest('.col-md-6');
                const dataInizioContainerMod = dataInizioMod.closest('.col-md-6');
                const orarioInizioContainerMod = orarioInizioMod.closest('.col-md-6');
                const orarioFineContainerMod = orarioFineMod.closest('.col-md-6');


                function aggiornaCampiModificaInterna() { // Funzione helper interna per aggiornare i campi del modal modifica
                    const isAppuntamento = lezioneAppuntamentoMod.checked;
                    const tipoSelezionato = tipologiaMod.value;

                    tipologiaMod.disabled = isAppuntamento;
                    tipologiaContainerMod.style.display = isAppuntamento ? 'none' : '';

                    dataInizioMod.disabled = isAppuntamento;
                    dataInizioContainerMod.style.display = isAppuntamento ? 'none' : '';
                    dataFineMod.disabled = isAppuntamento;
                    dataFineContainerMod.style.display = isAppuntamento ? 'none' : '';

                    orarioInizioMod.disabled = isAppuntamento;
                    orarioInizioContainerMod.style.display = isAppuntamento ? 'none' : '';
                    orarioFineMod.disabled = isAppuntamento;
                    orarioFineContainerMod.style.display = isAppuntamento ? 'none' : '';

                    disclaimerPrezzoMod.style.display = (isAppuntamento || (tipoSelezionato === 'Privata' && !isAppuntamento)) ? '' : 'none';

                    if (!isAppuntamento) {
                        if (tipoSelezionato === 'Periodica') {
                            dataFineMod.disabled = false;
                            dataFineContainerMod.style.display = '';
                            dataInizioMod.required = true;
                            dataFineMod.required = true;
                            orarioInizioMod.required = true;
                            orarioFineMod.required = true;
                        } else if (tipoSelezionato === 'Singola') {
                            dataFineMod.disabled = true;
                            dataFineContainerMod.style.display = 'none';
                            dataInizioMod.required = true;
                            dataFineMod.required = false;
                            orarioInizioMod.required = true;
                            orarioFineMod.required = true;
                        } else if (tipoSelezionato === 'Privata') {
                            dataFineMod.disabled = true;
                            dataFineContainerMod.style.display = 'none';
                            dataInizioMod.required = true;
                            dataFineMod.required = false;
                            orarioInizioMod.required = true;
                            orarioFineMod.required = true;
                        } else { // Default o nessun tipo selezionato
                            dataInizioMod.required = true;
                            dataFineMod.required = false;
                            orarioInizioMod.required = true;
                            orarioFineMod.required = true;
                        }
                    } else { // Se è su appuntamento, tutti i campi data/ora non sono required
                        dataInizioMod.required = false;
                        dataFineMod.required = false;
                        orarioInizioMod.required = false;
                        orarioFineMod.required = false;
                    }
                }
                aggiornaCampiModificaInterna(); // Setta lo stato iniziale. 

                const modalModificaCorso = new bootstrap.Modal(document.getElementById('modalModificaCorso'));
                modalModificaCorso.show();
            }
        });
    }

    // Gestione MODAL ELIMINA CORSO
    const modalEliminaCorsoListaEl = document.getElementById('modalEliminaCorsoLista');
    if (modalEliminaCorsoListaEl) {
        modalEliminaCorsoListaEl.addEventListener('click', function (event) {
            if (event.target.closest('.delete-course-from-list-btn')) {
                const button = event.target.closest('.delete-course-from-list-btn');
                const courseRow = button.closest('tr');
                const courseName = courseRow.dataset.courseName;
                const courseId = courseRow.dataset.courseId;

                document.getElementById('nomeCorsoDaEliminareSingolo').textContent = courseName;
                document.getElementById('confermaEliminazioneCorsoSingoloBtn').dataset.courseIdToDelete = courseId;

                const modalConfermaSingoloCorso = new bootstrap.Modal(document.getElementById('modalConfermaEliminazioneSingoloCorso'));
                // Imposta l'hidden id per l'eliminazione
                document.getElementById('idCorsoDaEliminareSingolo').value = courseId;
                modalConfermaSingoloCorso.show();
            }
        });
    }

});

// Gestione del modal per rispondere ai feedback
document.addEventListener('DOMContentLoaded', function () {
    // Button class: answer-feedback
    const answerButtons = document.querySelectorAll('.answer-feedback');
    answerButtons.forEach(button => {
        button.addEventListener('click', () => {
            const feedbackId = button.getAttribute('data-feedback-id');
            document.getElementById('feedbackId').value = feedbackId;
            const feedbackStars = button.getAttribute('data-feedback-stars');
            const feedbackContent = button.getAttribute('data-feedback-body');
            document.getElementById('feedbackStars').value = feedbackStars + ' stelle';
            document.getElementById('feedbackContent').value = feedbackContent;
            const modal = new bootstrap.Modal(document.getElementById('modalRispondiFeedback'));
            modal.show();
        });
    });
});