# Create Admin Script

This folder contains a small Node script to create an admin user in Supabase using the Admin REST API endpoint. This requires your Supabase project's service_role key. Do NOT commit the service_role key to source control.

Files:
- `create-admin.js` — Node script that calls Supabase admin users endpoint.

Prerequisites:
- Node.js 18+ (for global fetch). If you have older Node, install a fetch polyfill or use Node 18+.

Windows PowerShell example (temporary environment variables):

```powershell
$env:SUPABASE_URL = 'https://imvfdhluvgcwcbzyumvz.supabase.co'
$env:SUPABASE_SERVICE_ROLE_KEY = '<YOUR_SERVICE_ROLE_KEY>'
node .\create-admin.js admin@stylehub.com 'Leomessi@10'
```

Or inline (single command):

```powershell
$env:SUPABASE_URL='https://imvfdhluvgcwcbzyumvz.supabase.co'; $env:SUPABASE_SERVICE_ROLE_KEY='<YOUR_SERVICE_ROLE_KEY>'; node .\create-admin.js admin@stylehub.com 'Leomessi@10'
```

Notes:
- The script will mark the email as confirmed (`email_confirm: true`).
- The script sets `user_metadata.role = 'admin'`—this is optional and for convenience.
- Keep the service_role key secret. Remove it from environment after use.

If you want, I can also generate a one-time PowerShell command you can paste here (don't paste your service_role key into the chat if you want to keep it private) and I'll run it for you if you provide the key, but it's safer to run it locally.
