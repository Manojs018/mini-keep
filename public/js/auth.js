const API_URL = '/api';

// Handle Register
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = 'Registering...';

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            let data;
            try {
                data = await res.json();
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                data = { message: 'An unexpected error occurred' };
            }

            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data));
                window.location.href = 'pages/dashboard.html';
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error(error);
            alert('Connection error. Please check your internet or try again later.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    });
}

// Handle Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = 'Logging in...';

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            let data;
            try {
                data = await res.json();
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                data = { message: 'An unexpected error occurred' };
            }

            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data));
                window.location.href = 'pages/dashboard.html';
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error(error);
            alert('Connection error. Please check your internet or try again later.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    });
}


// Check if already logged in (simple check)
const user = JSON.parse(localStorage.getItem('user'));
// If we are on index.html (login) or register.html and user exists, redirect to dashboard
// Note: This logic needs to be careful about which page loads this script.
if (user) {
    // If current page is index.html or register.html
    const path = window.location.pathname;
    if (path.endsWith('index.html') || path.endsWith('register.html') || path === '/') {
        window.location.href = 'pages/dashboard.html';
        // If index.html is in root and dashboard in pages, path needs adjustment.
        // Let's refine based on where files are.
        // index.html -> pages/dashboard.html
        // pages/register.html -> dashboard.html
    }
}
