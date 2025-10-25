// Product listing page functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize the page
    await initializeProductPage();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup view toggle
    setupViewToggle();
    
    // Setup clear filters
    setupClearFilters();
});

async function initializeProductPage() {
    try {
        // Show loading state
        showLoadingState();
        
        // Load categories first
        await productManager.loadCategories();
        
        // Setup filters
        productManager.setupFilters();
        
        // Setup search
        productManager.setupSearch();
        
        // Check for URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = urlParams.get('category');
        const search = urlParams.get('search');
        
        if (categoryId) {
            productManager.currentFilters.category = categoryId;
            document.getElementById('categoryFilter').value = categoryId;
        }
        
        if (search) {
            productManager.currentFilters.search = search;
            document.getElementById('searchInput').value = search;
        }
        
        // Load and render products
        await productManager.loadAndRenderProducts();
        
        // Update products count
        updateProductsCount();
        
        // Hide loading state
        hideLoadingState();
        
    } catch (error) {
        console.error('Error initializing product page:', error);
        showErrorState();
    }
}

function showLoadingState() {
    const container = document.getElementById('productsContainer');
    if (container) {
        container.innerHTML = `
            <div class="col-span-full flex justify-center items-center py-12">
                <div class="loading"></div>
                <span class="ml-2 text-gray-600">Loading products...</span>
            </div>
        `;
    }
}

function hideLoadingState() {
    // Loading state is replaced by actual content
}

function showErrorState() {
    const container = document.getElementById('productsContainer');
    if (container) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">Something went wrong</h3>
                <p class="text-gray-500 mb-4">Unable to load products. Please try again later.</p>
                <button onclick="location.reload()" 
                        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                    Retry
                </button>
            </div>
        `;
    }
}

function updateProductsCount() {
    const countElement = document.getElementById('productsCount');
    if (countElement) {
        const count = productManager.products.length;
        countElement.textContent = `${count} product${count !== 1 ? 's' : ''} found`;
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

function setupViewToggle() {
    const gridViewBtn = document.getElementById('gridView');
    const listViewBtn = document.getElementById('listView');
    const productsContainer = document.getElementById('productsContainer');
    
    if (gridViewBtn && listViewBtn && productsContainer) {
        gridViewBtn.addEventListener('click', () => {
            // Switch to grid view
            gridViewBtn.className = 'p-2 bg-blue-600 text-white rounded-lg';
            listViewBtn.className = 'p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300';
            
            productsContainer.className = 'product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
            
            // Re-render products with grid layout
            productManager.renderProducts(productManager.products, 'productsContainer');
        });
        
        listViewBtn.addEventListener('click', () => {
            // Switch to list view
            listViewBtn.className = 'p-2 bg-blue-600 text-white rounded-lg';
            gridViewBtn.className = 'p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300';
            
            productsContainer.className = 'space-y-4';
            
            // Re-render products with list layout
            renderProductsList(productManager.products, 'productsContainer');
        });
    }
}

function renderProductsList(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                <p class="text-gray-500">Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="bg-white rounded-lg shadow-md p-6 flex items-center space-x-6">
            <img src="${product.image_url}" alt="${product.name}" 
                 class="w-32 h-32 object-cover rounded-lg">
            <div class="flex-1">
                <h3 class="text-xl font-semibold text-gray-800 mb-2">${product.name}</h3>
                <p class="text-sm text-gray-600 mb-2">${product.categories?.name || 'Uncategorized'}</p>
                <p class="text-lg font-bold text-blue-600 mb-4">$${product.price.toFixed(2)}</p>
                <p class="text-gray-600 text-sm line-clamp-2">${product.description || 'No description available'}</p>
            </div>
            <div class="flex flex-col space-y-2">
                <button onclick="cartManager.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300">
                    <i class="fas fa-shopping-cart mr-2"></i>
                    Add to Cart
                </button>
                <a href="product-details.html?id=${product.id}" 
                   class="bg-gray-100 text-gray-800 text-center px-6 py-2 rounded-lg hover:bg-gray-200 transition duration-300">
                    View Details
                </a>
            </div>
        </div>
    `).join('');
}

function setupClearFilters() {
    const clearFiltersBtn = document.getElementById('clearFilters');
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            // Reset all filters
            productManager.currentFilters = {
                category: null,
                search: '',
                sortBy: 'created_at',
                sortOrder: 'desc'
            };
            
            // Reset form elements
            document.getElementById('categoryFilter').value = '';
            document.getElementById('searchInput').value = '';
            document.getElementById('sortFilter').value = 'created_at_desc';
            
            // Reset page and reload
            productManager.currentPage = 1;
            productManager.loadAndRenderProducts();
        });
    }
}

// Override the loadAndRenderProducts method to update count
const originalLoadAndRenderProducts = productManager.loadAndRenderProducts;
productManager.loadAndRenderProducts = async function() {
    await originalLoadAndRenderProducts.call(this);
    updateProductsCount();
};

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
    const elementsToAnimate = document.querySelectorAll('.product-card');
    elementsToAnimate.forEach(el => observer.observe(el));
});
