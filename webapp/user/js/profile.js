// Profile page functionality
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Wait for auth to initialize and check authentication
        const isAuth = await authManager.isAuthenticated();
        if (!isAuth) {
            console.log('User not authenticated, redirecting to login');
            window.location.href = 'login.html';
            return;
        }
        
        // Initialize the page
        await initializeProfilePage();
        
        // Setup mobile menu
        setupMobileMenu();
        
        // Setup tab navigation
        setupTabNavigation();
        
        // Setup forms
        setupProfileForm();
        setupPasswordForm();
    } catch (error) {
        console.error('Error initializing profile page:', error);
        showToast('Failed to load profile. Please try again.', 'error');
    }
});

async function initializeProfilePage() {
    try {
        // Load categories for navigation
        await productManager.loadCategories();
        
        // Load user profile
        await loadUserProfile();
        
        // Load order history
        await loadOrderHistory();
        
    } catch (error) {
        console.error('Error initializing profile page:', error);
    }
}

async function loadUserProfile() {
    const user = authManager.getCurrentUser();
    if (!user) return;
    
    // Update profile display
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileEmailInput = document.getElementById('profileEmailInput');
    
    if (profileName) {
        const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        profileName.textContent = displayName;
    }
    
    if (profileEmail) {
        profileEmail.textContent = user.email || '';
    }
    
    if (profileEmailInput) {
        profileEmailInput.value = user.email || '';
    }
    
    // Populate form fields
    const nameParts = user.user_metadata?.full_name?.split(' ') || [];
    document.getElementById('profileFirstName').value = nameParts[0] || '';
    document.getElementById('profileLastName').value = nameParts.slice(1).join(' ') || '';
    document.getElementById('profilePhone').value = user.user_metadata?.phone || '';
    document.getElementById('profileAddress').value = user.user_metadata?.address || '';
}

async function loadOrderHistory() {
    try {
        const user = authManager.getCurrentUser();
        if (!user) return;
        
        // Fetch orders for the current user
        const { data: orders, error } = await supabase
            .from(TABLES.ORDERS)
            .select(`
                *,
                order_items (
                    quantity,
                    products (
                        name,
                        price,
                        image_url
                    )
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        renderOrderHistory(orders || []);
        
    } catch (error) {
        console.error('Error loading order history:', error);
        showToast('Failed to load order history', 'error');
    }
}

function renderOrderHistory(orders) {
    const container = document.getElementById('ordersList');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">No orders yet</h3>
                <p class="text-gray-500 mb-6">Start shopping to see your orders here!</p>
                <a href="product.html" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                    Start Shopping
                </a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="border border-gray-200 rounded-lg p-6 mb-4">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h4 class="text-lg font-semibold text-gray-800">Order #${order.id.slice(-8)}</h4>
                    <p class="text-sm text-gray-600">Placed on ${new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div class="text-right">
                    <p class="text-lg font-bold text-blue-600">$${order.total_price.toFixed(2)}</p>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </div>
            </div>
            
            <div class="space-y-3">
                ${order.order_items.map(item => `
                    <div class="flex items-center space-x-4">
                        <img src="${item.products.image_url}" alt="${item.products.name}" 
                             class="w-16 h-16 object-cover rounded-lg">
                        <div class="flex-1">
                            <h5 class="font-medium text-gray-800">${item.products.name}</h5>
                            <p class="text-sm text-gray-600">Quantity: ${item.quantity}</p>
                        </div>
                        <p class="font-semibold text-gray-800">$${(item.products.price * item.quantity).toFixed(2)}</p>
                    </div>
                `).join('')}
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

function setupTabNavigation() {
    const profileTab = document.getElementById('profileTab');
    const ordersTab = document.getElementById('ordersTab');
    const passwordTab = document.getElementById('passwordTab');
    
    const profileContent = document.getElementById('profileInfoContent');
    const ordersContent = document.getElementById('ordersContent');
    const passwordContent = document.getElementById('passwordContent');
    
    const tabs = [
        { button: profileTab, content: profileContent, className: 'bg-blue-100 text-blue-700' },
        { button: ordersTab, content: ordersContent, className: 'bg-blue-100 text-blue-700' },
        { button: passwordTab, content: passwordContent, className: 'bg-blue-100 text-blue-700' }
    ];
    
    function switchTab(activeTab) {
        tabs.forEach(tab => {
            if (tab === activeTab) {
                tab.button.className = `w-full text-left px-4 py-2 ${tab.className} rounded-lg font-medium`;
                tab.content.classList.remove('hidden');
            } else {
                tab.button.className = 'w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg';
                tab.content.classList.add('hidden');
            }
        });
    }
    
    if (profileTab) {
        profileTab.addEventListener('click', () => switchTab(tabs[0]));
    }
    
    if (ordersTab) {
        ordersTab.addEventListener('click', () => switchTab(tabs[1]));
    }
    
    if (passwordTab) {
        passwordTab.addEventListener('click', () => switchTab(tabs[2]));
    }
}

function setupProfileForm() {
    const profileForm = document.getElementById('profileForm');
    const updateProfileBtn = document.getElementById('updateProfileBtn');
    
    if (profileForm && updateProfileBtn) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const firstName = document.getElementById('profileFirstName').value.trim();
            const lastName = document.getElementById('profileLastName').value.trim();
            const phone = document.getElementById('profilePhone').value.trim();
            const address = document.getElementById('profileAddress').value.trim();
            
            // Show loading state
            updateProfileBtn.disabled = true;
            updateProfileBtn.textContent = 'Updating...';
            
            try {
                // Update user metadata
                const { error } = await supabase.auth.updateUser({
                    data: {
                        full_name: `${firstName} ${lastName}`.trim(),
                        phone: phone,
                        address: address
                    }
                });
                
                if (error) throw error;
                
                showToast('Profile updated successfully!', 'success');
                
                // Update display
                const profileName = document.getElementById('profileName');
                if (profileName) {
                    profileName.textContent = `${firstName} ${lastName}`.trim() || 'User';
                }
                
            } catch (error) {
                console.error('Profile update error:', error);
                showToast('Failed to update profile. Please try again.', 'error');
            } finally {
                // Reset button
                updateProfileBtn.disabled = false;
                updateProfileBtn.textContent = 'Update Profile';
            }
        });
    }
}

function setupPasswordForm() {
    const passwordForm = document.getElementById('passwordForm');
    const updatePasswordBtn = document.getElementById('updatePasswordBtn');
    
    if (passwordForm && updatePasswordBtn) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            
            // Validate inputs
            if (!currentPassword || !newPassword || !confirmNewPassword) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            if (newPassword.length < 8) {
                showToast('New password must be at least 8 characters long', 'error');
                return;
            }
            
            if (newPassword !== confirmNewPassword) {
                showToast('New passwords do not match', 'error');
                return;
            }
            
            // Show loading state
            updatePasswordBtn.disabled = true;
            updatePasswordBtn.textContent = 'Updating...';
            
            try {
                // Update password
                const { error } = await authManager.updatePassword(newPassword);
                
                if (error) {
                    throw error;
                }
                
                // Clear form
                passwordForm.reset();
                
            } catch (error) {
                console.error('Password update error:', error);
                showToast(error.message || 'Failed to update password. Please try again.', 'error');
            } finally {
                // Reset button
                updatePasswordBtn.disabled = false;
                updatePasswordBtn.textContent = 'Update Password';
            }
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
