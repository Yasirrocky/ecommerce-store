// Collections View with Auto-Sliding Images
let collections = [];
let slideshows = {};

// Load collections on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadCollections();
});

// Load all active collections with their products
async function loadCollections() {
    try {
        // Get active collections
        const { data: collectionsData, error: collectionsError } = await supabase
            .from('collections')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (collectionsError) throw collectionsError;

        collections = collectionsData || [];

        // Load products for each collection
        for (const collection of collections) {
            const { data: productsData, error: productsError } = await supabase
                .from('collection_products')
                .select('product_id, display_order')
                .eq('collection_id', collection.id)
                .order('display_order', { ascending: true });

            if (productsError) {
                console.error('Error loading collection products:', productsError);
                collection.products = [];
                continue;
            }

            // Fetch full product details for each product_id
            if (productsData && productsData.length > 0) {
                const productIds = productsData.map(cp => cp.product_id);
                const { data: products, error: productError } = await supabase
                    .from('products')
                    .select('id, name, description, price, image_url')
                    .in('id', productIds);

                if (productError) {
                    console.error('Error loading products:', productError);
                    collection.products = [];
                } else {
                    // Sort products according to display_order
                    const productMap = {};
                    products.forEach(p => productMap[p.id] = p);
                    collection.products = productsData
                        .map(cp => productMap[cp.product_id])
                        .filter(p => p);
                }
            } else {
                collection.products = [];
            }
        }

        displayCollections();
    } catch (error) {
        console.error('Error loading collections:', error);
        showError();
    }
}

// Display collections
function displayCollections() {
    const container = document.getElementById('collectionsContainer');

    if (collections.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16">
                <i class="fas fa-layer-group text-gray-300 text-6xl mb-4"></i>
                <p class="text-gray-500 text-xl">No collections available at the moment.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = collections.map((collection, index) => {
        const hasProducts = collection.products && collection.products.length > 0;
        
        return `
            <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
                <!-- Collection Header -->
                <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                    <h2 class="text-3xl font-bold mb-2">${collection.name}</h2>
                    <p class="text-blue-100">${collection.description || ''}</p>
                </div>

                <!-- Products Slideshow -->
                ${hasProducts ? `
                    <div class="p-8">
                        <div class="slideshow-container" id="slideshow-${collection.id}">
                            ${collection.products.map((product, productIndex) => `
                                <div class="slide ${productIndex === 0 ? 'active' : ''}" data-index="${productIndex}">
                                    ${product.image_url ? 
                                        `<img src="${product.image_url}" alt="${product.name}">` :
                                        `<div class="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <i class="fas fa-image text-gray-400 text-6xl"></i>
                                        </div>`
                                    }
                                    <div class="product-overlay">
                                        <h3 class="text-2xl font-bold mb-2">${product.name}</h3>
                                        <p class="text-gray-200 mb-3">${product.description || ''}</p>
                                        <div class="flex items-center justify-between">
                                            <span class="text-3xl font-bold">$${parseFloat(product.price).toFixed(2)}</span>
                                            <a href="product-details.html?id=${product.id}" class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300">
                                                View Details <i class="fas fa-arrow-right ml-2"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}

                            <!-- Navigation Buttons -->
                            ${collection.products.length > 1 ? `
                                <button class="slide-nav prev" onclick="changeSlide('${collection.id}', -1)">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button class="slide-nav next" onclick="changeSlide('${collection.id}', 1)">
                                    <i class="fas fa-chevron-right"></i>
                                </button>

                                <!-- Indicators -->
                                <div class="slide-indicators">
                                    ${collection.products.map((_, i) => `
                                        <span class="indicator ${i === 0 ? 'active' : ''}" onclick="goToSlide('${collection.id}', ${i})"></span>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>

                        <!-- Product Grid -->
                        <div class="mt-8">
                            <h3 class="text-xl font-bold text-gray-800 mb-4">All Products in this Collection</h3>
                            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                ${collection.products.map(product => `
                                    <a href="product-details.html?id=${product.id}" class="group">
                                        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                                            <div class="aspect-square bg-gray-200 overflow-hidden">
                                                ${product.image_url ? 
                                                    `<img src="${product.image_url}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">` :
                                                    `<div class="w-full h-full flex items-center justify-center">
                                                        <i class="fas fa-image text-gray-400 text-3xl"></i>
                                                    </div>`
                                                }
                                            </div>
                                            <div class="p-3">
                                                <h4 class="font-semibold text-gray-800 text-sm mb-1 truncate">${product.name}</h4>
                                                <p class="text-blue-600 font-bold">$${parseFloat(product.price).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : `
                    <div class="p-8 text-center text-gray-500">
                        <i class="fas fa-box-open text-4xl mb-3"></i>
                        <p>No products in this collection yet.</p>
                    </div>
                `}
            </div>
        `;
    }).join('');

    // Initialize slideshows
    collections.forEach(collection => {
        if (collection.products && collection.products.length > 1) {
            initSlideshow(collection.id, collection.products.length);
        }
    });
}

// Initialize slideshow with auto-play
function initSlideshow(collectionId, productCount) {
    slideshows[collectionId] = {
        currentIndex: 0,
        productCount: productCount,
        interval: null
    };

    // Start auto-play (change slide every 5 seconds)
    startAutoPlay(collectionId);
}

// Start auto-play
function startAutoPlay(collectionId) {
    const slideshow = slideshows[collectionId];
    if (!slideshow) return;

    // Clear any existing interval
    if (slideshow.interval) {
        clearInterval(slideshow.interval);
    }

    // Set new interval
    slideshow.interval = setInterval(() => {
        changeSlide(collectionId, 1);
    }, 5000); // Change every 5 seconds
}

// Stop auto-play
function stopAutoPlay(collectionId) {
    const slideshow = slideshows[collectionId];
    if (slideshow && slideshow.interval) {
        clearInterval(slideshow.interval);
        slideshow.interval = null;
    }
}

// Change slide
function changeSlide(collectionId, direction) {
    const slideshow = slideshows[collectionId];
    if (!slideshow) return;

    const container = document.getElementById(`slideshow-${collectionId}`);
    const slides = container.querySelectorAll('.slide');
    const indicators = container.querySelectorAll('.indicator');

    // Remove active class from current slide
    slides[slideshow.currentIndex].classList.remove('active');
    indicators[slideshow.currentIndex].classList.remove('active');

    // Calculate new index
    slideshow.currentIndex = (slideshow.currentIndex + direction + slideshow.productCount) % slideshow.productCount;

    // Add active class to new slide
    slides[slideshow.currentIndex].classList.add('active');
    indicators[slideshow.currentIndex].classList.add('active');

    // Restart auto-play
    startAutoPlay(collectionId);
}

// Go to specific slide
function goToSlide(collectionId, index) {
    const slideshow = slideshows[collectionId];
    if (!slideshow) return;

    const container = document.getElementById(`slideshow-${collectionId}`);
    const slides = container.querySelectorAll('.slide');
    const indicators = container.querySelectorAll('.indicator');

    // Remove active class from current slide
    slides[slideshow.currentIndex].classList.remove('active');
    indicators[slideshow.currentIndex].classList.remove('active');

    // Set new index
    slideshow.currentIndex = index;

    // Add active class to new slide
    slides[slideshow.currentIndex].classList.add('active');
    indicators[slideshow.currentIndex].classList.add('active');

    // Restart auto-play
    startAutoPlay(collectionId);
}

// Pause slideshow on hover
document.addEventListener('mouseover', (e) => {
    const slideshow = e.target.closest('.slideshow-container');
    if (slideshow) {
        const collectionId = slideshow.id.replace('slideshow-', '');
        stopAutoPlay(collectionId);
    }
});

// Resume slideshow on mouse leave
document.addEventListener('mouseout', (e) => {
    const slideshow = e.target.closest('.slideshow-container');
    if (slideshow) {
        const collectionId = slideshow.id.replace('slideshow-', '');
        startAutoPlay(collectionId);
    }
});

// Show error message
function showError() {
    const container = document.getElementById('collectionsContainer');
    container.innerHTML = `
        <div class="text-center py-16">
            <i class="fas fa-exclamation-triangle text-red-500 text-6xl mb-4"></i>
            <p class="text-gray-600 text-xl">Error loading collections. Please try again later.</p>
        </div>
    `;
}

// Clean up intervals when leaving page
window.addEventListener('beforeunload', () => {
    Object.keys(slideshows).forEach(collectionId => {
        stopAutoPlay(collectionId);
    });
});
