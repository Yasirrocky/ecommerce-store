// Site Settings Loader - Dynamically load site configuration
let siteSettings = {};
let settingsLoaded = false;
const CACHE_KEY = 'stylehub_settings';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Load site settings from database
async function loadSiteSettings() {
    try {
        // Try to load from cache first
        const cached = loadFromCache();
        if (cached) {
            siteSettings = cached;
            settingsLoaded = true;
            applySiteSettings();
        }

        // Fetch fresh data from database
        const { data, error } = await supabase
            .from('site_settings')
            .select('*');

        if (error) throw error;

        // Convert array to object for easier access
        data.forEach(setting => {
            siteSettings[setting.setting_key] = setting.setting_value;
        });

        settingsLoaded = true;

        // Save to cache
        saveToCache(siteSettings);

        // Apply settings to the page immediately
        applySiteSettings();

        // Also apply after a short delay to catch late-loading components
        setTimeout(() => applySiteSettings(), 500);

    } catch (error) {
        console.error('Error loading site settings:', error);
        // Use default values if settings can't be loaded
        setDefaultSettings();
    }
}

// Apply loaded settings to the page
function applySiteSettings() {
    if (!settingsLoaded) return;

    // Update site logo
    const logoImg = document.getElementById('siteLogo') || document.querySelector('.site-logo');
    if (logoImg) {
        if (siteSettings.site_logo) {
            logoImg.src = siteSettings.site_logo;
            logoImg.alt = siteSettings.site_name || 'StyleHub';
            logoImg.classList.remove('hidden');
            logoImg.style.display = 'block';
        } else {
            logoImg.classList.add('hidden');
        }
    }

    // Update site name in all locations
    const siteNameElements = document.querySelectorAll('.site-name');
    siteNameElements.forEach(element => {
        if (siteSettings.site_name) {
            element.textContent = siteSettings.site_name;
        }
    });

    // Update page title
    if (siteSettings.site_name) {
        const titleParts = document.title.split(' - ');
        if (titleParts.length > 1) {
            document.title = `${titleParts[0]} - ${siteSettings.site_name}`;
        } else {
            document.title = siteSettings.site_name;
        }
    }

    // Update header wallpaper if exists
    const headerElements = document.querySelectorAll('.header-wallpaper, .hero-section');
    headerElements.forEach(element => {
        if (siteSettings.header_wallpaper) {
            element.style.backgroundImage = `url('${siteSettings.header_wallpaper}')`;
            element.style.backgroundSize = 'cover';
            element.style.backgroundPosition = 'center';
        }
    });

    // Update footer information
    updateFooter();

    // Update meta tags
    updateMetaTags();
}

// Update footer with dynamic settings
function updateFooter() {
    // Update business address
    const addressElements = document.querySelectorAll('.business-address');
    addressElements.forEach(element => {
        if (siteSettings.business_address) {
            element.textContent = siteSettings.business_address;
        }
    });

    // Update business phone
    const phoneElements = document.querySelectorAll('.business-phone');
    phoneElements.forEach(element => {
        if (siteSettings.business_phone) {
            element.textContent = siteSettings.business_phone;
            element.href = `tel:${siteSettings.business_phone.replace(/\s/g, '')}`;
        }
    });

    // Update business email
    const emailElements = document.querySelectorAll('.business-email');
    emailElements.forEach(element => {
        if (siteSettings.business_email) {
            element.textContent = siteSettings.business_email;
            element.href = `mailto:${siteSettings.business_email}`;
        }
    });

    // Update social media links
    if (siteSettings.facebook_url) {
        const fbLinks = document.querySelectorAll('.social-facebook, a[href*="facebook"]');
        fbLinks.forEach(link => {
            if (link.classList.contains('social-facebook') || link.querySelector('i.fa-facebook')) {
                link.href = siteSettings.facebook_url;
            }
        });
    }

    if (siteSettings.instagram_url) {
        const igLinks = document.querySelectorAll('.social-instagram, a[href*="instagram"]');
        igLinks.forEach(link => {
            if (link.classList.contains('social-instagram') || link.querySelector('i.fa-instagram')) {
                link.href = siteSettings.instagram_url;
            }
        });
    }

    if (siteSettings.twitter_url) {
        const twLinks = document.querySelectorAll('.social-twitter, a[href*="twitter"]');
        twLinks.forEach(link => {
            if (link.classList.contains('social-twitter') || link.querySelector('i.fa-twitter')) {
                link.href = siteSettings.twitter_url;
            }
        });
    }

    if (siteSettings.whatsapp_number) {
        const waLinks = document.querySelectorAll('.social-whatsapp, a[href*="whatsapp"]');
        waLinks.forEach(link => {
            if (link.classList.contains('social-whatsapp') || link.querySelector('i.fa-whatsapp')) {
                link.href = `https://wa.me/${siteSettings.whatsapp_number.replace(/\D/g, '')}`;
            }
        });
    }

    // Update about us text
    const aboutElements = document.querySelectorAll('.about-us-text');
    aboutElements.forEach(element => {
        if (siteSettings.about_us) {
            element.textContent = siteSettings.about_us;
        }
    });
}

// Update meta tags for SEO
function updateMetaTags() {
    if (siteSettings.site_name) {
        // Update og:site_name
        let ogSiteName = document.querySelector('meta[property="og:site_name"]');
        if (!ogSiteName) {
            ogSiteName = document.createElement('meta');
            ogSiteName.setAttribute('property', 'og:site_name');
            document.head.appendChild(ogSiteName);
        }
        ogSiteName.setAttribute('content', siteSettings.site_name);
    }

    if (siteSettings.about_us) {
        // Update description meta tag
        let description = document.querySelector('meta[name="description"]');
        if (!description) {
            description = document.createElement('meta');
            description.setAttribute('name', 'description');
            document.head.appendChild(description);
        }
        description.setAttribute('content', siteSettings.about_us);
    }
}

// Set default settings if loading fails
function setDefaultSettings() {
    siteSettings = {
        site_name: 'StyleHub',
        site_logo: '',
        business_address: '123 Fashion Street, New York, NY 10001',
        business_phone: '+1 (555) 123-4567',
        business_email: 'info@stylehub.com',
        facebook_url: 'https://facebook.com',
        instagram_url: 'https://instagram.com',
        twitter_url: 'https://twitter.com',
        whatsapp_number: '+15551234567',
        about_us: 'StyleHub is your premier destination for fashion and style.'
    };
    applySiteSettings();
}

// Get a specific setting value
function getSetting(key, defaultValue = '') {
    return siteSettings[key] || defaultValue;
}

// Cache functions for faster loading
function saveToCache(settings) {
    try {
        const cacheData = {
            settings: settings,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
        console.warn('Failed to save settings to cache:', e);
    }
}

function loadFromCache() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const cacheData = JSON.parse(cached);
        const age = Date.now() - cacheData.timestamp;

        // Return cached data if it's still fresh
        if (age < CACHE_DURATION) {
            return cacheData.settings;
        }

        // Clear old cache
        localStorage.removeItem(CACHE_KEY);
        return null;
    } catch (e) {
        console.warn('Failed to load settings from cache:', e);
        return null;
    }
}

// Clear cache (useful when settings are updated in admin)
function clearSettingsCache() {
    try {
        localStorage.removeItem(CACHE_KEY);
    } catch (e) {
        console.warn('Failed to clear settings cache:', e);
    }
}

// Initialize settings when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSiteSettings);
} else {
    loadSiteSettings();
}

// Also listen for components loaded event to reapply settings
document.addEventListener('components:loaded', () => {
    if (Object.keys(siteSettings).length > 0) {
        applySiteSettings();
    }
});

// Export for use in other scripts
window.siteSettings = siteSettings;
window.getSetting = getSetting;
window.loadSiteSettings = loadSiteSettings;
window.applySiteSettings = applySiteSettings;
