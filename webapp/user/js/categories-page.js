// Categories page functionality
document.addEventListener('DOMContentLoaded', async () => {
    await initializeCategoriesPage();
});

async function initializeCategoriesPage() {
    try {
        // Load all categories
        const categories = await productManager.loadCategories();
        
        if (!categories || categories.length === 0) {
            showEmptyState();
            return;
        }
        
        // Load products for each category
        await renderCategoriesWithProducts(categories);
        
    } catch (error) {
        console.error('Error initializing categories page:', error);
        showErrorState();
    }
}

async function renderCategoriesWithProducts(categories) {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    // Clear loading state
    container.innerHTML = '';
    
    // Render each category with its products
    for (const category of categories) {
        try {
            // Load products for this category
            const { data: products, error } = await supabase
                .from(TABLES.PRODUCTS)
                .select(`
                    *,
                    categories:category_id (
                        id,
                        name
                    )
                `)
                .eq('category_id', category.id)
                .order('created_at', { ascending: false })
                .limit(8);
            
            if (error) throw error;
            
            // Skip empty categories
            if (!products || products.length === 0) continue;
            
            // Create category section
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';
            categorySection.innerHTML = `
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">${category.name}</h2>
                        <p class="text-gray-600">Explore our ${category.name.toLowerCase()} collection</p>
                    </div>
                    <a href="product.html?category=${category.id}" 
                       class="group flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                        <span>View All</span>
                        <svg class="ml-2 w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                        </svg>
                    </a>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="category-${category.id}">
                    <!-- Products will be inserted here -->
                </div>
            `;
            
            container.appendChild(categorySection);
            
            // Render products for this category
            const productContainer = document.getElementById(`category-${category.id}`);
            if (productContainer) {
                productContainer.innerHTML = products.map(product => {
                    // Validate product has ID
                    if (!product.id) {
                        console.error('Product missing ID:', product);
                        return '';
                    }
                    
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
            
        } catch (error) {
            console.error(`Error loading products for category ${category.name}:`, error);
        }
    }
}

function showEmptyState() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center py-12">
            <i class="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-600 mb-2">No categories found</h3>
            <p class="text-gray-500">Check back later for new collections</p>
        </div>
    `;
}

function showErrorState() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center py-12">
            <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-600 mb-2">Something went wrong</h3>
            <p class="text-gray-500 mb-4">Unable to load categories. Please try again later.</p>
            <button onclick="location.reload()" 
                    class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                Retry
            </button>
        </div>
    `;
}
