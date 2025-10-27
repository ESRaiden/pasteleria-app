document.addEventListener('DOMContentLoaded', function() {
    // Variable global para recordar la vista anterior
    window.previousView = 'calendar';
    let currentSessionId = null; // Variable para saber en qué sesión de chat estamos

    // --- VISTAS Y ELEMENTOS GLOBALES ---
    const loginView = document.getElementById('loginView');
    const appView = document.getElementById('appView');
    const calendarView = document.getElementById('calendarView');
    const formView = document.getElementById('formView');
    const userManagementView = document.getElementById('userManagementView');
    const statsView = document.getElementById('statsView');
    const loadingEl = document.getElementById('loading');
    const chatView = document.getElementById('chatView');

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

    // --- ELEMENTOS DEL CHAT ---
    const chatTitle = document.getElementById('chat-title');
    const backToSessionsBtn = document.getElementById('backToSessionsBtn');
    const chatMessagesContainer = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const folioStatusPanel = document.getElementById('folio-status-panel');
    const generateFolioBtn = document.getElementById('generate-folio-btn');
    const manualEditBtn = document.getElementById('manual-edit-btn');

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

    // --- FUNCIONES DE MANEJO DE VISTAS Y SESIÓN ---
    function showView(viewToShow) {
        calendarView.classList.add('hidden');
        formView.classList.add('hidden');
        userManagementView.classList.add('hidden');
        statsView.classList.add('hidden');
        pendingView.classList.add('hidden');
        chatView.classList.add('hidden');

        if (viewToShow === 'calendar') calendarView.classList.remove('hidden');
        else if (viewToShow === 'form') formView.classList.remove('hidden');
        else if (viewToShow === 'userManagement') userManagementView.classList.remove('hidden');
        else if (viewToShow === 'stats') statsView.classList.remove('hidden');
        else if (viewToShow === 'pending') pendingView.classList.remove('hidden');
        else if (viewToShow === 'chat') chatView.classList.remove('hidden');
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

        loadActiveSessions();

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
            // Si no es JSON válido, intentar devolverlo como un array con el string original
            return typeof jsonString === 'string' ? [jsonString] : [];
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
        // Asegurarse de que los checkboxes y selects disparen sus eventos 'change' para resetear UI
        if (inStorePickupCheckbox.checked) inStorePickupCheckbox.checked = false;
        inStorePickupCheckbox.dispatchEvent(new Event('change'));
        if (googleMapsLocationCheckbox.checked) googleMapsLocationCheckbox.checked = false;
        googleMapsLocationCheckbox.dispatchEvent(new Event('change'));
        folioTypeSelect.value = 'Normal'; // Volver al valor por defecto
        folioTypeSelect.dispatchEvent(new Event('change'));
        if (isPaidCheckbox.checked) isPaidCheckbox.checked = false;
        isPaidCheckbox.dispatchEvent(new Event('change'));
         if (addCommissionCheckbox.checked) addCommissionCheckbox.checked = false;
        addCommissionCheckbox.dispatchEvent(new Event('change'));
         if (hasExtraHeightCheckbox.checked) hasExtraHeightCheckbox.checked = false;
        updateTotals(); // Recalcular totales al final
    }

    window.populateFormForEdit = (folio) => {
        resetForm(); // Llama al reset mejorado
        folioForm.dataset.editingId = folio.id;
        folioForm.dataset.originalStatus = folio.status;

        if (folio.status === 'Pendiente') {
            formTitle.textContent = `Confirmar Folio de IA: ${folio.folioNumber || ''}`;
        } else {
            formTitle.textContent = `Editando Folio: ${folio.folioNumber}`;
        }

        folioTypeSelect.value = folio.folioType || 'Normal'; // Asegura un valor por defecto
        folioTypeSelect.dispatchEvent(new Event('change'));

        // ==================== INICIO CORRECCIÓN ERROR 'name' ====================
        clientNameInput.value = folio.client?.name || ''; // Usa Optional Chaining (?.) y valor por defecto
        clientPhoneInput.value = folio.client?.phone || ''; // Usa Optional Chaining (?.) y valor por defecto
        clientPhone2Input.value = folio.client?.phone2 || ''; // Usa Optional Chaining (?.) y valor por defecto
        // ===================== FIN CORRECCIÓN ERROR 'name' ======================

        deliveryDateInput.value = folio.deliveryDate || '';
        personsInput.value = folio.persons || '';
        shapeInput.value = folio.shape || '';

        let desc = folio.designDescription || '';
        let ded = folio.dedication || '';

        // Intenta extraer dedicatoria de la descripción si no viene separada
        if (!ded && desc) {
            const dedMatch = desc.match(/(?:diga|decir|con el texto)\s*[:"']?([^"']+)/i);
            if (dedMatch && dedMatch[1]) {
                ded = dedMatch[1].trim().replace(/['"]$/, '');
                 // Remueve la parte de la dedicatoria de la descripción
                desc = desc.replace(dedMatch[0], '').replace(/,\s*$/, '').trim();
            }
        }
        designDescriptionTextarea.value = desc;
        dedicationInput.value = ded;

        accessoriesInput.value = folio.accessories || '';
        deliveryCostInput.value = (parseFloat(folio.deliveryCost) || 0).toFixed(2); // Asegura formato

        if (folio.deliveryTime) {
            const timeParts = folio.deliveryTime.split(':');
            if (timeParts.length >= 2) {
                const hour = parseInt(timeParts[0], 10);
                const minute = timeParts[1];
                if (!isNaN(hour)) {
                    const hour12 = (hour % 12) || 12;
                    deliveryHourSelect.value = hour12;
                    deliveryMinuteSelect.value = minute;
                    deliveryPeriodSelect.value = hour >= 12 ? 'PM' : 'AM';
                }
            }
        }

        isPaidCheckbox.checked = folio.isPaid || false;
        hasExtraHeightCheckbox.checked = folio.hasExtraHeight || false;

        // Populate additional items
        additionalItems = []; // Limpiar antes de llenar
        if (folio.additional && Array.isArray(folio.additional)) {
             additionalItems = folio.additional.map(item => {
                 // Intenta parsear 'X x Nombre ($Y.YY)' o solo 'Nombre ($Y.YY)'
                const priceMatch = item.name.match(/\(\$([\d.]+)\)$/);
                const priceFromName = priceMatch ? parseFloat(priceMatch[1]) : parseFloat(item.price); // Usa el precio del objeto si no está en el nombre

                const nameWithoutPrice = priceMatch ? item.name.substring(0, priceMatch.index).trim() : item.name;

                const quantityMatch = nameWithoutPrice.match(/^(\d+)\s*x\s*(.*)/);
                let quantity = 1;
                let name = nameWithoutPrice;

                if (quantityMatch) {
                    quantity = parseInt(quantityMatch[1], 10);
                    name = quantityMatch[2].trim();
                }

                const individualPrice = (quantity > 0 && !isNaN(priceFromName)) ? priceFromName / quantity : 0;

                return {
                    name: name,
                    quantity: quantity,
                    price: individualPrice, // Precio unitario
                    totalPrice: priceFromName // Precio total del item (cantidad * precio unitario)
                };
             }).filter(item => item && !isNaN(item.totalPrice)); // Filtrar items inválidos
             renderAdditionalItems();
        }


        // Populate complements
        complementsContainer.innerHTML = ''; // Limpiar antes de llenar
        if (folio.complements && Array.isArray(folio.complements)) {
            folio.complements.forEach(comp => addComplementRow(comp));
        }

        // Populate flavors/fillings or tiers
        if (folio.folioType === 'Normal') {
            selectedCakeFlavors = safeJsonParse(folio.cakeFlavor);
            selectedRellenos = safeJsonParse(folio.filling); // Assuming filling might be JSON string or array
             // Asegurarse de que selectedRellenos sea un array de objetos si es necesario
             selectedRellenos = selectedRellenos.map(r => typeof r === 'string' ? { name: r, hasCost: false } : r); // Ajusta hasCost según tu lógica si es necesario
            renderTags(cakeFlavorContainer, selectedCakeFlavors, removeCakeFlavor);
            renderTags(fillingContainer, selectedRellenos, removeRelleno); // selectedRellenos ahora es [{name:'...', hasCost:...}]
        } else if (folio.folioType === 'Base/Especial' && Array.isArray(folio.tiers)) {
            tiersTableBody.innerHTML = ''; // Limpiar antes
            tiersData = []; // Limpiar antes
            folio.tiers.forEach(tier => {
                 // Asegurarse de que panes y rellenos sean arrays
                tier.panes = Array.isArray(tier.panes) ? tier.panes : (tier.panes ? [tier.panes] : []);
                tier.rellenos = Array.isArray(tier.rellenos) ? tier.rellenos : (tier.rellenos ? [tier.rellenos] : []);
                addTierRow(tier);
            });
        }


        // Populate delivery location
        const location = folio.deliveryLocation || '';
        googleMapsLocationCheckbox.checked = location.includes('El cliente envía ubicación (Google Maps)');

        if (location.toLowerCase() === 'recoge en tienda') {
            inStorePickupCheckbox.checked = true;
        } else {
            inStorePickupCheckbox.checked = false;
            // Intenta extraer partes de la dirección de forma más robusta
            let addressPart = location.replace('El cliente envía ubicación (Google Maps)', '').replace(/[\(\)]/g, '').trim();

            neighborhoodInput.value = '';
            streetInput.value = '';
            extNumberInput.value = '';
            intNumberInput.value = '';

            // Extraer Colonia
            const colMatch = addressPart.match(/(?:Colonia|Col\.?)\s*([^,]+)/i);
            if (colMatch) {
                neighborhoodInput.value = colMatch[1].trim();
                addressPart = addressPart.replace(colMatch[0], '').trim().replace(/^,\s*/, '').replace(/,\s*$/, '');
            }

             // Extraer Número Exterior (puede tener letra)
             const numExtMatch = addressPart.match(/\b(\d+[A-Z]?)\b/);
             if (numExtMatch) {
                 extNumberInput.value = numExtMatch[0];
                 // Remover el número y comas/espacios adyacentes
                 addressPart = addressPart.replace(new RegExp(`\\b${numExtMatch[0]}\\b\\s*,?|,?\\s*\\b${numExtMatch[0]}\\b`), '').trim();
             }


            // Extraer Número Interior
            const numIntMatch = addressPart.match(/(?:Int\.?|Interior)\s*(\w+)/i);
            if (numIntMatch) {
                intNumberInput.value = numIntMatch[1];
                 addressPart = addressPart.replace(numIntMatch[0], '').trim().replace(/^,\s*/, '').replace(/,\s*$/, '');
            }

            // Lo que queda es la calle/referencias
            streetInput.value = addressPart.trim();
        }
        inStorePickupCheckbox.dispatchEvent(new Event('change')); // Actualiza visibilidad de campos

        // Populate images
        existingImages = []; // Limpiar antes
        if (folio.imageUrls && Array.isArray(folio.imageUrls)) {
            existingImages = folio.imageUrls.map((url, index) => ({
                url: url,
                 // Asegurarse de que imageComments exista y sea un array
                comment: (folio.imageComments && Array.isArray(folio.imageComments) && folio.imageComments[index]) ? folio.imageComments[index] : ''
            }));
        }
        renderImagePreviews();

        // Populate financial fields
        // Recalcular el costo base del pastel a partir del total y los costos adicionales/envío
        const additionalTotalCost = additionalItems.reduce((sum, item) => sum + item.totalPrice, 0);

        // Recalcular costo de relleno SOLO si es Normal
        let calculatedFillingCost = 0;
        if (folio.folioType === 'Normal') {
            const numPersons = parseInt(folio.persons, 10) || 0;
            calculatedFillingCost = selectedRellenos.reduce((sum, relleno) => {
                // Asume que el objeto relleno tiene `hasCost`
                return (relleno && relleno.hasCost && numPersons > 0) ? sum + ((numPersons / 20) * 30) : sum;
            }, 0);
        }

        // Calcular costo base restando todo lo demás del total guardado
        const calculatedBaseCakeCost = (parseFloat(folio.total) || 0) - (parseFloat(folio.deliveryCost) || 0) - additionalTotalCost - calculatedFillingCost;

        // Si hay comisión aplicada al cliente (necesitaríamos saberlo del backend, aquí asumimos que no o lo recalculamos si `addCommissionCheckbox` estuviera guardado)
        // Por ahora, asumimos que 'total' guardado ya incluye la comisión si se aplicó. El costo base sería sin comisión.
        // Si el total SÍ incluye la comisión y queremos mostrar el costo *antes* de comisión:
        // Habría que recalcular la comisión basada en los costos y restarla también. Es complejo sin saber si folio.total la incluye.
        // Forma simple: Mostrar el costo base calculado sin intentar quitar la comisión.
        totalInput.value = isNaN(calculatedBaseCakeCost) ? '0.00' : Math.max(0, calculatedBaseCakeCost).toFixed(2); // Evitar negativos


        advanceInput.value = (parseFloat(folio.advancePayment) || 0).toFixed(2);

        // Populate commission checkbox (si tuvieras esta info guardada o desde el objeto Commission)
        // addCommissionCheckbox.checked = folio.commission?.appliedToCustomer || false; // Ejemplo si tuvieras la relación cargada

        updateTotals(); // Recalcula el balance final
    };

    // --- EVENT LISTENERS GLOBALES ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        loadingEl.classList.remove('hidden');
        document.getElementById('loginError').textContent = ''; // Limpiar error previo
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
        window.previousView = 'calendar'; // O la vista actual
        resetForm();
        showView('form');
    });

    viewCalendarButton.addEventListener('click', () => showView('calendar'));

    cancelFormButton.addEventListener('click', () => {
        resetForm();
        showView(window.previousView || 'calendar');
        if (window.previousView === 'pending') {
            loadActiveSessions();
        } else if (window.previousView === 'chat') {
             // Si cancelas desde el form que abriste desde el chat, vuelve al chat
             showView('chat');
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
        loadActiveSessions();
    });

    // --- LÓGICA DEL CHAT (sin cambios respecto a tu código base) ---
     function addMessageToChat(text, sender) {
        const messageEl = document.createElement('div');
        messageEl.className = `p-2 rounded-lg max-w-[80%] ${sender === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-gray-800 self-start'}`;
        // Escapar HTML básico para seguridad simple
        messageEl.textContent = text;
        chatMessagesContainer.appendChild(messageEl);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Auto-scroll
    }


    function renderFolioStatus(data) {
        folioStatusPanel.innerHTML = ''; // Limpiar panel
        if (!data) {
            folioStatusPanel.innerHTML = '<p class="text-gray-500 italic">No hay datos extraídos aún.</p>';
            return;
        }

        const keyMap = {
            folioType: 'Tipo Folio',
            clientName: 'Cliente',
            clientPhone: 'Teléfono',
            deliveryDate: 'Fecha Entrega',
            deliveryTime: 'Hora Entrega',
            persons: 'Personas',
            shape: 'Forma',
            // No mostrar cakeFlavor/filling si es Base/Especial
            cakeFlavor: data.folioType !== 'Base/Especial' ? 'Sabores Pan' : null,
            filling: data.folioType !== 'Base/Especial' ? 'Rellenos' : null,
            // Mostrar tiers si es Base/Especial
            tiers: data.folioType === 'Base/Especial' ? 'Estructura Pisos' : null,
            designDescription: 'Descripción Diseño',
            dedication: 'Dedicatoria',
            deliveryLocation: 'Lugar Entrega',
            deliveryCost: 'Costo Envío',
            total: 'Costo Pastel (Base)', // Asumiendo que 'total' es el costo base
            advancePayment: 'Anticipo',
            accessories: 'Accesorios',
            additional: 'Adicionales',
            complements: 'Complementos',
            hasExtraHeight: 'Altura Extra',
            isPaid: 'Pagado Total'
        };

        for (const key in keyMap) {
            if (keyMap[key] === null) continue; // Saltar claves deshabilitadas

            let value = data[key];

            // Formatear valores para mejor visualización
            if (value !== null && value !== undefined) {
                if (key === 'tiers' && Array.isArray(value)) {
                    value = value.map((tier, i) => `P${i+1}: ${tier.persons}p, Panes(${tier.panes?.join('/')||'N/A'}), Rellenos(${tier.rellenos?.join('/')||'N/A'})`).join('; ');
                } else if (key === 'additional' && Array.isArray(value)) {
                    value = value.map(item => `${item.name} ($${item.price})`).join(', ');
                } else if (key === 'complements' && Array.isArray(value)) {
                     value = value.map((c, i) => `C${i+1}: ${c.persons}p ${c.flavor}/${c.filling || 'N/A'}`).join('; ');
                } else if (Array.isArray(value)) {
                    value = value.join(', ');
                } else if (typeof value === 'boolean') {
                    value = value ? 'Sí' : 'No';
                } else if (key === 'deliveryTime' && typeof value === 'string') {
                    // Formatear HH:MM:SS a AM/PM
                    const parts = value.split(':');
                    if (parts.length >= 2) {
                        let hour = parseInt(parts[0], 10);
                        const minute = parts[1];
                        const period = hour >= 12 ? 'PM' : 'AM';
                        hour = hour % 12 || 12; // Convierte 0 a 12 para AM, mantiene 12 para PM
                        value = `${hour}:${minute} ${period}`;
                    }
                } else if (typeof value === 'number' && ['total', 'advancePayment', 'deliveryCost'].includes(key)) {
                    value = `$${value.toFixed(2)}`;
                }

                if (value === '' || (Array.isArray(value) && value.length === 0)) {
                   value = 'N/A'; // Mostrar N/A si está vacío
                }

                const itemEl = document.createElement('div');
                itemEl.className = 'text-sm mb-1'; // Estilo más compacto
                itemEl.innerHTML = `<strong class="text-gray-600">${keyMap[key]}:</strong> <span class="text-gray-800">${value}</span>`;
                folioStatusPanel.appendChild(itemEl);
            }
        }
    }


     async function loadChatSession(sessionId) {
        currentSessionId = sessionId;
        loadingEl.classList.remove('hidden');
        showView('chat');
        chatMessagesContainer.innerHTML = ''; // Limpiar mensajes anteriores
        folioStatusPanel.innerHTML = '<p class="text-gray-500 italic">Cargando datos de la sesión...</p>'; // Mensaje de carga

        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:3000/api/ai-sessions/${sessionId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'No se pudo cargar la sesión de chat.');
            }

            const session = await response.json();
            chatTitle.textContent = `Asistente - Sesión #${session.id}`;

            // Renderizar historial de chat
             if (session.chatHistory && Array.isArray(session.chatHistory)) {
                 session.chatHistory.forEach(msg => {
                     // Solo mostrar mensajes con contenido y rol user o assistant
                     if (msg.content && (msg.role === 'user' || msg.role === 'assistant')) {
                         addMessageToChat(msg.content, msg.role);
                     }
                 });
             }

            // Renderizar estado inicial del folio
            renderFolioStatus(session.extractedData);

            // Si no hay historial o el último mensaje no es del asistente, añadir saludo inicial
            const lastMessage = session.chatHistory?.[session.chatHistory.length - 1];
            if (!lastMessage || lastMessage.role !== 'assistant' || !lastMessage.content) {
                 addMessageToChat('¡Hola! He analizado la conversación inicial. ¿Qué deseas hacer? Puedes pedirme que modifique datos ("cambia el nombre a X", "añade un piso para Y personas", etc.) o que genere el folio ("genera el folio").', 'assistant');
            }


        } catch (error) {
            console.error("Error cargando sesión de chat:", error);
            folioStatusPanel.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
            addMessageToChat(`Error al cargar la sesión: ${error.message}`, 'assistant');
        } finally {
            loadingEl.classList.add('hidden');
            chatInput.focus(); // Poner foco en el input
        }
    }


    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageText = chatInput.value.trim();
        if (!messageText || !currentSessionId) return;

        addMessageToChat(messageText, 'user');
        chatInput.value = '';
        chatInput.disabled = true; // Deshabilitar mientras responde
        const thinkingEl = document.createElement('div');
        thinkingEl.className = 'chat-message assistant-message italic text-gray-500';
        thinkingEl.textContent = 'Pensando...';
        chatMessagesContainer.appendChild(thinkingEl);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;


        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:3000/api/ai-sessions/${currentSessionId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ message: messageText })
            });

             // Eliminar "Pensando..."
             thinkingEl.remove();

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error del servidor: ${response.status}`);
            }

            const { message, sessionData } = await response.json();

            // Añadir mensaje del asistente solo si tiene contenido textual
            if (message && message.content) {
                addMessageToChat(message.content, 'assistant');
            } else if (message && message.tool_calls) {
                 // Si solo hubo llamada a tool y no contenido textual, no añadir nada visible
                 console.log("Asistente llamó a herramienta(s), sin respuesta textual directa.");
            }


            // Actualizar panel de estado con los datos MÁS RECIENTES de la sesión
            if (sessionData && sessionData.extractedData) {
                renderFolioStatus(sessionData.extractedData);
                 // Si la sesión se completó (ej. se generó el folio), mostrar mensaje y quizás deshabilitar input
                 if (sessionData.status === 'completed') {
                     addMessageToChat("El folio ha sido generado. Esta sesión está completa.", "assistant");
                     chatInput.disabled = true; // Deshabilitar input
                     generateFolioBtn.disabled = true; // Deshabilitar botón
                     manualEditBtn.disabled = true;
                 }
            } else {
                console.warn("No se recibieron datos de sesión actualizados en la respuesta del chat.");
                // Podrías intentar recargar la sesión completa si esto pasa a menudo
                // await loadChatSession(currentSessionId); // Opcional: recargar todo si falla
            }

        } catch (error) {
             thinkingEl.remove(); // Asegurarse de quitar "Pensando..." en caso de error
            console.error("Error en chat submit:", error);
            addMessageToChat(`Error: ${error.message}`, 'assistant');
        } finally {
             // Habilitar input solo si la sesión no está completada
             if (currentSessionId && folioStatusPanel.closest('.col-span-1').querySelector('#generate-folio-btn:disabled') === null) {
                 chatInput.disabled = false;
                 chatInput.focus();
             }
        }
    });

    backToSessionsBtn.addEventListener('click', () => {
        currentSessionId = null;
        showView('pending');
        loadActiveSessions(); // Recargar lista de sesiones pendientes
    });

    generateFolioBtn.addEventListener('click', () => {
        if (!currentSessionId || chatInput.disabled) return; // Evitar si ya está completado
        chatInput.value = "Genera el folio y PDF con los datos actuales"; // Comando explícito
        chatForm.dispatchEvent(new Event('submit'));
    });

    manualEditBtn.addEventListener('click', async () => {
        if (!currentSessionId || chatInput.disabled) return; // Evitar si ya está completado
        loadingEl.classList.remove('hidden');
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:3000/api/ai-sessions/${currentSessionId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) throw new Error('No se pudo cargar la sesión para edición manual.');

            const session = await response.json();
            const extracted = session.extractedData;

             // Crear un objeto 'folio' simulado para populateFormForEdit
            const mockFolio = {
                id: `ai-${session.id}`, // Usar un ID temporal para indicar que viene de IA
                ...extracted,
                // Asegurarse de que los campos esperados por populateFormForEdit existan
                client: {
                    name: extracted.clientName || '',
                    phone: extracted.clientPhone || '',
                    phone2: extracted.clientPhone2 || ''
                },
                // Asegurar formato correcto para JSON y arrays
                cakeFlavor: JSON.stringify(extracted.cakeFlavor || []),
                filling: JSON.stringify(extracted.filling || []),
                tiers: extracted.tiers || [], // Ya debería ser array o null
                additional: extracted.additional || [], // Ya debería ser array o null
                complements: extracted.complements || [], // Ya debería ser array o null
                imageUrls: session.imageUrls || [],
                imageComments: session.imageComments || [], // Asegurar que exista
                status: 'Pendiente', // Marcar como pendiente para que el submit lo cambie a 'Nuevo'
                deliveryCost: extracted.deliveryCost || 0,
                advancePayment: extracted.advancePayment || 0,
                total: extracted.total || 0, // El 'total' aquí es el costo base del pastel
                isPaid: extracted.isPaid || false,
                hasExtraHeight: extracted.hasExtraHeight || false,
                // folioNumber no se pasa, se generará al guardar
            };


            window.previousView = 'chat'; // Para que el botón Cancelar regrese al chat
            populateFormForEdit(mockFolio);
            showView('form');

        } catch (error) {
            alert(`Error al preparar edición manual: ${error.message}`);
        } finally {
            loadingEl.classList.add('hidden');
        }
    });


    // --- Lógica para Estadísticas (sin cambios) ---
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
         // ... (código sin cambios)
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
             // Mostrar error en la UI si es necesario
             document.getElementById('normalFlavorsList').innerHTML = `<p class="text-red-500">Error al cargar.</p>`;
             // ... etc para otros contenedores ...
        }
    }

    async function loadProductivityStats() {
         // ... (código sin cambios)
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
                 const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudieron cargar los datos de productividad.');
            }

            const stats = await response.json();
            productivityListBody.innerHTML = '';

            if (stats.length === 0) {
                productivityListBody.innerHTML = `<tr><td colspan="2" class="text-center p-4">No se capturaron folios en esta fecha.</td></tr>`;
                return;
            }

            stats.forEach(userStat => {
                 if (userStat.responsibleUser) { // Verificar que el usuario exista
                     const row = document.createElement('tr');
                     row.className = 'border-b';
                     row.innerHTML = `
                         <td class="py-2 px-4">${userStat.responsibleUser.username}</td>
                         <td class="py-2 px-4 font-bold">${userStat.folioCount}</td>
                     `;
                     productivityListBody.appendChild(row);
                 } else {
                     console.warn("Estadística encontrada sin usuario asociado:", userStat);
                 }
            });

        } catch (error) {
            productivityListBody.innerHTML = `<tr><td colspan="2" class="text-center p-4 text-red-500">${error.message}</td></tr>`;
        }
    }


    if (viewStatsButton) {
        viewStatsButton.addEventListener('click', () => {
            showView('stats');
            loadingEl.classList.remove('hidden');
            // Establecer fecha por defecto a hoy
             const today = new Date();
             productivityDateInput.value = today.toISOString().split('T')[0];

            Promise.all([
                loadFlavorAndFillingStats(),
                loadProductivityStats() // Carga con la fecha de hoy por defecto
            ]).finally(() => {
                loadingEl.classList.add('hidden');
            });
        });
    }

    if (productivityDateInput) {
        productivityDateInput.addEventListener('change', loadProductivityStats);
    }

    // --- LÓGICA DEL FORMULARIO (Submit, Previews, Tags, Modales, Totales, etc.) ---
    // ... (El resto del código del formulario, incluyendo:
    //      - folioForm.addEventListener('submit', ...)
    //      - renderImagePreviews, imageInput listener, imagePreview listeners
    //      - renderTags, openSelectionModal, openRellenoModal, openRellenoModalEspecial, modalCloseBtn listener
    //      - addCakeFlavor/removeCakeFlavor, addRelleno/removeRelleno, listeners de botones correspondientes
    //      - checkRestrictions
    //      - inStorePickupCheckbox listener
    //      - getGrandTotal, calculateBalance, updateTotals, listeners de inputs financieros
    //      - renderAdditionalItems, addAdditionalButton listener, additionalList listener
    //      - addTierRow, folioTypeSelect listener, addTierButton listener, removeTierPane/Filling
    //      - tiersTableBody listener
    //      - addComplementRow, addComplementButton listener
    //    permanecen IGUALES a como los tenías en tu código base original)
     folioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editingId = folioForm.dataset.editingId;
        // Diferenciar si viene de IA (ID temporal) o es una edición real
        const isCreatingFromAI = editingId && editingId.startsWith('ai-');
        const isEditingExisting = editingId && !isCreatingFromAI;

        const method = isEditingExisting ? 'PUT' : 'POST'; // Siempre POST si es nuevo o desde IA
        const url = isEditingExisting ? `http://localhost:3000/api/folios/${editingId}` : 'http://localhost:3000/api/folios';

        loadingEl.classList.remove('hidden');
        const authToken = localStorage.getItem('authToken');
        const formData = new FormData();

        // --- Recolección de Datos del Formulario (igual que antes) ---
        let hour = parseInt(deliveryHourSelect.value);
        if (deliveryPeriodSelect.value === 'PM' && hour !== 12) { hour += 12; }
        if (deliveryPeriodSelect.value === 'AM' && hour === 12) { hour = 0; }
        const deliveryTime = `${hour.toString().padStart(2, '0')}:${deliveryMinuteSelect.value}:00`;

        let deliveryLocation = '';
        if (inStorePickupCheckbox.checked) {
            deliveryLocation = 'Recoge en Tienda';
        } else {
             const addressParts = [
                 (streetInput.value || '').trim(),
                 (extNumberInput.value ? `${extNumberInput.value}` : '').trim(),
                 (intNumberInput.value ? `Int. ${intNumberInput.value}` : '').trim(),
                 (neighborhoodInput.value ? `Col. ${neighborhoodInput.value}` : '').trim()
             ].filter(Boolean); // Filtra partes vacías
             const address = addressParts.join(', ');

            if (googleMapsLocationCheckbox.checked) {
                deliveryLocation = `El cliente envía ubicación (Google Maps)${address ? ` (${address})` : ''}`;
            } else {
                deliveryLocation = address || 'Dirección no especificada'; // Evitar enviar vacío si no es pickup ni maps
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
        formData.append('total', totalInput.value); // Costo base del pastel
        formData.append('advancePayment', advanceInput.value);
        formData.append('accessories', accessoriesInput.value);

        // Adicionales: asegurar que el precio total esté bien calculado
         const finalAdditionalItems = additionalItems.map(item => ({
             name: `${item.quantity} x ${item.name}`,
             price: (item.quantity * item.price).toFixed(2) // Enviar precio total calculado
         }));
        formData.append('additional', JSON.stringify(finalAdditionalItems));

        formData.append('isPaid', isPaidCheckbox.checked);
        formData.append('hasExtraHeight', hasExtraHeightCheckbox.checked);
        formData.append('addCommissionToCustomer', addCommissionCheckbox.checked);


        const complementsData = [];
        document.querySelectorAll('.complement-form').forEach(form => {
            complementsData.push({
                persons: form.querySelector('.complement-persons').value || null, // Enviar null si está vacío
                shape: form.querySelector('.complement-shape').value || null,
                flavor: form.querySelector('.complement-flavor').value || null,
                filling: form.querySelector('.complement-filling').value || null,
                description: form.querySelector('.complement-description').value || null,
            });
        });
        formData.append('complements', JSON.stringify(complementsData));

        if (folioTypeSelect.value === 'Normal') {
            formData.append('cakeFlavor', JSON.stringify(selectedCakeFlavors));
            // Asegurarse de enviar solo los nombres si selectedRellenos es array de objetos
            formData.append('filling', JSON.stringify(selectedRellenos.map(r => r.name ? { name: r.name, hasCost: r.hasCost } : { name: r, hasCost: false })));
            formData.append('tiers', '[]'); // Enviar array vacío para tiers
        } else { // Base/Especial
            formData.append('cakeFlavor', '[]'); // Enviar array vacío
            formData.append('filling', '[]');    // Enviar array vacío
            const currentTiersData = Array.from(tiersTableBody.children).map((row, index) => {
                 const tierState = tiersData[index] || { persons: null, panes: [], rellenos: [], notas: null }; // Asegurar estado existe
                 // Validar y limpiar datos del tier antes de enviar
                 const persons = parseInt(row.querySelector('.tier-persons-input').value, 10) || null;
                 const panes = tierState.panes.filter(p => p); // Eliminar nulls/vacíos
                 const rellenos = tierState.rellenos.filter(r => r); // Eliminar nulls/vacíos
                 const notas = row.querySelector('.tier-notes-input').value || null;

                 // Asegurar estructura mínima incluso si está incompleto
                 return {
                     persons: persons,
                     // Asegurar 3 panes, rellenando con null si es necesario
                     panes: [...panes, null, null, null].slice(0, 3),
                      // Asegurar 2 rellenos, rellenando con null si es necesario
                     rellenos: [...rellenos, null, null].slice(0, 2),
                     notas: notas
                 };
            });
            formData.append('tiers', JSON.stringify(currentTiersData));
        }


        // Manejo de Imágenes
        if (isEditingExisting) { // Solo enviar imágenes existentes si estamos editando uno real
            formData.append('existingImageUrls', JSON.stringify(existingImages.map(img => img.url)));
            formData.append('existingImageComments', JSON.stringify(existingImages.map(img => img.comment)));
        } else {
             // Si es nuevo o desde IA, no hay 'existing'
             formData.append('existingImageUrls', '[]');
             formData.append('existingImageComments', '[]');
        }

         // Nuevas imágenes y sus comentarios
        const newImageComments = selectedFiles.map(sf => sf.comment);
        formData.append('imageComments', JSON.stringify(newImageComments)); // Comentarios para las nuevas imágenes
        selectedFiles.forEach(fileData => {
            formData.append('referenceImages', fileData.file); // Los archivos nuevos
        });


        // Establecer estado a 'Nuevo' si viene de 'Pendiente' (IA)
        if (isCreatingFromAI || folioForm.dataset.originalStatus === 'Pendiente') {
            formData.append('status', 'Nuevo');
        }

        try {
            const response = await fetch(url, { method, headers: { 'Authorization': `Bearer ${authToken}` }, body: formData });

             const responseBody = await response.text(); // Leer como texto primero
             let responseData;
             try {
                 responseData = JSON.parse(responseBody); // Intentar parsear como JSON
             } catch (e) {
                 // Si falla el parseo, lanzar error con el texto original
                 console.error("Respuesta no es JSON:", responseBody);
                 throw new Error(`Respuesta inesperada del servidor: ${responseBody}`);
             }


            if (!response.ok) {
                 // Usar el mensaje del JSON parseado si existe
                throw new Error(responseData.message || `Error del servidor: ${response.status}`);
            }

            const successMessage = (isCreatingFromAI || !isEditingExisting)
                ? '¡Folio creado con éxito!'
                : '¡Folio actualizado con éxito!';

            alert(successMessage);

            const event = new CustomEvent('folioCreated'); // Reusar el mismo evento
            window.dispatchEvent(event); // Disparar evento para actualizar calendario/listas

             // Si se creó desde IA, ahora podríamos querer marcar la sesión de IA como completada
             if (isCreatingFromAI) {
                 const sessionId = editingId.split('-')[1]; // Extraer ID original de 'ai-ID'
                 // Opcional: Llamar a una ruta API para marcar la sesión como 'completed'
                 // fetch(`/api/ai-sessions/${sessionId}/complete`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${authToken}` } });
                 console.log(`Folio creado desde la sesión de IA ${sessionId}. Considerar marcarla como completada.`);
             }


        } catch (error) {
            console.error("Error al guardar folio:", error);
            alert(`Error al guardar: ${error.message}`);
        } finally {
            loadingEl.classList.add('hidden');
        }
    });

     window.addEventListener('folioCreated', () => {
         // Decide a qué vista volver basado en `previousView`
         const returnView = window.previousView || 'calendar';
         resetForm(); // Limpiar el formulario después de guardar
         showView(returnView);

         // Recargar datos relevantes para la vista de retorno
         if (returnView === 'calendar' && window.myAppCalendar) {
             window.myAppCalendar.refetchEvents();
         } else if (returnView === 'pending' || returnView === 'chat') {
              // Si volvemos a pending o chat (aunque chat no debería ser directo), recargar sesiones
             loadActiveSessions();
             // Si específicamente volvemos al chat (quizás tras error), podríamos recargar esa sesión
             if (returnView === 'chat' && currentSessionId) {
                  loadChatSession(currentSessionId);
             }
         }
     });


    function renderImagePreviews() {
        // ... (código sin cambios)
         imagePreview.innerHTML = '';

        existingImages.forEach((imgData, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'relative border rounded-md overflow-hidden shadow'; // Estilo
            wrapper.innerHTML = `
                <img src="http://localhost:3000/${imgData.url.replace(/\\/g, '/')}" alt="Imagen existente ${index + 1}" class="block w-full h-32 object-cover">
                <button type="button" class="absolute top-1 right-1 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold delete-image-btn existing" data-index="${index}">&times;</button>
                <textarea placeholder="Comentario..." class="w-full text-xs p-1 border-t existing-comment" data-index="${index}" rows="2">${imgData.comment || ''}</textarea>
            `;
            imagePreview.appendChild(wrapper);
        });

        selectedFiles.forEach((fileData, index) => {
            const wrapper = document.createElement('div');
             wrapper.className = 'relative border rounded-md overflow-hidden shadow'; // Estilo
            wrapper.innerHTML = `
                <img src="${URL.createObjectURL(fileData.file)}" alt="Nueva imagen ${index + 1}" class="block w-full h-32 object-cover">
                <button type="button" class="absolute top-1 right-1 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold delete-image-btn new" data-index="${index}">&times;</button>
                 <textarea placeholder="Comentario..." class="w-full text-xs p-1 border-t new-comment" data-index="${index}" rows="2">${fileData.comment || ''}</textarea>
            `;
            imagePreview.appendChild(wrapper);
        });
    }

    imageInput.addEventListener('change', () => {
        // ... (código sin cambios)
         const files = Array.from(imageInput.files);
        const totalImages = selectedFiles.length + existingImages.length;
        const allowedNew = 5 - totalImages;

        if (files.length > allowedNew) {
            alert(`Solo puedes añadir ${allowedNew} imágenes más (máximo 5 en total).`);
             // Mantener solo las permitidas
             files.splice(allowedNew);
        }

        if (files.length > 0) {
             selectedFiles.push(...files.map(file => ({ file, comment: '' })));
             renderImagePreviews();
        }
        imageInput.value = ''; // Limpiar input para permitir seleccionar los mismos archivos de nuevo si se borran
    });

    imagePreview.addEventListener('click', (e) => {
        // ... (código sin cambios)
         if (e.target.classList.contains('delete-image-btn')) {
            const index = parseInt(e.target.dataset.index, 10);
            if (e.target.classList.contains('existing')) {
                 if (index >= 0 && index < existingImages.length) {
                    existingImages.splice(index, 1);
                 }
            } else {
                 if (index >= 0 && index < selectedFiles.length) {
                     const fileData = selectedFiles[index];
                     // Revocar URL para liberar memoria
                     if (fileData.file) URL.revokeObjectURL(e.target.previousElementSibling.src);
                     selectedFiles.splice(index, 1);
                 }
            }
            renderImagePreviews(); // Re-renderizar con índices actualizados
        }
    });

    imagePreview.addEventListener('input', (e) => {
        // ... (código sin cambios)
         if (e.target.tagName === 'TEXTAREA') {
            const index = parseInt(e.target.dataset.index, 10);
            if (e.target.classList.contains('existing-comment')) {
                if (existingImages[index]) existingImages[index].comment = e.target.value;
            } else if (e.target.classList.contains('new-comment')) { // Asegurar que sea el comentario de una nueva imagen
                if (selectedFiles[index]) selectedFiles[index].comment = e.target.value;
            }
        }
    });

     // --- Resto de funciones auxiliares (renderTags, modales, add/remove flavors/fillings/tiers, etc.) ---
     // ... (El código de estas funciones permanece igual que en tu base) ...
     function renderTags(container, tagsArray, onRemoveCallback) {
        container.innerHTML = '';
        (tagsArray || []).forEach((tagData, index) => {
            const tagEl = document.createElement('div');
            tagEl.className = 'tag';
             // Manejar si tagData es string u objeto {name: ..., hasCost: ...}
            const tagName = typeof tagData === 'object' ? tagData.name : tagData;
            const hasCost = typeof tagData === 'object' ? tagData.hasCost : false; // Asumir no costo si es string

             tagEl.innerHTML = `<span>${tagName}${hasCost ? ' ($)' : ''}</span><button type="button" class="tag-remove-btn" data-index="${index}">&times;</button>`;
            container.appendChild(tagEl);
        });
        if (onRemoveCallback) {
             container.querySelectorAll('.tag-remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                     e.stopPropagation(); // Prevenir que otros listeners se activen
                     onRemoveCallback(parseInt(e.target.dataset.index, 10));
                 });
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
            const lowerFilter = filter.toLowerCase();
             // Filtrar datos y asegurar que no se añadan duplicados (basado en nombre si son objetos)
            const currentTagNames = currentTags.map(tag => (typeof tag === 'object' ? tag.name : tag).toLowerCase());
            const filteredData = data.filter(item => {
                 const itemName = (typeof item === 'object' ? item.name : item).toLowerCase();
                 return itemName.includes(lowerFilter) && !currentTagNames.includes(itemName);
             });


            filteredData.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'modal-list-item';
                const itemName = typeof item === 'object' ? item.name : item;
                const hasCost = typeof item === 'object' ? item.hasCost : false;
                itemEl.textContent = itemName;
                 if (hasCost) itemEl.classList.add('cost-extra'); // Aplicar estilo si tiene costo

                itemEl.addEventListener('click', () => {
                    if (currentTags.length < limit) {
                        onSelectCallback(item); // Pasar el item completo (puede ser string u objeto)
                        selectionModal.classList.add('hidden');
                    } else {
                        alert(`Solo puedes seleccionar un máximo de ${limit}.`);
                    }
                });
                modalList.appendChild(itemEl);
            });
             if (filteredData.length === 0) {
                 modalList.innerHTML = '<p class="text-gray-500 p-2">No hay más opciones o ya están seleccionadas.</p>';
             }
        }
        populateList();
        modalSearch.oninput = () => populateList(modalSearch.value); // Usar oninput para respuesta más rápida
        selectionModal.classList.remove('hidden');
    }

     function openRellenoModal(onSelectCallback, currentRellenos, limit) {
        modalTitle.textContent = 'Añadir Relleno';
        modalStep1.classList.remove('hidden');
        modalStep2.classList.add('hidden');
        modalSearch.value = '';
        modalList.innerHTML = '';

         // Crear lista combinada con info de costo
        const allRellenos = [
            ...Object.keys(rellenosData.incluidos).map(name => ({ name, hasCost: false, data: rellenosData.incluidos[name] })),
            ...Object.keys(rellenosData.conCosto).map(name => ({ name, hasCost: true, data: rellenosData.conCosto[name] }))
        ];
         // Nombres de rellenos ya seleccionados para evitar duplicados
        const currentRellenoNames = currentRellenos.map(r => r.name.toLowerCase());


        function populateList(filter = '') {
            modalList.innerHTML = '';
            const lowerFilter = filter.toLowerCase();
            const filteredRellenos = allRellenos.filter(r =>
                 r.name.toLowerCase().includes(lowerFilter) &&
                 !currentRellenoNames.includes(r.name.toLowerCase()) // Evitar ya seleccionados
            );


            filteredRellenos.forEach(titular => {
                const itemEl = document.createElement('div');
                itemEl.className = 'modal-list-item';
                if (titular.hasCost) itemEl.classList.add('cost-extra');
                 // Indicar si tiene subopciones
                itemEl.textContent = titular.name + (titular.data.suboptions && titular.data.suboptions.length > 0 ? ' (...)' : '');

                itemEl.addEventListener('click', () => {
                    const suboptions = titular.data.suboptions;
                    if (suboptions && suboptions.length > 0) {
                        showStep2(titular, suboptions);
                    } else {
                        if (currentRellenos.length < limit) {
                             // Pasar objeto { name, hasCost }
                            onSelectCallback({ name: titular.name, hasCost: titular.hasCost });
                            selectionModal.classList.add('hidden');
                        } else {
                            alert(`Solo puedes seleccionar un máximo de ${limit} rellenos.`);
                        }
                    }
                });
                modalList.appendChild(itemEl);
            });
             if (filteredRellenos.length === 0) {
                 modalList.innerHTML = '<p class="text-gray-500 p-2">No hay más opciones o ya están seleccionadas.</p>';
             }
        }

        const showStep2 = (titular, suboptions) => {
            modalStep1.classList.add('hidden');
            modalStep2.classList.remove('hidden');
            modalTitle.textContent = `Paso 2: Elige para "${titular.name}"`;
            modalStep2Title.innerHTML = `Opción para "<b>${titular.name}</b>" <button type="button" class="back-to-step1 text-sm text-blue-600 hover:underline">(Volver)</button>`;
            modalStep2List.innerHTML = '';

             // Filtrar subopciones para evitar duplicados completos (ej. "Manjar con Nuez")
             const filteredSuboptions = suboptions.filter(sub => {
                 const fullName = `${titular.name} ${titular.data.separator || 'con'} ${sub}`;
                 return !currentRellenoNames.includes(fullName.toLowerCase());
             });


            filteredSuboptions.forEach(comp => {
                const compEl = document.createElement('div');
                compEl.className = 'modal-list-item';
                compEl.textContent = comp;
                compEl.addEventListener('click', () => {
                     if (currentRellenos.length < limit) {
                        const separator = titular.data.separator || 'con';
                        const finalName = `${titular.name} ${separator} ${comp}`;
                         // Pasar objeto { name, hasCost }
                        onSelectCallback({ name: finalName, hasCost: titular.hasCost });
                        selectionModal.classList.add('hidden');
                    } else {
                        alert(`Solo puedes seleccionar un máximo de ${limit} rellenos.`);
                    }
                });
                modalStep2List.appendChild(compEl);
            });

             if (filteredSuboptions.length === 0) {
                  modalStep2List.innerHTML = '<p class="text-gray-500 p-2">No hay más opciones o ya están seleccionadas.</p>';
             }

            modalStep2Title.querySelector('.back-to-step1').addEventListener('click', () => {
                 modalStep1.classList.remove('hidden');
                 modalStep2.classList.add('hidden');
                 populateList(modalSearch.value); // Volver a poblar paso 1
             });
        };

        populateList();
        modalSearch.oninput = () => populateList(modalSearch.value);
        selectionModal.classList.remove('hidden');
    }

     function openRellenoModalEspecial(onSelectCallback) {
        // ... (código sin cambios)
         let state = { principal: null, finalPrincipal: '' };
        modalSearch.value = '';

        const showPrincipales = (filter = '') => {
            modalTitle.textContent = 'Paso 1: Elige un Relleno Principal';
            modalStep1.classList.remove('hidden');
            modalStep2.classList.add('hidden');
            modalList.innerHTML = '';

            const lowerFilter = filter.toLowerCase();
            const filteredPrincipales = rellenosDataEspecial.principales.filter(item =>
                item.name.toLowerCase().includes(lowerFilter)
            );

            filteredPrincipales.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'modal-list-item';
                itemEl.textContent = item.name + (item.suboptions && item.suboptions.length > 0 ? ` (...)` : '');
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
             if (filteredPrincipales.length === 0) {
                 modalList.innerHTML = '<p class="text-gray-500 p-2">No hay opciones.</p>';
             }
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
                    const separator = state.principal.separator || ' con '; // Default a ' con '
                    state.finalPrincipal = `${state.principal.name}${separator}${subItem}`;
                    showSecundarios();
                });
                modalStep2List.appendChild(itemEl);
            });
            modalStep2Title.querySelector('.back-to-step1').addEventListener('click', () => {
                 modalStep1.classList.remove('hidden');
                 modalStep2.classList.add('hidden');
                 showPrincipales(modalSearch.value);
             });
        };


        const showSecundarios = () => {
            modalStep1.classList.add('hidden');
            modalStep2.classList.remove('hidden');
            modalTitle.textContent = 'Paso 2: Elige un Relleno Secundario (Opcional)';
            modalStep2Title.innerHTML = `Principal: "<b>${state.finalPrincipal}</b>" <button type="button" class="back-to-step1-from-sec text-sm text-blue-600 hover:underline">(Cambiar Principal)</button>`;
            modalStep2List.innerHTML = '';

             // Opción para no añadir secundario
             const noSecundarioEl = document.createElement('div');
             noSecundarioEl.className = 'modal-list-item italic text-gray-500';
             noSecundarioEl.textContent = '(Sin relleno secundario)';
             noSecundarioEl.addEventListener('click', () => {
                 onSelectCallback([state.finalPrincipal]); // Solo el principal
                 selectionModal.classList.add('hidden');
             });
             modalStep2List.appendChild(noSecundarioEl);


            rellenosDataEspecial.secundarios.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'modal-list-item';
                itemEl.textContent = item;
                itemEl.addEventListener('click', () => {
                    onSelectCallback([state.finalPrincipal, item]); // Ambos rellenos
                    selectionModal.classList.add('hidden');
                });
                modalStep2List.appendChild(itemEl);
            });

            modalStep2Title.querySelector('.back-to-step1-from-sec').addEventListener('click', () => {
                // Volver al paso anterior correcto (subopciones o principales)
                if (state.principal.suboptions && state.principal.suboptions.length > 0) {
                    showPrincipalSuboptions();
                } else {
                     modalStep1.classList.remove('hidden');
                     modalStep2.classList.add('hidden');
                     showPrincipales(modalSearch.value);
                }
            });
        };

        showPrincipales();
        modalSearch.oninput = () => showPrincipales(modalSearch.value);
    }


    modalCloseBtn.addEventListener('click', () => selectionModal.classList.add('hidden'));

    function addCakeFlavor(flavor) {
        if (selectedCakeFlavors.length < 2 && !selectedCakeFlavors.includes(flavor)) {
            selectedCakeFlavors.push(flavor);
            renderTags(cakeFlavorContainer, selectedCakeFlavors, removeCakeFlavor);
            checkRestrictions();
        } else if (selectedCakeFlavors.length >= 2) {
             alert("Solo puedes seleccionar un máximo de 2 sabores.");
        }
    }
    function removeCakeFlavor(index) {
        selectedCakeFlavors.splice(index, 1);
        renderTags(cakeFlavorContainer, selectedCakeFlavors, removeCakeFlavor);
        checkRestrictions();
    }

    function addRelleno(rellenoObj) { // Ahora recibe { name, hasCost }
        if (selectedRellenos.length < 2 && !selectedRellenos.some(r => r.name === rellenoObj.name)) {
            selectedRellenos.push(rellenoObj);
            renderTags(fillingContainer, selectedRellenos, removeRelleno); // Renderizará objetos
            updateTotals();
        } else if (selectedRellenos.length >= 2) {
             alert("Solo puedes seleccionar un máximo de 2 rellenos.");
        }
    }
    function removeRelleno(index) {
        selectedRellenos.splice(index, 1);
        renderTags(fillingContainer, selectedRellenos, removeRelleno);
        updateTotals();
    }


    addCakeFlavorBtn.addEventListener('click', () => openSelectionModal('Sabor de Pan', cakeFlavorsData.normal, selectedCakeFlavors, addCakeFlavor, 2));
    addFillingBtn.addEventListener('click', () => openRellenoModal(addRelleno, selectedRellenos, 2));

     function checkRestrictions() {
        // ... (código sin cambios)
         const hasNoFillingPan = selectedCakeFlavors.some(flavor => ['Pastel de queso', 'Queso/Flan'].includes(flavor));
        const isMilHojas = selectedCakeFlavors.includes('Mil Hojas');

        const isDisabled = hasNoFillingPan || isMilHojas;
        fillingSection.classList.toggle('disabled-section', isDisabled);
        addFillingBtn.disabled = isDisabled; // Deshabilitar botón también

        designDescriptionTextarea.disabled = isMilHojas;

        if (isDisabled && selectedRellenos.length > 0) {
            // Si se deshabilita y había rellenos, limpiarlos
            selectedRellenos = [];
            renderTags(fillingContainer, selectedRellenos, removeRelleno);
            updateTotals();
        }

        if (isMilHojas) {
            designDescriptionTextarea.value = "Mil Hojas no lleva diseño";
        } else if (designDescriptionTextarea.value === "Mil Hojas no lleva diseño") {
             // Limpiar si deja de ser Mil Hojas
             designDescriptionTextarea.value = "";
        }
    }

    inStorePickupCheckbox.addEventListener('change', function() {
        const isPickup = this.checked;
        deliveryAddressSection.classList.toggle('hidden', isPickup);
        deliveryCostInput.readOnly = isPickup;
         googleMapsLocationCheckbox.disabled = isPickup; // Deshabilitar si es pickup

        if (isPickup) {
            deliveryCostInput.value = '0.00'; // Establecer a 0.00
            googleMapsLocationCheckbox.checked = false; // Desmarcar maps
            // Limpiar campos de dirección
            streetInput.value = '';
            extNumberInput.value = '';
            intNumberInput.value = '';
            neighborhoodInput.value = '';
        }
         googleMapsLocationCheckbox.dispatchEvent(new Event('change')); // Actualizar visibilidad de campos de dirección
        updateTotals();
    });

     googleMapsLocationCheckbox.addEventListener('change', function() {
         // Ocultar campos de dirección específicos si se marca "Google Maps"
         addressFields.classList.toggle('hidden', this.checked);
         if (this.checked) {
             // Opcional: Limpiar campos cuando se marca
             // streetInput.value = '';
             // extNumberInput.value = '';
             // intNumberInput.value = '';
             // neighborhoodInput.value = '';
         }
     });


     function getGrandTotal() {
        const baseCakeCost = parseFloat(totalInput.value) || 0;
        const delivery = parseFloat(deliveryCostInput.value) || 0;
        const additionalTotal = additionalItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0); // Usar totalPrice

        let calculatedFillingCost = 0;
        if (folioTypeSelect.value === 'Normal') {
            const personsValue = parseFloat(personsInput.value) || 0;
             // Calcular costo basado en los objetos {name, hasCost}
            calculatedFillingCost = selectedRellenos.reduce((sum, relleno) => {
                return (relleno && relleno.hasCost && personsValue > 0) ? sum + (Math.ceil(personsValue / 20) * 30) : sum; // Ceil para cobrar por fracción
            }, 0);
        }
        // Nota: El costo de relleno para Base/Especial podría necesitar lógica diferente si aplica.

        const subtotalForCommission = baseCakeCost + delivery + additionalTotal + calculatedFillingCost;

        let commissionCost = 0;
        if (addCommissionCheckbox.checked) {
            const commission = subtotalForCommission * 0.05;
            // Redondear comisión hacia arriba a la decena más cercana
            commissionCost = Math.ceil(commission / 10) * 10;
        }

        return subtotalForCommission + commissionCost;
    }

     function calculateBalance() {
        const grandTotal = getGrandTotal();
        const advance = parseFloat(advanceInput.value) || 0;
        balanceInput.value = (grandTotal - advance).toFixed(2);
    }

    function updateTotals() {
        const grandTotal = getGrandTotal();
        if (isPaidCheckbox.checked) {
            advanceInput.value = grandTotal.toFixed(2);
            advanceInput.readOnly = true; // Asegurar que sea readonly
        } else {
             advanceInput.readOnly = false; // Asegurar que sea editable
        }
        calculateBalance(); // Siempre recalcular balance
    }


    [totalInput, deliveryCostInput, personsInput, advanceInput].forEach(input => input.addEventListener('input', updateTotals));
    isPaidCheckbox.addEventListener('change', updateTotals); // Usar updateTotals directamente
    addCommissionCheckbox.addEventListener('change', updateTotals);
    // Recalcular si cambian rellenos (por costo) o tipo de folio
    fillingContainer.addEventListener('DOMSubtreeModified', updateTotals);
    folioTypeSelect.addEventListener('change', updateTotals);


    function renderAdditionalItems() {
        // ... (código sin cambios)
         additionalList.innerHTML = '';
        additionalItems.forEach((item, index) => {
             // Asegurarse de que totalPrice esté calculado
             item.totalPrice = (item.quantity || 0) * (item.price || 0);
            const li = document.createElement('li');
             li.className = 'text-sm text-gray-700 flex justify-between items-center';
            li.innerHTML = `
                 <span>${item.quantity} x ${item.name} (@ $${(item.price || 0).toFixed(2)}) = <strong>$${item.totalPrice.toFixed(2)}</strong></span>
                 <button type="button" class="remove-additional-btn text-red-500 ml-2 font-bold" data-index="${index}">[X]</button>`;
            additionalList.appendChild(li);
        });
    }

    addAdditionalButton.addEventListener('click', () => {
        // ... (código sin cambios)
         const nameInput = document.getElementById('additionalName');
         const quantityInput = document.getElementById('additionalQuantity');
         const priceInput = document.getElementById('additionalPrice');

        const name = nameInput.value.trim();
        const quantity = parseInt(quantityInput.value, 10);
        const price = parseFloat(priceInput.value); // Precio unitario

        if (name && quantity > 0 && !isNaN(price) && price >= 0) {
             additionalItems.push({ name, quantity, price, totalPrice: quantity * price }); // Guardar precio unitario y total
            renderAdditionalItems();
            updateTotals(); // Recalcular total general y balance
            // Limpiar inputs
            nameInput.value = '';
            quantityInput.value = '1';
            priceInput.value = '';
            nameInput.focus(); // Foco en el nombre para el siguiente item
        } else {
            alert('Por favor, completa la descripción (texto), cantidad (>0) y precio unitario (>=0) del adicional.');
        }
    });

    additionalList.addEventListener('click', (e) => {
        // ... (código sin cambios)
         if (e.target.classList.contains('remove-additional-btn')) {
             const index = parseInt(e.target.dataset.index, 10);
             if (index >= 0 && index < additionalItems.length) {
                 additionalItems.splice(index, 1);
                 renderAdditionalItems();
                 updateTotals(); // Recalcular
             }
        }
    });


     function addTierRow(tier = null) {
        const index = tiersData.length;
         // Crear estado inicial seguro
         const initialTierData = {
             persons: tier?.persons || '',
             panes: Array.isArray(tier?.panes) ? tier.panes.filter(p => p) : [], // Limpiar nulls/vacíos
             rellenos: Array.isArray(tier?.rellenos) ? tier.rellenos.filter(r => r) : [], // Limpiar nulls/vacíos
             notas: tier?.notas || ''
         };
        tiersData.push(initialTierData);

        const row = document.createElement('tr');
        row.className = 'tier-row border-b align-top'; // align-top para mejor layout
        row.dataset.index = index;
        row.innerHTML = `
            <td class="p-2 w-1/5"><input type="number" step="5" min="0" class="tier-persons-input bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2" placeholder="Personas" value="${initialTierData.persons}"></td>
            <td class="p-2 w-2/5">
                <div class="tag-container panes-container mb-1"></div>
                <button type="button" class="add-tier-pane-btn text-xs text-blue-600 hover:text-blue-800 font-medium">+ Pan (Máx 3)</button>
            </td>
            <td class="p-2 w-2/5">
                <div class="tag-container fillings-container mb-1"></div>
                <button type="button" class="add-tier-filling-btn text-xs text-blue-600 hover:text-blue-800 font-medium">+ Relleno (Máx 2)</button>
            </td>
            <td class="p-2 w-1/5"><input type="text" class="tier-notes-input bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2" placeholder="Notas/Forma" value="${initialTierData.notas}"></td>
            <td class="p-1 text-center"><button type="button" class="remove-tier-button text-red-500 font-bold px-2 text-lg hover:text-red-700">X</button></td>
        `;

         // Renderizar tags iniciales
        renderTags(row.querySelector('.panes-container'), initialTierData.panes, (tagIndex) => removeTierPane(index, tagIndex));
        renderTags(row.querySelector('.fillings-container'), initialTierData.rellenos, (tagIndex) => removeTierFilling(index, tagIndex));

        tiersTableBody.appendChild(row);
    }


    folioTypeSelect.addEventListener('change', function() {
        // ... (código sin cambios)
         const isSpecial = this.value === 'Base/Especial';
        normalFields.classList.toggle('hidden', isSpecial);
        specialFields.classList.toggle('hidden', !isSpecial);

        if (isSpecial) {
             // Si cambiamos a Especial y no hay filas, añadir una
             if (tiersTableBody.children.length === 0) {
                 addTierRow();
             }
             // Limpiar sabores y rellenos normales si existían
            if (selectedCakeFlavors.length > 0 || selectedRellenos.length > 0) {
                 selectedCakeFlavors = [];
                 selectedRellenos = [];
                 renderTags(cakeFlavorContainer, [], null);
                 renderTags(fillingContainer, [], null);
            }
        } else { // Si cambiamos a Normal
             // Limpiar estructura de pisos si existía
             if (tiersData.length > 0) {
                 tiersData = [];
                 tiersTableBody.innerHTML = '';
             }
        }
        updateTotals(); // Recalcular costos (ej. costo de relleno normal)
    });
    addTierButton.addEventListener('click', () => addTierRow());

    const removeTierPane = (tierIndex, tagIndex) => {
        // ... (código sin cambios)
         if (tierIndex >= 0 && tierIndex < tiersData.length) {
            tiersData[tierIndex].panes.splice(tagIndex, 1);
            const row = tiersTableBody.querySelector(`tr[data-index="${tierIndex}"]`);
            if (row) {
                renderTags(row.querySelector('.panes-container'), tiersData[tierIndex].panes, (newTagIndex) => removeTierPane(tierIndex, newTagIndex));
            }
        }
    };
    const removeTierFilling = (tierIndex, tagIndex) => {
         // ... (código sin cambios)
          if (tierIndex >= 0 && tierIndex < tiersData.length) {
            tiersData[tierIndex].rellenos.splice(tagIndex, 1);
            const row = tiersTableBody.querySelector(`tr[data-index="${tierIndex}"]`);
            if (row) {
                renderTags(row.querySelector('.fillings-container'), tiersData[tierIndex].rellenos, (newTagIndex) => removeTierFilling(tierIndex, newTagIndex));
            }
            // updateTotals(); // Rellenos especiales podrían no afectar costo total directamente aquí
        }
    };

    tiersTableBody.addEventListener('click', function(e) {
        // ... (código sin cambios, asegurando que addTierPane/Filling funcionen)
         const target = e.target;
        const row = target.closest('.tier-row');
        if (!row) return;

        currentTierIndex = parseInt(row.dataset.index, 10);
         // Asegurar que el índice es válido
         if (isNaN(currentTierIndex) || currentTierIndex < 0 || currentTierIndex >= tiersData.length) {
             console.error("Índice de piso inválido:", currentTierIndex);
             return;
         }

        const addTierPane = (flavor) => {
             // No añadir si ya está o si se alcanzó el límite
            if (tiersData[currentTierIndex].panes.length < 3 && !tiersData[currentTierIndex].panes.includes(flavor)) {
                tiersData[currentTierIndex].panes.push(flavor);
                renderTags(row.querySelector('.panes-container'), tiersData[currentTierIndex].panes, (tagIndex) => removeTierPane(currentTierIndex, tagIndex));
            } else if (tiersData[currentTierIndex].panes.length >= 3) {
                 alert("Máximo 3 panes por piso.");
            }
        };

        const addTierFilling = (rellenosSeleccionados) => { // Recibe array de 1 o 2 rellenos
            if (rellenosSeleccionados && rellenosSeleccionados.length > 0 && rellenosSeleccionados.length <= 2) {
                 // Reemplazar los rellenos actuales por los nuevos seleccionados
                 tiersData[currentTierIndex].rellenos = rellenosSeleccionados;
                 renderTags(row.querySelector('.fillings-container'), tiersData[currentTierIndex].rellenos, (tagIndex) => removeTierFilling(currentTierIndex, tagIndex));
                 // updateTotals(); // Podría recalcular si rellenos especiales tuvieran costo asociado
            } else if (rellenosSeleccionados.length > 2) {
                 alert("Máximo 2 rellenos por piso.");
            }
        };


        if (target.classList.contains('add-tier-pane-btn')) {
            openSelectionModal(
                `Panes Piso ${currentTierIndex + 1}`,
                cakeFlavorsData.tier,
                tiersData[currentTierIndex].panes,
                addTierPane,
                3 // Límite de panes
            );
        } else if (target.classList.contains('add-tier-filling-btn')) {
             // Limpiar rellenos existentes antes de abrir modal para reemplazarlos
             tiersData[currentTierIndex].rellenos = [];
             renderTags(row.querySelector('.fillings-container'), [], (tagIndex) => removeTierFilling(currentTierIndex, tagIndex));
             // Abrir modal especial que devuelve un array de 1 o 2 rellenos
             openRellenoModalEspecial(addTierFilling);
        } else if (target.classList.contains('remove-tier-button')) {
             if (confirm(`¿Eliminar piso ${currentTierIndex + 1}?`)) {
                 tiersData.splice(currentTierIndex, 1); // Eliminar del array de datos
                 row.remove(); // Eliminar del DOM
                 // Re-indexar las filas restantes en el DOM y en los datos si es necesario (o manejarlo al guardar)
                 Array.from(tiersTableBody.children).forEach((r, i) => r.dataset.index = i);
                 // updateTotals(); // Recalcular si personas afectan total
             }
        }
         // Delegación para botones de eliminar tags dentro de los tiers
         else if(target.classList.contains('tag-remove-btn')) {
             const tagContainer = target.closest('.tag-container');
             const tagIndex = parseInt(target.dataset.index, 10);
             if (tagContainer.classList.contains('panes-container')) {
                 removeTierPane(currentTierIndex, tagIndex);
             } else if (tagContainer.classList.contains('fillings-container')) {
                 removeTierFilling(currentTierIndex, tagIndex);
             }
        }

    });

     function addComplementRow(complement = null) {
        // ... (código sin cambios)
         const complementIndex = complementsContainer.children.length;
        const formWrapper = document.createElement('div');
        formWrapper.className = 'complement-form relative space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4'; // Añadir mb-4
        formWrapper.dataset.index = complementIndex;

        formWrapper.innerHTML = `
            <button type="button" class="absolute top-2 right-2 remove-complement-btn text-red-500 font-bold text-lg hover:text-red-700">X</button>
            <h4 class="text-md font-semibold text-gray-600 border-b pb-1 mb-2">Complemento ${complementIndex + 1}</h4>
            <div class="grid md:grid-cols-4 gap-4">
                <div>
                    <label class="block mb-1 text-xs font-medium text-gray-600">Personas</label>
                    <input type="number" step="5" min="0" class="complement-persons bg-white border border-gray-300 text-sm rounded-lg block w-full p-2" value="${complement?.persons || ''}">
                </div>
                <div>
                    <label class="block mb-1 text-xs font-medium text-gray-600">Forma</label>
                    <input type="text" class="complement-shape bg-white border border-gray-300 text-sm rounded-lg block w-full p-2" value="${complement?.shape || ''}">
                </div>
                <div>
                    <label class="block mb-1 text-xs font-medium text-gray-600">Sabor Pan</label>
                    <input type="text" class="complement-flavor bg-white border border-gray-300 text-sm rounded-lg block w-full p-2" value="${complement?.flavor || ''}">
                </div>
                <div>
                    <label class="block mb-1 text-xs font-medium text-gray-600">Relleno</label>
                    <input type="text" class="complement-filling bg-white border border-gray-300 text-sm rounded-lg block w-full p-2" value="${complement?.filling || ''}">
                </div>
            </div>
            <div>
                <label class="block mb-1 text-xs font-medium text-gray-600">Descripción</label>
                <textarea rows="2" class="complement-description block p-2 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300">${complement?.description || ''}</textarea>
            </div>
        `;
        complementsContainer.appendChild(formWrapper);

        formWrapper.querySelector('.remove-complement-btn').addEventListener('click', () => {
             if (confirm(`¿Eliminar Complemento ${parseInt(formWrapper.dataset.index) + 1}?`)) {
                 formWrapper.remove();
                 // Re-numerar los títulos de los complementos restantes
                 document.querySelectorAll('#complementsContainer .complement-form').forEach((form, index) => {
                     form.dataset.index = index; // Actualizar índice del dataset
                     form.querySelector('h4').textContent = `Complemento ${index + 1}`;
                 });
             }
        });
    }

    addComplementButton.addEventListener('click', () => addComplementRow());

    // --- INICIALIZACIÓN ---
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
        try {
            const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
            // Validación básica de expiración (opcional pero recomendada)
             if (tokenPayload.exp * 1000 < Date.now()) {
                 throw new Error("Token expirado");
             }
            const userRole = tokenPayload.role;
            window.currentUserRole = userRole; // Guardar rol globalmente si es útil
            showAppView(storedToken, userRole);
        } catch (error) {
            console.error("Error con token almacenado:", error.message);
            localStorage.removeItem('authToken'); // Limpiar token inválido/expirado
            showView('login'); // Asegurar que muestre login si hay error
        }
    } else {
         showView('login'); // Asegurar que muestre login si no hay token
    }


    window.showMainView = showView; // Exponer función para cambiar vistas

    // --- LÓGICA DEL VISOR DE PDFS (sin cambios) ---
    // ... (El código del visor PDF permanece igual) ...
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
             console.warn("Índice de PDF fuera de rango.");
             closePdfViewer(); // Cerrar si el índice es inválido
            return;
        }

        const folio = currentFolioList[currentFolioIndex];
        if (!folio || !folio.id) {
             console.error("Datos de folio inválidos para el visor PDF.");
             closePdfViewer();
             return;
        }

        const authToken = localStorage.getItem('authToken');
        const pdfUrl = `http://localhost:3000/api/folios/${folio.id}/pdf?token=${authToken}`;

        pdfViewerTitle.textContent = `Viendo Folio: ${folio.folioNumber || 'N/A'} (${currentFolioIndex + 1}/${currentFolioList.length})`;
        pdfFrame.src = pdfUrl;

        prevFolioBtn.disabled = currentFolioIndex === 0;
        nextFolioBtn.disabled = currentFolioIndex === currentFolioList.length - 1;

         // Añadir/quitar clases para estilo de deshabilitado si usas Tailwind u otro framework
         prevFolioBtn.classList.toggle('opacity-50', prevFolioBtn.disabled);
         prevFolioBtn.classList.toggle('cursor-not-allowed', prevFolioBtn.disabled);
         nextFolioBtn.classList.toggle('opacity-50', nextFolioBtn.disabled);
         nextFolioBtn.classList.toggle('cursor-not-allowed', nextFolioBtn.disabled);

    }


    window.openPdfViewer = (folios, index) => {
         if (!Array.isArray(folios) || folios.length === 0 || index < 0 || index >= folios.length) {
             console.error("Datos inválidos para abrir el visor PDF.");
             return;
         }
        currentFolioList = folios;
        currentFolioIndex = index;
        updatePdfViewer();
        pdfViewerModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Evitar scroll del body detrás del modal
        setTimeout(() => window.focus(), 100);
    };


    function closePdfViewer() {
        pdfViewerModal.classList.add('hidden');
        pdfFrame.src = 'about:blank'; // Limpiar iframe
        document.body.style.overflow = ''; // Restaurar scroll del body
    }

    closePdfViewerBtn.addEventListener('click', closePdfViewer);

    prevFolioBtn.addEventListener('click', () => {
        if (!prevFolioBtn.disabled) { // Solo actuar si no está deshabilitado
            currentFolioIndex--;
            updatePdfViewer();
        }
    });

    nextFolioBtn.addEventListener('click', () => {
         if (!nextFolioBtn.disabled) { // Solo actuar si no está deshabilitado
            currentFolioIndex++;
            updatePdfViewer();
         }
    });

     // Cerrar con tecla Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && !pdfViewerModal.classList.contains('hidden')) {
            closePdfViewer();
        }
         // Navegación con flechas izquierda/derecha
         else if (!pdfViewerModal.classList.contains('hidden')) {
             if (e.key === "ArrowLeft" && !prevFolioBtn.disabled) {
                 currentFolioIndex--;
                 updatePdfViewer();
             } else if (e.key === "ArrowRight" && !nextFolioBtn.disabled) {
                 currentFolioIndex++;
                 updatePdfViewer();
             }
         }
    });

     // Re-enfocar si se pierde el foco (útil para Escape/Flechas)
    window.addEventListener('blur', () => {
        if (!pdfViewerModal.classList.contains('hidden')) {
            setTimeout(() => window.focus(), 0);
        }
    });


    // --- LÓGICA DEL BOTÓN DE REPORTE (sin cambios) ---
    // ... (El código del botón de reporte permanece igual) ...
     if (commissionReportButton) {
        commissionReportButton.addEventListener('click', () => {
             // Generar reporte para el día ANTERIOR
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const reportDate = yesterday.toISOString().split('T')[0]; // Formato YYYY-MM-DD

            const authToken = localStorage.getItem('authToken');
             // Asegurarse de que el token se pasa correctamente como query param
            const url = `http://localhost:3000/api/folios/commission-report?date=${reportDate}&token=${authToken}`;

            console.log("Abriendo URL de reporte:", url); // Log para depuración
            window.open(url, '_blank'); // Abrir en nueva pestaña
        });
    }

    // ===== SECCIÓN PARA LA BANDEJA DE ENTRADA (sin cambios) =====
    // ... (El código de loadActiveSessions permanece igual) ...
    async function loadActiveSessions() {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
             console.warn("No auth token found for loading sessions.");
             // Podrías redirigir a login aquí si es necesario
             return;
        }


        const pendingTitle = document.querySelector('#pendingView h2');
        if (pendingTitle) pendingTitle.textContent = 'Bandeja de Entrada - Sesiones de IA Activas';

        pendingFoliosList.innerHTML = '<p class="text-gray-500 text-center italic mt-4 p-4">Cargando sesiones activas...</p>';
         pendingCountBadge.classList.add('hidden'); // Ocultar contador mientras carga

        try {
            const response = await fetch('http://localhost:3000/api/ai-sessions?status=active', { // Asegurar que solo traiga activas
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) {
                 // Manejar caso donde la ruta aún no exista o falle
                 if (response.status === 404) {
                     pendingFoliosList.innerHTML = '<p class="text-orange-600 text-center italic mt-4 p-4">Funcionalidad de Sesiones IA no disponible o sin sesiones activas.</p>';
                 } else {
                     const errorData = await response.json();
                     throw new Error(errorData.message || `Error ${response.status} al cargar sesiones.`);
                 }
                 pendingCountBadge.classList.add('hidden'); // Asegurar que esté oculto
                 return; // Salir si no se pueden cargar
            }

            const activeSessions = await response.json();

            // Actualizar contador
            if (activeSessions.length > 0) {
                pendingCountBadge.textContent = activeSessions.length;
                pendingCountBadge.classList.remove('hidden');
            } else {
                pendingCountBadge.classList.add('hidden');
            }

            pendingFoliosList.innerHTML = ''; // Limpiar mensaje de carga
            if (activeSessions.length === 0) {
                pendingFoliosList.innerHTML = '<p class="text-gray-500 text-center italic mt-4 p-4">No hay sesiones de IA activas en este momento.</p>';
                return;
            }

            activeSessions.forEach(session => {
                const sessionCard = document.createElement('div');
                 // Estilos mejorados
                 sessionCard.className = 'p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-2 sm:gap-x-4 cursor-pointer hover:bg-blue-50 transition-colors duration-150';
                sessionCard.dataset.sessionId = session.id;

                 // Extraer datos de forma segura
                 const clientName = session.extractedData?.clientName || 'Cliente Desconocido';
                 let deliveryDateStr = 'Fecha no definida';
                 if (session.extractedData?.deliveryDate) {
                     try {
                          // Intentar parsear y formatear la fecha
                          const dateObj = new Date(session.extractedData.deliveryDate + 'T12:00:00Z'); // Asumir UTC para evitar problemas de zona horaria al parsear YYYY-MM-DD
                          if (!isNaN(dateObj)) {
                              deliveryDateStr = dateObj.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Mexico_City' }); // Especificar zona horaria
                          }
                     } catch (e) { console.error("Error formateando fecha de sesión:", e); }
                 }
                 const persons = session.extractedData?.persons || 'N/A';


                sessionCard.innerHTML = `
                    <div class="flex-grow">
                        <p class="font-bold text-base text-gray-800">${clientName} <span class="text-sm font-normal text-gray-500">(ID: ${session.id})</span></p>
                        <p class="text-sm text-gray-600">
                            <span class="font-medium">Fecha:</span> ${deliveryDateStr} |
                            <span class="font-medium">Personas:</span> ${persons}
                        </p>
                    </div>
                    <button class="bg-blue-600 text-white font-bold py-1 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors flex-shrink-0">Abrir Asistente</button>
                `;

                sessionCard.addEventListener('click', (e) => {
                     // Solo navegar si no se hizo clic en el botón (permitir que el botón funcione si se añade otra acción)
                     if (e.target.tagName !== 'BUTTON') {
                         window.previousView = 'pending'; // Guardar de dónde venimos
                         loadChatSession(session.id);
                     }
                });


                pendingFoliosList.appendChild(sessionCard);
            });

        } catch (error) {
            console.error("Error en loadActiveSessions:", error);
            pendingFoliosList.innerHTML = `<p class="text-red-600 text-center p-4">Error al cargar sesiones: ${error.message}</p>`;
             pendingCountBadge.classList.add('hidden'); // Ocultar contador en caso de error
        }
    }


}); // Fin de DOMContentLoaded