// Admin authentication functions
class AdminAuthManager {
    constructor() {
        this.currentAdmin = null;
        this.init();
    }

    async init() {
        // Check if admin is already logged in
        console.debug('[AdminAuth] supabase client:', window.supabase);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            console.debug('[AdminAuth] current session:', session);
            
            if (session?.user) {
                console.debug('[AdminAuth] found existing session with user:', session.user);
                
                // Accept admin if user_metadata.role is 'admin' OR email is in configured admin list
                if (session.user.user_metadata?.role === 'admin' || this.isAdminEmail(session.user.email)) {
                    console.debug('[AdminAuth] setting current admin from session');
                    this.currentAdmin = session.user;
                    this.updateUI();
                    return; // Exit early if we have a valid admin session
                } else {
                    console.debug('[AdminAuth] session user is not admin, clearing session');
                    await this.signOut();
                }
            }
        } catch (err) {
            console.debug('[AdminAuth] session check error', err);
        }

        // Listen for auth state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            console.debug('[AdminAuth] onAuthStateChange', { event, session, currentAdmin: this.currentAdmin });
            
            if (event === 'SIGNED_IN' && session?.user) {
                // If we already have this user as current admin, don't re-verify
                if (this.currentAdmin?.id === session.user.id) {
                    console.debug('[AdminAuth] user already verified as admin, skipping re-verification');
                    return;
                }

                console.debug('[AdminAuth] verifying admin status', session.user);
                
                const isAdmin = session.user.user_metadata?.role === 'admin' || this.isAdminEmail(session.user.email);
                
                if (isAdmin) {
                    console.log('[AdminAuth] User VERIFIED as admin:', session.user.email);
                    this.currentAdmin = session.user;
                    this.updateUI();
                    
                    if (window.location.pathname.endsWith('login.html')) {
                        this.showToast('Login successful! Redirecting...', 'success');
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 1500);
                    }
                } else {
                    console.error(`[AdminAuth] User NOT an admin: ${session.user.email}. Configured admins:`, window.ADMIN_EMAILS);
                    this.showToast('Login failed: Not an authorized admin.', 'error');
                    await this.signOut();
                }
            } else if (event === 'SIGNED_OUT' && !this.currentAdmin) {
                // Only process SIGNED_OUT if we don't have a current admin
                console.debug('[AdminAuth] user signed out event', session);
                this.currentAdmin = null;
                this.updateUI();
                
                // Only show logout message if we're not on the login page
                if (!window.location.pathname.endsWith('login.html')) {
                    this.showToast('Logged out successfully', 'success');
                }
            } else {
                console.debug('[AdminAuth] auth event (unhandled):', event, session);
            }
        });
    }

    isAdminEmail(email) {
        // Prefer the explicitly exported window.ADMIN_EMAILS to avoid ReferenceErrors
        const adminList = Array.isArray(window.ADMIN_EMAILS) ? window.ADMIN_EMAILS : [];

        if (adminList.length === 0) {
            // Informative (not an error) - helpful when supabase config hasn't run yet
            console.warn('[AdminAuth] No admin emails configured (window.ADMIN_EMAILS is empty). Admin checks will fail until configured.');
            return false;
        }

        return adminList.includes(email);
    }

    async signIn(email, password) {
        try {
            // Debug: show configured admin emails and attempt
            console.debug('[AdminAuth] sign in attempt:', { 
                email,
                adminEmails: window.ADMIN_EMAILS,
                isAdminEmail: this.isAdminEmail(email)
            });

            // Pre-check if this is an admin email
            if (!this.isAdminEmail(email)) {
                throw new Error('Access denied. Admin privileges required.');
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            console.debug('[AdminAuth] signInWithPassword result:', { data, error });

            if (error) throw error;
            
            // Verify admin status immediately
            const signedInUser = data.user;
            const isAdmin = signedInUser.user_metadata?.role === 'admin' || this.isAdminEmail(signedInUser.email);
            
            console.debug('[AdminAuth] admin verification:', {
                isAdmin,
                userMetadata: signedInUser.user_metadata,
                userEmail: signedInUser.email
            });

            if (!isAdmin) {
                throw new Error('Access denied. Admin privileges required.');
            }

            // Set the current admin user if verification passed
            this.currentAdmin = signedInUser;
            return { data, error: null };
        } catch (error) {
            console.error('Admin sign in error:', error);
            this.showToast(error.message, 'error');
            return { data: null, error };
        }
    }

    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            window.location.href = 'login.html';
        } catch (error) {
            console.error('Admin sign out error:', error);
            this.showToast(error.message, 'error');
        }
    }

    updateUI() {
        // Admin UI updates can be added here if needed
        // For now, we'll handle redirects in individual pages
    }

    isAuthenticated() {
        return this.currentAdmin !== null && this.isAdminEmail(this.currentAdmin.email);
    }

    getCurrentAdmin() {
        return this.currentAdmin;
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

    // Protect admin routes
    requireAuth(redirectTo = 'login.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }
}

// Initialize admin auth manager after DOM is ready to avoid script load order races
let adminAuthManager = null;
document.addEventListener('DOMContentLoaded', () => {
    adminAuthManager = new AdminAuthManager();
    // Export for use in other files
    window.adminAuthManager = adminAuthManager;
});
