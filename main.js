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

    function showView(viewToShow) {
        calendarView.classList.add('hidden');
        formView.classList.add('hidden');
        if (viewToShow === 'calendar') {
            calendarView.classList.remove('hidden');
        } else if (viewToShow === 'form') {
            formView.classList.remove('hidden');
        }
    }

    async function loadCalendarView() {
        const response = await fetch('calendar.html');
        const html = await response.text();
        calendarView.innerHTML = html;
        const authToken = localStorage.getItem('authToken');
        if (window.initializeCalendar) {
            window.initializeCalendar(authToken);
        }
    }
    
    function showAppView(token) {
        loginView.classList.add('hidden');
        appView.classList.remove('hidden');
        loadCalendarView().then(() => {
            showView('calendar');
        });
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
    newFolioButton.addEventListener('click', () => showView('form'));
    viewCalendarButton.addEventListener('click', () => showView('calendar'));

    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
        showAppView(storedToken);
    }
});