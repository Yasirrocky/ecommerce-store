// Supabase configuration
const SUPABASE_URL = 'https://imvfdhluvgcwcbzyumvz.supabase.co';
// IMPORTANT: Replace the placeholder with your actual anon key from Supabase project settings
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltdmZkaGx1dmdjd2Nienl1bXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjIyMjYsImV4cCI6MjA3Njc5ODIyNn0.MknPmuuurqwxuqRuYlN4Be7ttqlADOrWynKefCmgUrg'; // <-- set this to your anon key

// Validate configuration
function isSupabaseConfigured() {
    return SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY';
}

if (!isSupabaseConfigured()) {
    // Provide a clear console error to help developers during local testing
    console.error('[Supabase] Missing SUPABASE_ANON_KEY. Please set the anon key in user/js/supabase.js');
}

// Ensure the supabase JS library is loaded (from CDN) before calling createClient.
// If it's not loaded we'll create a stub that throws clear errors on use so the UI
// doesn't crash with a generic "supabase is not defined" ReferenceError.
const _supabaseLib = (typeof window !== 'undefined') ? window.supabase : undefined;

if (!_supabaseLib || typeof _supabaseLib.createClient !== 'function') {
    console.error('[Supabase] supabase-js library not found. Make sure the CDN <script> for @supabase/supabase-js is included before js/supabase.js');

    // Create a minimal stub client that throws when auth methods are used.
    const stubClient = {
        auth: {
            async signUp() { throw new Error('Supabase client not available (library not loaded)'); },
            async signInWithPassword() { throw new Error('Supabase client not available (library not loaded)'); },
            async signOut() { throw new Error('Supabase client not available (library not loaded)'); },
            async getUser() { return { data: { user: null } }; },
            onAuthStateChange() { /* no-op */ }
        },
        from() { return { select: async () => ({ data: null, error: new Error('Supabase client not available') }) }; },
        storage: {
            from() { return { upload: async () => ({ error: new Error('Supabase client not available') }) }; }
        }
    };

    // Expose the stub so other modules can import window.supabase without causing a ReferenceError.
    window.supabase = stubClient;
}

// Initialize Supabase client with proper auth persistence
const supabase = window.supabase.createClient ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'supabase.auth.token'
    }
}) : window.supabase;

// Database table names
const TABLES = {
    CATEGORIES: 'categories',
    PRODUCTS: 'products',
    ORDERS: 'orders',
    ORDER_ITEMS: 'order_items'
};

// Storage bucket name
const STORAGE_BUCKET = 'product-images';

// Export for use in other files
// Export for use in other files
window.supabase = supabase;
window.TABLES = TABLES;
window.STORAGE_BUCKET = STORAGE_BUCKET;
window.isSupabaseConfigured = isSupabaseConfigured;
