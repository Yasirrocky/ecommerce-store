// Cart page functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize the page
    await initializeCartPage();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup checkout button
    setupCheckoutButton();
});

async function initializeCartPage() {
    try {
        // Load categories for navigation
        await productManager.loadCategories();
        
        // Update cart UI
        cartManager.updateCartUI();
        
        // Calculate and display totals
        updateOrderSummary();
        
    } catch (error) {
        console.error('Error initializing cart page:', error);
    }
}

function updateOrderSummary() {
    const cartItems = cartManager.getCartItems();
    const subtotal = cartManager.getCartTotal();
    
    // Calculate shipping (free over $50)
    const shipping = subtotal >= 50 ? 0 : 9.99;
    
    // Calculate tax (8.5%)
    const tax = subtotal * 0.085;
    
    // Calculate total
    const total = subtotal + shipping + tax;
    
    // Update display
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    
    // Update checkout button state
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        if (cartItems.length === 0) {
            checkoutBtn.disabled = true;
            checkoutBtn.textContent = 'Cart is Empty';
            checkoutBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
            checkoutBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Proceed to Checkout';
            checkoutBtn.classList.remove('bg-gray-400', 'cursor-not-allowed');
            checkoutBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        }
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

function setupCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            // Check if user is authenticated
            const isAuth = await authManager.isAuthenticated();
            if (!isAuth) {
                showToast('Please log in to proceed with checkout', 'warning');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
            
            // Check if cart is empty
            if (cartManager.getCartItems().length === 0) {
                showToast('Your cart is empty!', 'error');
                return;
            }
            
            // Redirect to checkout
            window.location.href = 'checkout.html';
        });
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

// Override cart manager's updateCartPage method to also update order summary
const originalUpdateCartPage = cartManager.updateCartPage;
cartManager.updateCartPage = function() {
    originalUpdateCartPage.call(this);
    updateOrderSummary();
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
