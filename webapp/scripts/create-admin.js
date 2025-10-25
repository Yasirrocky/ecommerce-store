#!/usr/bin/env node
// create-admin.js
// Usage: node create-admin.js <email> <password>
// Or set environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD

const [,, emailArg, passwordArg] = process.argv;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = emailArg || process.env.ADMIN_EMAIL;
const password = passwordArg || process.env.ADMIN_PASSWORD;

function usage() {
    console.error('Usage: node create-admin.js <email> <password>');
    console.error('Or set env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD');
    process.exit(1);
}

if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment.');
    usage();
}

if (!email || !password) {
    console.error('Error: admin email and password must be provided as args or env vars.');
    usage();
}

(async () => {
    try {
        const endpoint = SUPABASE_URL.replace(/\/$/, '') + '/auth/v1/admin/users';
        const body = {
            email,
            password,
            email_confirm: true,
            user_metadata: { role: 'admin' }
        };

        // Use global fetch available in Node 18+. If not available, instruct user to use node >=18.
        if (typeof fetch !== 'function') {
            console.error('Error: global fetch is not available. Please run this script with Node 18+ or install a fetch polyfill.');
            process.exit(1);
        }

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SERVICE_ROLE,
                'Authorization': `Bearer ${SERVICE_ROLE}`
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('Failed to create admin user. Status:', res.status);
            console.error('Response:', JSON.stringify(data, null, 2));
            process.exit(1);
        }

        console.log('Admin user created successfully:');
        console.log(JSON.stringify(data, null, 2));
        console.log('You can now sign in at admin/login.html with the provided credentials.');
    } catch (err) {
        console.error('Error creating admin user:', err);
        process.exit(1);
    }
})();
