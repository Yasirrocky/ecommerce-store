// Homepage functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize the page
    await initializeHomepage();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup newsletter signup
    setupNewsletter();
});

async function initializeHomepage() {
    try {
        // Show loading state
        showLoadingState();
        
        // Load categories and products in parallel
        const [categories, featuredProducts] = await Promise.all([
            productManager.loadCategories(),
            productManager.loadFeaturedProducts(8)
        ]);
        
        // Render categories
        productManager.renderCategories(categories.slice(0, 4), 'featuredCategories');
        
        // Render featured products
        productManager.renderProducts(featuredProducts, 'featuredProducts');
        
        // Hide loading state
        hideLoadingState();
        
    } catch (error) {
        console.error('Error initializing homepage:', error);
        showErrorState();
    }
}

function showLoadingState() {
    const containers = ['featuredCategories', 'featuredProducts'];
    containers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = `
                <div class="col-span-full flex justify-center items-center py-12">
                    <div class="loading"></div>
                    <span class="ml-2 text-gray-600">Loading...</span>
                </div>
            `;
        }
    });
}

function hideLoadingState() {
    // Loading states are replaced by actual content
}

function showErrorState() {
    const containers = ['featuredCategories', 'featuredProducts'];
    containers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">Something went wrong</h3>
                    <p class="text-gray-500 mb-4">Unable to load content. Please try again later.</p>
                    <button onclick="location.reload()" 
                            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                        Retry
                    </button>
                </div>
            `;
        }
    });
}

function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    const mobileSearchOverlay = document.getElementById('mobileSearchOverlay');
    const closeMobileSearch = document.getElementById('closeMobileSearch');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('mobile-menu-enter');
        });
    }
    
    // Mobile search functionality
    if (mobileSearchBtn && mobileSearchOverlay) {
        mobileSearchBtn.addEventListener('click', () => {
            mobileSearchOverlay.classList.remove('hidden');
            mobileSearchInput.focus();
        });
    }
    
    if (closeMobileSearch && mobileSearchOverlay) {
        closeMobileSearch.addEventListener('click', () => {
            mobileSearchOverlay.classList.add('hidden');
        });
    }
    
    // Close mobile search on escape key
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                mobileSearchOverlay.classList.add('hidden');
            }
        });
    }
}

function setupNewsletter() {
    const newsletterBtn = document.getElementById('newsletterBtn');
    const newsletterEmail = document.getElementById('newsletterEmail');
    
    if (newsletterBtn && newsletterEmail) {
        newsletterBtn.addEventListener('click', async () => {
            const email = newsletterEmail.value.trim();
            
            if (!email) {
                showToast('Please enter your email address', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate newsletter signup
            newsletterBtn.innerHTML = '<div class="loading"></div>';
            newsletterBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                newsletterBtn.innerHTML = 'Subscribe';
                newsletterBtn.disabled = false;
                newsletterEmail.value = '';
                showToast('Thank you for subscribing to our newsletter!', 'success');
            }, 1500);
        });
        
        // Allow Enter key to submit
        newsletterEmail.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                newsletterBtn.click();
            }
        });
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

// Add smooth scrolling for anchor links
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
    const elementsToAnimate = document.querySelectorAll('.product-card, .category-card');
    elementsToAnimate.forEach(el => observer.observe(el));
});
