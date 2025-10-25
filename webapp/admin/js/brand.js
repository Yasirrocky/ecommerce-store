// Admin Brand Loader - sync admin header/footer with site settings
async function applyAdminBrand() {
  try {
    if (typeof supabase === 'undefined') return;

    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value');

    if (error) throw error;

    const settings = {};
    data.forEach((row) => (settings[row.setting_key] = row.setting_value));

    const siteName = settings.site_name || 'StyleHub';
    const logoUrl = settings.site_logo || '';

    // Update document title: keep page prefix, replace brand suffix
    if (document.title.includes(' - ')) {
      const parts = document.title.split(' - ');
      const pagePrefix = parts[0];
      document.title = `${pagePrefix} - ${siteName} Admin`;
    } else {
      document.title = `${siteName} Admin`;
    }

    // Update header brand link
    const headerBrand = document.querySelector('nav .flex-shrink-0 a');
    if (headerBrand) {
      // Ensure it points to user home
      headerBrand.setAttribute('href', '../user/index.html');
      headerBrand.setAttribute('title', `${siteName} Store Home`);
      headerBrand.classList.add('flex', 'items-center', 'space-x-2');

      // Build brand content
      const img = document.createElement('img');
      img.className = 'h-8 w-auto hidden';
      img.alt = `${siteName} Logo`;
      if (logoUrl) {
        img.src = logoUrl;
        img.classList.remove('hidden');
      }

      const span = document.createElement('span');
      span.textContent = `${siteName} Admin`;
      span.className = 'text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent';

      // Replace children
      headerBrand.innerHTML = '';
      headerBrand.appendChild(img);
      headerBrand.appendChild(span);
    }

    // Update any "View Store" links to point correctly
    document.querySelectorAll('a[href$="../user/index.html"]').forEach((a) => {
      a.setAttribute('href', '../user/index.html');
      a.setAttribute('title', `${siteName} Store Home`);
    });

    // Update footer brand text
    document.querySelectorAll('footer h3, footer .footer-brand').forEach((el) => {
      el.textContent = `${siteName} Admin`;
    });
  } catch (e) {
    console.warn('Admin brand load failed:', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyAdminBrand);
} else {
  applyAdminBrand();
}

// Expose for manual refresh after settings save
window.applyAdminBrand = applyAdminBrand;
