document.addEventListener('DOMContentLoaded', function() {
    // Variable global para recordar la vista anterior
    window.previousView = 'calendar';

    // --- VISTAS Y ELEMENTOS GLOBALES ---
    const loginView = document.getElementById('loginView');
    const appView = document.getElementById('appView');
    const calendarView = document.getElementById('calendarView');
    const formView = document.getElementById('formView');
    const userManagementView = document.getElementById('userManagementView');
    const statsView = document.getElementById('statsView');
    const loadingEl = document.getElementById('loading');
    
    const pendingView = document.getElementById('pendingView');
    const viewPendingButton = document.getElementById('viewPendingButton');
    const pendingFoliosList = document.getElementById('pendingFoliosList');
    const pendingCountBadge = document.getElementById('pending-count');

    const manageUsersButton = document.getElementById('manageUsersButton');
    const loginForm = document.getElementById('loginForm');
    const logoutButton = document.getElementById('logoutButton');
    const newFolioButton = document.getElementById('newFolioButton');
    const viewCalendarButton = document.getElementById('viewCalendarButton');
    const viewStatsButton = document.getElementById('viewStatsButton');
    const productivityDateInput = document.getElementById('productivityDate');
    const commissionReportButton = document.getElementById('commissionReportButton');

    // --- ELEMENTOS DEL FORMULARIO ---
    const folioForm = document.getElementById('folioForm'),
        formTitle = document.getElementById('formTitle'),
        clientNameInput = document.getElementById('clientName'),
        clientPhoneInput = document.getElementById('clientPhone'),
        clientPhone2Input = document.getElementById('clientPhone2'),
        deliveryDateInput = document.getElementById('deliveryDate'),
        deliveryHourSelect = document.getElementById('deliveryHour'),
        deliveryMinuteSelect = document.getElementById('deliveryMinute'),
        deliveryPeriodSelect = document.getElementById('deliveryPeriod'),
        folioTypeSelect = document.getElementById('folioType'),
        personsInput = document.getElementById('persons'),
        shapeInput = document.getElementById('shape'),
        imageInput = document.getElementById('referenceImages'),
        imagePreview = document.getElementById('imagePreview'),
        totalInput = document.getElementById('total'),
        advanceInput = document.getElementById('advancePayment'),
        balanceInput = document.getElementById('balance'),
        isPaidCheckbox = document.getElementById('isPaid'),
        addCommissionCheckbox = document.getElementById('addCommission'),
        hasExtraHeightCheckbox = document.getElementById('hasExtraHeight'),
        complementsContainer = document.getElementById('complementsContainer'),
        addComplementButton = document.getElementById('addComplementButton'),
        accessoriesInput = document.getElementById('accessories'),
        designDescriptionTextarea = document.getElementById('designDescription'),
        dedicationInput = document.getElementById('dedication'),
        deliveryCostInput = document.getElementById('deliveryCost'),
        inStorePickupCheckbox = document.getElementById('inStorePickup'),
        googleMapsLocationCheckbox = document.getElementById('googleMapsLocation'),
        streetInput = document.getElementById('street'),
        extNumberInput = document.getElementById('extNumber'),
        intNumberInput = document.getElementById('intNumber'),
        neighborhoodInput = document.getElementById('neighborhood'),
        addressFields = document.getElementById('addressFields'),
        deliveryAddressSection = document.getElementById('deliveryAddressSection'),
        cancelFormButton = document.getElementById('cancelFormButton'),
        addCakeFlavorBtn = document.getElementById('addCakeFlavorBtn'),
        addFillingBtn = document.getElementById('addFillingBtn'),
        cakeFlavorContainer = document.getElementById('cakeFlavorContainer'),
        fillingContainer = document.getElementById('fillingContainer'),
        fillingSection = document.getElementById('fillingSection'),
        selectionModal = document.getElementById('selectionModal'),
        modalTitle = document.getElementById('modalTitle'),
        modalSearch = document.getElementById('modalSearch'),
        modalList = document.getElementById('modalList'),
        modalCloseBtn = document.getElementById('modalCloseBtn'),
        modalStep1 = document.getElementById('modal-step-1'),
        modalStep2 = document.getElementById('modal-step-2'),
        modalStep2Title = document.getElementById('modal-step-2-title'),
        modalStep2List = document.getElementById('modal-step-2-list'),
        tiersTableBody = document.getElementById('tiersTableBody'),
        addTierButton = document.getElementById('addTierButton'),
        additionalList = document.getElementById('additionalList'),
        addAdditionalButton = document.getElementById('addAdditionalButton'),
        normalFields = document.getElementById('normalFields'),
        specialFields = document.getElementById('specialFields');

    // --- MANEJO DE MODALES ---
    const dailyFoliosModal = document.getElementById('dailyFoliosModal');
    const closeDailyFoliosModalBtn = document.getElementById('closeDailyFoliosModal');
    const registerModal = document.getElementById('registerModal');
    const showRegisterModalLink = document.getElementById('showRegisterModalLink');
    const closeRegisterModalBtn = document.getElementById('closeRegisterModal');
    const registerForm = document.getElementById('registerForm');

    if (closeDailyFoliosModalBtn) {
        closeDailyFoliosModalBtn.addEventListener('click', () => {
            dailyFoliosModal.classList.add('hidden');
        });
    }

    if (dailyFoliosModal) {
        dailyFoliosModal.addEventListener('click', (e) => {
            if (e.target.id === 'dailyFoliosModal') {
                dailyFoliosModal.classList.add('hidden');
            }
        });
    }
    
    // --- LÓGICA DE REGISTRO ---
    if (showRegisterModalLink) {
        showRegisterModalLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerModal.classList.remove('hidden');
        });
    }
    
    if (closeRegisterModalBtn) {
        closeRegisterModalBtn.addEventListener('click', () => {
            registerModal.classList.add('hidden');
            registerForm.reset();
            document.getElementById('registerError').textContent = '';
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const role = document.getElementById('registerRole').value;
            const errorEl = document.getElementById('registerError');
            
            loadingEl.classList.remove('hidden');
            errorEl.textContent = '';
    
            try {
                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password, role }),
                });
    
                const data = await response.json();
    
                if (!response.ok) {
                    throw new Error(data.message || 'Error en el registro.');
                }
    
                alert('¡Usuario registrado con éxito! Ahora puedes iniciar sesión.');
                registerModal.classList.add('hidden');
                registerForm.reset();
    
            } catch (error) {
                errorEl.textContent = error.message;
            } finally {
                loadingEl.classList.add('hidden');
            }
        });
    }

    // --- FUNCIÓN PARA CARGAR USUARIOS ---
    async function loadUsers() {
        const userListBody = document.getElementById('userListBody');
        const authToken = localStorage.getItem('authToken');
        
        userListBody.innerHTML = `<tr><td colspan="5" class="text-center p-4">Cargando usuarios...</td></tr>`;

        try {
            const response = await fetch('http://localhost:3000/api/users', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) {
                throw new Error('No se pudieron cargar los usuarios. Es posible que no tengas permisos.');
            }

            const users = await response.json();
            userListBody.innerHTML = '';

            if (users.length === 0) {
                userListBody.innerHTML = `<tr><td colspan="5" class="text-center p-4">No se encontraron usuarios.</td></tr>`;
                return;
            }

            users.forEach(user => {
                const row = document.createElement('tr');
                row.className = 'border-b';
                row.innerHTML = `
                    <td class="py-2 px-4">${user.id}</td>
                    <td class="py-2 px-4">${user.username}</td>
                    <td class="py-2 px-4">${user.email}</td>
                    <td class="py-2 px-4" data-field="role">${user.role}</td>
                    <td class="py-2 px-4">
                        <button class="text-blue-500 hover:underline text-sm edit-user-btn" data-user-id="${user.id}">Editar</button>
                        <button class="text-red-500 hover:underline text-sm ml-2 delete-user-btn" data-user-id="${user.id}">Eliminar</button>
                    </td>
                `;
                userListBody.appendChild(row);
            });

        } catch (error) {
            userListBody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-red-500">${error.message}</td></tr>`;
        }
    }

    document.getElementById('userListBody').addEventListener('click', async (e) => {
        const target = e.target;
        const authToken = localStorage.getItem('authToken');
        const userId = target.dataset.userId;
    
        if (target.classList.contains('delete-user-btn')) {
            if (confirm(`¿Estás seguro de que quieres eliminar al usuario con ID ${userId}?`)) {
                try {
                    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.message);
                    alert(result.message);
                    loadUsers();
                } catch (error) {
                    alert(`Error: ${error.message}`);
                }
            }
        }
    
        if (target.classList.contains('edit-user-btn')) {
            const currentRole = target.closest('tr').querySelector('[data-field="role"]').textContent;
            const newRole = prompt(`Introduce el nuevo rol para el usuario con ID ${userId} (Opciones: Administrador, Usuario):`, currentRole);
            
            const validRoles = ['Administrador', 'Usuario'];
            if (newRole && validRoles.includes(newRole)) {
                try {
                    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ role: newRole })
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.message);
                    alert(result.message);
                    loadUsers();
                } catch (error) {
                    alert(`Error: ${error.message}`);
                }
            } else if (newRole !== null) {
                alert('Rol no válido. Por favor, introduce uno de los roles permitidos.');
            }
        }
    });

    // --- VARIABLES DE ESTADO DEL FORMULARIO ---
    let additionalItems = [];
    let selectedFiles = [];
    let existingImages = [];
    let selectedCakeFlavors = [];
    let selectedRellenos = [];
    let tiersData = [];
    let currentTierIndex = -1;
    
    // --- DATOS CONSTANTES (SABORES, RELLENOS) ---
    const cakeFlavorsData = {
        normal: ['Pastel de queso', 'Pan de tres leches', 'Chocolate', 'Red Velvet', 'Mil Hojas', 'Zanahoria', 'Queso/Flan', 'Mantequilla'],
        tier: ['Mantequilla', 'Queso', 'Nata', 'Chocolate', 'Vainilla', 'Flan', 'Red Velvet']
    };

    const rellenosData = {
        'incluidos': {
            'Mermelada':      { suboptions: ['Fresa', 'Zarzamora', 'Piña', 'Durazno'], separator: ' de ' },
            'Manjar':         { suboptions: ['Snickers', 'Nuez', 'Almendra', 'Coco'], separator: ' con ' },
            'Dulce de Leche': { suboptions: ['Envinada', 'Nuez', 'Almendra', 'Coco'], separator: ' con ' },
            'Duraznos':       { suboptions: ['Crema de Yogurth', 'Chantilly', 'Rompope'], separator: ' con ' },
            'Nuez':           { suboptions: ['Manjar', 'Mocka', 'Capuchino'], separator: ' con ' }
        },
        'conCosto': {
            'Chantilly':            { suboptions: ['Durazno', 'Cocktail de Frutas', 'Snickers'], separator: ' con ' },
            'Cajeta':               { suboptions: ['Nuez', 'Coco', 'Almendra', 'Oreo'], separator: ' con ' },
            'Crema de Queso':       { suboptions: ['Mermelada zarzamora', 'Mermelada fresa', 'Cajeta', 'Envinada'], separator: ' con ' },
            'Oreo':                 { suboptions: ['Manjar', 'Crema de yogurth fresa', 'Crema de chocolate', 'Chantilly'], separator: ' con ' },
            'Cremas':               { suboptions: ['Mocka', 'Yogurth de fresa', 'Café con o sin brandy'], separator: ' con ' },
            'Cocktail de frutas':   { suboptions: ['Chantilly', 'Crema de queso', 'Crema de Yogurth'], separator: ' con ' },
            'Snickers / Milky Way': { suboptions: ['Manjar', 'Chantilly', 'Crema de yogurth fresa', 'Crema de chocolate'], separator: ' con ' },
            'Chantilly con fresas': { suboptions: [] },
            'Nutella':              { suboptions: [] },
            'Crema de queso con Chocoretas': { suboptions: [] }
        }
    };
    
    const rellenosDataEspecial = {
        principales: [
            { name: 'CREMA DE QUESO', suboptions: [] },
            { name: 'CREMA DE NUTELLA', suboptions: [] },
            { name: 'PIÑA DE COCO', suboptions: [] },
            { name: 'CAJETA CON', suboptions: ['NUEZ', 'COCO'], separator: ' ' },
            { name: 'MERMELADA', suboptions: ['FRESA', 'ZARZAMORA', 'PIÑA', 'DURAZNO'], separator: ' de ' },
            { name: 'CHANTILLY', suboptions: ['DURAZNO', 'COCKTAIL DE FRUTAS', 'SNICKERS'], separator: ' con ' },
            { name: 'MANJAR', suboptions: ['SNICKERS', 'NUEZ', 'ALMENDRA', 'COCO'], separator: ' con ' },
            { name: 'MANJAR CAJETA', suboptions: [] },
            { name: 'MANJAR CHOCOLATE', suboptions: [] },
            { name: 'CREMA DE TEQUILA', suboptions: [] },
            { name: 'CREMA DE MANY', suboptions: [] },
            { name: 'CREMA DE CAPUCCINO', suboptions: [] }
        ],
        secundarios: [
            'Manjar', 'Crema francesa de yogurt de fresa', 'Crema francesa de rompope', 
            'Crema francesa de café', 'Crema francesa de chocolate'
        ]
    };

    // --- FUNCIONES DE MANEJO DE VISTAS Y SESIÓN ---
    function showView(viewToShow) {
        calendarView.classList.add('hidden');
        formView.classList.add('hidden');
        userManagementView.classList.add('hidden');
        statsView.classList.add('hidden');
        pendingView.classList.add('hidden');

        if (viewToShow === 'calendar') {
            calendarView.classList.remove('hidden');
        } else if (viewToShow === 'form') {
            formView.classList.remove('hidden');
        } else if (viewToShow === 'userManagement') {
            userManagementView.classList.remove('hidden');
        } else if (viewToShow === 'stats') {
            statsView.classList.remove('hidden');
        } else if (viewToShow === 'pending') {
            pendingView.classList.remove('hidden');
        }
    }
    
    function showAppView(token, role) {
        loginView.classList.add('hidden');
        appView.classList.remove('hidden');
        showView('calendar');

        if (role === 'Administrador') {
            manageUsersButton.classList.remove('hidden');
            viewStatsButton.classList.remove('hidden');
            commissionReportButton.classList.remove('hidden');
        } else {
            manageUsersButton.classList.add('hidden');
            viewStatsButton.classList.add('hidden');
            commissionReportButton.classList.add('hidden');
        }

        loadPendingFolios();

        if (window.initializeCalendar) {
            window.initializeCalendar(token, role);
            setTimeout(() => {
                if (window.myAppCalendar) {
                    window.myAppCalendar.refetchEvents();
                }
            }, 100);
        }
    }

    function handleLogout() {
        localStorage.removeItem('authToken');
        appView.classList.add('hidden');
        loginView.classList.remove('hidden');
        alert("Sesión cerrada.");
    }
    
    async function fetchWithTimeout(resource, options = {}, timeout = 8000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await fetch(resource, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    }

    function safeJsonParse(jsonString) {
        if (!jsonString) return [];
        try {
            const result = JSON.parse(jsonString);
            return Array.isArray(result) ? result : [result];
        } catch (e) {
            return [jsonString];
        }
    }

    // --- LÓGICA DEL FORMULARIO (INICIALIZACIÓN Y FUNCIONES) ---
    for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option'); option.value = i; option.textContent = i.toString().padStart(2, '0');
        deliveryHourSelect.appendChild(option);
    }

    function resetForm() {
        folioForm.reset();
        formTitle.textContent = 'Crear Nuevo Folio';
        delete folioForm.dataset.editingId;
        delete folioForm.dataset.originalStatus;
        additionalItems = [];
        selectedFiles = [];
        existingImages = [];
        selectedCakeFlavors = [];
        selectedRellenos = [];
        tiersData = [];
        additionalList.innerHTML = '';
        imagePreview.innerHTML = '';
        renderTags(cakeFlavorContainer, [], null);
        renderTags(fillingContainer, [], null);
        tiersTableBody.innerHTML = '';
        complementsContainer.innerHTML = '';
        inStorePickupCheckbox.dispatchEvent(new Event('change'));
        folioTypeSelect.dispatchEvent(new Event('change'));
        updateTotals();
    }
    
    window.populateFormForEdit = (folio) => {
        resetForm();
        folioForm.dataset.editingId = folio.id;
        folioForm.dataset.originalStatus = folio.status;

        if (folio.status === 'Pendiente') {
            formTitle.textContent = `Confirmar Folio de IA: ${folio.folioNumber}`;
        } else {
            formTitle.textContent = `Editando Folio: ${folio.folioNumber}`;
        }

        folioTypeSelect.value = folio.folioType;
        folioTypeSelect.dispatchEvent(new Event('change'));

        clientNameInput.value = folio.client.name;
        clientPhoneInput.value = folio.client.phone;
        clientPhone2Input.value = folio.client.phone2 || '';
        deliveryDateInput.value = folio.deliveryDate;
        personsInput.value = folio.persons;
        shapeInput.value = folio.shape;
        designDescriptionTextarea.value = folio.designDescription;
        dedicationInput.value = folio.dedication || '';
        accessoriesInput.value = folio.accessories || '';
        deliveryCostInput.value = parseFloat(folio.deliveryCost) || 0;

        const [hour, minute] = folio.deliveryTime.split(':');
        const hour12 = (parseInt(hour) % 12) || 12;
        deliveryHourSelect.value = hour12;
        deliveryMinuteSelect.value = minute;
        deliveryPeriodSelect.value = parseInt(hour) >= 12 ? 'PM' : 'AM';
        
        isPaidCheckbox.checked = folio.isPaid;
        hasExtraHeightCheckbox.checked = folio.hasExtraHeight;
        
        if (folio.additional && folio.additional.length > 0) {
            additionalItems = folio.additional.map(item => {
                const match = item.name.match(/(\d+)\s*x\s*(.*)/);
                if (match) {
                    const quantity = parseInt(match[1]);
                    const name = match[2].trim();
                    const price = parseFloat(item.price);
                    return { name, quantity, price: price / quantity, totalPrice: price };
                }
                return { name: item.name, quantity: 1, price: parseFloat(item.price), totalPrice: parseFloat(item.price) };
            });
            renderAdditionalItems();
        }
        
        if (folio.complements && Array.isArray(folio.complements) && folio.complements.length > 0) {
            folio.complements.forEach(comp => addComplementRow(comp));
        }
        
        if (folio.folioType === 'Normal') {
            selectedCakeFlavors = safeJsonParse(folio.cakeFlavor);
            selectedRellenos = safeJsonParse(folio.filling);
            renderTags(cakeFlavorContainer, selectedCakeFlavors, removeCakeFlavor);
            renderTags(fillingContainer, selectedRellenos, removeRelleno);
        } else if (folio.folioType === 'Base/Especial' && Array.isArray(folio.tiers)) {
            tiersTableBody.innerHTML = '';
            tiersData = [];
            folio.tiers.forEach(tier => {
                addTierRow(tier); 
            });
        }

        const location = folio.deliveryLocation || '';
        googleMapsLocationCheckbox.checked = location.includes('El cliente envía ubicación (Google Maps)');
        
        if (location.toLowerCase().includes('recoge en tienda')) {
            inStorePickupCheckbox.checked = true;
        } else {
            inStorePickupCheckbox.checked = false;
            let addressPart = location.replace('El cliente envía ubicación (Google Maps)', '').replace('(','').replace(')','').trim();
            
            const colMatch = addressPart.match(/Col\.\s*([^,]+)/);
            const intMatch = addressPart.match(/Int\.\s*([^,]+)/);
            
            if (colMatch) neighborhoodInput.value = colMatch[1].trim();
            if (intMatch) intNumberInput.value = intMatch[1].trim();
            
            let remainingLocation = addressPart.replace(/Col\.\s*[^,]+,?/, '').replace(/Int\.\s*[^,]+,?/, '').trim();
            const parts = remainingLocation.split(' ');
            const lastPart = parts[parts.length - 1];

            if (parts.length > 1 && !isNaN(parseFloat(lastPart))) {
                extNumberInput.value = parts.pop();
                streetInput.value = parts.join(' ');
            } else {
                streetInput.value = remainingLocation;
                extNumberInput.value = '';
            }
        }
        inStorePickupCheckbox.dispatchEvent(new Event('change'));

        if (folio.imageUrls && folio.imageUrls.length > 0) {
            existingImages = folio.imageUrls.map((url, index) => ({
                url: url,
                comment: (folio.imageComments && folio.imageComments[index]) ? folio.imageComments[index] : ''
            }));
        }
        renderImagePreviews();
        
        const additionalCost = (folio.additional || []).reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
        
        let fillingCost = 0;
        if (folio.folioType === 'Normal') {
            const numPersons = parseInt(folio.persons, 10) || 0;
            const rellenosArray = safeJsonParse(folio.filling);
            fillingCost = rellenosArray.reduce((sum, relleno) => {
                return (relleno && relleno.hasCost && numPersons > 0) ? sum + ((numPersons / 20) * 30) : sum;
            }, 0);
        } else if (folio.folioType === 'Base/Especial') {
            fillingCost = 0;
        }

        const baseCakeCost = parseFloat(folio.total) - (parseFloat(folio.deliveryCost) || 0) - additionalCost - fillingCost;

        totalInput.value = isNaN(baseCakeCost) ? '0.00' : baseCakeCost.toFixed(2);
        advanceInput.value = parseFloat(folio.advancePayment).toFixed(2);
        
        updateTotals();
    };
    
    // --- EVENT LISTENERS GLOBALES ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        loadingEl.classList.remove('hidden');
        try {
            const response = await fetchWithTimeout('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión');
            }
            localStorage.setItem('authToken', data.token);

            const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
            const userRole = tokenPayload.role;
            window.currentUserRole = userRole; 

            showAppView(data.token, userRole); 
        } catch (error) {
            document.getElementById('loginError').textContent = error.message;
        } finally {
            loadingEl.classList.add('hidden');
        }
    });

    logoutButton.addEventListener('click', handleLogout);
    
    newFolioButton.addEventListener('click', () => {
        window.previousView = 'calendar';
        resetForm();
        showView('form');
    });

    viewCalendarButton.addEventListener('click', () => showView('calendar'));
    
    cancelFormButton.addEventListener('click', () => {
        resetForm();
        showView(window.previousView || 'calendar'); 
        if (window.previousView === 'pending') {
            loadPendingFolios();
        }
    });

    if (manageUsersButton) {
        manageUsersButton.addEventListener('click', () => {
            showView('userManagement');
            loadUsers();
        });
    }

    viewPendingButton.addEventListener('click', () => {
        showView('pending');
        loadPendingFolios();
    });

    // --- Lógica para Estadísticas ---
    function renderStatsList(elementId, data) {
        const container = document.getElementById(elementId);
        container.innerHTML = '';
        if (!data || data.length === 0) {
            container.innerHTML = `<p class="text-gray-500 italic">No hay datos para mostrar.</p>`;
            return;
        }
        const ol = document.createElement('ol');
        ol.className = 'list-decimal list-inside space-y-1';
        data.forEach(item => {
            const li = document.createElement('li');
            li.className = 'text-gray-700';
            li.innerHTML = `${item.name} <span class="font-bold text-gray-900">(${item.count} veces)</span>`;
            ol.appendChild(li);
        });
        container.appendChild(ol);
    }

    async function loadFlavorAndFillingStats() {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:3000/api/folios/statistics', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) throw new Error('No se pudieron cargar las estadísticas de sabores.');
            const stats = await response.json();
            renderStatsList('normalFlavorsList', stats.normal.flavors);
            renderStatsList('normalFillingsList', stats.normal.fillings);
            renderStatsList('specialFlavorsList', stats.special.flavors);
            renderStatsList('specialFillingsList', stats.special.fillings);
        } catch (error) {
            console.error(error);
        }
    }
    
    async function loadProductivityStats() {
        const date = productivityDateInput.value;
        if (!date) return;

        const productivityListBody = document.getElementById('productivityListBody');
        productivityListBody.innerHTML = `<tr><td colspan="2" class="text-center p-4">Cargando...</td></tr>`;
        
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:3000/api/folios/productivity?date=${date}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) {
                throw new Error('No se pudieron cargar los datos de productividad.');
            }
            
            const stats = await response.json();
            productivityListBody.innerHTML = '';

            if (stats.length === 0) {
                productivityListBody.innerHTML = `<tr><td colspan="2" class="text-center p-4">No se capturaron folios en esta fecha.</td></tr>`;
                return;
            }

            stats.forEach(userStat => {
                const row = document.createElement('tr');
                row.className = 'border-b';
                row.innerHTML = `
                    <td class="py-2 px-4">${userStat.responsibleUser.username}</td>
                    <td class="py-2 px-4 font-bold">${userStat.folioCount}</td>
                `;
                productivityListBody.appendChild(row);
            });

        } catch (error) {
            productivityListBody.innerHTML = `<tr><td colspan="2" class="text-center p-4 text-red-500">${error.message}</td></tr>`;
        }
    }

    if (viewStatsButton) {
        viewStatsButton.addEventListener('click', () => {
            showView('stats');
            loadingEl.classList.remove('hidden');
            productivityDateInput.valueAsDate = new Date();
            Promise.all([
                loadFlavorAndFillingStats(),
                loadProductivityStats()
            ]).finally(() => {
                loadingEl.classList.add('hidden');
            });
        });
    }

    if (productivityDateInput) {
        productivityDateInput.addEventListener('change', loadProductivityStats);
    }

    // --- LÓGICA DEL FORMULARIO ---
    folioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editingId = folioForm.dataset.editingId;
        const isEditing = !!editingId;
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `http://localhost:3000/api/folios/${editingId}` : 'http://localhost:3000/api/folios';
        
        loadingEl.classList.remove('hidden');
        const authToken = localStorage.getItem('authToken');
        const formData = new FormData();
        
        let hour = parseInt(deliveryHourSelect.value);
        if (deliveryPeriodSelect.value === 'PM' && hour !== 12) { hour += 12; }
        if (deliveryPeriodSelect.value === 'AM' && hour === 12) { hour = 0; }
        const deliveryTime = `${hour.toString().padStart(2, '0')}:${deliveryMinuteSelect.value}:00`;

        let deliveryLocation = '';
        if (inStorePickupCheckbox.checked) {
            deliveryLocation = 'Recoge en Tienda';
        } else {
            const address = [`${streetInput.value || ''} ${extNumberInput.value || ''}`.trim(), intNumberInput.value ? `Int. ${intNumberInput.value}` : '', neighborhoodInput.value ? `Col. ${neighborhoodInput.value}` : ''].filter(Boolean).join(', ');
            if (googleMapsLocationCheckbox.checked) {
                deliveryLocation = `El cliente envía ubicación (Google Maps)${address ? ` (${address})` : ''}`;
            } else {
                deliveryLocation = address;
            }
        }

        formData.append('clientName', clientNameInput.value);
        formData.append('clientPhone', clientPhoneInput.value);
        formData.append('clientPhone2', clientPhone2Input.value);
        formData.append('deliveryDate', deliveryDateInput.value);
        formData.append('deliveryTime', deliveryTime);
        formData.append('folioType', folioTypeSelect.value);
        formData.append('persons', personsInput.value);
        formData.append('shape', shapeInput.value);
        formData.append('designDescription', designDescriptionTextarea.value);
        formData.append('dedication', dedicationInput.value);
        formData.append('deliveryLocation', deliveryLocation);
        formData.append('deliveryCost', deliveryCostInput.value);
        formData.append('total', totalInput.value);
        formData.append('advancePayment', advanceInput.value);
        formData.append('accessories', accessoriesInput.value);
        
        const finalAdditionalItems = additionalItems.map(item => ({ name: `${item.quantity} x ${item.name}`, price: item.totalPrice }));
        formData.append('additional', JSON.stringify(finalAdditionalItems));
        
        formData.append('isPaid', isPaidCheckbox.checked);
        formData.append('hasExtraHeight', hasExtraHeightCheckbox.checked);
        formData.append('addCommissionToCustomer', addCommissionCheckbox.checked);

        const complementsData = [];
        document.querySelectorAll('.complement-form').forEach(form => {
            complementsData.push({
                persons: form.querySelector('.complement-persons').value,
                shape: form.querySelector('.complement-shape').value,
                flavor: form.querySelector('.complement-flavor').value,
                filling: form.querySelector('.complement-filling').value,
                description: form.querySelector('.complement-description').value,
            });
        });
        formData.append('complements', JSON.stringify(complementsData));

        if (folioTypeSelect.value === 'Normal') {
            formData.append('cakeFlavor', JSON.stringify(selectedCakeFlavors));
            formData.append('filling', JSON.stringify(selectedRellenos));
        } else {
            const currentTiersData = Array.from(tiersTableBody.children).map((row, index) => {
                const tierState = tiersData[index] || { panes: [], rellenos: [] };
                return {
                    persons: row.querySelector('.tier-persons-input').value,
                    panes: tierState.panes,
                    rellenos: tierState.rellenos,
                    notas: row.querySelector('.tier-notes-input').value
                };
            });
            formData.append('tiers', JSON.stringify(currentTiersData));
        }

        if (isEditing) {
            formData.append('existingImageUrls', JSON.stringify(existingImages.map(img => img.url)));
            formData.append('existingImageComments', JSON.stringify(existingImages.map(img => img.comment)));
        }

        const newImageComments = selectedFiles.map(sf => sf.comment);
        formData.append('imageComments', JSON.stringify(newImageComments));

        for (const fileData of selectedFiles) {
            formData.append('referenceImages', fileData.file);
        }
        
        if (isEditing && folioForm.dataset.originalStatus === 'Pendiente') {
            formData.append('status', 'Nuevo');
        }
        
        try {
            const response = await fetch(url, { method, headers: { 'Authorization': `Bearer ${authToken}` }, body: formData });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Error del servidor'); }
            
            const successMessage = (isEditing && folioForm.dataset.originalStatus === 'Pendiente')
                ? '¡Folio confirmado y guardado con éxito!'
                : (isEditing ? '¡Folio actualizado con éxito!' : '¡Folio creado con éxito!');
            
            alert(successMessage);

            const event = new CustomEvent('folioCreated');
            window.dispatchEvent(event);

        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            loadingEl.classList.add('hidden');
        }
    });

    window.addEventListener('folioCreated', () => {
        showView('calendar');
        loadPendingFolios();
        if (window.myAppCalendar) {
            window.myAppCalendar.refetchEvents();
        }
    });

    function renderImagePreviews() {
        imagePreview.innerHTML = '';

        existingImages.forEach((imgData, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'image-preview-wrapper w-full';
            wrapper.innerHTML = `
                <img src="http://localhost:3000/${imgData.url.replace(/\\/g, '/')}" class="w-full h-auto object-cover rounded-md border">
                <button type="button" class="delete-image-btn existing" data-index="${index}">&times;</button>
                <textarea placeholder="Añadir un comentario..." class="w-full text-sm p-2 mt-2 border rounded existing-comment" data-index="${index}">${imgData.comment}</textarea>
            `;
            imagePreview.appendChild(wrapper);
        });

        selectedFiles.forEach((fileData, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'image-preview-wrapper w-full';
            wrapper.innerHTML = `
                <img src="${URL.createObjectURL(fileData.file)}" class="w-full h-auto object-cover rounded-md border">
                <button type="button" class="delete-image-btn new" data-index="${index}">&times;</button>
                <textarea placeholder="Añadir un comentario..." class="w-full text-sm p-2 mt-2 border rounded new-comment" data-index="${index}">${fileData.comment}</textarea>
            `;
            imagePreview.appendChild(wrapper);
        });
    }

    imageInput.addEventListener('change', () => {
        const files = Array.from(imageInput.files);
        if ((selectedFiles.length + existingImages.length + files.length) > 5) {
            alert('Solo puedes subir un máximo de 5 imágenes en total.');
            return;
        }
        selectedFiles.push(...files.map(file => ({ file, comment: '' })));
        renderImagePreviews();
        imageInput.value = '';
    });

    imagePreview.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-image-btn')) {
            const index = parseInt(e.target.dataset.index, 10);
            if (e.target.classList.contains('existing')) {
                existingImages.splice(index, 1);
            } else {
                selectedFiles.splice(index, 1);
            }
            renderImagePreviews();
        }
    });

    imagePreview.addEventListener('input', (e) => {
        if (e.target.tagName === 'TEXTAREA') {
            const index = parseInt(e.target.dataset.index, 10);
            if (e.target.classList.contains('existing-comment')) {
                if (existingImages[index]) existingImages[index].comment = e.target.value;
            } else {
                if (selectedFiles[index]) selectedFiles[index].comment = e.target.value;
            }
        }
    });

    function renderTags(container, tagsArray, onRemoveCallback) {
        container.innerHTML = '';
        (tagsArray || []).forEach((tagData, index) => {
            const tagEl = document.createElement('div');
            tagEl.className = 'tag';
            const tagName = typeof tagData === 'object' ? tagData.name : tagData;
            tagEl.innerHTML = `<span>${tagName}</span><button type="button" class="tag-remove-btn" data-index="${index}">&times;</button>`;
            container.appendChild(tagEl);
        });
        if (onRemoveCallback) {
             container.querySelectorAll('.tag-remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => onRemoveCallback(parseInt(e.target.dataset.index, 10)));
            });
        }
    }
    
    function openSelectionModal(title, data, currentTags, onSelectCallback, limit) {
        modalStep1.classList.remove('hidden');
        modalStep2.classList.add('hidden');
        modalTitle.textContent = title;
        modalSearch.value = '';
        
        function populateList(filter = '') {
            modalList.innerHTML = '';
            data.filter(item => item.toLowerCase().includes(filter.toLowerCase())).forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'modal-list-item';
                itemEl.textContent = item;
                itemEl.addEventListener('click', () => {
                    if (currentTags.length < limit) {
                        onSelectCallback(item);
                        selectionModal.classList.add('hidden');
                    } else {
                        alert(`Solo puedes seleccionar un máximo de ${limit}.`);
                    }
                });
                modalList.appendChild(itemEl);
            });
        }
        populateList();
        modalSearch.onkeyup = () => populateList(modalSearch.value);
        selectionModal.classList.remove('hidden');
    }
    
    function openRellenoModal(onSelectCallback, currentRellenos, limit) {
        modalTitle.textContent = 'Añadir Relleno';
        modalStep1.classList.remove('hidden');
        modalStep2.classList.add('hidden');
        modalSearch.value = '';
        modalList.innerHTML = '';
        
        const allRellenos = [
            ...Object.keys(rellenosData.incluidos).map(name => ({ name, hasCost: false, data: rellenosData.incluidos[name] })),
            ...Object.keys(rellenosData.conCosto).map(name => ({ name, hasCost: true, data: rellenosData.conCosto[name] }))
        ];

        function populateList(filter = '') {
            modalList.innerHTML = '';
            const filteredRellenos = allRellenos.filter(r => r.name.toLowerCase().includes(filter.toLowerCase()));

            filteredRellenos.forEach(titular => {
                const itemEl = document.createElement('div');
                itemEl.className = 'modal-list-item';
                if (titular.hasCost) itemEl.classList.add('cost-extra');
                itemEl.textContent = titular.name;

                itemEl.addEventListener('click', () => {
                    const suboptions = titular.data.suboptions;
                    if (suboptions && suboptions.length > 0) {
                        showStep2(titular, suboptions);
                    } else {
                        if (currentRellenos.length < limit) {
                            onSelectCallback({ name: titular.name, hasCost: titular.hasCost });
                            selectionModal.classList.add('hidden');
                        } else {
                            alert(`Solo puedes seleccionar un máximo de ${limit} rellenos.`);
                        }
                    }
                });
                modalList.appendChild(itemEl);
            });
        }

        const showStep2 = (titular, suboptions) => {
            modalStep1.classList.add('hidden');
            modalStep2.classList.remove('hidden');
            modalTitle.textContent = `Paso 2: Elige para "${titular.name}"`;
            modalStep2Title.innerHTML = `Opción para "<b>${titular.name}</b>" <button type="button" class="back-to-step1 text-sm text-blue-600 hover:underline">(Volver)</button>`;
            modalStep2List.innerHTML = '';
            suboptions.forEach(comp => {
                const compEl = document.createElement('div');
                compEl.className = 'modal-list-item';
                compEl.textContent = comp;
                compEl.addEventListener('click', () => {
                     if (currentRellenos.length < limit) {
                        const separator = titular.data.separator || 'con';
                        const finalName = `${titular.name} ${separator} ${comp}`;
                        onSelectCallback({ name: finalName, hasCost: titular.hasCost });
                        selectionModal.classList.add('hidden');
                    } else {
                        alert(`Solo puedes seleccionar un máximo de ${limit} rellenos.`);
                    }
                });
                modalStep2List.appendChild(compEl);
            });
            modalStep2Title.querySelector('.back-to-step1').addEventListener('click', () => populateList(modalSearch.value));
        };
        
        populateList();
        modalSearch.onkeyup = () => populateList(modalSearch.value);
        selectionModal.classList.remove('hidden');
    }

    function openRellenoModalEspecial(onSelectCallback) {
        let state = { principal: null, finalPrincipal: '' };
        modalSearch.value = '';

        const showPrincipales = (filter = '') => {
            modalTitle.textContent = 'Paso 1: Elige un Relleno Principal';
            modalStep1.classList.remove('hidden');
            modalStep2.classList.add('hidden');
            modalList.innerHTML = '';
            
            const filteredPrincipales = rellenosDataEspecial.principales.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));

            filteredPrincipales.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'modal-list-item';
                itemEl.textContent = item.name + (item.suboptions.length > 0 ? ` (...)` : '');
                itemEl.addEventListener('click', () => {
                    state.principal = item;
                    if (item.suboptions && item.suboptions.length > 0) {
                        showPrincipalSuboptions();
                    } else {
                        state.finalPrincipal = item.name;
                        showSecundarios();
                    }
                });
                modalList.appendChild(itemEl);
            });
            selectionModal.classList.remove('hidden');
        };

        const showPrincipalSuboptions = () => {
            modalStep1.classList.add('hidden');
            modalStep2.classList.remove('hidden');
            modalTitle.textContent = `Elige una opción para "${state.principal.name}"`;
            modalStep2Title.innerHTML = `Opción para "<b>${state.principal.name}</b>" <button type="button" class="back-to-step1 text-sm text-blue-600 hover:underline">(Volver)</button>`;
            modalStep2List.innerHTML = '';

            state.principal.suboptions.forEach(subItem => {
                const itemEl = document.createElement('div');
                itemEl.className = 'modal-list-item';
                itemEl.textContent = subItem;
                itemEl.addEventListener('click', () => {
                    const separator = state.principal.separator || 'con';
                    state.finalPrincipal = `${state.principal.name}${separator}${subItem}`;
                    showSecundarios();
                });
                modalStep2List.appendChild(itemEl);
            });
            modalStep2Title.querySelector('.back-to-step1').addEventListener('click', () => showPrincipales(modalSearch.value));
        };

        const showSecundarios = () => {
            modalStep1.classList.add('hidden');
            modalStep2.classList.remove('hidden');
            modalTitle.textContent = 'Paso 2: Elige un Relleno Secundario';
            modalStep2Title.innerHTML = `Elegiste: "<b>${state.finalPrincipal}</b>" <button type="button" class="back-to-step1 text-sm text-blue-600 hover:underline">(Volver)</button>`;
            modalStep2List.innerHTML = '';

            rellenosDataEspecial.secundarios.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'modal-list-item';
                itemEl.textContent = item;
                itemEl.addEventListener('click', () => {
                    onSelectCallback([state.finalPrincipal, item]);
                    selectionModal.classList.add('hidden');
                });
                modalStep2List.appendChild(itemEl);
            });
            
            modalStep2Title.querySelector('.back-to-step1').addEventListener('click', () => {
                if (state.principal.suboptions && state.principal.suboptions.length > 0) {
                    showPrincipalSuboptions();
                } else {
                    showPrincipales(modalSearch.value);
                }
            });
        };
        
        showPrincipales();
        modalSearch.onkeyup = () => showPrincipales(modalSearch.value);
    }

    modalCloseBtn.addEventListener('click', () => selectionModal.classList.add('hidden'));

    function addCakeFlavor(flavor) { if (selectedCakeFlavors.length < 2) { selectedCakeFlavors.push(flavor); renderTags(cakeFlavorContainer, selectedCakeFlavors, removeCakeFlavor); checkRestrictions(); } }
    function removeCakeFlavor(index) { selectedCakeFlavors.splice(index, 1); renderTags(cakeFlavorContainer, selectedCakeFlavors, removeCakeFlavor); checkRestrictions(); }
    
    function addRelleno(relleno) { if (selectedRellenos.length < 2) { selectedRellenos.push(relleno); renderTags(fillingContainer, selectedRellenos, removeRelleno); updateTotals(); } }
    function removeRelleno(index) { selectedRellenos.splice(index, 1); renderTags(fillingContainer, selectedRellenos, removeRelleno); updateTotals(); }

    addCakeFlavorBtn.addEventListener('click', () => openSelectionModal('Sabor de Pan', cakeFlavorsData.normal, selectedCakeFlavors, addCakeFlavor, 2));
    addFillingBtn.addEventListener('click', () => openRellenoModal(addRelleno, selectedRellenos, 2));

    function checkRestrictions() {
        const hasNoFillingPan = selectedCakeFlavors.includes('Pastel de queso') || selectedCakeFlavors.includes('Queso/Flan');
        const isMilHojas = selectedCakeFlavors.includes('Mil Hojas');
        fillingSection.classList.toggle('disabled-section', hasNoFillingPan || isMilHojas);
        designDescriptionTextarea.disabled = isMilHojas;
        if (hasNoFillingPan || isMilHojas) {
            selectedRellenos = [];
            renderTags(fillingContainer, selectedRellenos, removeRelleno);
            updateTotals();
            if(isMilHojas) designDescriptionTextarea.value = "Mil Hojas no lleva diseño";
        }
    }
    
    inStorePickupCheckbox.addEventListener('change', function() { 
        deliveryAddressSection.classList.toggle('hidden', this.checked); 
        deliveryCostInput.readOnly = this.checked; 
        if (this.checked) {
            deliveryCostInput.value = '0'; 
        }
        updateTotals(); 
    });

    function getGrandTotal() {
        const total = parseFloat(totalInput.value) || 0;
        const delivery = parseFloat(deliveryCostInput.value) || 0;
        const additionalFromList = additionalItems.reduce((sum, item) => sum + item.totalPrice, 0);
        
        let fillingCost = 0;
        if (folioTypeSelect.value === 'Normal') {
            const persons = parseFloat(personsInput.value) || 0;
            fillingCost = selectedRellenos.reduce((sum, relleno) => (relleno && relleno.hasCost && persons > 0) ? sum + ((persons / 20) * 30) : sum, 0);
        }

        let commissionCost = 0;
        const subtotalForCommission = total + delivery + additionalFromList + fillingCost;
        if (addCommissionCheckbox.checked) {
            const commission = subtotalForCommission * 0.05;
            commissionCost = Math.ceil(commission / 10) * 10;
        }
        
        return subtotalForCommission + commissionCost;
    }

    function calculateBalance() {
        balanceInput.value = (getGrandTotal() - (parseFloat(advanceInput.value) || 0)).toFixed(2);
    }

    function updateTotals() {
        if (isPaidCheckbox.checked) {
            advanceInput.value = getGrandTotal().toFixed(2);
        }
        calculateBalance();
    }

    [totalInput, deliveryCostInput, personsInput].forEach(input => input.addEventListener('input', updateTotals));
    advanceInput.addEventListener('input', calculateBalance);
    isPaidCheckbox.addEventListener('change', function() {
        advanceInput.readOnly = this.checked;
        updateTotals();
    });
    addCommissionCheckbox.addEventListener('change', updateTotals);
    tiersTableBody.addEventListener('input', (e) => {
        if (e.target.classList.contains('tier-persons-input')) updateTotals();
    });

    function renderAdditionalItems() {
        additionalList.innerHTML = '';
        additionalItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `${item.quantity} x ${item.name} - $${item.totalPrice.toFixed(2)} <button type="button" class="remove-additional-btn text-red-500 ml-2" data-index="${index}">[x]</button>`;
            additionalList.appendChild(li);
        });
    }

    addAdditionalButton.addEventListener('click', () => {
        const nameInput = document.getElementById('additionalName'), quantityInput = document.getElementById('additionalQuantity'), priceInput = document.getElementById('additionalPrice');
        const name = nameInput.value.trim(), quantity = parseInt(quantityInput.value, 10), price = parseFloat(priceInput.value);
        if (name && quantity > 0 && !isNaN(price)) {
            additionalItems.push({ name, quantity, price, totalPrice: quantity * price });
            renderAdditionalItems();
            updateTotals();
            nameInput.value = '';
            quantityInput.value = '1';
            priceInput.value = '';
        } else {
            alert('Por favor, completa la descripción, cantidad y precio del adicional.');
        }
    });

    additionalList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-additional-btn')) {
            additionalItems.splice(e.target.dataset.index, 1);
            renderAdditionalItems();
            updateTotals();
        }
    });

    function addTierRow(tier = null) {
        const index = tiersData.length;
        tiersData.push(tier || { persons: '', panes: [], rellenos: [], notas: '' });
    
        const row = document.createElement('tr');
        row.className = 'tier-row border-b';
        row.dataset.index = index;
        row.innerHTML = `<td class="p-2"><input type="number" class="tier-persons-input bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2" placeholder="Personas"></td><td class="p-2"><div class="tag-container panes-container"></div><button type="button" class="add-tier-pane-btn mt-1 text-sm text-blue-600 hover:text-blue-800 font-medium">+ Pan</button></td><td class="p-2"><div class="tag-container fillings-container"></div><button type="button" class="add-tier-filling-btn mt-1 text-sm text-blue-600 hover:text-blue-800 font-medium">+ Relleno</button></td><td class="p-2"><input type="text" class="tier-notes-input bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2" placeholder="Notas"></td><td class="p-1 text-center"><button type="button" class="remove-tier-button text-red-500 font-bold px-2 text-lg">X</button></td>`;
        
        if (tier) {
            row.querySelector('.tier-persons-input').value = tier.persons || '';
            row.querySelector('.tier-notes-input').value = tier.notas || '';
            renderTags(row.querySelector('.panes-container'), tier.panes || [], (tagIndex) => removeTierPane(index, tagIndex));
            renderTags(row.querySelector('.fillings-container'), (tier.rellenos || []), (tagIndex) => removeTierFilling(index, tagIndex));
        }
        
        tiersTableBody.appendChild(row);
    }

    folioTypeSelect.addEventListener('change', function() {
        const isSpecial = this.value === 'Base/Especial';
        normalFields.classList.toggle('hidden', isSpecial);
        specialFields.classList.toggle('hidden', !isSpecial);
        if (isSpecial && tiersTableBody.children.length === 0) {
             addTierRow();
        }
        if (isSpecial) {
            selectedCakeFlavors = [];
            selectedRellenos = [];
            renderTags(cakeFlavorContainer, [], null);
            renderTags(fillingContainer, [], null);
        } else {
            tiersData = [];
            tiersTableBody.innerHTML = '';
        }
        updateTotals();
    });
    addTierButton.addEventListener('click', () => addTierRow());
    
    const removeTierPane = (tierIndex, tagIndex) => {
        if (!tiersData[tierIndex]) return;
        tiersData[tierIndex].panes.splice(tagIndex, 1);
        const row = tiersTableBody.querySelector(`[data-index="${tierIndex}"]`);
        if (row) {
            renderTags(row.querySelector('.panes-container'), tiersData[tierIndex].panes, (newTagIndex) => removeTierPane(tierIndex, newTagIndex));
        }
    };
    const removeTierFilling = (tierIndex, tagIndex) => {
        if (!tiersData[tierIndex]) return;
        tiersData[tierIndex].rellenos.splice(tagIndex, 1);
        const row = tiersTableBody.querySelector(`[data-index="${tierIndex}"]`);
        if (row) {
            renderTags(row.querySelector('.fillings-container'), tiersData[tierIndex].rellenos, (newTagIndex) => removeTierFilling(tierIndex, newTagIndex));
        }
        updateTotals();
    };

    tiersTableBody.addEventListener('click', function(e) {
        const target = e.target;
        const row = target.closest('.tier-row');
        if (!row) return;

        currentTierIndex = parseInt(row.dataset.index, 10);

        const addTierPane = (flavor) => {
            if (tiersData[currentTierIndex] && tiersData[currentTierIndex].panes.length < 3) {
                tiersData[currentTierIndex].panes.push(flavor);
                renderTags(row.querySelector('.panes-container'), tiersData[currentTierIndex].panes, (tagIndex) => removeTierPane(currentTierIndex, tagIndex));
            }
        };

        const addTierFilling = (rellenos) => { 
            if (tiersData[currentTierIndex]) {
                tiersData[currentTierIndex].rellenos = rellenos; 
                renderTags(row.querySelector('.fillings-container'), tiersData[currentTierIndex].rellenos, (tagIndex) => removeTierFilling(currentTierIndex, tagIndex));
                updateTotals();
            }
        };

        if (target.classList.contains('add-tier-pane-btn')) {
            openSelectionModal('Sabor de Pan (Piso)', cakeFlavorsData.tier, tiersData[currentTierIndex].panes, addTierPane, 3);
        } else if (target.classList.contains('add-tier-filling-btn')) {
            openRellenoModalEspecial(addTierFilling); 
        } else if (target.classList.contains('remove-tier-button')) {
            tiersData.splice(currentTierIndex, 1);
            row.remove();
            Array.from(tiersTableBody.children).forEach((r, i) => r.dataset.index = i);
            updateTotals();
        } else if(target.closest('.tag-remove-btn')) {
            const tagContainer = target.closest('.tag-container');
            const tagIndex = parseInt(target.closest('.tag-remove-btn').dataset.index, 10);
            if (tagContainer.classList.contains('panes-container')) {
                removeTierPane(currentTierIndex, tagIndex);
            } else if (tagContainer.classList.contains('fillings-container')) {
                removeTierFilling(currentTierIndex, tagIndex);
            }
        }
    });

    function addComplementRow(complement = null) {
        const complementIndex = complementsContainer.children.length;
        const formWrapper = document.createElement('div');
        formWrapper.className = 'complement-form relative space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50';
        formWrapper.dataset.index = complementIndex;

        formWrapper.innerHTML = `
            <button type="button" class="absolute top-2 right-2 remove-complement-btn text-red-500 font-bold text-lg">X</button>
            <h4 class="text-md font-semibold text-gray-600">Complemento ${complementIndex + 1}</h4>
            <div class="grid md:grid-cols-4 gap-4">
                <div>
                    <label class="block mb-2 text-sm font-medium">Personas</label>
                    <input type="number" step="5" class="complement-persons bg-white border border-gray-300 text-sm rounded-lg block w-full p-2.5" value="${complement?.persons || ''}">
                </div>
                <div>
                    <label class="block mb-2 text-sm font-medium">Forma</label>
                    <input type="text" class="complement-shape bg-white border border-gray-300 text-sm rounded-lg block w-full p-2.5" value="${complement?.shape || ''}">
                </div>
                <div>
                    <label class="block mb-2 text-sm font-medium">Sabor del Pan</label>
                    <input type="text" class="complement-flavor bg-white border border-gray-300 text-sm rounded-lg block w-full p-2.5" value="${complement?.flavor || ''}">
                </div>
                <div>
                    <label class="block mb-2 text-sm font-medium">Relleno</label>
                    <input type="text" class="complement-filling bg-white border border-gray-300 text-sm rounded-lg block w-full p-2.5" value="${complement?.filling || ''}">
                </div>
            </div>
            <div>
                <label class="block mb-2 text-sm font-medium">Descripción</label>
                <textarea rows="2" class="complement-description block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300">${complement?.description || ''}</textarea>
            </div>
        `;
        complementsContainer.appendChild(formWrapper);

        formWrapper.querySelector('.remove-complement-btn').addEventListener('click', () => {
            formWrapper.remove();
            document.querySelectorAll('.complement-form').forEach((form, index) => {
                form.querySelector('h4').textContent = `Complemento ${index + 1}`;
            });
        });
    }

    addComplementButton.addEventListener('click', () => addComplementRow());
    
    // --- INICIALIZACIÓN ---
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
        try {
            const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
            const userRole = tokenPayload.role;
            window.currentUserRole = userRole;
            showAppView(storedToken, userRole);
        } catch (error) {
            console.error("Error al decodificar el token:", error);
            localStorage.removeItem('authToken');
        }
    }

    window.showMainView = showView;

    // --- LÓGICA DEL VISOR DE PDFS ---
    const pdfViewerModal = document.getElementById('pdfViewerModal');
    const closePdfViewerBtn = document.getElementById('closePdfViewer');
    const pdfViewerTitle = document.getElementById('pdfViewerTitle');
    const pdfFrame = document.getElementById('pdfFrame');
    const prevFolioBtn = document.getElementById('prevFolioBtn');
    const nextFolioBtn = document.getElementById('nextFolioBtn');

    let currentFolioList = [];
    let currentFolioIndex = -1;

    function updatePdfViewer() {
        if (currentFolioIndex < 0 || currentFolioIndex >= currentFolioList.length) {
            return;
        }

        const folio = currentFolioList[currentFolioIndex];
        const authToken = localStorage.getItem('authToken');
        const pdfUrl = `http://localhost:3000/api/folios/${folio.id}/pdf?token=${authToken}`;

        pdfViewerTitle.innerText = `Viendo Folio: ${folio.folioNumber} (${currentFolioIndex + 1} de ${currentFolioList.length})`;
        pdfFrame.src = pdfUrl;

        prevFolioBtn.disabled = currentFolioIndex === 0;
        nextFolioBtn.disabled = currentFolioIndex === currentFolioList.length - 1;
    }

    window.openPdfViewer = (folios, index) => {
        currentFolioList = folios;
        currentFolioIndex = index;
        updatePdfViewer();
        pdfViewerModal.classList.remove('hidden');
        setTimeout(() => window.focus(), 100); 
    };

    function closePdfViewer() {
        pdfViewerModal.classList.add('hidden');
        pdfFrame.src = 'about:blank';
    }

    closePdfViewerBtn.addEventListener('click', closePdfViewer);

    prevFolioBtn.addEventListener('click', () => {
        if (currentFolioIndex > 0) {
            currentFolioIndex--;
            updatePdfViewer();
        }
    });

    nextFolioBtn.addEventListener('click', () => {
        if (currentFolioIndex < currentFolioList.length - 1) {
            currentFolioIndex++;
            updatePdfViewer();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && !pdfViewerModal.classList.contains('hidden')) {
            closePdfViewer();
        }
    });

    window.addEventListener('mouseover', () => {
        if (!pdfViewerModal.classList.contains('hidden')) {
            window.focus();
        }
    });

    // --- LÓGICA DEL BOTÓN DE REPORTE ---
    if (commissionReportButton) {
        commissionReportButton.addEventListener('click', () => {
            const today = new Date();
            today.setDate(today.getDate() - 1);
            const yesterday = today.toISOString().split('T')[0];

            const authToken = localStorage.getItem('authToken');
            const url = `http://localhost:3000/api/folios/commission-report?date=${yesterday}&token=${authToken}`;
            
            window.open(url, '_blank');
        });
    }

    // ===== SECCIÓN PARA LA BANDEJA DE ENTRADA (CON CORRECCIONES) =====
    async function loadPendingFolios() {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) return;

        try {
            const response = await fetch('http://localhost:3000/api/folios?status=Pendiente', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) throw new Error('No se pudieron cargar los folios pendientes.');
            
            const pendingFolios = await response.json();

            // Actualizar el contador
            if (pendingFolios.length > 0) {
                pendingCountBadge.textContent = pendingFolios.length;
                pendingCountBadge.classList.remove('hidden');
            } else {
                pendingCountBadge.classList.add('hidden');
            }

            // Renderizar la lista
            pendingFoliosList.innerHTML = '';
            if (pendingFolios.length === 0) {
                pendingFoliosList.innerHTML = '<p class="text-gray-500 text-center italic mt-4">No hay folios pendientes por confirmar.</p>';
                return;
            }

            pendingFolios.forEach(folio => {
                const folioCard = document.createElement('div');
                folioCard.className = 'p-4 bg-gray-50 border rounded-lg flex justify-between items-center';
                folioCard.dataset.folioId = folio.id;

                folioCard.innerHTML = `
                    <div>
                        <p class="font-bold text-lg text-gray-800">Cliente: ${folio.client?.name || 'N/A'}</p>
                        <p class="text-sm text-gray-600">Fecha de Entrega: <span class="font-semibold">${new Date(folio.deliveryDate + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'long' })}</span></p>
                        <p class="text-sm text-gray-600">Personas: <span class="font-semibold">${folio.persons}</span> | Total: <span class="font-semibold">$${parseFloat(folio.total).toFixed(2)}</span></p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="review-btn bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Revisar y Confirmar</button>
                        <button class="reject-btn bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Rechazar</button>
                    </div>
                `;

                folioCard.addEventListener('click', async (e) => {
                    const target = e.target;
                
                    // --- Lógica para REVISAR Y CONFIRMAR ---
                    if (target.classList.contains('review-btn')) {
                        window.previousView = 'pending';
                        loadingEl.classList.remove('hidden');
                        try {
                            const folioResponse = await fetch(`http://localhost:3000/api/folios/${folio.id}`, {
                                headers: { 'Authorization': `Bearer ${authToken}` }
                            });
                            if (!folioResponse.ok) throw new Error('No se pudo cargar el detalle del folio.');
                            const folioDetails = await folioResponse.json();
                            
                            populateFormForEdit(folioDetails);
                            showView('form');
                
                        } catch (error) {
                            alert(error.message);
                        } finally {
                            loadingEl.classList.add('hidden');
                        }
                    }
                
                    // --- Lógica para RECHAZAR (ELIMINAR) ---
                    if (target.classList.contains('reject-btn')) {
                        if (confirm(`¿Estás seguro de que quieres rechazar y eliminar permanentemente el folio para "${folio.client?.name || 'N/A'}"?`)) {
                            loadingEl.classList.remove('hidden');
                            try {
                                const response = await fetch(`http://localhost:3000/api/folios/${folio.id}`, {
                                    method: 'DELETE',
                                    headers: { 'Authorization': `Bearer ${authToken}` }
                                });
                                
                                const result = await response.json();
                                if (!response.ok) {
                                    throw new Error(result.message || 'No se pudo eliminar el folio.');
                                }
                
                                alert('Folio rechazado y eliminado con éxito.');
                                loadPendingFolios();
                
                            } catch (error) {
                                alert(`Error: ${error.message}`);
                            } finally {
                                loadingEl.classList.add('hidden');
                            }
                        }
                    }
                });

                pendingFoliosList.appendChild(folioCard);
            });

        } catch (error) {
            console.error(error);
            pendingFoliosList.innerHTML = `<p class="text-red-500 text-center">${error.message}</p>`;
        }
    }
});