// Admin orders management functionality
let currentOrders = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentFilters = {
    search: '',
    status: '',
    dateRange: ''
};

document.addEventListener('DOMContentLoaded', async () => {
    // Check admin authentication
    if (!adminAuthManager.requireAuth()) {
        return;
    }
    
    // Initialize the page
    await initializeOrdersPage();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup logout buttons
    setupLogoutButtons();
    
    // Setup filters
    setupFilters();
    
    // Setup order modal
    setupOrderModal();
});

async function initializeOrdersPage() {
    try {
        // Load orders
        await loadOrders();
        
        // Update admin name
        updateAdminName();
        
    } catch (error) {
        console.error('Error initializing orders page:', error);
        showToast('Failed to load orders', 'error');
    }
}

async function loadOrders() {
    try {
        let query = supabase
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
            `);
        
        // Apply filters
        if (currentFilters.status) {
            query = query.eq('status', currentFilters.status);
        }
        
        // Apply date filter
        if (currentFilters.dateRange) {
            const now = new Date();
            let startDate;
            
            switch (currentFilters.dateRange) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
            }
            
            if (startDate) {
                query = query.gte('created_at', startDate.toISOString());
            }
        }
        
        // Apply pagination
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        query = query.range(from, to);
        
        // Order by created_at desc
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        currentOrders = data || [];
        renderOrdersTable();
        updatePagination();
        
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Failed to load orders', 'error');
    }
}

function renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    if (currentOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-shopping-bag text-4xl text-gray-300 mb-4"></i>
                    <p>No orders found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = currentOrders.map(order => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">#${order.id.slice(-8)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">Customer</div>
                <div class="text-sm text-gray-500">${order.user_id}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${order.order_items?.length || 0} items</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                $${order.total_price.toFixed(2)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <select onchange="updateOrderStatus('${order.id}', this.value)" 
                        class="text-xs font-medium px-2 py-1 rounded-full border-0 ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                        }">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${new Date(order.created_at).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="viewOrderDetails('${order.id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    // Simple pagination - you can enhance this
    pagination.innerHTML = `
        <div class="flex justify-center space-x-2">
            <button onclick="previousPage()" 
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                    ${currentPage === 1 ? 'disabled' : ''}>
                Previous
            </button>
            <span class="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Page ${currentPage}
            </span>
            <button onclick="nextPage()" 
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Next
            </button>
        </div>
    `;
}

function nextPage() {
    currentPage++;
    loadOrders();
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadOrders();
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

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const clearFilters = document.getElementById('clearFilters');
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentFilters.search = e.target.value;
                currentPage = 1;
                loadOrders();
            }, 500);
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            currentFilters.status = e.target.value;
            currentPage = 1;
            loadOrders();
        });
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', (e) => {
            currentFilters.dateRange = e.target.value;
            currentPage = 1;
            loadOrders();
        });
    }
    
    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            currentFilters = { search: '', status: '', dateRange: '' };
            document.getElementById('searchInput').value = '';
            document.getElementById('statusFilter').value = '';
            document.getElementById('dateFilter').value = '';
            currentPage = 1;
            loadOrders();
        });
    }
}

function setupOrderModal() {
    const orderModal = document.getElementById('orderModal');
    const closeOrderModal = document.getElementById('closeOrderModal');
    
    if (closeOrderModal) {
        closeOrderModal.addEventListener('click', () => {
            orderModal.classList.add('hidden');
        });
    }
    
    // Close modal when clicking outside
    if (orderModal) {
        orderModal.addEventListener('click', (e) => {
            if (e.target === orderModal) {
                orderModal.classList.add('hidden');
            }
        });
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const { error } = await supabase
            .from(TABLES.ORDERS)
            .update({ status: newStatus })
            .eq('id', orderId);
        
        if (error) throw error;
        
        showToast('Order status updated successfully', 'success');
        
        // Reload orders
        await loadOrders();
        
    } catch (error) {
        console.error('Error updating order status:', error);
        showToast('Failed to update order status', 'error');
    }
}

async function viewOrderDetails(orderId) {
    try {
        const order = currentOrders.find(o => o.id === orderId);
        if (!order) return;
        
        // Update modal title
        document.getElementById('orderModalTitle').textContent = `Order #${order.id.slice(-8)}`;
        
        // Render order details
        const orderDetails = document.getElementById('orderDetails');
        orderDetails.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Order Info -->
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-4">Order Information</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Order ID:</span>
                            <span class="font-medium">#${order.id.slice(-8)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Status:</span>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                            }">
                                ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Total:</span>
                            <span class="font-semibold text-lg">$${order.total_price.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Date:</span>
                            <span>${new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Order Items -->
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-4">Order Items</h4>
                    <div class="space-y-4">
                        ${order.order_items?.map(item => `
                            <div class="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                <img src="${item.products.image_url}" alt="${item.products.name}" 
                                     class="w-16 h-16 object-cover rounded-lg">
                                <div class="flex-1">
                                    <h5 class="font-medium text-gray-800">${item.products.name}</h5>
                                    <p class="text-sm text-gray-600">Quantity: ${item.quantity}</p>
                                </div>
                                <p class="font-semibold text-gray-800">$${(item.products.price * item.quantity).toFixed(2)}</p>
                            </div>
                        `).join('') || '<p class="text-gray-500">No items found</p>'}
                    </div>
                </div>
            </div>
        `;
        
        // Show modal
        document.getElementById('orderModal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading order details:', error);
        showToast('Failed to load order details', 'error');
    }
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
