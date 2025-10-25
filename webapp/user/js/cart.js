// Shopping cart management
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.updateCartUI();
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    addToCart(product, quantity = 1, size = null) {
        const existingItem = this.cart.find(item => 
            item.id === product.id && item.size === size
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                quantity,
                size
            });
        }

        this.saveCart();
        this.updateCartUI();
        this.showToast(`${product.name} added to cart!`, 'success');
    }

    removeFromCart(productId, size = null) {
        this.cart = this.cart.filter(item => 
            !(item.id === productId && item.size === size)
        );
        this.saveCart();
        this.updateCartUI();
    }

    updateQuantity(productId, quantity, size = null) {
        const item = this.cart.find(item => 
            item.id === productId && item.size === size
        );

        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId, size);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartUI();
            }
        }
    }

    getCartItems() {
        return this.cart;
    }

    getCartCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
    }

    updateCartUI() {
        // Update cart count in navigation
        const cartCount = document.getElementById('cartCount');
        const mobileCartCount = document.getElementById('mobileCartCount');
        const mobileCartCountMenu = document.getElementById('mobileCartCountMenu');
        
        const count = this.getCartCount();
        
        if (cartCount) {
            cartCount.textContent = count;
            cartCount.classList.toggle('hidden', count === 0);
        }
        
        if (mobileCartCount) {
            mobileCartCount.textContent = count;
            mobileCartCount.classList.toggle('hidden', count === 0);
        }
        
        if (mobileCartCountMenu) {
            mobileCartCountMenu.textContent = count;
            mobileCartCountMenu.classList.toggle('hidden', count === 0);
        }

        // Update cart page if it exists
        this.updateCartPage();
    }

    updateCartPage() {
        const cartContainer = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const cartCount = document.getElementById('cartCount');

        if (!cartContainer) return;

        if (this.cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
                    <p class="text-gray-500 mb-6">Add some products to get started!</p>
                    <a href="product.html" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                        Continue Shopping
                    </a>
                </div>
            `;
            if (cartTotal) cartTotal.textContent = '$0.00';
            if (cartCount) cartCount.textContent = '0';
            return;
        }

        cartContainer.innerHTML = this.cart.map(item => `
            <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <img src="${item.image_url}" alt="${item.name}" 
                         class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0">
                    <div class="flex-1 min-w-0">
                        <h3 class="text-base sm:text-lg font-semibold text-gray-800 truncate">${item.name}</h3>
                        ${item.size ? `<p class="text-xs sm:text-sm text-gray-600">Size: ${item.size}</p>` : ''}
                        <p class="text-base sm:text-lg font-bold text-blue-600">$${item.price.toFixed(2)}</p>
                    </div>
                    <div class="flex items-center space-x-2 w-full sm:w-auto">
                        <button onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1}, '${item.size || ''}')" 
                                class="bg-gray-200 hover:bg-gray-300 text-gray-700 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center">
                            <i class="fas fa-minus text-xs sm:text-sm"></i>
                        </button>
                        <span class="text-base sm:text-lg font-semibold w-6 sm:w-8 text-center">${item.quantity}</span>
                        <button onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1}, '${item.size || ''}')" 
                                class="bg-gray-200 hover:bg-gray-300 text-gray-700 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center">
                            <i class="fas fa-plus text-xs sm:text-sm"></i>
                        </button>
                        <button onclick="cartManager.removeFromCart('${item.id}', '${item.size || ''}')" 
                                class="text-red-500 hover:text-red-700 ml-2 sm:ml-4 p-1">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        if (cartTotal) {
            cartTotal.textContent = `$${this.getCartTotal().toFixed(2)}`;
        }
        if (cartCount) {
            cartCount.textContent = this.getCartCount().toString();
        }
    }

    async createOrder() {
        // Check authentication
        const isAuth = await authManager.isAuthenticated();
        if (!isAuth) {
            console.log('User not authenticated during order creation');
            this.showToast('Please log in to complete your order', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        if (this.cart.length === 0) {
            this.showToast('Your cart is empty!', 'error');
            return;
        }

        try {
            const currentUser = authManager.getCurrentUser();
            if (!currentUser || !currentUser.id) {
                throw new Error('User session expired. Please log in again.');
            }
            
            const orderData = {
                user_id: currentUser.id,
                total_price: this.getCartTotal(),
                status: 'pending'
            };

            // Create order
            const { data: order, error: orderError } = await supabase
                .from(TABLES.ORDERS)
                .insert([orderData])
                .select()
                .single();

            if (orderError) throw orderError;

            // Create order items
            const orderItems = this.cart.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity
            }));

            const { error: itemsError } = await supabase
                .from(TABLES.ORDER_ITEMS)
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Clear cart
            this.clearCart();

            this.showToast('Order placed successfully!', 'success');
            
            // Redirect to profile page to view order
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 2000);

        } catch (error) {
            console.error('Order creation error:', error);
            this.showToast('Failed to create order. Please try again.', 'error');
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

// Initialize cart manager
const cartManager = new CartManager();

// Export for use in other files
window.cartManager = cartManager;
