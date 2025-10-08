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
        // ==================== INICIO DE LA CORRECCIÓN ====================
        clientPhone2Input = document.getElementById('clientPhone2'),
        // ===================== FIN DE LA CORRECCIÓN ======================
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
    let selectedRellenos = [];
    let tiersData = [];
    let currentTierIndex = -1;
    
    // --- DATOS CONSTANTES (SABORES, RELLENOS) ---
    const cakeFlavorsData = {
        normal: ['Pastel de queso', 'Pan de tres leches', 'Chocolate', 'Red Velvet', 'Mil Hojas', 'Zanahoria', 'Queso/Flan', 'Mantequilla'],
        tier: ['Mantequilla', 'Queso', 'Nata', 'Chocolate', 'Vainilla', 'Flan', 'Red Velvet']
    };
    const rellenosData = {
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

    function safeJsonParse(jsonString) {
        if (!jsonString) return [];
        try {
            const result = JSON.parse(jsonString);
            return Array.isArray(result) ? result : [];
        } catch (e) {
            return [];
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
        formTitle.textContent = `Editando Folio: ${folio.folioNumber}`;
        folioForm.dataset.editingId = folio.id;

        folioTypeSelect.value = folio.folioType;
        folioTypeSelect.dispatchEvent(new Event('change'));

        clientNameInput.value = folio.client.name;
        clientPhoneInput.value = folio.client.phone;
        clientPhone2Input.value = folio.client.phone2 || ''; // Cargar teléfono 2
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
        
        if (location === 'Recoge en Tienda') {
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
            fillingCost = (folio.tiers || []).reduce((sum, tier) => {
                if (!tier) return sum; 
                const tierPersons = parseInt(tier.persons, 10) || 0;
                const tierFillingCost = (tier.rellenos || []).reduce((tierSum, relleno) => {
                    return (relleno && relleno.hasCost && tierPersons > 0) ? tierSum + ((tierPersons / 20) * 30) : tierSum;
                }, 0);
                return sum + tierFillingCost;
            }, 0);
        }

        const baseCakeCost = parseFloat(folio.total) - parseFloat(folio.deliveryCost) - additionalCost - fillingCost;

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
            showAppView(data.token);
        } catch (error) {
            document.getElementById('loginError').textContent = error.message;
        } finally {
            loadingEl.classList.add('hidden');
        }
    });

    logoutButton.addEventListener('click', handleLogout);
    newFolioButton.addEventListener('click', () => {
        resetForm();
        showView('form');
    });
    viewCalendarButton.addEventListener('click', () => showView('calendar'));
    cancelFormButton.addEventListener('click', () => {
        resetForm();
        showView('calendar');
    });

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

        // ==================== INICIO DE LA CORRECCIÓN ====================
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
        // ===================== FIN DE LA CORRECCIÓN ======================

        formData.append('clientName', clientNameInput.value);
        formData.append('clientPhone', clientPhoneInput.value);
        formData.append('clientPhone2', clientPhone2Input.value); // Enviar teléfono 2
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

        const complementsData = [];
        document.querySelectorAll('.complement-form').forEach(form => {
            complementsData.push({
                persons: form.querySelector('.complement-persons').value,
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
        const showStep1 = () => {
            modalTitle.textContent = 'Añadir Relleno (Paso 1 de 2)';
            modalStep1.classList.remove('hidden');
            modalStep2.classList.add('hidden');
            modalSearch.value = '';
            modalList.innerHTML = '';
            [...Object.keys(rellenosData.incluidos).map(name => ({ name, hasCost: false })), ...Object.keys(rellenosData.conCosto).map(name => ({ name, hasCost: true }))].forEach(titular => {
                const itemEl = document.createElement('div');
                itemEl.className = 'modal-list-item';
                if (titular.hasCost) itemEl.classList.add('cost-extra');
                itemEl.textContent = titular.name;
                itemEl.addEventListener('click', () => {
                    const complementos = (rellenosData.incluidos[titular.name] || rellenosData.conCosto[titular.name]);
                    if (complementos && complementos.length > 0) {
                        showStep2(titular, complementos);
                    } else {
                        if (currentRellenos.length < limit) {
                            onSelectCallback(titular);
                            selectionModal.classList.add('hidden');
                        } else {
                            alert(`Solo puedes seleccionar un máximo de ${limit} rellenos.`);
                        }
                    }
                });
                modalList.appendChild(itemEl);
            });
        }
        const showStep2 = (titular, complementos) => {
            modalStep1.classList.add('hidden');
            modalStep2.classList.remove('hidden');
            modalTitle.textContent = `Paso 2: Elige un complemento`;
            modalStep2Title.innerHTML = `Complemento para "<b>${titular.name}</b>" <button type="button" class="back-to-step1 text-sm text-blue-600 hover:underline">(Volver)</button>`;
            modalStep2List.innerHTML = '';
            complementos.forEach(comp => {
                const compEl = document.createElement('div');
                compEl.className = 'modal-list-item';
                compEl.textContent = comp;
                compEl.addEventListener('click', () => {
                     if (currentRellenos.length < limit) {
                        onSelectCallback({ name: `${titular.name} con ${comp}`, hasCost: titular.hasCost });
                        selectionModal.classList.add('hidden');
                    } else {
                        alert(`Solo puedes seleccionar un máximo de ${limit} rellenos.`);
                    }
                });
                modalStep2List.appendChild(compEl);
            });
            modalStep2Title.querySelector('.back-to-step1').addEventListener('click', showStep1);
        }
        showStep1();
        selectionModal.classList.remove('hidden');
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
    
    // ==================== INICIO DE LA CORRECCIÓN ====================
    inStorePickupCheckbox.addEventListener('change', function() { 
        deliveryAddressSection.classList.toggle('hidden', this.checked); 
        deliveryCostInput.readOnly = this.checked; 
        if (this.checked) deliveryCostInput.value = '0'; 
        updateTotals(); 
    });

    // Se elimina el listener que deshabilitaba los campos
    // googleMapsLocationCheckbox.addEventListener('change', function() { addressFields.classList.toggle('disabled-section', this.checked); });
    // ===================== FIN DE LA CORRECCIÓN ======================

    function getGrandTotal() {
        const total = parseFloat(totalInput.value) || 0;
        const delivery = parseFloat(deliveryCostInput.value) || 0;
        const additionalFromList = additionalItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const persons = parseFloat(personsInput.value) || 0;
        const normalFillingCost = selectedRellenos.reduce((sum, relleno) => (relleno && relleno.hasCost && persons > 0) ? sum + ((persons / 20) * 30) : sum, 0);
        const tierFillingCost = tiersData.reduce((sum, tier, index) => {
            if (!tier || !tiersTableBody.children[index]) return sum;
            const row = tiersTableBody.children[index];
            const tierPersons = parseFloat(row.querySelector('.tier-persons-input').value) || 0;
            return sum + (tier.rellenos || []).reduce((tierSum, relleno) => (relleno && relleno.hasCost && tierPersons > 0) ? tierSum + ((tierPersons / 20) * 30) : tierSum, 0);
        }, 0);
        return total + delivery + additionalFromList + normalFillingCost + tierFillingCost;
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
            renderTags(row.querySelector('.fillings-container'), tier.rellenos || [], (tagIndex) => removeTierFilling(index, tagIndex));
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
    
    // --- Lógica para manejar la tabla de pisos (Tiers) ---
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
        const addTierFilling = (relleno) => { if (tiersData[currentTierIndex] && tiersData[currentTierIndex].rellenos.length < 2) { tiersData[currentTierIndex].rellenos.push(relleno); renderTags(row.querySelector('.fillings-container'), tiersData[currentTierIndex].rellenos, (tagIndex) => removeTierFilling(currentTierIndex, tagIndex)); updateTotals();
            }
        };

        if (target.classList.contains('add-tier-pane-btn')) {
            openSelectionModal('Sabor de Pan (Piso)', cakeFlavorsData.tier, tiersData[currentTierIndex].panes, addTierPane, 3);
        } else if (target.classList.contains('add-tier-filling-btn')) {
            openRellenoModal(addTierFilling, tiersData[currentTierIndex].rellenos, 2);
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
            <div class="grid md:grid-cols-3 gap-4">
                <div>
                    <label class="block mb-2 text-sm font-medium">Personas</label>
                    <input type="number" step="5" class="complement-persons bg-white border border-gray-300 text-sm rounded-lg block w-full p-2.5" value="${complement?.persons || ''}">
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
            // Re-indexar los títulos por si se borra uno intermedio
            document.querySelectorAll('.complement-form').forEach((form, index) => {
                form.querySelector('h4').textContent = `Complemento ${index + 1}`;
            });
        });
    }

    addComplementButton.addEventListener('click', () => addComplementRow());
    
    // --- INICIALIZACIÓN ---
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
        showAppView(storedToken);
    }

    window.showMainView = showView;
});