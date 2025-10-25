// Authentication functions
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.initialized = false;
        this.initPromise = this.init();
    }

    async init() {
        try {
            // Check if user is already logged in
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) {
                console.error('Error getting user:', error);
                // Try to recover session from storage
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    this.currentUser = session.user;
                } else {
                    this.currentUser = null;
                }
            } else if (user) {
                this.currentUser = user;
            }
            
            this.updateUI();
            this.initialized = true;

            // Listen for auth state changes
            supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event);
                if (event === 'SIGNED_IN') {
                    this.currentUser = session.user;
                    this.updateUI();
                    this.showToast('Successfully logged in!', 'success');
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.updateUI();
                    this.showToast('Logged out successfully', 'success');
                } else if (event === 'TOKEN_REFRESHED') {
                    console.log('Token refreshed successfully');
                    this.currentUser = session.user;
                } else if (event === 'USER_UPDATED') {
                    this.currentUser = session.user;
                    this.updateUI();
                }
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
            this.initialized = true;
        }
    }

    async signUp(email, password, fullName) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (error) throw error;

            if (data.user && !data.user.email_confirmed_at) {
                this.showToast('Please check your email to confirm your account', 'warning');
            }

            return { data, error: null };
        } catch (error) {
            console.error('Sign up error:', error);
            this.showToast(error.message, 'error');
            return { data: null, error };
        }
    }

    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            console.error('Sign in error:', error);
            this.showToast(error.message, 'error');
            return { data: null, error };
        }
    }

    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            // Clear cart from localStorage
            localStorage.removeItem('cart');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Sign out error:', error);
            this.showToast(error.message, 'error');
        }
    }

    async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            });

            if (error) throw error;

            this.showToast('Password reset email sent!', 'success');
            return { error: null };
        } catch (error) {
            console.error('Password reset error:', error);
            this.showToast(error.message, 'error');
            return { error };
        }
    }

    async updatePassword(newPassword) {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            this.showToast('Password updated successfully!', 'success');
            return { error: null };
        } catch (error) {
            console.error('Password update error:', error);
            this.showToast(error.message, 'error');
            return { error };
        }
    }

    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const mobileAuthButtons = document.getElementById('mobileAuthButtons');
        const mobileUserMenu = document.getElementById('mobileUserMenu');
        const userName = document.getElementById('userName');

        if (this.currentUser) {
            // Hide auth buttons, show user menu
            if (authButtons) authButtons.classList.add('hidden');
            if (userMenu) userMenu.classList.remove('hidden');
            if (mobileAuthButtons) mobileAuthButtons.classList.add('hidden');
            if (mobileUserMenu) mobileUserMenu.classList.remove('hidden');
            
            // Update user name
            if (userName) {
                const displayName = this.currentUser.user_metadata?.full_name || 
                                 this.currentUser.email?.split('@')[0] || 'User';
                userName.textContent = displayName;
            }
        } else {
            // Show auth buttons, hide user menu
            if (authButtons) authButtons.classList.remove('hidden');
            if (userMenu) userMenu.classList.add('hidden');
            if (mobileAuthButtons) mobileAuthButtons.classList.remove('hidden');
            if (mobileUserMenu) mobileUserMenu.classList.add('hidden');
        }
    }

    async isAuthenticated() {
        // Wait for initialization to complete
        await this.initPromise;
        return this.currentUser !== null;
    }

    // Synchronous version for backward compatibility (use with caution)
    isAuthenticatedSync() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    showToast(message, type = 'success') {
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

    // Protect routes that require authentication
    requireAuth(redirectTo = 'login.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Add event listeners for logout buttons
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authManager.signOut();
        });
    }

    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authManager.signOut();
        });
    }
});

// Export for use in other files
window.authManager = authManager;
