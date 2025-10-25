// Product management functions
class ProductManager {
    constructor() {
        this.products = [];
        this.categories = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentFilters = {
            category: null,
            search: '',
            sortBy: 'created_at',
            sortOrder: 'desc'
        };
    }

    async loadCategories() {
        try {
            const { data, error } = await supabase
                .from(TABLES.CATEGORIES)
                .select('*')
                .order('name');

            if (error) throw error;

            this.categories = data || [];
            this.updateCategoryDropdowns();
            return this.categories;
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showToast('Failed to load categories', 'error');
            return [];
        }
    }

    async loadProducts(filters = {}) {
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
            if (filters.category) {
                query = query.eq('category_id', filters.category);
            }

            if (filters.search) {
                query = query.ilike('name', `%${filters.search}%`);
            }

            // Apply sorting
            const sortBy = filters.sortBy || this.currentFilters.sortBy;
            const sortOrder = filters.sortOrder || this.currentFilters.sortOrder;
            query = query.order(sortBy, { ascending: sortOrder === 'asc' });

            // Apply pagination
            const page = filters.page || this.currentPage;
            const from = (page - 1) * this.itemsPerPage;
            const to = from + this.itemsPerPage - 1;
            query = query.range(from, to);

            const { data, error } = await query;

            if (error) throw error;

            this.products = data || [];
            return this.products;
        } catch (error) {
            console.error('Error loading products:', error);
            this.showToast('Failed to load products', 'error');
            return [];
        }
    }

    async loadFeaturedProducts(limit = 8) {
        try {
            const { data, error } = await supabase
                .from(TABLES.PRODUCTS)
                .select(`
                    *,
                    categories:category_id (
                        id,
                        name
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('Error loading featured products:', error);
            return [];
        }
    }

    async getProductById(id) {
        try {
            const { data, error } = await supabase
                .from(TABLES.PRODUCTS)
                .select(`
                    *,
                    categories:category_id (
                        id,
                        name
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error loading product:', error);
            this.showToast('Product not found', 'error');
            return null;
        }
    }

    async getRelatedProducts(productId, categoryId, limit = 4) {
        try {
            const { data, error } = await supabase
                .from(TABLES.PRODUCTS)
                .select(`
                    *,
                    categories:category_id (
                        id,
                        name
                    )
                `)
                .eq('category_id', categoryId)
                .neq('id', productId)
                .limit(limit);

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('Error loading related products:', error);
            return [];
        }
    }

    updateCategoryDropdowns() {
        // Update desktop categories dropdown
        const categoriesDropdown = document.getElementById('categoriesDropdown');
        const mobileCategories = document.getElementById('mobileCategories');

        if (categoriesDropdown) {
            categoriesDropdown.innerHTML = this.categories.map(category => `
                <a href="product.html?category=${category.id}" 
                   class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    ${category.name}
                </a>
            `).join('');
        }

        if (mobileCategories) {
            mobileCategories.innerHTML = this.categories.map(category => `
                <a href="product.html?category=${category.id}" 
                   class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    ${category.name}
                </a>
            `).join('');
        }
    }

    renderProducts(products, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        console.log('Rendering products:', products.length, 'products');
        console.log('First product sample:', products[0]);

        if (products.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                    <p class="text-gray-500">Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => {
            // Validate product has ID
            if (!product.id) {
                console.error('Product missing ID:', product);
                return '';
            }
            
            console.log('Rendering product:', product.name, 'ID:', product.id);
            
            return `
            <div class="product-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300" 
                 data-product-id="${product.id}">
                <a href="product-details.html?id=${product.id}" class="block">
                    <div class="relative">
                        <img src="${product.image_url}" alt="${product.name}" 
                             class="product-image w-full h-64 object-cover" loading="lazy" decoding="async" width="800" height="256">
                        <div class="absolute top-2 right-2">
                            <button onclick="event.preventDefault(); event.stopPropagation(); cartManager.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')});" 
                                    class="bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition duration-300">
                                <i class="fas fa-shopping-cart"></i>
                            </button>
                        </div>
                    </div>
                    <div class="p-4">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">${product.name}</h3>
                        <p class="text-sm text-gray-600 mb-2">${product.categories?.name || 'Uncategorized'}</p>
                        <p class="text-lg font-bold text-blue-600">$${product.price.toFixed(2)}</p>
                    </div>
                </a>
            </div>
        `;
        }).filter(html => html !== '').join('');
    }

    renderCategories(categories, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = categories.map(category => `
            <div class="category-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                 onclick="window.location.href='product.html?category=${category.id}'">
                <div class="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <h3 class="text-2xl font-bold text-white">${category.name}</h3>
                </div>
                <div class="p-4">
                    <p class="text-gray-600 text-center">Shop ${category.name}</p>
                </div>
            </div>
        `).join('');
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentFilters.search = e.target.value;
                    this.loadAndRenderProducts();
                }, 500);
            });
        }
    }

    setupFilters() {
        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.innerHTML = `
                <option value="">All Categories</option>
                ${this.categories.map(category => `
                    <option value="${category.id}">${category.name}</option>
                `).join('')}
            `;

            categoryFilter.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value || null;
                this.currentPage = 1;
                this.loadAndRenderProducts();
            });
        }

        // Sort filter
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                const [sortBy, sortOrder] = e.target.value.split('_');
                this.currentFilters.sortBy = sortBy;
                this.currentFilters.sortOrder = sortOrder;
                this.currentPage = 1;
                this.loadAndRenderProducts();
            });
        }
    }

    async loadAndRenderProducts() {
        const products = await this.loadProducts(this.currentFilters);
        this.renderProducts(products, 'productsContainer');
        this.updatePagination();
    }

    updatePagination() {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;

        // Simple pagination - you can enhance this
        paginationContainer.innerHTML = `
            <div class="flex justify-center space-x-2">
                <button onclick="productManager.previousPage()" 
                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                    Previous
                </button>
                <span class="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    Page ${this.currentPage}
                </span>
                <button onclick="productManager.nextPage()" 
                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                    Next
                </button>
            </div>
        `;
    }

    nextPage() {
        this.currentPage++;
        this.loadAndRenderProducts();
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadAndRenderProducts();
        }
    }

    showToast(message, type = 'success') {
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
}

// Initialize product manager
const productManager = new ProductManager();

// Export for use in other files
window.productManager = productManager;

// Global navigation function for product cards
window.navigateToProduct = function(productId) {
    if (!productId) {
        console.error('No product ID provided to navigateToProduct');
        return;
    }
    console.log('Navigating to product:', productId);
    window.location.href = `product-details.html?id=${productId}`;
};
