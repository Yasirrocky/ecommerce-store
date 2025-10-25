// Load navigation and footer components
document.addEventListener('DOMContentLoaded', async () => {
    // Load navigation
    const navPlaceholder = document.getElementById('navigation');
    if (navPlaceholder) {
        try {
            const navResponse = await fetch('components/navigation.html');
            if (!navResponse.ok) throw new Error('Failed to fetch navigation');
            const navHtml = await navResponse.text();
            navPlaceholder.innerHTML = navHtml;
        } catch (err) {
            console.warn('Could not load components/navigation.html via fetch — falling back to inline navigation. Error:', err);
            // Fallback navigation (used when opening files via file:// or fetch blocked)
            navPlaceholder.innerHTML = `
<nav class="bg-white shadow-lg sticky top-0 z-50">
    <div class="container-responsive">
        <div class="flex justify-between items-center h-14 sm:h-16">
            <div class="flex-shrink-0">
                <a href="index.html" class="text-xl sm:text-2xl font-bold text-gray-800">StyleHub</a>
            </div>
            <div class="hidden md:flex flex-1 max-w-lg mx-4 lg:mx-8">
                <div class="relative w-full">
                    <input type="text" id="searchInput" placeholder="Search products..." 
                           class="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-search text-gray-400 text-sm"></i>
                    </div>
                </div>
            </div>
            <div class="hidden lg:block">
                <div class="flex items-baseline space-x-2 xl:space-x-4">
                    <a href="index.html" class="text-gray-800 hover:text-blue-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium">Home</a>
                    <div class="relative group">
                        <button class="text-gray-800 hover:text-blue-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium flex items-center">
                            Categories <i class="fas fa-chevron-down ml-1 text-xs"></i>
                        </button>
                        <div class="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            <div class="py-1" id="categoriesDropdown">
                                <!-- Categories will be loaded here -->
                            </div>
                        </div>
                    </div>
                    <a href="collections.html" class="text-gray-800 hover:text-blue-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium">Collections</a>
                    <a href="product.html" class="text-gray-800 hover:text-blue-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium">Products</a>
                    <a href="cart.html" class="text-gray-800 hover:text-blue-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium relative">
                        <i class="fas fa-shopping-cart"></i>
                        <span id="cartCount" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">0</span>
                    </a>
                    <div id="authButtons" class="flex space-x-1 xl:space-x-2">
                        <a href="login.html" class="text-gray-800 hover:text-blue-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium">Login</a>
                        <a href="signup.html" class="bg-blue-600 text-white px-3 xl:px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Sign Up</a>
                    </div>
                    <div id="userMenu" class="hidden relative group">
                        <button class="text-gray-800 hover:text-blue-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium flex items-center">
                            <i class="fas fa-user mr-1 xl:mr-2 text-sm"></i>
                            <span id="userName" class="hidden xl:inline">User</span>
                            <i class="fas fa-chevron-down ml-1 text-xs"></i>
                        </button>
                        <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            <div class="py-1">
                                <a href="profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                                <a href="#" id="logoutBtn" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex items-center space-x-2 lg:hidden">
                <button id="mobileSearchBtn" class="text-gray-800 hover:text-blue-600 p-2">
                    <i class="fas fa-search"></i>
                </button>
                <a href="cart.html" class="text-gray-800 hover:text-blue-600 p-2 relative">
                    <i class="fas fa-shopping-cart"></i>
                    <span id="mobileCartCount" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">0</span>
                </a>
                <button id="mobileMenuBtn" class="text-gray-800 hover:text-blue-600 p-2">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </div>
    </div>
`;
        }
        // Notify other scripts that navigation has been loaded
        if (typeof initializeCategories === 'function') {
            try { initializeCategories(); } catch (e) { console.error('initializeCategories error:', e); }
        }
        
        // Apply site settings after navigation is loaded
        if (typeof applySiteSettings === 'function') {
            try { 
                applySiteSettings(); 
            } catch (e) { 
                console.error('applySiteSettings error:', e); 
            }
        }
        
        document.dispatchEvent(new Event('components:loaded'));
    }

    // Load footer
    const footerPlaceholder = document.getElementById('footer');
    if (footerPlaceholder) {
        try {
            const footerResponse = await fetch('components/footer.html');
            if (!footerResponse.ok) throw new Error('Failed to fetch footer');
            const footerHtml = await footerResponse.text();
            footerPlaceholder.innerHTML = footerHtml;
        } catch (err) {
            console.warn('Could not load components/footer.html via fetch — falling back to inline footer. Error:', err);
            footerPlaceholder.innerHTML = `
<footer class="bg-gray-900 text-white py-8">
    <div class="container-responsive">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div class="sm:col-span-2 lg:col-span-1">
                <h3 class="text-lg sm:text-xl font-bold mb-4">StyleHub</h3>
                <p class="text-gray-400 text-sm sm:text-base">Your one-stop destination for the latest fashion trends and styles.</p>
            </div>
            <div>
                <h4 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h4>
                <ul class="space-y-2">
                    <li><a href="index.html" class="text-gray-400 hover:text-white text-sm sm:text-base">Home</a></li>
                    <li><a href="product.html" class="text-gray-400 hover:text-white text-sm sm:text-base">Products</a></li>
                    <li><a href="cart.html" class="text-gray-400 hover:text-white text-sm sm:text-base">Cart</a></li>
                    <li><a href="profile.html" class="text-gray-400 hover:text-white text-sm sm:text-base">My Account</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Customer Service</h4>
                <ul class="space-y-2">
                    <li><a href="#" class="text-gray-400 hover:text-white text-sm sm:text-base">Contact Us</a></li>
                    <li><a href="#" class="text-gray-400 hover:text-white text-sm sm:text-base">Shipping Info</a></li>
                    <li><a href="#" class="text-gray-400 hover:text-white text-sm sm:text-base">Returns</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Follow Us</h4>
                <div class="flex space-x-4">
                    <a href="#" class="text-gray-400 hover:text-white text-lg"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" class="text-gray-400 hover:text-white text-lg"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="text-gray-400 hover:text-white text-lg"><i class="fab fa-instagram"></i></a>
                </div>
            </div>
        </div>
        <div class="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
            <p class="text-sm sm:text-base">&copy; 2024 StyleHub. All rights reserved.</p>
        </div>
    </div>
</footer>
`;
        }
    }

    // Setup navigation interactivity
    setupMobileMenu();
    setupSearch();
    highlightCurrentPage();
});

// Setup mobile menu functionality
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    const mobileSearchOverlay = document.getElementById('mobileSearchOverlay');
    const closeMobileSearch = document.getElementById('closeMobileSearch');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            if (mobileSearchOverlay) {
                mobileSearchOverlay.classList.add('hidden');
            }
        });
    }

    if (mobileSearchBtn && mobileSearchOverlay && closeMobileSearch) {
        mobileSearchBtn.addEventListener('click', () => {
            mobileSearchOverlay.classList.remove('hidden');
            if (mobileMenu) {
                mobileMenu.classList.add('hidden');
            }
        });

        closeMobileSearch.addEventListener('click', () => {
            mobileSearchOverlay.classList.add('hidden');
        });
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');

    function handleSearch(query) {
        if (query.trim()) {
            window.location.href = `product.html?search=${encodeURIComponent(query.trim())}`;
        }
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch(searchInput.value);
            }
        });
    }

    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch(mobileSearchInput.value);
            }
        });
    }
}

// Highlight current page in navigation
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('text-blue-600');
            link.classList.remove('text-gray-800');
        }
    });
}