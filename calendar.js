// Esta función se encarga de inicializar y controlar todo el calendario.
function initializeCalendar(authToken) {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    let calendar;
    let allFoliosData = []; // Variable para almacenar todos los folios

    // Función para buscar y obtener los folios desde el servidor.
    function fetchFolios(query = '', successCallback, failureCallback) {
        const loadingEl = document.getElementById('loading');
        if (!query) loadingEl.classList.remove('hidden');

        const url = query ? `http://localhost:3000/api/folios?q=${query}` : 'http://localhost:3000/api/folios';
        
        fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar los folios');
            return response.json();
        })
        .then(data => {
            if (!query) {
                allFoliosData = data;
            }
            if (successCallback) {
                const events = data.map(folio => ({
                    title: `Folio ${folio.folioNumber} - ${folio.client?.name || 'N/A'}`,
                    start: `${folio.deliveryDate}T${folio.deliveryTime}`,
                    extendedProps: { folioData: folio }
                }));
                successCallback(events);
            }
        })
        .catch(error => {
            console.error(error);
            if(failureCallback) failureCallback(error);
        })
        .finally(() => {
            if (!query) loadingEl.classList.add('hidden');
        });
    }

    // Rellena el modal con la información del folio seleccionado.
    function populateFolioModal(folio) {
        const modalFolioNumber = document.getElementById('modalFolioNumber');
        const modalContent = document.getElementById('modalContent');
        if (!modalFolioNumber || !modalContent) return;

        const timeString = folio.deliveryTime;
        const [hour, minute] = timeString.split(':');
        const hour12 = (parseInt(hour) % 12) || 12;
        const period = parseInt(hour) >= 12 ? 'PM' : 'AM';
        const formattedTime = `${hour12}:${minute} ${period}`;

        modalFolioNumber.innerText = `Folio: ${folio.folioNumber}`;

        // ==================== INICIO DE LA CORRECCIÓN ====================
        // Se añade la clase 'break-words' al párrafo de la descripción
        modalContent.innerHTML = `
            <p><strong>Cliente:</strong> ${folio.client?.name || 'N/A'}</p>
            <p><strong>Teléfono:</strong> <a href="tel:${folio.client?.phone}" class="text-blue-500 hover:underline">${folio.client?.phone || 'N/A'}</a></p>
            <p><strong>Fecha de Entrega:</strong> ${new Date(folio.deliveryDate + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Hora de Entrega:</strong> ${formattedTime}</p>
            <p><strong>Personas:</strong> ${folio.persons}</p>
            <p class="break-words"><strong>Descripción:</strong> ${folio.designDescription}</p>
            <p><strong>Total:</strong> $${parseFloat(folio.total).toFixed(2)}</p>
            <p><strong>Resta:</strong> $${parseFloat(folio.balance).toFixed(2)}</p>
        `;
        // ===================== FIN DE LA CORRECCIÓN ======================
    }

    if (calendar) {
        calendar.destroy();
    }

    // Configuración e inicialización de FullCalendar.
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', list: 'Lista' },
        events: (fetchInfo, successCallback, failureCallback) => fetchFolios('', successCallback, failureCallback),
        
        dateClick: function(info) {
            const dailyFoliosModal = document.getElementById('dailyFoliosModal');
            dailyFoliosModal.dataset.date = info.dateStr;

            const foliosForDay = allFoliosData.filter(folio => folio.deliveryDate === info.dateStr);
            
            foliosForDay.sort((a, b) => a.deliveryTime.localeCompare(b.deliveryTime));

            const dailyFoliosList = document.getElementById('dailyFoliosList');
            const dailyFoliosTitle = document.getElementById('dailyFoliosTitle');
            const dailySearchInput = document.getElementById('dailyFolioSearch');
            dailyFoliosList.innerHTML = '';
            dailySearchInput.value = '';

            if (foliosForDay.length > 0) {
                const date = new Date(info.dateStr + 'T12:00:00');
                const formattedDate = date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                dailyFoliosTitle.innerText = `Folios del ${formattedDate}`;

                foliosForDay.forEach(folio => {
                    const listItem = document.createElement('div');
                    listItem.className = 'folio-list-item p-3 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 flex justify-between items-center';
                    listItem.dataset.phone = folio.client?.phone || '';

                    const time = folio.deliveryTime.substring(0, 5);
                    let itemHTML = `<span>${time} - Folio ${folio.folioNumber} - ${folio.client ? folio.client.name : 'N/A'}</span>`;
                    
                    if (folio.isPrinted) {
                        itemHTML += `<span class="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">IMPRESO</span>`;
                    }
                    
                    listItem.innerHTML = itemHTML;
                    
                    listItem.addEventListener('click', () => {
                        dailyFoliosModal.classList.add('hidden');
                        window.currentEditingFolioId = folio.id;
                        populateFolioModal(folio);
                        document.getElementById('folioModal').classList.remove('hidden');
                    });
                    dailyFoliosList.appendChild(listItem);
                });
            } else {
                dailyFoliosTitle.innerText = 'No hay folios para este día';
            }
            
            dailyFoliosModal.classList.remove('hidden');
        },

        eventClick: function(info) {
            const folio = info.event.extendedProps.folioData;
            window.currentEditingFolioId = folio.id;
            populateFolioModal(folio);
            document.getElementById('folioModal').classList.remove('hidden');
        }
    });
    calendar.render();
    
    window.myAppCalendar = calendar;

    // --- LÓGICA DE BÚSQUEDA GENERAL ---
    const searchInput = document.getElementById('folioSearchInput');
    const searchResultsContainer = document.getElementById('searchResults');

    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    const handleSearchInput = async (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) {
            searchResultsContainer.innerHTML = '';
            searchResultsContainer.classList.add('hidden');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/folios?q=${query}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            const folios = await response.json();

            searchResultsContainer.innerHTML = '';
            if (folios.length > 0) {
                folios.slice(0, 5).forEach(folio => {
                    const item = document.createElement('div');
                    item.className = 'p-3 border-b hover:bg-gray-100 cursor-pointer text-sm';
                    item.innerHTML = `<strong>Folio: ${folio.folioNumber}</strong> - ${folio.client.name}`;
                    item.dataset.folioId = folio.id;
                    searchResultsContainer.appendChild(item);
                });
                searchResultsContainer.classList.remove('hidden');
            } else {
                searchResultsContainer.innerHTML = '<div class="p-3 text-sm text-gray-500">No se encontraron resultados.</div>';
                searchResultsContainer.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error fetching search suggestions:', error);
            searchResultsContainer.classList.add('hidden');
        }
    };

    const debouncedSearch = debounce(handleSearchInput, 300);

    if (searchInput) {
        searchInput.addEventListener('input', debouncedSearch);
    }
    
    if(searchResultsContainer) {
        searchResultsContainer.addEventListener('click', async (e) => {
            const targetItem = e.target.closest('[data-folio-id]');
            if (targetItem) {
                const folioId = targetItem.dataset.folioId;
                
                searchResultsContainer.innerHTML = '';
                searchResultsContainer.classList.add('hidden');
                searchInput.value = '';
                
                try {
                    const response = await fetch(`http://localhost:3000/api/folios/${folioId}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
                    const folioData = await response.json();
                    
                    window.currentEditingFolioId = folioData.id;
                    populateFolioModal(folioData);
                    document.getElementById('folioModal').classList.remove('hidden');
                } catch (error) {
                    console.error('Error fetching folio details:', error);
                }
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (searchInput && searchResultsContainer && !searchInput.contains(e.target) && !searchResultsContainer.contains(e.target)) {
            searchResultsContainer.classList.add('hidden');
        }
    });

    // --- LÓGICA DE BOTONES ---
    const closeModalBtn = document.getElementById('closeModal');
    const editFolioButton = document.getElementById('editFolioButton');
    const viewPdfButton = document.getElementById('viewPdfButton');
    const modal = document.getElementById('folioModal');

    if (closeModalBtn) { closeModalBtn.addEventListener('click', () => modal.classList.add('hidden')); }
    
    if (editFolioButton) {
        editFolioButton.addEventListener('click', async () => {
            if (window.currentEditingFolioId) {
                const folioId = window.currentEditingFolioId;
                modal.classList.add('hidden');
                document.getElementById('loading').classList.remove('hidden');
                try {
                    const response = await fetch(`http://localhost:3000/api/folios/${folioId}`, {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    if (!response.ok) throw new Error('No se pudo cargar la información del folio para editar.');
                    const folioData = await response.json();
                    if (window.populateFormForEdit) window.populateFormForEdit(folioData);
                    if(window.showMainView) window.showMainView('form');
                } catch (error) {
                    alert(error.message);
                } finally {
                    document.getElementById('loading').classList.add('hidden');
                }
            }
        });
    }

    if (viewPdfButton) {
        viewPdfButton.addEventListener('click', () => {
            if (window.currentEditingFolioId) {
                const urlWithToken = `http://localhost:3000/api/folios/${window.currentEditingFolioId}/pdf?token=${authToken}`;
                window.open(urlWithToken, '_blank');
            }
        });
    }

    const printLabelsButton = document.getElementById('printLabelsButton');
    const printOrdersButton = document.getElementById('printOrdersButton');
    const dailyFoliosModal = document.getElementById('dailyFoliosModal');

    if (printLabelsButton) {
        printLabelsButton.addEventListener('click', () => {
            const date = dailyFoliosModal.dataset.date;
            if (date) {
                const url = `http://localhost:3000/api/folios/day-summary-pdf?type=labels&date=${date}&token=${authToken}`;
                window.open(url, '_blank');
            }
        });
    }

    if (printOrdersButton) {
        printOrdersButton.addEventListener('click', () => {
            const date = dailyFoliosModal.dataset.date;
            if (date) {
                const url = `http://localhost:3000/api/folios/day-summary-pdf?type=orders&date=${date}&token=${authToken}`;
                window.open(url, '_blank');
            }
        });
    }

    const dailySearchInput = document.getElementById('dailyFolioSearch');
    if (dailySearchInput) {
        dailySearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const listItems = document.querySelectorAll('#dailyFoliosList .folio-list-item');
            
            listItems.forEach(item => {
                const text = item.innerText.toLowerCase();
                const phone = item.dataset.phone;

                if (text.includes(query) || phone.includes(query)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
}

window.initializeCalendar = initializeCalendar;

window.addEventListener('folioCreated', () => {
    const calendar = window.myAppCalendar; 
    if (calendar) {
        calendar.refetchEvents();
    }
});