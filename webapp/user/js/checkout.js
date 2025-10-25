// Checkout page functionality
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Wait for auth to initialize and check authentication
        const isAuth = await authManager.isAuthenticated();
        if (!isAuth) {
            console.log('User not authenticated, redirecting to login');
            window.location.href = 'login.html';
            return;
        }
        
        // Check if cart is empty
        if (cartManager.getCartItems().length === 0) {
            console.log('Cart is empty, redirecting to cart page');
            window.location.href = 'cart.html';
            return;
        }
        
        // Initialize the page
        await initializeCheckoutPage();
        
        // Setup mobile menu
        setupMobileMenu();
        
        // Setup form interactions
        setupFormInteractions();
        
        // Setup place order button
        setupPlaceOrderButton();
    } catch (error) {
        console.error('Error initializing checkout page:', error);
        showToast('Failed to load checkout page. Please try again.', 'error');
    }
});

async function initializeCheckoutPage() {
    try {
        // Load categories for navigation
        await productManager.loadCategories();
        
        // Populate user information
        populateUserInfo();
        
        // Load checkout items
        loadCheckoutItems();
        
        // Calculate and display totals
        updateOrderSummary();
        
    } catch (error) {
        console.error('Error initializing checkout page:', error);
    }
}

function populateUserInfo() {
    const user = authManager.getCurrentUser();
    if (user) {
        // Pre-fill email if available
        const emailField = document.getElementById('email');
        if (emailField && user.email) {
            emailField.value = user.email;
        }
        
        // Pre-fill name if available
        const firstNameField = document.getElementById('firstName');
        const lastNameField = document.getElementById('lastName');
        if (user.user_metadata?.full_name) {
            const nameParts = user.user_metadata.full_name.split(' ');
            if (firstNameField && nameParts[0]) {
                firstNameField.value = nameParts[0];
            }
            if (lastNameField && nameParts[1]) {
                lastNameField.value = nameParts.slice(1).join(' ');
            }
        }
    }
}

function loadCheckoutItems() {
    const container = document.getElementById('checkoutItems');
    const cartItems = cartManager.getCartItems();
    
    if (!container) return;
    
    container.innerHTML = cartItems.map(item => `
        <div class="flex items-center space-x-4">
            <img src="${item.image_url}" alt="${item.name}" 
                 class="w-16 h-16 object-cover rounded-lg">
            <div class="flex-1">
                <h3 class="text-sm font-semibold text-gray-800">${item.name}</h3>
                ${item.size ? `<p class="text-xs text-gray-600">Size: ${item.size}</p>` : ''}
                <p class="text-sm text-gray-600">Qty: ${item.quantity}</p>
            </div>
            <p class="text-sm font-semibold text-gray-800">$${(item.price * item.quantity).toFixed(2)}</p>
        </div>
    `).join('');
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

function setupFormInteractions() {
    // Payment method toggle
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const cardPayment = document.getElementById('cardPayment');
    const paypalPayment = document.getElementById('paypalPayment');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', () => {
            if (method.value === 'card') {
                cardPayment.classList.remove('hidden');
                paypalPayment.classList.add('hidden');
            } else if (method.value === 'paypal') {
                cardPayment.classList.add('hidden');
                paypalPayment.classList.remove('hidden');
            }
        });
    });
    
    // Card number formatting
    const cardNumberField = document.getElementById('cardNumber');
    if (cardNumberField) {
        cardNumberField.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            if (formattedValue !== e.target.value) {
                e.target.value = formattedValue;
            }
        });
    }
    
    // Expiry date formatting
    const expiryDateField = document.getElementById('expiryDate');
    if (expiryDateField) {
        expiryDateField.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // CVV formatting
    const cvvField = document.getElementById('cvv');
    if (cvvField) {
        cvvField.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        });
    }
}

function setupPlaceOrderButton() {
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const checkoutForm = document.getElementById('checkoutForm');
    
    if (placeOrderBtn && checkoutForm) {
        placeOrderBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Validate form
            if (!validateForm()) {
                return;
            }
            
            // Show loading state
            placeOrderBtn.disabled = true;
            placeOrderBtn.innerHTML = '<div class="loading"></div> Processing...';
            
            try {
                // Create order
                await cartManager.createOrder();
                
                // Show success message
                showToast('Order placed successfully!', 'success');
                
                // Redirect to profile page
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 2000);
                
            } catch (error) {
                console.error('Order placement error:', error);
                showToast('Failed to place order. Please try again.', 'error');
                
                // Reset button
                placeOrderBtn.disabled = false;
                placeOrderBtn.innerHTML = 'Place Order';
            }
        });
    }
}

function validateForm() {
    const form = document.getElementById('checkoutForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    // Clear previous error states
    requiredFields.forEach(field => {
        field.classList.remove('border-red-500');
    });
    
    // Validate required fields
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('border-red-500');
            isValid = false;
        }
    });
    
    // Validate email format
    const emailField = document.getElementById('email');
    if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            emailField.classList.add('border-red-500');
            isValid = false;
            showToast('Please enter a valid email address', 'error');
        }
    }
    
    // Validate card information if card payment is selected
    const cardPayment = document.querySelector('input[name="paymentMethod"]:checked');
    if (cardPayment && cardPayment.value === 'card') {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardName = document.getElementById('cardName').value;
        
        if (cardNumber.length < 13 || cardNumber.length > 19) {
            document.getElementById('cardNumber').classList.add('border-red-500');
            isValid = false;
            showToast('Please enter a valid card number', 'error');
        }
        
        if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
            document.getElementById('expiryDate').classList.add('border-red-500');
            isValid = false;
            showToast('Please enter a valid expiry date (MM/YY)', 'error');
        }
        
        if (cvv.length < 3 || cvv.length > 4) {
            document.getElementById('cvv').classList.add('border-red-500');
            isValid = false;
            showToast('Please enter a valid CVV', 'error');
        }
        
        if (!cardName.trim()) {
            document.getElementById('cardName').classList.add('border-red-500');
            isValid = false;
            showToast('Please enter the name on card', 'error');
        }
    }
    
    if (!isValid) {
        showToast('Please fill in all required fields correctly', 'error');
    }
    
    return isValid;
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
