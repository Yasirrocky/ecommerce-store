// Admin categories management functionality
let currentCategories = [];
let editingCategoryId = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Check admin authentication
    if (!adminAuthManager.requireAuth()) {
        return;
    }
    
    // Initialize the page
    await initializeCategoriesPage();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup logout buttons
    setupLogoutButtons();
    
    // Setup modals
    setupModals();
});

async function initializeCategoriesPage() {
    try {
        // Load categories
        await loadCategories();
        
        // Update admin name
        updateAdminName();
        
    } catch (error) {
        console.error('Error initializing categories page:', error);
        showToast('Failed to load categories', 'error');
    }
}

async function loadCategories() {
    try {
        const { data, error } = await supabase
            .from(TABLES.CATEGORIES)
            .select(`
                *,
                products:products(count)
            `)
            .order('name');
        
        if (error) throw error;
        
        currentCategories = data || [];
        renderCategories();
        
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Failed to load categories', 'error');
    }
}

function renderCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;
    
    if (currentCategories.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-tags text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">No categories yet</h3>
                <p class="text-gray-500 mb-6">Create your first category to get started!</p>
                <button onclick="openAddCategoryModal()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                    Add Category
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = currentCategories.map(category => `
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold text-gray-800">${category.name}</h3>
                <div class="flex space-x-2">
                    <button onclick="editCategory('${category.id}')" class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteCategory('${category.id}')" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="text-sm text-gray-600 mb-4">
                <div class="flex items-center">
                    <i class="fas fa-box mr-2"></i>
                    <span>${category.products?.[0]?.count || 0} products</span>
                </div>
            </div>
            
            <div class="text-xs text-gray-500">
                Created: ${new Date(category.created_at).toLocaleDateString()}
            </div>
        </div>
    `).join('');
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

function setupModals() {
    // Add category button
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', openAddCategoryModal);
    }
    
    // Category modal
    const categoryModal = document.getElementById('categoryModal');
    const closeModal = document.getElementById('closeModal');
    const cancelCategory = document.getElementById('cancelCategory');
    const categoryForm = document.getElementById('categoryForm');
    
    if (closeModal) {
        closeModal.addEventListener('click', closeCategoryModal);
    }
    
    if (cancelCategory) {
        cancelCategory.addEventListener('click', closeCategoryModal);
    }
    
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }
    
    // Close modal when clicking outside
    if (categoryModal) {
        categoryModal.addEventListener('click', (e) => {
            if (e.target === categoryModal) {
                closeCategoryModal();
            }
        });
    }
    
    // Delete modal
    const deleteModal = document.getElementById('deleteModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');
    
    let categoryToDelete = null;
    
    window.deleteCategory = (categoryId) => {
        categoryToDelete = categoryId;
        deleteModal.classList.remove('hidden');
    };
    
    if (cancelDelete) {
        cancelDelete.addEventListener('click', () => {
            deleteModal.classList.add('hidden');
            categoryToDelete = null;
        });
    }
    
    if (confirmDelete) {
        confirmDelete.addEventListener('click', async () => {
            if (categoryToDelete) {
                try {
                    const { error } = await supabase
                        .from(TABLES.CATEGORIES)
                        .delete()
                        .eq('id', categoryToDelete);
                    
                    if (error) throw error;
                    
                    showToast('Category deleted successfully', 'success');
                    deleteModal.classList.add('hidden');
                    categoryToDelete = null;
                    
                    // Reload categories
                    await loadCategories();
                    
                } catch (error) {
                    console.error('Error deleting category:', error);
                    showToast('Failed to delete category', 'error');
                }
            }
        });
    }
    
    // Close delete modal when clicking outside
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                deleteModal.classList.add('hidden');
                categoryToDelete = null;
            }
        });
    }
}

function openAddCategoryModal() {
    editingCategoryId = null;
    document.getElementById('modalTitle').textContent = 'Add Category';
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryModal').classList.remove('hidden');
}

function editCategory(categoryId) {
    const category = currentCategories.find(cat => cat.id === categoryId);
    if (!category) return;
    
    editingCategoryId = categoryId;
    document.getElementById('modalTitle').textContent = 'Edit Category';
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryModal').classList.remove('hidden');
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.add('hidden');
    editingCategoryId = null;
    document.getElementById('categoryName').value = '';
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const categoryName = document.getElementById('categoryName').value.trim();
    
    if (!categoryName) {
        showToast('Please enter a category name', 'error');
        return;
    }
    
    try {
        if (editingCategoryId) {
            // Update existing category
            const { error } = await supabase
                .from(TABLES.CATEGORIES)
                .update({ name: categoryName })
                .eq('id', editingCategoryId);
            
            if (error) throw error;
            
            showToast('Category updated successfully', 'success');
        } else {
            // Create new category
            const { error } = await supabase
                .from(TABLES.CATEGORIES)
                .insert([{ name: categoryName }]);
            
            if (error) throw error;
            
            showToast('Category created successfully', 'success');
        }
        
        closeCategoryModal();
        await loadCategories();
        
    } catch (error) {
        console.error('Error saving category:', error);
        showToast(error.message || 'Failed to save category', 'error');
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
