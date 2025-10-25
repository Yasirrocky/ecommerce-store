// Settings Management
let currentSettings = {};

// Initialize settings page
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    setupEventListeners();
});

// Load current settings from database
async function loadSettings() {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*');

        if (error) throw error;

        // Convert array to object for easier access
        data.forEach(setting => {
            currentSettings[setting.setting_key] = setting.setting_value;
        });

        // Populate form fields
        document.getElementById('siteName').value = currentSettings.site_name || '';
        document.getElementById('businessEmail').value = currentSettings.business_email || '';
        document.getElementById('businessPhone').value = currentSettings.business_phone || '';
        document.getElementById('businessAddress').value = currentSettings.business_address || '';
        document.getElementById('aboutUs').value = currentSettings.about_us || '';
        document.getElementById('facebookUrl').value = currentSettings.facebook_url || '';
        document.getElementById('instagramUrl').value = currentSettings.instagram_url || '';
        document.getElementById('twitterUrl').value = currentSettings.twitter_url || '';
        document.getElementById('whatsappNumber').value = currentSettings.whatsapp_number || '';

        // Set hidden fields for images
        document.getElementById('siteLogo').value = currentSettings.site_logo || '';
        document.getElementById('headerWallpaper').value = currentSettings.header_wallpaper || '';

        // Show image previews if available
        if (currentSettings.site_logo) {
            showImagePreview('logo', currentSettings.site_logo);
        }
        if (currentSettings.header_wallpaper) {
            showImagePreview('header', currentSettings.header_wallpaper);
        }

    } catch (error) {
        console.error('Error loading settings:', error);
        alert('Failed to load settings. Please refresh the page.');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('settingsForm').addEventListener('submit', handleSubmit);

    // Logo upload
    document.getElementById('logoUpload').addEventListener('change', (e) => handleImageUpload(e, 'logo'));

    // Header upload
    document.getElementById('headerUpload').addEventListener('change', (e) => handleImageUpload(e, 'header'));

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Logout buttons
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('mobileLogoutBtn')?.addEventListener('click', handleLogout);
}

// Handle image upload
async function handleImageUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
    }

    try {
        // Show loading state
        const uploadBtn = event.target.previousElementSibling || event.target.nextElementSibling;
        const originalText = uploadBtn.innerHTML;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Uploading...';
        uploadBtn.disabled = true;

        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${type}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('site-assets')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('site-assets')
            .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        // Update hidden field
        if (type === 'logo') {
            document.getElementById('siteLogo').value = publicUrl;
        } else if (type === 'header') {
            document.getElementById('headerWallpaper').value = publicUrl;
        }

        // Show preview
        showImagePreview(type, publicUrl);

        // Reset button
        uploadBtn.innerHTML = originalText;
        uploadBtn.disabled = false;

        showToast('Image uploaded successfully!', 'success');

    } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
        
        // Reset button
        const uploadBtn = event.target.previousElementSibling || event.target.nextElementSibling;
        uploadBtn.innerHTML = uploadBtn.innerHTML.replace('Uploading...', 'Upload');
        uploadBtn.disabled = false;
    }
}

// Show image preview
function showImagePreview(type, url) {
    if (type === 'logo') {
        const logoImage = document.getElementById('logoImage');
        const logoPreview = document.getElementById('logoPreview');
        logoImage.src = url;
        logoImage.classList.remove('hidden');
        logoPreview.querySelector('i')?.classList.add('hidden');
    } else if (type === 'header') {
        const headerImage = document.getElementById('headerImage');
        const headerPreview = document.getElementById('headerPreview');
        headerImage.src = url;
        headerImage.classList.remove('hidden');
        headerPreview.querySelector('i')?.classList.add('hidden');
    }
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();

    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
    saveBtn.disabled = true;

    try {
        // Collect form data
        const formData = new FormData(event.target);
        const settings = {};
        
        for (let [key, value] of formData.entries()) {
            settings[key] = value;
        }

        // Update each setting in database
        const updates = [];
        for (let [key, value] of Object.entries(settings)) {
            updates.push(
                supabase
                    .from('site_settings')
                    .upsert({
                        setting_key: key,
                        setting_value: value,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'setting_key'
                    })
            );
        }

        await Promise.all(updates);

        // Clear user-side cache so changes appear immediately
        try {
            localStorage.removeItem('stylehub_settings');
        } catch (e) {
            console.warn('Could not clear cache:', e);
        }

        showToast('Settings saved successfully!', 'success');

        // Refresh admin header/footer branding immediately if script is loaded
        try {
            if (typeof window.applyAdminBrand === 'function') {
                window.applyAdminBrand();
            }
        } catch (e) {
            console.warn('applyAdminBrand refresh failed:', e);
        }

        // Reload settings
        await loadSettings();

    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Failed to save settings. Please try again.', 'error');
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('successToast');
    if (!toast) return;

    // Update toast content
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl z-50`;
    toast.querySelector('i').className = `fas ${icon} text-2xl`;
    toast.querySelector('span').textContent = message;

    // Show toast
    toast.classList.remove('hidden');

    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Handle logout
async function handleLogout(e) {
    e.preventDefault();
    
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Failed to logout. Please try again.');
    }
}
