// Login page functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is already logged in
    const isAuth = await authManager.isAuthenticated();
    if (isAuth) {
        console.log('User already authenticated, redirecting to home');
        window.location.href = 'index.html';
        return;
    }
    
    // Setup form interactions
    setupLoginForm();
    setupPasswordToggle();
    setupForgotPasswordModal();
});

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginLoading = document.getElementById('loginLoading');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            
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
                // Attempt login
                const { data, error } = await authManager.signIn(email, password);
                
                if (error) {
                    throw error;
                }
                
                // Show success message
                showToast('Login successful!', 'success');
                
                // Redirect to home page or intended destination
                const urlParams = new URLSearchParams(window.location.search);
                const redirectTo = urlParams.get('redirect') || 'index.html';
                
                setTimeout(() => {
                    window.location.href = redirectTo;
                }, 1000);
                
            } catch (error) {
                console.error('Login error:', error);
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

function setupForgotPasswordModal() {
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeForgotPasswordModal = document.getElementById('closeForgotPasswordModal');
    const cancelReset = document.getElementById('cancelReset');
    const sendResetEmail = document.getElementById('sendResetEmail');
    const resetEmail = document.getElementById('resetEmail');
    
    // Open modal
    if (forgotPasswordLink && forgotPasswordModal) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotPasswordModal.classList.remove('hidden');
        });
    }
    
    // Close modal
    const closeModal = () => {
        forgotPasswordModal.classList.add('hidden');
        resetEmail.value = '';
    };
    
    if (closeForgotPasswordModal) {
        closeForgotPasswordModal.addEventListener('click', closeModal);
    }
    
    if (cancelReset) {
        cancelReset.addEventListener('click', closeModal);
    }
    
    // Send reset email
    if (sendResetEmail && resetEmail) {
        sendResetEmail.addEventListener('click', async () => {
            const email = resetEmail.value.trim();
            
            if (!email) {
                showToast('Please enter your email address', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            // Show loading state
            sendResetEmail.disabled = true;
            sendResetEmail.textContent = 'Sending...';
            
            try {
                const { error } = await authManager.resetPassword(email);
                
                if (error) {
                    throw error;
                }
                
                showToast('Password reset email sent! Check your inbox.', 'success');
                closeModal();
                
            } catch (error) {
                console.error('Password reset error:', error);
                showToast(error.message || 'Failed to send reset email. Please try again.', 'error');
                
                // Reset button
                sendResetEmail.disabled = false;
                sendResetEmail.textContent = 'Send Reset Email';
            }
        });
    }
    
    // Close modal when clicking outside
    if (forgotPasswordModal) {
        forgotPasswordModal.addEventListener('click', (e) => {
            if (e.target === forgotPasswordModal) {
                closeModal();
            }
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
