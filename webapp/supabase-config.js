// Supabase Configuration
// Replace 'YOUR_ANON_KEY' with your actual Supabase anon key

const SUPABASE_CONFIG = {
    url: 'https://imvfdhluvgcwcbzyumvz.supabase.co',
    anonKey: 'YOUR_ANON_KEY', // Replace with your actual anon key
    serviceRoleKey: 'YOUR_SERVICE_ROLE_KEY' // For admin operations (optional)
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
} else {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}
