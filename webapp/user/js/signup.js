// Signup page functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is already logged in
    const isAuth = await authManager.isAuthenticated();
    if (isAuth) {
        console.log('User already authenticated, redirecting to home');
        window.location.href = 'index.html';
        return;
    }
    
    // Setup form interactions
    setupSignupForm();
    setupPasswordToggles();
    setupPasswordValidation();
});

function setupSignupForm() {
    const signupForm = document.getElementById('signupForm');
    const signupBtn = document.getElementById('signupBtn');
    const signupBtnText = document.getElementById('signupBtnText');
    const signupLoading = document.getElementById('signupLoading');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            const loadingOverlay = document.getElementById('loadingOverlay');
            const successModal = document.getElementById('successModal');
            const redirectCounter = document.getElementById('redirectCounter');
            
            // Validate inputs
            if (!fullName || !email || !password || !confirmPassword) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            // Password validation
            const passwordErrors = validatePasswordStrength(password);
            if (passwordErrors.length > 0) {
                showToast(passwordErrors[0], 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            if (!agreeTerms) {
                showToast('Please agree to the Terms of Service and Privacy Policy', 'error');
                return;
            }
            
            // Show loading states
            signupBtn.disabled = true;
            signupBtnText.classList.add('hidden');
            signupLoading.classList.remove('hidden');
            loadingOverlay.classList.remove('hidden');
            
            try {
                // Ensure Supabase is configured
                if (typeof isSupabaseConfigured === 'function' && !isSupabaseConfigured()) {
                    throw new Error('Supabase is not configured. Please set SUPABASE_ANON_KEY in js/supabase.js');
                }
                
                // Attempt signup
                const { data, error } = await authManager.signUp(email, password, fullName);
                
                if (error) {
                    throw error;
                }
                
                // Hide loading overlay and show success modal
                loadingOverlay.classList.add('hidden');
                successModal.classList.remove('hidden');
                
                // Start countdown for redirect
                let count = 3;
                const countdownInterval = setInterval(() => {
                    count--;
                    if (redirectCounter) redirectCounter.textContent = count;
                    if (count <= 0) {
                        clearInterval(countdownInterval);
                        window.location.href = 'login.html';
                    }
                }, 1000);
                
            } catch (error) {
                console.error('Signup error:', error);
                showToast(error.message || 'Signup failed. Please try again.', 'error');
                
                // Reset all loading states
                loadingOverlay.classList.add('hidden');
                signupBtn.disabled = false;
                signupBtnText.classList.remove('hidden');
                signupLoading.classList.add('hidden');
            }
        });
    }
}

function setupPasswordToggles() {
    // Password toggle
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
    
    // Confirm password toggle
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const confirmPasswordField = document.getElementById('confirmPassword');
    
    if (toggleConfirmPassword && confirmPasswordField) {
        toggleConfirmPassword.addEventListener('click', () => {
            const type = confirmPasswordField.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordField.setAttribute('type', type);
            
            const icon = toggleConfirmPassword.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }
}

function setupPasswordValidation() {
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');
    
    if (passwordField) {
        passwordField.addEventListener('input', () => {
            validatePassword();
        });
    }
    
    if (confirmPasswordField) {
        confirmPasswordField.addEventListener('input', () => {
            validatePasswordMatch();
        });
    }
}

function validatePassword() {
    const password = document.getElementById('password').value;
    const passwordField = document.getElementById('password');
    
    // Remove previous validation classes
    passwordField.classList.remove('border-red-500', 'border-green-500');
    
    if (password.length > 0) {
        if (password.length >= 8) {
            passwordField.classList.add('border-green-500');
        } else {
            passwordField.classList.add('border-red-500');
        }
    }
}

function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmPasswordField = document.getElementById('confirmPassword');
    
    // Remove previous validation classes
    confirmPasswordField.classList.remove('border-red-500', 'border-green-500');
    
    if (confirmPassword.length > 0) {
        if (password === confirmPassword) {
            confirmPasswordField.classList.add('border-green-500');
        } else {
            confirmPasswordField.classList.add('border-red-500');
        }
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePasswordStrength(password) {
    const errors = [];
    
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*)');
    }
    
    return errors;
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
    // Add animations
    const form = document.querySelector('.slide-up');
    if (form) {
        setTimeout(() => {
            form.classList.remove('opacity-0');
            form.classList.add('translate-y-0');
        }, 100);
    }

    // Ensure proper z-index for form container on mobile
    const rightPanel = document.querySelector('.w-full.min-h-screen');
    if (rightPanel && window.innerWidth < 1024) {
        rightPanel.style.zIndex = '1';
        rightPanel.style.position = 'relative';
    }
});
