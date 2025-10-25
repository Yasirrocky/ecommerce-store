// Add product functionality
let selectedImageFile = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Check admin authentication
    if (!adminAuthManager.requireAuth()) {
        return;
    }
    
    // Initialize the page
    await initializeAddProductPage();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup logout buttons
    setupLogoutButtons();
    
    // Setup form interactions
    setupFormInteractions();
});

async function initializeAddProductPage() {
    try {
        // Load categories
        await loadCategories();
        
        // Update admin name
        updateAdminName();
        
    } catch (error) {
        console.error('Error initializing add product page:', error);
        showToast('Failed to load page data', 'error');
    }
}

async function loadCategories() {
    try {
        const { data, error } = await supabase
            .from(TABLES.CATEGORIES)
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        const categorySelect = document.getElementById('productCategory');
        if (categorySelect) {
            categorySelect.innerHTML = `
                <option value="">Select a category</option>
                ${data.map(category => `
                    <option value="${category.id}">${category.name}</option>
                `).join('')}
            `;
        }
        
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Failed to load categories', 'error');
    }
}

function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('mobile-menu-enter');
        });
    }
}

function setupLogoutButtons() {
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            adminAuthManager.signOut();
        });
    }
    
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            adminAuthManager.signOut();
        });
    }
}

function setupFormInteractions() {
    // Image upload handling
    const imageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeImageBtn = document.getElementById('removeImage');
    
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    showToast('Please select a valid image file', 'error');
                    return;
                }
                
                // Validate file size (10MB max)
                if (file.size > 10 * 1024 * 1024) {
                    showToast('Image size must be less than 10MB', 'error');
                    return;
                }
                
                selectedImageFile = file;
                
                // Show preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImg.src = e.target.result;
                    imagePreview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            selectedImageFile = null;
            imageInput.value = '';
            imagePreview.classList.add('hidden');
        });
    }
    
    // Form submission
    const form = document.getElementById('addProductForm');
    const saveBtn = document.getElementById('saveProductBtn');
    const saveBtnText = document.getElementById('saveBtnText');
    const saveLoading = document.getElementById('saveLoading');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validate form
            if (!validateForm()) {
                return;
            }
            
            // Show loading state
            saveBtn.disabled = true;
            saveBtnText.classList.add('hidden');
            saveLoading.classList.remove('hidden');
            
            try {
                // Upload image first if selected
                let imageUrl = '';
                if (selectedImageFile) {
                    imageUrl = await uploadImage(selectedImageFile);
                }
                
                // Create product
                const productData = {
                    name: document.getElementById('productName').value.trim(),
                    description: document.getElementById('productDescription').value.trim(),
                    price: parseFloat(document.getElementById('productPrice').value),
                    category_id: document.getElementById('productCategory').value,
                    image_url: imageUrl,
                    sizes: document.getElementById('productSizes').value.trim(),
                    colors: document.getElementById('productColors').value.trim(),
                    tags: document.getElementById('productTags').value.trim()
                };
                
                const { data, error } = await supabase
                    .from(TABLES.PRODUCTS)
                    .insert([productData])
                    .select()
                    .single();
                
                if (error) throw error;
                
                showToast('Product created successfully!', 'success');
                
                // Redirect to products page
                setTimeout(() => {
                    window.location.href = 'products.html';
                }, 1500);
                
            } catch (error) {
                console.error('Error creating product:', error);
                showToast(error.message || 'Failed to create product', 'error');
                
                // Reset button state
                saveBtn.disabled = false;
                saveBtnText.classList.remove('hidden');
                saveLoading.classList.add('hidden');
            }
        });
    }
}

function validateForm() {
    const name = document.getElementById('productName').value.trim();
    const price = document.getElementById('productPrice').value;
    const description = document.getElementById('productDescription').value.trim();
    const category = document.getElementById('productCategory').value;
    
    if (!name) {
        showToast('Product name is required', 'error');
        return false;
    }
    
    if (!price || parseFloat(price) <= 0) {
        showToast('Please enter a valid price', 'error');
        return false;
    }
    
    if (!description) {
        showToast('Product description is required', 'error');
        return false;
    }
    
    if (!category) {
        showToast('Please select a category', 'error');
        return false;
    }
    
    if (!selectedImageFile) {
        showToast('Please select a product image', 'error');
        return false;
    }
    
    return true;
}

async function uploadImage(file) {
    try {
        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(fileName, file);
        
        if (error) throw error;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(fileName);
        
        return publicUrl;
        
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image');
    }
}

function updateAdminName() {
    const admin = adminAuthManager.getCurrentAdmin();
    const adminName = document.getElementById('adminName');
    
    if (adminName && admin) {
        const displayName = admin.user_metadata?.full_name || 
                           admin.email?.split('@')[0] || 'Admin';
        adminName.textContent = displayName;
    }
}

function showToast(message, type = 'success') {
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

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add fade-in animation to elements as they come into view
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe elements for fade-in animation
document.addEventListener('DOMContentLoaded', () => {
    const elementsToAnimate = document.querySelectorAll('.bg-white');
    elementsToAnimate.forEach(el => observer.observe(el));
});
