// Initialize categories
async function initializeCategories() {
    try {
        // Get categories from Supabase
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error) throw error;

        // Populate desktop dropdown
        const categoriesDropdown = document.getElementById('categoriesDropdown');
        if (categoriesDropdown) {
            categories.forEach(category => {
                const link = document.createElement('a');
                link.href = `product.html?category=${encodeURIComponent(category.id)}`;
                link.className = 'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100';
                link.textContent = category.name;
                categoriesDropdown.appendChild(link);
            });
        }

        // Populate mobile menu
        const mobileCategories = document.getElementById('mobileCategories');
        if (mobileCategories) {
            categories.forEach(category => {
                const link = document.createElement('a');
                link.href = `product.html?category=${encodeURIComponent(category.id)}`;
                link.className = 'block px-3 py-2 text-sm text-gray-600 hover:text-blue-600';
                link.textContent = category.name;
                mobileCategories.appendChild(link);
            });
        }

        // Populate categories section on homepage if it exists
        const featuredCategories = document.getElementById('featuredCategories');
        if (featuredCategories) {
            featuredCategories.innerHTML = ''; // Clear sample content
            categories.forEach(category => {
                const card = `
                    <a href="product.html?category=${encodeURIComponent(category.id)}" 
                       class="group relative h-[400px] overflow-hidden rounded-lg">
                        <img src="${category.image_url || 'https://via.placeholder.com/800x800'}" 
                             class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                             alt="${category.name}">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div class="absolute bottom-0 left-0 right-0 p-6">
                            <h3 class="text-2xl font-bold text-white mb-2">${category.name}</h3>
                            <p class="text-white/80 mb-4">${category.description || 'Explore our collection'}</p>
                            <span class="inline-block text-white font-semibold group-hover:underline">
                                Shop Collection →
                            </span>
                        </div>
                    </a>
                `;
                featuredCategories.insertAdjacentHTML('beforeend', card);
            });
        }

    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load categories when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof supabase !== 'undefined') {
        initializeCategories();
    }
});

// If components are loaded later, listen for that event as well
document.addEventListener('components:loaded', () => {
    if (typeof initializeCategories === 'function') {
        initializeCategories();
    }
});