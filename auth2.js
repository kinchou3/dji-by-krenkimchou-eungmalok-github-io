document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const authModal = document.getElementById('authModal');
    const authLink = document.getElementById('authLink');
    const closeBtn = document.querySelector('.close-btn');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const rememberMe = document.getElementById('rememberMe');
    
    // User data storage
    const USERS_KEY = 'djiCambodiaUsers';
    const AUTH_KEY = 'djiCambodiaAuth';
    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    
    // Check for existing session on page load
    checkExistingSession();
    
    // Show modal when login/register link is clicked
    authLink.addEventListener('click', function(e) {
        e.preventDefault();
        authModal.style.display = 'flex';
        showLoginForm();
    });
    
    // Close modal when X is clicked
    closeBtn.addEventListener('click', function() {
        authModal.style.display = 'none';
    });
    
    // Close modal when clicking outside the modal
    window.addEventListener('click', function(e) {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });
    
    // Switch between login and register forms
    loginTab.addEventListener('click', showLoginForm);
    registerTab.addEventListener('click', showRegisterForm);
    
    function showLoginForm() {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    }
    
    function showRegisterForm() {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    }
    
    // Form submissions
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const remember = rememberMe.checked;
        
        // Clear previous errors
        clearErrors(loginForm);
        
        // Validation
        if (!email || !password) {
            showError(loginForm, 'Please fill in all fields');
            return;
        }
        
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Successful login
            alert(`Welcome back, ${user.name}!`);
            authModal.style.display = 'none';
            
            // Save session if "Remember me" is checked
            if (remember) {
                const authData = {
                    email: user.email,
                    name: user.name,
                    timestamp: new Date().getTime()
                };
                localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
            }
            
            updateNavForLoggedInUser(user.name);
        } else {
            showError(loginForm, 'Invalid email or password');
        }
    }
    
    function handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        // Clear previous errors
        clearErrors(registerForm);
        
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            showError(registerForm, 'Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            showError(registerForm, 'Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            showError(registerForm, 'Password must be at least 6 characters');
            return;
        }
        
        if (users.some(u => u.email === email)) {
            showError(registerForm, 'Email already registered');
            return;
        }
        
        // Create new user
        const newUser = { 
            name, 
            email, 
            password,
            registeredAt: new Date().getTime()
        };
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        
        alert(`Registration successful, ${name}! You can now login.`);
        showLoginForm();
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPassword').value = '';
    }
    
    function checkExistingSession() {
        const authData = JSON.parse(localStorage.getItem(AUTH_KEY));
        
        if (authData) {
            // Check if session is still valid (e.g., within 30 days)
            const sessionDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
            const isSessionValid = (new Date().getTime() - authData.timestamp) < sessionDuration;
            
            if (isSessionValid) {
                // Auto-login the user
                updateNavForLoggedInUser(authData.name);
            } else {
                // Session expired, clear it
                localStorage.removeItem(AUTH_KEY);
            }
        }
    }
    
    function showError(form, message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        form.appendChild(errorElement);
    }
    
    function clearErrors(form) {
        const errors = form.querySelectorAll('.error-message');
        errors.forEach(error => error.remove());
    }
    
    function updateNavForLoggedInUser(username) {
        // Replace login/register link with user greeting
        authLink.innerHTML = `<span class="user-greeting">Welcome, ${username}</span>`;
        authLink.removeAttribute('href');
        
        // Add logout functionality
        authLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                // Clear the session
                localStorage.removeItem(AUTH_KEY);
                
                // Reset the auth link
                authLink.textContent = 'Login/Register';
                authLink.href = '#';
                authLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    authModal.style.display = 'flex';
                    showLoginForm();
                }, { once: true });
            }
        }, { once: true });
    }
});