/**
 * @author Cristian Capraro
 * @version 1.0.0
 * @file contattaci.js
 * @description Script per la pagina di contatto.
 * Gestisce la visualizzazione del campo "Specifica oggetto" e la preparazione di un'email con i dati del form.
 */

"use strict";

// Attende il caricamento del DOM prima di eseguire il codice
document.addEventListener('DOMContentLoaded', () => {
    // Mostra/nasconde il campo "Specifica oggetto" se si seleziona "Altro"
    document.getElementById('oggetto').addEventListener('change', function () {
        const altroDiv = document.getElementById('altroOggettoDiv');
        if (this.value === 'Altro') {
            altroDiv.style.display = '';
            document.getElementById('altroOggetto').setAttribute('required', 'required');
        } else {
            altroDiv.style.display = 'none';
            document.getElementById('altroOggetto').removeAttribute('required');
        }
    });

    // Script per preparare una email con oggetto e messaggio
    document.getElementById('contactForm').addEventListener('submit', e => {
        e.preventDefault();
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        let oggetto = document.getElementById('oggetto').value;
        if (oggetto === 'Altro') {
            oggetto = document.getElementById('altroOggetto').value;
        }
        const messaggio = document.getElementById('messaggio').value;

        const destinatario = "danceemotion@email.test";
        const subject = encodeURIComponent(oggetto);
        const body = encodeURIComponent(`Nome: ${nome}\n\n${messaggio}\n\nRicontattare alla seguente email: ${email}`);
        window.location.href = `mailto:${destinatario}?subject=${subject}&body=${body}`;
    }); 
});