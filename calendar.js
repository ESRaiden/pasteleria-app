function initializeCalendar(authToken) {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    let calendar;

    function fetchFolios(query = '', successCallback, failureCallback) {
        const loadingEl = document.getElementById('loading');
        loadingEl.classList.remove('hidden');
        fetch(`http://localhost:3000/api/folios?q=${query}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar los folios');
            return response.json();
        })
        .then(data => {
            const events = data.map(folio => ({
                title: `Folio ${folio.folioNumber} - ${folio.client?.name || 'N/A'}`,
                start: `${folio.deliveryDate}T${folio.deliveryTime}`,
                extendedProps: { folioData: folio }
            }));
            if(successCallback) successCallback(events);
        })
        .catch(error => {
            console.error(error);
            if(failureCallback) failureCallback(error);
        })
        .finally(() => {
            loadingEl.classList.add('hidden');
        });
    }

    function populateFolioModal(folio) {
        const modalFolioNumber = document.getElementById('modalFolioNumber');
        const modalContent = document.getElementById('modalContent');
        if (!modalFolioNumber || !modalContent) return;

        modalFolioNumber.innerText = `Folio: ${folio.folioNumber}`;
        modalContent.innerHTML = `
            <p><strong>Cliente:</strong> ${folio.client?.name || 'N/A'}</p>
            <p><strong>Teléfono:</strong> <a href="tel:${folio.client?.phone}" class="text-blue-500 hover:underline">${folio.client?.phone || 'N/A'}</a></p>
            <p><strong>Fecha de Entrega:</strong> ${new Date(folio.deliveryDate + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Hora de Entrega:</strong> ${folio.deliveryTime}</p>
            <p><strong>Personas:</strong> ${folio.persons}</p>
            <p><strong>Descripción:</strong> ${folio.designDescription}</p>
            <p><strong>Total:</strong> $${parseFloat(folio.total).toFixed(2)}</p>
            <p><strong>Resta:</strong> $${parseFloat(folio.balance).toFixed(2)}</p>
        `;
    }

    if (calendar) {
        calendar.destroy();
    }

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        buttonText: {
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            list: 'Lista'
        },
        events: (fetchInfo, successCallback, failureCallback) => fetchFolios('', successCallback, failureCallback),
        eventClick: function(info) {
            const folio = info.event.extendedProps.folioData;
            window.currentEditingFolioId = folio.id;
            populateFolioModal(folio);
            document.getElementById('folioModal').classList.remove('hidden');
        }
    });
    calendar.render();

    const searchInput = document.getElementById('folioSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                calendar.removeAllEvents();
                calendar.addEventSource((fetchInfo, successCallback, failureCallback) => fetchFolios(query, successCallback, failureCallback));
            }
        });
    }

    const closeModalBtn = document.getElementById('closeModal');
    const editFolioButton = document.getElementById('editFolioButton');
    const viewPdfButton = document.getElementById('viewPdfButton');
    const modal = document.getElementById('folioModal');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }
    
    if (editFolioButton) {
        editFolioButton.addEventListener('click', () => {
            if (window.currentEditingFolioId) {
                alert(`Función para editar folio no implementada aún. ID del folio: ${window.currentEditingFolioId}`);
                modal.classList.add('hidden');
            }
        });
    }

    if (viewPdfButton) {
        viewPdfButton.addEventListener('click', () => {
            if (window.currentEditingFolioId) {
                window.open(`http://localhost:3000/api/folios/${window.currentEditingFolioId}/pdf`, '_blank');
            }
        });
    }
}

window.initializeCalendar = initializeCalendar;