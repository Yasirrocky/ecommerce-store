// Admin login page functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check if admin is already logged in
    if (adminAuthManager.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Setup form interactions
    setupAdminLoginForm();
    setupPasswordToggle();
});

function setupAdminLoginForm() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginLoading = document.getElementById('loginLoading');
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            let email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            // Allow shorthand username 'ADMIN' (case-insensitive) to map to the admin email used by policies
            if (/^admin$/i.test(email)) {
                email = 'admin@stylehub.com';
            }
            
            // Validate inputs
            if (!email || !password) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            // Show loading state
            loginBtn.disabled = true;
            loginBtnText.classList.add('hidden');
            loginLoading.classList.remove('hidden');
            
            try {
                // Attempt admin login
                const { data, error } = await adminAuthManager.signIn(email, password);
                
                if (error) {
                    throw error;
                }
                
                // Show success message
                showToast('Admin login successful!', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
                
            } catch (error) {
                console.error('Admin login error:', error);
                showToast(error.message || 'Login failed. Please try again.', 'error');
                
                // Reset button state
                loginBtn.disabled = false;
                loginBtnText.classList.remove('hidden');
                loginLoading.classList.add('hidden');
            }
        });
    }
}

function setupPasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');
    
    if (togglePassword && passwordField) {
        togglePassword.addEventListener('click', () => {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            
            const icon = togglePassword.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showToast(message, type = 'success') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Add smooth transitions
document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in animation to the form
    const form = document.querySelector('form');
    if (form) {
        form.classList.add('fade-in');
    }
});
