document.addEventListener('DOMContentLoaded', function() {
    const loginView = document.getElementById('loginView');
    const appView = document.getElementById('appView');
    const calendarView = document.getElementById('calendarView');
    const formView = document.getElementById('formView');
    
    const loginForm = document.getElementById('loginForm');
    const logoutButton = document.getElementById('logoutButton');
    const newFolioButton = document.getElementById('newFolioButton');
    const viewCalendarButton = document.getElementById('viewCalendarButton');
    const loadingEl = document.getElementById('loading');

    // ========= INICIO DE CÓDIGO AÑADIDO =========
    // Referencias y listeners para la nueva modal de lista de folios
    const dailyFoliosModal = document.getElementById('dailyFoliosModal');
    const closeDailyFoliosModalBtn = document.getElementById('closeDailyFoliosModal');

    if (closeDailyFoliosModalBtn) {
        closeDailyFoliosModalBtn.addEventListener('click', () => {
            dailyFoliosModal.classList.add('hidden');
        });
    }

    if (dailyFoliosModal) {
        dailyFoliosModal.addEventListener('click', (e) => {
            // Cierra la modal solo si se hace clic en el fondo oscuro
            if (e.target.id === 'dailyFoliosModal') {
                dailyFoliosModal.classList.add('hidden');
            }
        });
    }
    // ========= FIN DE CÓDIGO AÑADIDO =========

    // Función para cambiar entre la vista de calendario y la de formulario
    function showView(viewToShow) {
        calendarView.classList.add('hidden');
        formView.classList.add('hidden');
        if (viewToShow === 'calendar') {
            calendarView.classList.remove('hidden');
        } else if (viewToShow === 'form') {
            formView.classList.remove('hidden');
        }
    }
    
    // Muestra la vista principal de la aplicación después del login
    function showAppView(token) {
        loginView.classList.add('hidden');
        appView.classList.remove('hidden');
        showView('calendar'); // Muestra el calendario por defecto
        
        // Llama a la función global para inicializar el calendario
        if (window.initializeCalendar) {
            window.initializeCalendar(token);
        }
    }

    // Maneja el cierre de sesión
    function handleLogout() {
        localStorage.removeItem('authToken');
        appView.classList.add('hidden');
        loginView.classList.remove('hidden');
        alert("Sesión cerrada.");
    }
    
    // Función de fetch con un tiempo de espera
    async function fetchWithTimeout(resource, options = {}, timeout = 8000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await fetch(resource, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    }

    // Lógica para el formulario de login
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

    // Escucha el evento personalizado cuando un folio se crea con éxito
    window.addEventListener('folioCreated', () => {
        showView('calendar');
    });

    // Event listeners para los botones de navegación
    logoutButton.addEventListener('click', handleLogout);
    newFolioButton.addEventListener('click', () => showView('form'));
    viewCalendarButton.addEventListener('click', () => showView('calendar'));

    // Comprueba si ya existe un token al cargar la página
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
        showAppView(storedToken);
    }

    // --- INICIO DE LA CORRECCIÓN ---
    // Hacemos la función showView accesible globalmente para que otros scripts puedan llamarla.
    window.showMainView = showView;
    // --- FIN DE LA CORRECCIÓN ---
});