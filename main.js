document.addEventListener('DOMContentLoaded', function() {
    // --- VISTAS Y ELEMENTOS GLOBALES ---
    const loginView = document.getElementById('loginView');
    const appView = document.getElementById('appView');
    const calendarView = document.getElementById('calendarView');
    const formView = document.getElementById('formView');
    const loginForm = document.getElementById('loginForm');
    const logoutButton = document.getElementById('logoutButton');
    const newFolioButton = document.getElementById('newFolioButton');
    const viewCalendarButton = document.getElementById('viewCalendarButton');
    const loadingEl = document.getElementById('loading');

    // --- ELEMENTOS DEL FORMULARIO ---
    const folioForm = document.getElementById('folioForm'),
          formTitle = document.getElementById('formTitle'),
          clientNameInput = document.getElementById('clientName'),
          clientPhoneInput = document.getElementById('clientPhone'),
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
          hasExtraHeightCheckbox = document.getElementById('hasExtraHeight'),
          addComplementCheckbox = document.getElementById('addComplement'),
          complementForm = document.getElementById('complementForm'),
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

    // --- VARIABLES DE ESTADO DEL FORMULARIO ---
    let additionalItems = [];
    let selectedFiles = [];
    let existingImages = [];
    let selectedCakeFlavors = [];
    let selectedFillings = [];
    let tiersData = [];
    let currentTierIndex = -1;
    
    // --- DATOS CONSTANTES (SABORES, RELLENOS) ---
    const cakeFlavorsData = {
        normal: ['Pastel de queso', 'Pan de tres leches', 'Chocolate', 'Red Velvet', 'Mil Hojas', 'Zanahoria', 'Queso/Flan', 'Mantequilla'],
        tier: ['Mantequilla', 'Queso', 'Nata', 'Chocolate', 'Vainilla', 'Flan', 'Red Velvet']
    };
    const fillingsData = {
        'incluidos': { 'Mermelada': ['Zarzamora', 'Fresa', 'Piña', 'Durazno'], 'Manjar': ['Nuez', 'Coco', 'Almendra'], 'Dulce de Leche': ['Envinada', 'Nuez', 'Almendra', 'Coco'], 'Duraznos': ['Crema de Yogurth', 'Chantilly', 'Rompope'], 'Nuez': ['Manjar', 'Mocka', 'Capuchino'] },
        'conCosto': { 'Cajeta': ['Nuez', 'Coco', 'Almendra', 'Oreo'], 'Crema de Queso': ['Mermelada zarzamora', 'Mermelada fresa', 'Cajeta', 'Envinada'], 'Oreo': ['Manjar', 'Crema de yogurth fresa', 'Crema de chocolate', 'Chantilly'], 'Cremas': ['Mocka', 'Yogurth de fresa', 'Café con o sin brandy'], 'Chantilly con fresas': [], 'Nutella': [], 'Cocktail de frutas': ['Chantilly', 'Crema de queso', 'Crema de Yogurth'], 'Crema de queso con Chocoretas': [], 'Snickers / Milky Way': ['Manjar', 'Chantilly', 'Crema de yogurth fresa', 'Crema de chocolate'] }
    };

    // --- FUNCIONES DE MANEJO DE VISTAS Y SESIÓN ---
    function showView(viewToShow) {
        calendarView.classList.add('hidden');
        formView.classList.add('hidden');
        if (viewToShow === 'calendar') {
            calendarView.classList.remove('hidden');
        } else if (viewToShow === 'form') {
            formView.classList.remove('hidden');
        }
    }
    
    function showAppView(token) {
        loginView.classList.add('hidden');
        appView.classList.remove('hidden');
        showView('calendar');
        if (window.initializeCalendar) {
            window.initializeCalendar(token);
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

    // --- LÓGICA DEL FORMULARIO ---
    for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option'); option.value = i; option.textContent = i.toString().padStart(2, '0');
        deliveryHourSelect.appendChild(option);
    }

    function resetForm() {
        folioForm.reset();
        formTitle.textContent = 'Crear Nuevo Folio';
        delete folioForm.dataset.editingId;
        additionalItems = [];
        selectedFiles = [];
        existingImages = [];
        selectedCakeFlavors = [];
        selectedFillings = [];
        tiersData = [];
        additionalList.innerHTML = '';
        imagePreview.innerHTML = '';
        renderTags(cakeFlavorContainer, [], null);
        renderTags(fillingContainer, [], null);
        tiersTableBody.innerHTML = '';
        inStorePickupCheckbox.dispatchEvent(new Event('change'));
        addComplementCheckbox.dispatchEvent(new Event('change'));
        folioTypeSelect.dispatchEvent(new Event('change'));
        updateTotals();
    }

    window.populateFormForEdit = (folio) => {
        resetForm();
        formTitle.textContent = `Editando Folio: ${folio.folioNumber}`;
        folioForm.dataset.editingId = folio.id;

        clientNameInput.value = folio.client.name;
        clientPhoneInput.value = folio.client.phone;
        deliveryDateInput.value = folio.deliveryDate;
        personsInput.value = folio.persons;
        shapeInput.value = folio.shape;
        designDescriptionTextarea.value = folio.designDescription;
        dedicationInput.value = folio.dedication || '';
        accessoriesInput.value = folio.accessories || '';
        deliveryCostInput.value = parseFloat(folio.deliveryCost);

        const [hour, minute] = folio.deliveryTime.split(':');
        const hour12 = (parseInt(hour) % 12) || 12;
        deliveryHourSelect.value = hour12;
        deliveryMinuteSelect.value = minute;
        deliveryPeriodSelect.value = parseInt(hour) >= 12 ? 'PM' : 'AM';
        
        isPaidCheckbox.checked = folio.isPaid;
        // --- LÍNEA AÑADIDA ---
        hasExtraHeightCheckbox.checked = folio.hasExtraHeight;
        
        if (folio.additional && folio.additional.length > 0) {
            additionalItems = folio.additional.map(item => {
                const match = item.name.match(/(\d+)\s*x\s*(.*)/);
                if (match) {
                    const quantity = parseInt(match[1]);
                    const name = match[2];
                    const price = parseFloat(item.price);
                    return { name, quantity, price: price / quantity, totalPrice: price };
                }
                return { name: item.name, quantity: 1, price: parseFloat(item.price), totalPrice: parseFloat(item.price) };
            });
            renderAdditionalItems();
        }

        if (folio.imageUrls && folio.imageUrls.length > 0) {
            existingImages = folio.imageUrls.map((url, index) => ({
                url: url,
                comment: (folio.imageComments && folio.imageComments[index]) ? folio.imageComments[index] : ''
            }));
        }
        
        renderImagePreviews();
        
        const additionalCost = (folio.additional || []).reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
        const baseCakeCost = parseFloat(folio.total) - parseFloat(folio.deliveryCost) - additionalCost;
        totalInput.value = baseCakeCost.toFixed(2);
        advanceInput.value = parseFloat(folio.advancePayment).toFixed(2);
        
        updateTotals();
    };
    
    // --- EVENT LISTENERS ---
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
            showAppView(data.token);
        } catch (error) {
            document.getElementById('loginError').textContent = error.message;
        } finally {
            loadingEl.classList.add('hidden');
        }
    });

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
        } else if (googleMapsLocationCheckbox.checked) {
            deliveryLocation = 'El cliente envía ubicación (Google Maps)';
        } else {
            deliveryLocation = [`${streetInput.value || ''} ${extNumberInput.value || ''}`.trim(), intNumberInput.value ? `Int. ${intNumberInput.value}` : '', neighborhoodInput.value ? `Col. ${neighborhoodInput.value}` : ''].filter(Boolean).join(', ');
        }

        formData.append('clientName', clientNameInput.value);
        formData.append('clientPhone', clientPhoneInput.value);
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
        // --- LÍNEA AÑADIDA ---
        formData.append('hasExtraHeight', hasExtraHeightCheckbox.checked);
        
        if (isEditing) {
            formData.append('existingImageUrls', JSON.stringify(existingImages.map(img => img.url)));
            formData.append('existingImageComments', JSON.stringify(existingImages.map(img => img.comment)));
        }

        const newImageComments = selectedFiles.map(sf => sf.comment);
        formData.append('imageComments', JSON.stringify(newImageComments));

        for (const fileData of selectedFiles) {
            formData.append('referenceImages', fileData.file);
        }
        
        try {
            const response = await fetch(url, { method, headers: { 'Authorization': `Bearer ${authToken}` }, body: formData });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Error del servidor'); }
            
            const successMessage = isEditing ? '¡Folio actualizado con éxito!' : '¡Folio creado con éxito!';
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
    });

    logoutButton.addEventListener('click', handleLogout);
    newFolioButton.addEventListener('click', () => showView('form'));
    viewCalendarButton.addEventListener('click', () => showView('calendar'));
    cancelFormButton.addEventListener('click', () => {
        resetForm();
        showView('calendar');
    });

    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
        showAppView(storedToken);
    }

    window.showMainView = showView;
    
    // El resto de la lógica del formulario (funciones de renderizado, cálculo, etc.) va aquí...
    // (Este código es el que estaba en el <script> de tu index.html y no necesita cambios)
    
    // (Funciones: renderImagePreviews, imageInput listeners, renderTags, openSelectionModal, etc...)
});