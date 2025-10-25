// Product details page functionality
let currentProduct = null;
let selectedSize = null;
let quantity = 1;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize the page
    await initializeProductDetails();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup product interactions
    setupProductInteractions();
});

async function initializeProductDetails() {
    try {
        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        console.log('Product ID from URL:', productId);
        console.log('Full URL:', window.location.href);
        
        if (!productId) {
            console.error('No product ID found in URL');
            showErrorState('No product ID provided');
            return;
        }
        
        // Load categories for breadcrumb
        await productManager.loadCategories();
        
        // Load product details
        console.log('Loading product with ID:', productId);
        currentProduct = await productManager.getProductById(productId);
        
        console.log('Loaded product:', currentProduct);
        
        if (!currentProduct) {
            console.error('Product not found for ID:', productId);
            showErrorState('Product not found in database');
            return;
        }
        
        // Render product details
        renderProductDetails(currentProduct);
        // Update SEO tags dynamically
        updateSeoTags(currentProduct);
        
        // Load related products
        await loadRelatedProducts();
        
        // Hide loading state
        hideLoadingState();
        
    } catch (error) {
        console.error('Error initializing product details:', error);
        showErrorState('Error loading product: ' + error.message);
    }
}

function renderProductDetails(product) {
    // Update breadcrumb
    updateBreadcrumb(product);
    
    // Update product image
    const productImage = document.getElementById('productImage');
    if (productImage) {
        productImage.src = product.image_url;
        productImage.alt = product.name;
    }
    
    // Update product info
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productCategory').textContent = product.categories?.name || 'Uncategorized';
    document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('productDescription').textContent = product.description || 'No description available.';
    
    // Show product content
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('productContent').classList.remove('hidden');
}

function updateBreadcrumb(product) {
    const breadcrumbCategory = document.getElementById('breadcrumbCategory');
    const breadcrumbProduct = document.getElementById('breadcrumbProduct');
    
    if (breadcrumbCategory) {
        breadcrumbCategory.textContent = product.categories?.name || 'Category';
    }
    
    if (breadcrumbProduct) {
        breadcrumbProduct.textContent = product.name;
    }
}

// Update SEO meta tags dynamically for product details
function updateSeoTags(product) {
    try {
        const titleBase = 'StyleHub';
        const pageTitle = `${product.name} - ${titleBase}`;
        document.title = pageTitle;

        const description = product.description && product.description.trim().length > 0
            ? product.description.substring(0, 155)
            : `Buy ${product.name} at ${titleBase}. Great price and fast delivery.`;

        const url = new URL(window.location.href);
        const image = product.image_url || 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80';

        setOrCreateMeta('name', 'description', description);
        setOrCreateMeta('property', 'og:type', 'product');
        setOrCreateMeta('property', 'og:title', pageTitle);
        setOrCreateMeta('property', 'og:description', description);
        setOrCreateMeta('property', 'og:url', url.toString());
        setOrCreateMeta('property', 'og:image', image);

        setOrCreateMeta('name', 'twitter:card', 'summary_large_image');
        setOrCreateMeta('name', 'twitter:title', pageTitle);
        setOrCreateMeta('name', 'twitter:description', description);
        setOrCreateMeta('name', 'twitter:image', image);

        // Canonical link
        setOrCreateLink('canonical', url.toString());
    } catch (e) {
        console.warn('SEO tag update failed:', e);
    }
}

function setOrCreateMeta(keyType, keyName, content) {
    let meta = document.querySelector(`meta[${keyType}="${keyName}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(keyType, keyName);
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
}

function setOrCreateLink(rel, href) {
    let link = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
    }
    link.setAttribute('href', href);
}

async function loadRelatedProducts() {
    if (!currentProduct) return;
    
    try {
        const relatedProducts = await productManager.getRelatedProducts(
            currentProduct.id, 
            currentProduct.category_id, 
            4
        );
        
        renderRelatedProducts(relatedProducts);
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

function renderRelatedProducts(products) {
    const container = document.getElementById('relatedProducts');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-500">No related products found.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card bg-white rounded-lg shadow-md overflow-hidden">
            <div class="relative">
                <img src="${product.image_url}" alt="${product.name}" 
                     class="product-image w-full h-64 object-cover">
                <div class="absolute top-2 right-2">
                    <button onclick="cartManager.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                            class="bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition duration-300">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">${product.name}</h3>
                <p class="text-sm text-gray-600 mb-2">${product.categories?.name || 'Uncategorized'}</p>
                <p class="text-lg font-bold text-blue-600">$${product.price.toFixed(2)}</p>
                <a href="product-details.html?id=${product.id}" 
                   class="block mt-3 bg-gray-100 text-gray-800 text-center py-2 rounded-lg hover:bg-gray-200 transition duration-300">
                    View Details
                </a>
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

function setupProductInteractions() {
    // Size selection
    const sizeButtons = document.querySelectorAll('.size-btn');
    sizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            sizeButtons.forEach(btn => {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('border-gray-300', 'text-gray-700');
            });
            
            // Add active class to clicked button
            button.classList.add('bg-blue-600', 'text-white');
            button.classList.remove('border-gray-300', 'text-gray-700');
            
            selectedSize = button.dataset.size;
        });
    });
    
    // Quantity controls
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');
    const quantityDisplay = document.getElementById('quantity');
    
    if (decreaseBtn && increaseBtn && quantityDisplay) {
        decreaseBtn.addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                quantityDisplay.textContent = quantity;
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            quantity++;
            quantityDisplay.textContent = quantity;
        });
    }
    
    // Add to cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            if (!currentProduct) return;
            
            // Check if size is selected (optional for some products)
            if (selectedSize) {
                cartManager.addToCart(currentProduct, quantity, selectedSize);
            } else {
                cartManager.addToCart(currentProduct, quantity);
            }
            
            // Show success message
            showToast(`${currentProduct.name} added to cart!`, 'success');
        });
    }
}

function showLoadingState() {
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('errorState').classList.add('hidden');
    document.getElementById('productContent').classList.add('hidden');
}

function hideLoadingState() {
    document.getElementById('loadingState').classList.add('hidden');
}

function showErrorState(message = 'Product not found') {
    document.getElementById('loadingState').classList.add('hidden');
    const errorState = document.getElementById('errorState');
    errorState.classList.remove('hidden');
    document.getElementById('productContent').classList.add('hidden');
    
    // Update error message if element exists
    const errorMessage = errorState.querySelector('p');
    if (errorMessage && message) {
        errorMessage.textContent = message;
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
    const elementsToAnimate = document.querySelectorAll('.product-card');
    elementsToAnimate.forEach(el => observer.observe(el));
});
