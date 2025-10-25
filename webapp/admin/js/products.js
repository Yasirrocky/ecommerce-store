// Admin products management functionality
let currentProducts = [];
let currentCategories = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentFilters = {
    search: '',
    category: '',
    status: ''
};

document.addEventListener('DOMContentLoaded', async () => {
    // Check admin authentication
    if (!adminAuthManager.requireAuth()) {
        return;
    }
    
    // Initialize the page
    await initializeProductsPage();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup logout buttons
    setupLogoutButtons();
    
    // Setup filters
    setupFilters();
    
    // Setup delete modal
    setupDeleteModal();
});

async function initializeProductsPage() {
    try {
        // Load categories
        await loadCategories();
        
        // Load products
        await loadProducts();
        
        // Update admin name
        updateAdminName();
        
    } catch (error) {
        console.error('Error initializing products page:', error);
        showToast('Failed to load products', 'error');
    }
}

async function loadCategories() {
    try {
        const { data, error } = await supabase
            .from(TABLES.CATEGORIES)
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        currentCategories = data || [];
        
        // Populate category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.innerHTML = `
                <option value="">All Categories</option>
                ${currentCategories.map(category => `
                    <option value="${category.id}">${category.name}</option>
                `).join('')}
            `;
        }
        
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadProducts() {
    try {
        let query = supabase
            .from(TABLES.PRODUCTS)
            .select(`
                *,
                categories:category_id (
                    id,
                    name
                )
            `);
        
        // Apply filters
        if (currentFilters.search) {
            query = query.ilike('name', `%${currentFilters.search}%`);
        }
        
        if (currentFilters.category) {
            query = query.eq('category_id', currentFilters.category);
        }
        
        // Apply pagination
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        query = query.range(from, to);
        
        // Order by created_at desc
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        currentProducts = data || [];
        renderProductsTable();
        updatePagination();
        
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Failed to load products', 'error');
    }
}

function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    if (currentProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-box text-4xl text-gray-300 mb-4"></i>
                    <p>No products found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = currentProducts.map(product => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-12 w-12">
                        <img class="h-12 w-12 rounded-lg object-cover" src="${product.image_url}" alt="${product.name}">
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${product.name}</div>
                        <div class="text-sm text-gray-500">${product.description?.substring(0, 50)}${product.description?.length > 50 ? '...' : ''}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${product.categories?.name || 'Uncategorized'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                $${product.price.toFixed(2)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${new Date(product.created_at).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                    <a href="edit-product.html?id=${product.id}" class="text-blue-600 hover:text-blue-900">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button onclick="deleteProduct('${product.id}')" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    // Simple pagination - you can enhance this
    pagination.innerHTML = `
        <div class="flex justify-center space-x-2">
            <button onclick="previousPage()" 
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                    ${currentPage === 1 ? 'disabled' : ''}>
                Previous
            </button>
            <span class="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Page ${currentPage}
            </span>
            <button onclick="nextPage()" 
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Next
            </button>
        </div>
    `;
}

function nextPage() {
    currentPage++;
    loadProducts();
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadProducts();
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

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const clearFilters = document.getElementById('clearFilters');
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentFilters.search = e.target.value;
                currentPage = 1;
                loadProducts();
            }, 500);
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            currentPage = 1;
            loadProducts();
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            currentFilters.status = e.target.value;
            currentPage = 1;
            loadProducts();
        });
    }
    
    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            currentFilters = { search: '', category: '', status: '' };
            document.getElementById('searchInput').value = '';
            document.getElementById('categoryFilter').value = '';
            document.getElementById('statusFilter').value = '';
            currentPage = 1;
            loadProducts();
        });
    }
}

function setupDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');
    
    let productToDelete = null;
    
    window.deleteProduct = (productId) => {
        productToDelete = productId;
        deleteModal.classList.remove('hidden');
    };
    
    if (cancelDelete) {
        cancelDelete.addEventListener('click', () => {
            deleteModal.classList.add('hidden');
            productToDelete = null;
        });
    }
    
    if (confirmDelete) {
        confirmDelete.addEventListener('click', async () => {
            if (productToDelete) {
                try {
                    const { error } = await supabase
                        .from(TABLES.PRODUCTS)
                        .delete()
                        .eq('id', productToDelete);
                    
                    if (error) throw error;
                    
                    showToast('Product deleted successfully', 'success');
                    deleteModal.classList.add('hidden');
                    productToDelete = null;
                    
                    // Reload products
                    await loadProducts();
                    
                } catch (error) {
                    console.error('Error deleting product:', error);
                    showToast('Failed to delete product', 'error');
                }
            }
        });
    }
    
    // Close modal when clicking outside
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                deleteModal.classList.add('hidden');
                productToDelete = null;
            }
        });
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
