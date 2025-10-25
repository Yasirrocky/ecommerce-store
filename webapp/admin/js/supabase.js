// Supabase configuration for admin
const SUPABASE_URL = 'https://imvfdhluvgcwcbzyumvz.supabase.co';
// IMPORTANT: Replace the placeholder with your actual anon key from Supabase project settings
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltdmZkaGx1dmdjd2Nienl1bXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjIyMjYsImV4cCI6MjA3Njc5ODIyNn0.MknPmuuurqwxuqRuYlN4Be7ttqlADOrWynKefCmgUrg'; // anon/public key

function isSupabaseConfigured() {
    // Detect whether the placeholder has been replaced. Update SUPABASE_ANON_KEY with your project's anon key.
    return SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY';
}

if (!isSupabaseConfigured()) {
    console.error('[Admin Supabase] Missing SUPABASE_ANON_KEY. Replace the placeholder value of SUPABASE_ANON_KEY in admin/js/supabase.js with your project anon key (Settings → API in Supabase).');
}

// Ensure supabase-js library is loaded before calling createClient. If not loaded, expose a stub to avoid ReferenceError.
const _supabaseLib = (typeof window !== 'undefined') ? window.supabase : undefined;

if (!_supabaseLib || typeof _supabaseLib.createClient !== 'function') {
    console.error('[Admin Supabase] supabase-js library not found. Make sure the CDN <script> for @supabase/supabase-js is included before admin/js/supabase.js');

    // Minimal stub client to avoid crashes; methods throw clear errors when used.
    const stubClient = {
        auth: {
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

    window.supabase = stubClient;
}

// Initialize Supabase client (will use real library if present)
const supabase = window.supabase.createClient ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : window.supabase;

// Database table names
const TABLES = {
    CATEGORIES: 'categories',
    PRODUCTS: 'products',
    ORDERS: 'orders',
    ORDER_ITEMS: 'order_items'
};

// Storage bucket name
const STORAGE_BUCKET = 'product-images';

// Admin role check
const ADMIN_EMAILS = [
    'admin@stylehub.com',
    'admin@example.com'
    // Add more admin emails as needed
];

// Export for use in other files
window.supabase = supabase;
window.TABLES = TABLES;
window.STORAGE_BUCKET = STORAGE_BUCKET;
window.ADMIN_EMAILS = ADMIN_EMAILS;
