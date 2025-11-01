// Esta función se encarga de inicializar y controlar todo el calendario.
function initializeCalendar(authToken, userRole) {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    let calendar;
    let allFoliosData = []; // Variable para almacenar todos los folios
    let dailyFoliosCache = []; // Variable para guardar los folios del día seleccionado

    // Función para buscar y obtener los folios desde el servidor.
    function fetchFolios(query = '', successCallback, failureCallback) {
        const loadingEl = document.getElementById('loading');
        if (!query) loadingEl.classList.remove('hidden');

        const url = query ? `https://pasteleria-app-production.up.railway.app/api/folios?q=${query}` : 'https://pasteleria-app-production.up.railway.app/api/folios';
        
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
        const formattedTime = `${hour12.toString().padStart(2, '0')}:${minute} ${period}`;

        modalFolioNumber.innerText = `Folio: ${folio.folioNumber}`;

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
    }

    function showFolioModalWithRoleCheck(folio) {
        window.currentEditingFolio = folio;
        populateFolioModal(folio);

        const deleteBtn = document.getElementById('deleteFolioButton');
        const editBtn = document.getElementById('editFolioButton');
        const cancelBtn = document.getElementById('cancelFolioButton');

        if (userRole === 'Administrador') {
            deleteBtn.style.display = 'inline-block';
        } else {
            deleteBtn.style.display = 'none';
        }

        // Deshabilitar botones si el folio está cancelado
        if (folio.status === 'Cancelado') {
            editBtn.disabled = true;
            cancelBtn.disabled = true;
            editBtn.classList.add('opacity-50', 'cursor-not-allowed');
            cancelBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            editBtn.disabled = false;
            cancelBtn.disabled = false;
            editBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            cancelBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }


        document.getElementById('folioModal').classList.remove('hidden');
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
            
            dailyFoliosCache = foliosForDay;

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
                    listItem.className = 'folio-list-item p-3 bg-gray-100 rounded-md flex justify-between items-center';
                    listItem.dataset.phone = folio.client?.phone || '';

                    const time = folio.deliveryTime.substring(0, 5);
                    
                    let tagsHTML = '';
                    if (folio.status === 'Cancelado') {
                        tagsHTML += `<span class="status-tag bg-red-100 text-red-600">CANCELADO</span>`;
                    } else {
                        if (folio.isPrinted) tagsHTML += `<span class="status-tag bg-green-100 text-green-600">IMPRESO</span>`;
                        if (folio.fondantChecked) tagsHTML += `<span class="status-tag bg-blue-100 text-blue-600">FONDANT OK</span>`;
                        if (folio.dataChecked) tagsHTML += `<span class="status-tag bg-purple-100 text-purple-600">DATOS OK</span>`;
                    }

                    listItem.innerHTML = `
                        <div class="flex-grow cursor-pointer folio-info">
                            <span>${time} - Folio ${folio.folioNumber} - ${folio.client ? folio.client.name : 'N/A'}</span>
                            <div class="mt-1 flex flex-wrap gap-2">${tagsHTML}</div>
                        </div>
                        <div class="flex-shrink-0 ml-4 p-2 border-l" data-folio-id="${folio.id}">
                            <div class="flex items-center space-x-3 text-xs">
                                <label class="flex items-center"><input type="checkbox" class="folio-status-check" data-status="isPrinted" ${folio.isPrinted ? 'checked' : ''}> Impreso</label>
                                <label class="flex items-center"><input type="checkbox" class="folio-status-check" data-status="fondantChecked" ${folio.fondantChecked ? 'checked' : ''}> Revisado Fondant</label>
                                <label class="flex items-center"><input type="checkbox" class="folio-status-check" data-status="dataChecked" ${folio.dataChecked ? 'checked' : ''}> Datos Revisados</label>
                            </div>
                        </div>
                    `;

                    listItem.querySelector('.folio-info').addEventListener('click', () => {
                        dailyFoliosModal.classList.add('hidden');
                        showFolioModalWithRoleCheck(folio);
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
            const foliosForDay = allFoliosData.filter(f => f.deliveryDate === folio.deliveryDate);
            foliosForDay.sort((a, b) => a.deliveryTime.localeCompare(b.deliveryTime));
            dailyFoliosCache = foliosForDay;

            showFolioModalWithRoleCheck(folio);
        }
    });
    calendar.render();
    
    // Event listener para todos los checkboxes
    document.getElementById('dailyFoliosList').addEventListener('change', async (e) => {
        if (e.target.classList.contains('folio-status-check')) {
            const checkboxContainer = e.target.closest('[data-folio-id]');
            const folioId = checkboxContainer.dataset.folioId;

            const isPrinted = checkboxContainer.querySelector('[data-status="isPrinted"]').checked;
            const fondantChecked = checkboxContainer.querySelector('[data-status="fondantChecked"]').checked;
            const dataChecked = checkboxContainer.querySelector('[data-status="dataChecked"]').checked;

            try {
                const response = await fetch(`https://pasteleria-app-production.up.railway.app/api/folios/${folioId}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ isPrinted, fondantChecked, dataChecked })
                });
                if (!response.ok) throw new Error('Error al actualizar el estado');
                
                // Actualizar el folio en el caché local para que los cambios se reflejen si se reabre el modal
                const folioInCache = allFoliosData.find(f => f.id == folioId);
                if (folioInCache) {
                    folioInCache.isPrinted = isPrinted;
                    folioInCache.fondantChecked = fondantChecked;
                    folioInCache.dataChecked = dataChecked;
                }
                calendar.refetchEvents(); // Refrescar los eventos del calendario
            } catch (error) {
                alert('No se pudo guardar el estado. Inténtalo de nuevo.');
                // Revertir el checkbox si falla la llamada
                e.target.checked = !e.target.checked;
            }
        }
    });

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
            const response = await fetch(`https://pasteleria-app-production.up.railway.app/api/folios?q=${query}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
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
                    const response = await fetch(`https://pasteleria-app-production.up.railway.app/api/folios/${folioId}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
                    const folioData = await response.json();

                    dailyFoliosCache = [];
                    
                    showFolioModalWithRoleCheck(folioData);
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
    const deleteFolioButton = document.getElementById('deleteFolioButton');
    const cancelFolioButton = document.getElementById('cancelFolioButton');
    const printLabelButton = document.getElementById('printLabelButton');

    if (printLabelButton) {
        printLabelButton.addEventListener('click', () => {
            const currentFolio = window.currentEditingFolio;
            if (currentFolio) {
                const currentToken = localStorage.getItem('authToken');
                const url = `https://pasteleria-app-production.up.railway.app/api/folios/${currentFolio.id}/label-pdf?token=${currentToken}`;
                window.open(url, '_blank');
            }
        });
    }

    if(cancelFolioButton){
        cancelFolioButton.addEventListener('click', async () => {
            const currentFolio = window.currentEditingFolio;
            if (currentFolio && confirm(`¿Estás seguro de que deseas CANCELAR el folio ${currentFolio.folioNumber}?`)) {
                modal.classList.add('hidden');
                document.getElementById('loading').classList.remove('hidden');
                try {
                    const response = await fetch(`https://pasteleria-app-production.up.railway.app/api/folios/${currentFolio.id}/cancel`, {
                        method: 'PATCH',
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.message);
                    alert(result.message);
                    calendar.refetchEvents();
                } catch (error) {
                    alert(`Error: ${error.message}`);
                } finally {
                    document.getElementById('loading').classList.add('hidden');
                }
            }
        });
    }

    if (closeModalBtn) { closeModalBtn.addEventListener('click', () => modal.classList.add('hidden')); }
    
    if (editFolioButton) {
        editFolioButton.addEventListener('click', async () => {
            const currentFolio = window.currentEditingFolio;
            if (currentFolio) {
                window.previousView = 'calendar'; // <-- LÍNEA CORREGIDA
                modal.classList.add('hidden');
                document.getElementById('loading').classList.remove('hidden');
                try {
                    if (window.populateFormForEdit) window.populateFormForEdit(currentFolio);
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
            const currentFolio = window.currentEditingFolio;
    
            if (currentFolio) {
                const currentFolioIndex = dailyFoliosCache.findIndex(f => f.id === currentFolio.id);
                
                if (currentFolioIndex !== -1 && dailyFoliosCache.length > 0) {
                    window.openPdfViewer(dailyFoliosCache, currentFolioIndex);
                } else {
                    window.openPdfViewer([currentFolio], 0);
                }
                modal.classList.add('hidden');
                calendar.refetchEvents();
            }
        });
    }

    if (deleteFolioButton) {
        deleteFolioButton.addEventListener('click', async () => {
            const currentFolio = window.currentEditingFolio;
    
            if (currentFolio) {
                if (confirm(`¿Estás seguro de que deseas eliminar el folio ${currentFolio.folioNumber}? Esta acción no se puede deshacer.`)) {
                    const folioId = currentFolio.id;
                    modal.classList.add('hidden');
                    document.getElementById('loading').classList.remove('hidden');
    
                    try {
                        const response = await fetch(`https://pasteleria-app-production.up.railway.app/api/folios/${folioId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${authToken}` }
                        });
    
                        const result = await response.json();
    
                        if (!response.ok) {
                            throw new Error(result.message || 'No se pudo eliminar el folio.');
                        }
    
                        alert(result.message);
                        calendar.refetchEvents();
    
                    } catch (error) {
                        alert(`Error: ${error.message}`);
                    } finally {
                        document.getElementById('loading').classList.add('hidden');
                    }
                }
            }
        });
    }

    const printLabelsButton = document.getElementById('printLabelsButton');
    const printOrdersButton = document.getElementById('printOrdersButton');
    
    if (printLabelsButton) {
        printLabelsButton.addEventListener('click', () => {
            const date = document.getElementById('dailyFoliosModal').dataset.date;
            if (date) {
                const currentToken = localStorage.getItem('authToken');
                const url = `https://pasteleria-app-production.up.railway.app/api/folios/day-summary-pdf?type=labels&date=${date}&token=${currentToken}`;
                window.open(url, '_blank');
            }
        });
    }

    if (printOrdersButton) {
        printOrdersButton.addEventListener('click', () => {
            const date = document.getElementById('dailyFoliosModal').dataset.date;
            if (date) {
                const currentToken = localStorage.getItem('authToken');
                const url = `https://pasteleria-app-production.up.railway.app/api/folios/day-summary-pdf?type=orders&date=${date}&token=${currentToken}`;
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