// Collections Management
let collections = [];
let products = [];
let selectedProducts = new Set();

// Load collections on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadCollections();
    await loadProducts();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Add collection button
    document.getElementById('addCollectionBtn').addEventListener('click', () => {
        openCollectionModal();
    });

    // Close modal buttons
    document.getElementById('closeModalBtn').addEventListener('click', closeCollectionModal);
    document.getElementById('cancelBtn').addEventListener('click', closeCollectionModal);
    document.getElementById('closeProductsModalBtn').addEventListener('click', closeProductsModal);

    // Form submit
    document.getElementById('collectionForm').addEventListener('submit', handleCollectionSubmit);

    // Save products
    document.getElementById('saveProductsBtn').addEventListener('click', saveCollectionProducts);

    // Product search
    document.getElementById('productSearch').addEventListener('input', (e) => {
        filterProducts(e.target.value);
    });
}

// Load all collections
async function loadCollections() {
    try {
        const { data, error } = await supabase
            .from('collections')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        collections = data || [];
        displayCollections();
    } catch (error) {
        console.error('Error loading collections:', error);
        showNotification('Error loading collections', 'error');
    }
}

// Display collections
function displayCollections() {
    const grid = document.getElementById('collectionsGrid');
    
    if (collections.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-layer-group text-gray-300 text-6xl mb-4"></i>
                <p class="text-gray-500 text-lg">No collections yet. Create your first collection!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = collections.map(collection => `
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div class="relative h-48 bg-gray-200">
                ${collection.image_url ? 
                    `<img src="${collection.image_url}" alt="${collection.name}" class="w-full h-full object-cover">` :
                    `<div class="w-full h-full flex items-center justify-center">
                        <i class="fas fa-image text-gray-400 text-4xl"></i>
                    </div>`
                }
                <div class="absolute top-2 right-2">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${collection.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}">
                        ${collection.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-2">${collection.name}</h3>
                <p class="text-gray-600 text-sm mb-4">${collection.description || 'No description'}</p>
                <div class="flex gap-2">
                    <button onclick="editCollection('${collection.id}')" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        <i class="fas fa-edit mr-1"></i> Edit
                    </button>
                    <button onclick="manageProducts('${collection.id}')" class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200">
                        <i class="fas fa-box mr-1"></i> Products
                    </button>
                    <button onclick="deleteCollection('${collection.id}')" class="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Open collection modal
function openCollectionModal(collectionId = null) {
    const modal = document.getElementById('collectionModal');
    const form = document.getElementById('collectionForm');
    const title = document.getElementById('modalTitle');

    form.reset();

    if (collectionId) {
        const collection = collections.find(c => c.id === collectionId);
        if (collection) {
            title.textContent = 'Edit Collection';
            document.getElementById('collectionId').value = collection.id;
            document.getElementById('collectionName').value = collection.name;
            document.getElementById('collectionDescription').value = collection.description || '';
            document.getElementById('collectionImage').value = collection.image_url || '';
            document.getElementById('collectionOrder').value = collection.display_order;
            document.getElementById('collectionActive').checked = collection.is_active;
        }
    } else {
        title.textContent = 'Add Collection';
        document.getElementById('collectionActive').checked = true;
    }

    modal.classList.remove('hidden');
}

// Close collection modal
function closeCollectionModal() {
    document.getElementById('collectionModal').classList.add('hidden');
}

// Handle collection form submit
async function handleCollectionSubmit(e) {
    e.preventDefault();

    const collectionId = document.getElementById('collectionId').value;
    const collectionData = {
        name: document.getElementById('collectionName').value,
        description: document.getElementById('collectionDescription').value,
        image_url: document.getElementById('collectionImage').value,
        display_order: parseInt(document.getElementById('collectionOrder').value),
        is_active: document.getElementById('collectionActive').checked,
        updated_at: new Date().toISOString()
    };

    try {
        let result;
        if (collectionId) {
            // Update existing collection
            result = await supabase
                .from('collections')
                .update(collectionData)
                .eq('id', collectionId);
        } else {
            // Create new collection
            result = await supabase
                .from('collections')
                .insert([collectionData]);
        }

        if (result.error) throw result.error;

        showNotification(collectionId ? 'Collection updated successfully' : 'Collection created successfully', 'success');
        closeCollectionModal();
        await loadCollections();
    } catch (error) {
        console.error('Error saving collection:', error);
        showNotification('Error saving collection: ' + error.message, 'error');
    }
}

// Edit collection
function editCollection(collectionId) {
    openCollectionModal(collectionId);
}

// Delete collection
async function deleteCollection(collectionId) {
    if (!confirm('Are you sure you want to delete this collection? This will also remove all product associations.')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('collections')
            .delete()
            .eq('id', collectionId);

        if (error) throw error;

        showNotification('Collection deleted successfully', 'success');
        await loadCollections();
    } catch (error) {
        console.error('Error deleting collection:', error);
        showNotification('Error deleting collection: ' + error.message, 'error');
    }
}

// Load all products
async function loadProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');

        if (error) throw error;

        products = data || [];
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Manage products in collection
async function manageProducts(collectionId) {
    document.getElementById('currentCollectionId').value = collectionId;
    
    // Load current collection products
    try {
        const { data, error } = await supabase
            .from('collection_products')
            .select('product_id')
            .eq('collection_id', collectionId);

        if (error) throw error;

        selectedProducts = new Set(data.map(cp => cp.product_id));
        displayProducts();
        document.getElementById('productsModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading collection products:', error);
        showNotification('Error loading products', 'error');
    }
}

// Display products with checkboxes
function displayProducts(filter = '') {
    const container = document.getElementById('availableProducts');
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(filter.toLowerCase())
    );

    container.innerHTML = filteredProducts.map(product => `
        <div class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <input type="checkbox" 
                   id="product-${product.id}" 
                   ${selectedProducts.has(product.id) ? 'checked' : ''}
                   onchange="toggleProduct('${product.id}')"
                   class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            <label for="product-${product.id}" class="ml-3 flex-1 flex items-center cursor-pointer">
                ${product.image_url ? 
                    `<img src="${product.image_url}" alt="${product.name}" class="w-12 h-12 object-cover rounded mr-3">` :
                    `<div class="w-12 h-12 bg-gray-200 rounded mr-3 flex items-center justify-center">
                        <i class="fas fa-image text-gray-400"></i>
                    </div>`
                }
                <div>
                    <div class="font-medium text-gray-800">${product.name}</div>
                    <div class="text-sm text-gray-500">$${product.price}</div>
                </div>
            </label>
        </div>
    `).join('');
}

// Toggle product selection
function toggleProduct(productId) {
    if (selectedProducts.has(productId)) {
        selectedProducts.delete(productId);
    } else {
        selectedProducts.add(productId);
    }
}

// Filter products
function filterProducts(searchTerm) {
    displayProducts(searchTerm);
}

// Save collection products
async function saveCollectionProducts() {
    const collectionId = document.getElementById('currentCollectionId').value;

    try {
        // First, delete all existing associations
        await supabase
            .from('collection_products')
            .delete()
            .eq('collection_id', collectionId);

        // Then insert new associations
        if (selectedProducts.size > 0) {
            const associations = Array.from(selectedProducts).map((productId, index) => ({
                collection_id: collectionId,
                product_id: productId,
                display_order: index
            }));

            const { error } = await supabase
                .from('collection_products')
                .insert(associations);

            if (error) throw error;
        }

        showNotification('Products updated successfully', 'success');
        closeProductsModal();
    } catch (error) {
        console.error('Error saving collection products:', error);
        showNotification('Error saving products: ' + error.message, 'error');
    }
}

// Close products modal
function closeProductsModal() {
    document.getElementById('productsModal').classList.add('hidden');
    selectedProducts.clear();
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}
