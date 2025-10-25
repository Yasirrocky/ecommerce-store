// Admin dashboard functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Check admin authentication
    if (!adminAuthManager.requireAuth()) {
        return;
    }
    
    // Initialize the dashboard
    await initializeDashboard();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup logout buttons
    setupLogoutButtons();
});

async function initializeDashboard() {
    try {
        // Load dashboard data
        await Promise.all([
            loadStats(),
            loadRecentOrders(),
            loadTopProducts()
        ]);
        
        // Update admin name
        updateAdminName();
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

async function loadStats() {
    try {
        // Load products count
        const { count: productsCount } = await supabase
            .from(TABLES.PRODUCTS)
            .select('*', { count: 'exact', head: true });
        
        // Load categories count
        const { count: categoriesCount } = await supabase
            .from(TABLES.CATEGORIES)
            .select('*', { count: 'exact', head: true });
        
        // Load orders count
        const { count: ordersCount } = await supabase
            .from(TABLES.ORDERS)
            .select('*', { count: 'exact', head: true });
        
        // Load total revenue
        const { data: orders } = await supabase
            .from(TABLES.ORDERS)
            .select('total_price');
        
        const totalRevenue = orders?.reduce((sum, order) => sum + order.total_price, 0) || 0;
        
        // Update UI
        document.getElementById('totalProducts').textContent = productsCount || 0;
        document.getElementById('totalCategories').textContent = categoriesCount || 0;
        document.getElementById('totalOrders').textContent = ordersCount || 0;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadRecentOrders() {
    try {
        const { data: orders, error } = await supabase
            .from(TABLES.ORDERS)
            .select(`
                *,
                order_items (
                    quantity,
                    products (
                        name,
                        price
                    )
                )
            `)
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (error) throw error;
        
        renderRecentOrders(orders || []);
        
    } catch (error) {
        console.error('Error loading recent orders:', error);
        document.getElementById('recentOrders').innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-500">Failed to load recent orders</p>
            </div>
        `;
    }
}

function renderRecentOrders(orders) {
    const container = document.getElementById('recentOrders');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-shopping-bag text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">No orders yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
            <div class="flex-1">
                <div class="flex items-center space-x-3">
                    <div class="w-2 h-2 rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-400' :
                        order.status === 'shipped' ? 'bg-blue-400' :
                        order.status === 'delivered' ? 'bg-green-400' :
                        'bg-gray-400'
                    }"></div>
                    <div>
                        <p class="text-sm font-medium text-gray-800">Order #${order.id.slice(-8)}</p>
                        <p class="text-xs text-gray-500">${new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
            <div class="text-right">
                <p class="text-sm font-semibold text-gray-800">$${order.total_price.toFixed(2)}</p>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                }">
                    ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
            </div>
        </div>
    `).join('');
}

async function loadTopProducts() {
    try {
        // Get products with order count
        const { data: products, error } = await supabase
            .from(TABLES.PRODUCTS)
            .select(`
                *,
                order_items (
                    quantity
                )
            `);
        
        if (error) throw error;
        
        // Calculate total quantity sold for each product
        const productsWithSales = products?.map(product => {
            const totalSold = product.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            return {
                ...product,
                totalSold
            };
        }).sort((a, b) => b.totalSold - a.totalSold).slice(0, 5) || [];
        
        renderTopProducts(productsWithSales);
        
    } catch (error) {
        console.error('Error loading top products:', error);
        document.getElementById('topProducts').innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-500">Failed to load product data</p>
            </div>
        `;
    }
}

function renderTopProducts(products) {
    const container = document.getElementById('topProducts');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-chart-bar text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">No product sales data available</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map((product, index) => `
        <div class="flex items-center space-x-4 py-3 border-b border-gray-200 last:border-b-0">
            <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-semibold text-blue-600">${index + 1}</span>
                </div>
            </div>
            <img src="${product.image_url}" alt="${product.name}" 
                 class="w-12 h-12 object-cover rounded-lg">
            <div class="flex-1">
                <h3 class="text-sm font-medium text-gray-800">${product.name}</h3>
                <p class="text-xs text-gray-500">$${product.price.toFixed(2)}</p>
            </div>
            <div class="text-right">
                <p class="text-sm font-semibold text-gray-800">${product.totalSold} sold</p>
            </div>
        </div>
    `).join('');
}

function updateAdminName() {
    const admin = adminAuthManager.getCurrentAdmin();
    const adminName = document.getElementById('adminName');
    
    if (adminName && admin) {
        const displayName = admin.user_metadata?.full_name || 
                           admin.email?.split('@')[0] || 'Admin';
        adminName.textContent = displayName;
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

function setupLogoutButtons() {
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            adminAuthManager.signOut();
        });
    }
    
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            adminAuthManager.signOut();
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
    const elementsToAnimate = document.querySelectorAll('.bg-white');
    elementsToAnimate.forEach(el => observer.observe(el));
});
