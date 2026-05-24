// ----------------------
// SAMPLE PRODUCTS FOR TESTING
// ----------------------
let currentFilteredProducts = [];

let products = [];
async function fetchProducts() {
    try {
        const res = await fetch("/api/product/get-all-products");
        const result = await res.json();

        if (result.success) {
            products = result.data;

            // re-render everything
            filterAndSortProducts();
            renderBestSellers(products, 4);
        }
    } catch (err) {
        console.error("Failed to fetch products", err);
    }
}

// ----------------------
// CART SETUP
// ----------------------
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let cartCount = cart.reduce((s, i) => s + i.quantity, 0);
let cartItemIdCounter = cart.length;

const shippingByGovernorate = {
    Cairo: 5, Giza: 6, Alexandria: 7, Qalyubia: 6, Sharqia: 7, Dakahlia: 7,
    Beheira: 7, Monufia: 6, Gharbia: 6, "Kafr El Sheikh": 7, Damietta: 7, "Port Said": 8,
    Ismailia: 8, Suez: 8, "North Sinai": 10, "South Sinai": 10, "Red Sea": 10,
    Faiyum: 7, "Beni Suef": 8, Minya: 8, Assiut: 9, Sohag: 9, Qena: 9, Luxor: 9,
    Aswan: 10, "New Valley": 10, Matrouh: 10
};

let productOptionsModal = null;

// ----------------------
// DOM ELEMENTS
// ----------------------
const citySelect = document.getElementById('city');
const checkoutItems = document.getElementById('checkoutItems');
const subtotalEl = document.getElementById('subtotal');
const shippingEl = document.getElementById('shipping');
const totalEl = document.getElementById('total');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const placeOrderBtn = document.getElementById('placeOrder');
const orderMsg = document.getElementById('orderMsg');
const visaRadio = document.getElementById('pmVisa');
const codRadio = document.getElementById('pmCod');
const visaFields = document.getElementById('visaFields');
const codNote = document.getElementById('codNote');
const bestSellerContainer = document.getElementById('bestSellerContainer');
const productOptionsModalEl = document.getElementById('productOptionsModal');
const productOptionsModalLabel = document.getElementById('productOptionsModalLabel');
const productOptionsCategory = document.getElementById('productOptionsCategory');
const productOptionsPrice = document.getElementById('productOptionsPrice');
const productOptionsCategoryInput = document.getElementById('productOptionsCategoryInput');
const productsContainer = document.getElementById('productsContainer');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const paginationEl = document.getElementById('pagination');
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchResults = document.getElementById("searchResults");
const productOptionsForm = document.getElementById('productOptionsForm');
const productOptionsName = document.getElementById('productOptionsName');
const productOptionsBasePrice = document.getElementById('productOptionsBasePrice');
const productOptionsImage = document.getElementById('productOptionsImage');
const productQuantityInput = document.getElementById('productQuantity');
const productSizeSelect = document.getElementById('productSize');
const increaseQtyBtn = document.getElementById('increaseQty');
const decreaseQtyBtn = document.getElementById('decreaseQty');

// ----------------------
// PAGINATION CONFIG
// ----------------------
const productsPerPage = 8;
let currentPage = 1;

// ----------------------
// DOM CONTENT LOADED
// ----------------------
document.addEventListener('DOMContentLoaded', async () => {
    updateCartCount();
    renderCart();
    renderCheckout();
    renderCartOffcanvas();
    // Sync dropdown with URL category (if any)
    syncCategoryDropdownWithUrl();
    await fetchProducts();

    // Single unified filter call
    filterAndSortProducts();

    renderBestSellers(products, 4);

    if (productOptionsModalEl && window.bootstrap) {
        productOptionsModal = new bootstrap.Modal(productOptionsModalEl);
    }

    const checkoutBtn = document.getElementById('checkoutButton');
    if (checkoutBtn) {
        checkoutBtn.onclick = () => {
            const isInPages = window.location.pathname.includes('/pages/');
            window.location.href = isInPages
                ? 'checkout.html'
                : 'pages/checkout.html';
        };
    }

    // Handle category square clicks on the home page
    const categoryLinks = document.querySelectorAll('.category-link');
    if (categoryLinks.length > 0) {
        const categoryTypes = [
            { id: 'all', name: 'All Types' },
            { id: 'sport', name: 'Sport' },
            { id: 'nationalitie', name: 'Nationality' },
            { id: 'cartoon', name: 'Cartoon' },
            { id: 'marvel', name: 'Marvel' },
            { id: 'series', name: 'Series' },
            { id: 'music', name: 'Music' },
            { id: 'colledge', name: 'College' },
            { id: 'anime', name: 'Anime' },
            { id: 'cute', name: 'Cute' },
            { id: 'memes', name: 'Memes' },
            { id: 'coat', name: 'Coat' }
        ];

        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const cat = link.getAttribute('data-cat');
                const container = document.getElementById('categorySquaresContainer');

                const sectionTitle = document.querySelector('#shopByCategory h2');
                const sectionDesc = document.querySelector('#shopByCategory p');
                if (sectionTitle) sectionTitle.textContent = `Select ${cat.charAt(0).toUpperCase() + cat.slice(1)} Type`;
                if (sectionDesc) sectionDesc.textContent = "Choose a specific type to explore";

                let html = `
                    <div class="col-12 mb-3">
                        <button class="btn btn-outline-secondary btn-sm" onclick="window.location.reload()">
                            <i class="fa-solid fa-arrow-left"></i> Back to Categories
                        </button>
                    </div>
                `;
                categoryTypes.forEach(type => {
                    let url = `pages/category.html?cat=${encodeURIComponent(cat)}`;
                    if (type.id !== 'all') {
                        url += `&type=${encodeURIComponent(type.id)}`;
                    }
                    html += `
                        <div class="col-6 col-md-3">
                            <a href="${url}" class="text-decoration-none">
                                <div class="category-card text-center p-3 border rounded hover-shadow">
                                    <img src="assets/Copilot_20260122_175027.png" alt="${type.name}" class="img-fluid mb-2 rounded">
                                    <h5 class="mb-0 text-dark">${type.name}</h5>
                                </div>
                            </a>
                        </div>
                    `;
                });

                if (container) {
                    container.innerHTML = html;
                }
            });
        });
    }

    citySelect?.addEventListener('change', renderCheckout);

    updateNavbarAuth();
});
function parseJwt(token) {
    try {
        const base64Payload = token.split('.')[1];
        return JSON.parse(atob(base64Payload));
    } catch {
        return null;
    }
}
function updateNavbarAuth() {
    const token = localStorage.getItem('token');
    const userIcon = document.getElementById('userIcon');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');

    if (!token) {
        userIcon.classList.remove('d-none');
        userMenu.classList.add('d-none');
        userName.textContent = '';
        return;
    }
    const payload = parseJwt(token);
    if (!payload?.name) {
        localStorage.removeItem('token');
        userIcon.classList.remove('d-none');
        userMenu.classList.add('d-none');
        userName.textContent = '';
        return;
    }

    userIcon.classList.add('d-none');
    userMenu.classList.remove('d-none');
    userName.textContent = payload.name;
}

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.reload();
});

// ----------------------
// GET CATEGORY & TYPE FROM URL
// ----------------------
function getCategoryFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('cat');
}

function getTypeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('type');
}

// ----------------------
// SYNC DROPDOWN WITH URL
// ----------------------
function syncCategoryDropdownWithUrl() {
    const urlCategory = getCategoryFromUrl();
    if (urlCategory && categoryFilter) {
        categoryFilter.value = urlCategory;
    }
    const urlType = getTypeFromUrl();
    if (urlType && typeFilter) {
        typeFilter.value = urlType;
    }
}

// ----------------------
// UNIFIED FILTER & SORT PRODUCTS (with pagination)
// ----------------------
const typeFilter = document.getElementById('typeFilter');

function filterAndSortProducts() {
    let filtered = [...products];
    const urlCategory = getCategoryFromUrl();
    const dropdownCategory = categoryFilter?.value;
    const selectedType = typeFilter?.value;
    const activeCategory = urlCategory || dropdownCategory;

    if (activeCategory && activeCategory !== 'all' && activeCategory !== 'default') {
        filtered = filtered.filter(p => p.category === activeCategory);
    }
    const urlType = getTypeFromUrl();
    const activeType = urlType || selectedType;
    if (activeType && activeType !== 'all') {
        filtered = filtered.filter(p => p.type === activeType);
    }

    const sort = sortFilter?.value;
    if (sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

    currentFilteredProducts = filtered; // ✅ store filtered list
    renderProductsPage(currentFilteredProducts, currentPage);
}




typeFilter?.addEventListener('change', () => {
    // Clear URL param so dropdown takes priority
    const url = new URL(window.location);
    url.searchParams.delete('type');
    window.history.pushState({}, '', url);

    currentPage = 1;
    filterAndSortProducts();
});

sortFilter?.addEventListener('change', () => {
    currentPage = 1;
    filterAndSortProducts();
});

// Event listeners for filter/sort
categoryFilter?.addEventListener('change', () => {
    // Clear URL param so dropdown takes priority
    const url = new URL(window.location);
    url.searchParams.delete('cat');
    window.history.pushState({}, '', url);

    currentPage = 1;
    filterAndSortProducts();
});
sortFilter?.addEventListener('change', filterAndSortProducts);

// ----------------------
// RENDER PRODUCTS DYNAMICALLY
function renderProducts(productList = products) {
    if (!productsContainer) return;
    productsContainer.innerHTML = '';

    productList.forEach(p => {
        const div = document.createElement('div');
        div.className = "col-6 col-md-3 mb-4";
        div.innerHTML = `
            <div class="card h-100 border-0 shadow-sm product-card-hover">
                <div class="position-relative overflow-hidden rounded-top" style="cursor:pointer" onclick="openProductDetail('${p.id}')">
                    <div class="img-wrapper">
                        <img src="${p.image}" class="card-img-top p-3" alt="${p.name}" loading="lazy">
                    </div>
                </div>
                
                <div class="card-body d-flex flex-column pt-0 text-center">
                    <h6 class="card-title fw-bold text-dark mb-1 mt-2" style="cursor:pointer" onclick="openProductDetail('${p.id}')">
                        🟢 ${p.name}
                    </h6>
                    <div class="mt-auto">
                        <div class="mb-2">
                            <span class="text-muted small d-block mb-0" style="font-size: 0.75rem; letter-spacing: 0.5px; text-transform: uppercase;">
                                Starts from
                            </span>
                            <span class="fs-5 fw-bold text-success price-green">LE ${p.price.toFixed(2)}</span>
                        </div>
                        
                        ${(p.stock != null && p.stock <= 0)
                ? `<button class="btn btn-secondary btn-sm w-100 rounded-pill" disabled>Out of Stock</button>`
                : p.category === 'stickers'
                    ? `<button class="btn btn-outline-success btn-sm w-100 rounded-pill open-product-options" data-id="${p.id}">
                                    Choose options
                               </button>`
                    : `<button class="btn btn-success btn-sm w-100 rounded-pill btn-add-to-cart" 
                                    data-id="${p.id}" 
                                    data-name="${p.name}" 
                                    data-price="${p.price}">
                                    Add to Cart
                               </button>`
            }
                    </div>
                </div>
            </div>`;
        productsContainer.appendChild(div);
    });

    // Re-attach listeners for the "Add to Cart" buttons
    attachAddToCartListeners();
}
function attachAddToCartListeners() {
    // Standard Add to Cart
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.onclick = () => {
            const product = products.find(p => p.id === btn.dataset.id);
            if (!product) return;
            addToCart(product.name, product.price, 1, '', "🟢", product.id);
        };
    });


    // Options Modal (Stickers)
    document.querySelectorAll('.open-product-options').forEach(btn => {
        btn.onclick = () => {
            openProductOptionsModal(btn.dataset.id);
        };
    });
}
// ----------------------
// PRODUCTS PAGINATION
// ----------------------
function renderProductsPage(productList = products, page = 1) {
    if (!productsContainer) return;
    // ✅ Re-show the pagination if it was hidden by the Detail View
    if (paginationEl) {
        paginationEl.closest('nav').style.display = 'block';
    }

    const start = (page - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = productList.slice(start, end);

    renderProducts(paginatedProducts);
    renderPagination(productList, page);
}
function renderPagination(productList, page) {
    if (!paginationEl) return;

    const totalPages = Math.ceil(productList.length / productsPerPage);
    if (totalPages <= 1) {
        paginationEl.innerHTML = '';
        return;
    }

    let html = '';

    // --- PREVIOUS BUTTON ---
    html += `
        <li class="page-item ${page === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${page - 1}">
                <i class="bi bi-chevron-left"></i>
            </a>
        </li>`;

    // --- SMART NUMBER LOGIC ---
    const maxVisibleButtons = 4; // Show only 4 numbers
    let startPage = Math.max(1, page - 1);
    let endPage = startPage + maxVisibleButtons - 1;

    // Adjust if we are near the end of the total pages
    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${page === i ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>`;
    }

    // --- NEXT BUTTON ---
    html += `
        <li class="page-item ${page === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${page + 1}">
                <i class="bi bi-chevron-right"></i>
            </a>
        </li>`;

    paginationEl.innerHTML = html;

    // --- CLICK HANDLERS ---
    paginationEl.querySelectorAll('.page-link').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const selectedPage = Number(link.dataset.page);

            if (selectedPage >= 1 && selectedPage <= totalPages) {
                currentPage = selectedPage;
                renderProductsPage(currentFilteredProducts, currentPage);

                // Scroll to top of product section
                window.scrollTo({
                    top: productsContainer.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        };
    });
}
// ----------------------
// STOCK HELPER — how many units of a product are already in the cart
// ----------------------
function getCartQtyForProduct(productId) {
    return cart
        .filter(i => i.productId === productId)
        .reduce((sum, i) => sum + i.quantity, 0);
}

// ----------------------
// ADD TO CART FUNCTION (with stock validation)
// ----------------------
function addToCart(name, basePrice, quantity = 1, size = '', emoji = '✨', productId = null) {
    // --- Stock validation ---
    if (productId) {
        const product = products.find(p => p.id === productId);
        if (product && product.stock != null) {
            const alreadyInCart = getCartQtyForProduct(productId);
            if (product.stock <= 0) {
                showCartToast(`❌ ${product.name} is out of stock`);
                return;
            }
            if (alreadyInCart + quantity > product.stock) {
                showCartToast(`⚠️ Only ${product.stock - alreadyInCart} left in stock`);
                return;
            }
        }
    }

    let finalPrice = Number(basePrice);

    cart.push({
        id: cartItemIdCounter++,
        productId,
        name,
        price: finalPrice,
        quantity,
        size,
        emoji
    });

    cartCount += quantity;
    saveAndRenderCart();
    showCartToast(`🟢 ${quantity}x ${name} added to cart`);
}



// ----------------------
// SAVE & RENDER CART
// ----------------------
function saveAndRenderCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
    renderCheckout();
    renderCartOffcanvas();
}

// ----------------------
// UPDATE NAVBAR CART COUNT
// ----------------------
function updateCartCount() {
    const el = document.querySelector('.cart-count');
    if (!el) return;
    el.textContent = cartCount;
    el.style.display = cartCount ? 'inline-block' : 'none';
}

// ----------------------
// RENDER CART MODAL
// ----------------------
function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    const summary = document.getElementById('cartSummary');
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');
    if (!container) return;
    container.innerHTML = '';

    if (!cart.length) {
        if (summary) summary.style.display = 'none';
        container.innerHTML = `<div class="text-center py-5 text-muted">
            <i class="bi bi-cart-x" style="font-size: 4rem; color: #ccc;"></i>
            <p class="mt-3">Your cart is empty</p>
        </div>`;
        return;
    }

    let subtotal = 0;
    cart.forEach(item => {
        const total = item.price * item.quantity;
        subtotal += total;

        container.insertAdjacentHTML('beforeend', `
            <div class="d-flex justify-content-between align-items-center mb-3" data-id="${item.id}">
                <div>🟢 ${item.name} (${item.size || 'N/A'}) x${item.quantity}</div>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-sm btn-outline-secondary decreaseQty">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary increaseQty">+</button>
                    <strong class="ms-2">LE ${total.toFixed(2)}</strong>
                    <button class="btn btn-sm btn-danger ms-2 removeItem">&times;</button>
                </div>
            </div>
        `);
    });

    if (subtotalEl) subtotalEl.textContent = `LE ${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `LE ${subtotal.toFixed(2)}`;
    if (summary) summary.style.display = 'block';

    container.querySelectorAll('.removeItem').forEach(btn =>
        btn.onclick = e => removeCartItem(Number(e.target.closest('[data-id]').dataset.id))
    );
    container.querySelectorAll('.increaseQty').forEach(btn =>
        btn.onclick = e => changeQuantity(Number(e.target.closest('[data-id]').dataset.id), 1)
    );
    container.querySelectorAll('.decreaseQty').forEach(btn =>
        btn.onclick = e => changeQuantity(Number(e.target.closest('[data-id]').dataset.id), -1)
    );
}

// ----------------------
// REMOVE ITEM
// ----------------------
function removeCartItem(id) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    cartCount -= item.quantity;
    cart = cart.filter(i => i.id !== id);
    saveAndRenderCart();
}

// ----------------------
// CHANGE QUANTITY
// ----------------------
function changeQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    // Stock cap when increasing
    if (delta > 0 && item.productId) {
        const product = products.find(p => p.id === item.productId);
        if (product && product.stock != null) {
            const totalInCart = getCartQtyForProduct(item.productId);
            if (totalInCart >= product.stock) {
                showCartToast(`⚠️ Only ${product.stock} available for ${product.name}`);
                return;
            }
        }
    }

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeCartItem(id);
        return;
    }

    cartCount += delta;
    saveAndRenderCart();
}

// ----------------------
// NOTIFICATION
// ----------------------
function showNotification(msg) {
    console.log(msg);
}

// ----------------------
// CHECKOUT FUNCTIONS
// ----------------------
function getSubtotal() {
    return cart.reduce((s, i) => s + i.price * i.quantity, 0);
}

function getShipping() {
    const city = citySelect?.value;
    const baseShipping = shippingByGovernorate[city] || 0;
    const codExtra = codRadio?.checked ? 2 : 0;
    return baseShipping + codExtra;
}

function renderCheckout() {
    if (!checkoutItems) return;
    checkoutItems.innerHTML = '';

    if (!cart.length) {
        if (subtotalEl) subtotalEl.textContent = 'LE 0.00';
        if (shippingEl) shippingEl.textContent = 'Free';
        if (totalEl) totalEl.textContent = 'LE 0.00';
        checkoutItems.innerHTML = `<p class="text-center text-muted py-4">Your cart is empty.</p>`;
        return;
    }

    cart.forEach(item => {
        checkoutItems.insertAdjacentHTML('beforeend', `
            <div class="d-flex justify-content-between">
                <div>🟢 ${item.name} (${item.size || 'N/A'}) × ${item.quantity}</div>
                <strong>LE ${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
        `);
    });

    const subtotal = getSubtotal();
    const shipping = getShipping();
    if (subtotalEl) subtotalEl.textContent = `LE ${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = shipping ? `LE ${shipping.toFixed(2)}` : 'Free';
    if (totalEl) totalEl.textContent = `LE ${(subtotal + shipping).toFixed(2)}`;
}

// ----------------------
// CART OFFCANVAS RENDER
// ----------------------
function renderCartOffcanvas() {
    if (!cartItemsEl) return;
    cartItemsEl.innerHTML = '';
    let total = 0;

    if (!cart.length) {
        if (cartTotalEl) cartTotalEl.textContent = 'LE 0.00';
        cartItemsEl.innerHTML = `<p class="text-center text-muted py-4">Your cart is empty.</p>`;
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        cartItemsEl.insertAdjacentHTML('beforeend', `
            <div class="d-flex justify-content-between align-items-center" data-id="${item.id}">
                <div>🟢 ${item.name} × ${item.quantity}</div>
                <div class="d-flex gap-2 align-items-center">
                    <button class="btn btn-sm btn-outline-secondary decrease">-</button>
                    <button class="btn btn-sm btn-outline-secondary increase">+</button>
                    <strong>LE ${itemTotal.toFixed(2)}</strong>
                    <button class="btn btn-sm btn-danger remove">&times;</button>
                </div>
            </div>
        `);
    });

    if (cartTotalEl) cartTotalEl.textContent = `LE ${total.toFixed(2)}`;

    cartItemsEl.querySelectorAll('.remove').forEach(b => b.onclick = e => updateQty(e, 0, true));
    cartItemsEl.querySelectorAll('.increase').forEach(b => b.onclick = e => updateQty(e, 1));
    cartItemsEl.querySelectorAll('.decrease').forEach(b => b.onclick = e => updateQty(e, -1));
}

function updateQty(e, delta, remove = false) {
    const id = Number(e.target.closest('[data-id]').dataset.id);
    const item = cart.find(i => i.id === id);
    if (!item) return;

    if (remove) {
        cart = cart.filter(i => i.id !== id);
    } else {
        // Stock cap when increasing
        if (delta > 0 && item.productId) {
            const product = products.find(p => p.id === item.productId);
            if (product && product.stock != null) {
                const totalInCart = getCartQtyForProduct(item.productId);
                if (totalInCart >= product.stock) {
                    showCartToast(`⚠️ Only ${product.stock} available for ${product.name}`);
                    return;
                }
            }
        }
        item.quantity += delta;
        if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
    }

    cartCount = cart.reduce((s, i) => s + i.quantity, 0);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCheckout();
    renderCartOffcanvas();
    updateCartCount();
}

// ----------------------
// PAYMENT OPTION SWITCH
// ----------------------
if (visaRadio && codRadio && visaFields && codNote) {
    visaRadio.onchange = codRadio.onchange = () => {
        visaFields.classList.toggle('d-none', !visaRadio.checked);
        codNote.classList.toggle('d-none', !codRadio.checked);
        renderCheckout();
    };
}


// ----------------------

// ----------------------
// PRODUCT OPTIONS MODAL QUANTITY BUTTONS
// ----------------------
if (increaseQtyBtn && decreaseQtyBtn && productQuantityInput) {
    increaseQtyBtn.onclick = () => {
        let val = parseInt(productQuantityInput.value);
        if (val < 99) productQuantityInput.value = val + 1;
    };
    decreaseQtyBtn.onclick = () => {
        let val = parseInt(productQuantityInput.value);
        if (val > 1) productQuantityInput.value = val - 1;
    };
}


// ----------------------
// LOGIN FORM RESET
// ----------------------
document.getElementById('loginModal')?.addEventListener('hidden.bs.modal', () => {
    document.getElementById('loginForm')?.reset();
});

// ----------------------
// SHOW CART TOAST
// ----------------------
function showCartToast(message) {
    const toastEl = document.getElementById('cartToast');
    if (!toastEl) return;

    toastEl.querySelector('.toast-body').textContent = message;
    const toast = new bootstrap.Toast(toastEl, { delay: 2000, autohide: true });
    toast.show();
}

// ----------------------
// RENDER BEST SELLERS
function renderBestSellers(productList = products, maxItems = 4) {
    if (!bestSellerContainer) return;
    bestSellerContainer.innerHTML = '';

    const middleIndex = Math.floor(productList.length / 2);
    const start = Math.max(0, middleIndex - 2);
    const bestSellers = productList.slice(start, start + maxItems);

    bestSellers.forEach(p => {
        bestSellerContainer.insertAdjacentHTML('beforeend', `
            <div class="col-6 col-md-3 mb-4">
                <div class="card h-100 border-0 shadow-sm product-card-hover">
                
                    <div class="position-relative overflow-hidden rounded-top" 
                         onclick="openBestsellerDetail('${p.id}')" 
                         style="cursor:pointer">
                        <div class="img-wrapper">
                            <img src="${p.image}" class="card-img-top p-3" alt="${p.name}" loading="lazy">
                        </div>
                    </div>
                    
                    <div class="card-body d-flex flex-column pt-0 text-center">
                        <h6 class="card-title fw-bold text-dark mb-1 mt-2" 
                            onclick="openBestsellerDetail('${p.id}')" 
                            style="cursor:pointer">
                            🟢 ${p.name}
                        </h6>
                        
                        <div class="mt-auto">
                            <div class="mb-2">
                                <span class="text-muted small d-block mb-0" style="font-size: 0.75rem; letter-spacing: 0.5px; text-transform: uppercase;">
                                    Starts from
                                </span>
                                <span class="fs-5 fw-bold text-success price-green">LE ${p.price.toFixed(2)}</span>
                            </div>
                            
                            ${(p.stock != null && p.stock <= 0)
                ? `<button class="btn btn-secondary btn-sm w-100 rounded-pill" disabled>Out of Stock</button>`
                : p.category === 'stickers'
                    ? `<button class="btn btn-outline-success btn-sm w-100 rounded-pill open-product-options" data-id="${p.id}">
                                        Choose options
                                   </button>`
                    : `<button class="btn btn-success btn-sm w-100 rounded-pill btn-add-to-cart" 
                                        data-id="${p.id}" 
                                        data-name="${p.name}" 
                                        data-price="${p.price}" 
                                        data-emoji="🟢">
                                        Add to Cart
                                   </button>`
            }
                        </div>
                    </div>
                </div>
            </div>
        `);
    });

    // Re-attach listeners for the "Add to Cart" buttons
    bestSellerContainer.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.onclick = () => {
            const product = products.find(p => p.id === btn.dataset.id);
            if (!product) return;
            addToCart(product.name, product.price, 1, '', "🟢", product.id);
        };
    });
}


// ----------------------
// OPEN PRODUCT OPTIONS MODAL (delegated click)
// ----------------------
document?.addEventListener('click', function (e) {
    const btn = e.target.closest('.open-product-options');
    if (!btn) return;
    const productId = btn.dataset.id;

    openProductOptionsModal(productId);
});
let currentProduct = null;

function openProductOptionsModal(productId) {
    if (!productOptionsModal) return;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentProduct = product; // store current product globally

    if (productOptionsModalLabel) productOptionsModalLabel.textContent = product.name;
    if (productOptionsCategory) productOptionsCategory.textContent = `Category: ${product.category}`;
    if (productOptionsPrice) productOptionsPrice.textContent = `LE ${product.price.toFixed(2)}`;

    if (productOptionsName) productOptionsName.value = product.name;
    if (productOptionsBasePrice) productOptionsBasePrice.value = product.price;
    if (productOptionsCategoryInput) productOptionsCategoryInput.value = product.category;

    if (productQuantityInput) productQuantityInput.value = 1;

    // Only show size selector for stickers
    if (productSizeSelect) {
        if (product.category === 'stickers') {
            productSizeSelect.parentElement.style.display = 'block';
            productSizeSelect.value = 'small';
        } else {
            productSizeSelect.parentElement.style.display = 'none';
            productSizeSelect.value = '';
        }
    }

    updateModalPrice();
    productOptionsModal.show();
}



// ----------------------
// SEARCH FUNCTIONALITY
// ----------------------
function getProductUrl(product) {
    return `pages/category.html?cat=${product.category}`;
}

// --- UPDATED SEARCH RESULTS RENDERER ---
function renderSearchResults(results) {
    if (!searchResults) return;

    // Clear dropdown if query is empty
    if (results.length === 0) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        return;
    }

    searchResults.style.display = 'block';
    searchResults.innerHTML = results.map(p => `
        <div class="search-result-item p-2 border-bottom" 
             style="cursor:pointer;" 
             onclick="handleSearchSelection('${p.id}')">
            <div class="d-flex align-items-center">
                <img src="${p.image}" alt="${p.name}" style="width: 35px; height: 35px; object-fit: contain;" class="me-2">
                <div>
                    <div class="fw-bold small mb-0">${p.name}</div>
                    <div class="text-success small" style="font-size: 0.7rem;">LE ${p.price.toFixed(2)}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// --- NEW HELPER: HANDLES CLICKING A SEARCH RESULT ---
// --- UPDATED HELPER: HANDLES CLICKING A SEARCH RESULT ---
function handleSearchSelection(productId) {
    if (searchResults) {
        searchResults.style.display = 'none';
    }

    const searchModalEl = document.getElementById('searchModal');
    if (searchModalEl && window.bootstrap) {
        const modalInstance = bootstrap.Modal.getInstance(searchModalEl);
        if (modalInstance) modalInstance.hide();
    }

    const isHomePage = !document.getElementById('productsContainer');
    if (isHomePage) {
        openBestsellerDetail(productId);
    } else {
        openProductDetail(productId);
    }
}


// --- UPDATED INPUT LISTENER ---
searchInput?.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    if (query === "") {
        currentFilteredProducts = [...products]; // Reset grid to all products
        renderSearchResults([]); // Hide dropdown
    } else {
        // Filter products for the background grid
        currentFilteredProducts = products.filter(p =>
            p.name.toLowerCase().includes(query)
        );

        // Show top 5 matches in the dropdown
        const dropDownMatches = currentFilteredProducts.slice(0, 5);
        renderSearchResults(dropDownMatches);
    }

    currentPage = 1;
    renderProductsPage(currentFilteredProducts, currentPage);
});

// Close search dropdown if user clicks outside
document.addEventListener('click', (e) => {
    if (!searchInput?.contains(e.target) && !searchResults?.contains(e.target)) {
        if (searchResults) searchResults.style.display = 'none';
    }
});

// Get modal elements
const productSize = document.getElementById('productSize');

//update price due to size
function updateModalPrice() {
    if (!currentProduct) return;

    let totalPrice = currentProduct.price;

    if (currentProduct.category === 'stickers') {
        const stickerPrices = { small: 20, medium: 25 };
        const size = productSizeSelect?.value;
        totalPrice = stickerPrices[size] || 20;
    }

    if (productOptionsPrice) productOptionsPrice.textContent = `LE ${totalPrice.toFixed(2)}`;
}


productSize?.addEventListener('change', updateModalPrice);

// Example: Open modal with product
function openProductModal(product) {
    document.getElementById('productOptionsModalLabel').textContent = product.name;
    document.getElementById('productOptionsCategory').textContent = product.category;
    productOptionsBasePrice.value = product.price;
    productSize.value = 'small'; // default
    updateModalPrice();
}

// ----------------------
// PRODUCT OPTIONS FORM SUBMIT
// ----------------------
productOptionsForm?.addEventListener('submit', e => {
    e.preventDefault();
    if (!currentProduct) return;

    const name = productOptionsName?.value;
    const category = productOptionsCategoryInput?.value;
    const quantity = parseInt(productQuantityInput?.value) || 1;
    const size = productSizeSelect?.value;

    let finalPrice = currentProduct.price;

    if (currentProduct.category === 'stickers') {
        if (size === 'medium') finalPrice += 5;
    }

    addToCart(name, finalPrice, quantity, size || '', "🟢", currentProduct.id);
    showCartToast(`✅ ${quantity}x ${name} (${size || 'N/A'}) added to cart`);

    productOptionsModal?.hide();
});




// Helper to find product and trigger view
function openProductDetail(productId) {
    // Save current state before navigating to detail
    history.pushState(
        { page: 'list', pageNum: currentPage, category: categoryFilter?.value || 'all' },
        "",
        window.location.href
    );
    // Then push detail state
    history.pushState(
        { page: 'detail', id: productId },
        "",
        `#product-${productId}`
    );

    const product = products.find(p => p.id == productId);
    if (product) renderProductDetailView(product);
}


function renderProductDetailView(product) {

    const container = document.getElementById('productsContainer');

    const filterSection = document.querySelector('.filter-section');
    const paginationNav = document.getElementById('pagination').closest('nav');

    if (!container) return;

    if (filterSection) filterSection.style.display = 'none';
    if (paginationNav) paginationNav.style.display = 'none';

    const currentIndex = products.findIndex(p => p.id === product.id);
    const relatedProducts = [
        products[(currentIndex + 1) % products.length],
        products[(currentIndex + 2) % products.length]
    ];

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const showSizeOption =
        product.category === "stickers";

    container.innerHTML = `
    <div class="container my-4 my-md-5 animate__animated animate__fadeIn">
        <div class="row g-4 g-lg-5 justify-content-center">
            
            <div class="col-10 col-sm-8 col-md-5 col-lg-4">
                <div class="product-image-wrapper bg-white border rounded-4 overflow-hidden shadow-sm">
                    <img src="${product.image}" class="img-fluid w-100 p-3 p-md-4" alt="${product.name}" style="max-height: 400px; object-fit: contain;">
                </div>
            </div>

            <div class="col-12 col-md-6 col-lg-5">
                <div class="product-info-sticky text-center text-md-start">

                    <h1 class="fw-bold h3 h2-md mb-2">${product.name}</h1>

                    <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-4">
                        <span class="fs-4 fw-bold text-dark" id="detailPrice">LE ${product.price.toFixed(2)}</span>
                        <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 small">In Stock</span>
                    </div>

                    ${showSizeOption ? `
                    <div class="my-4">
                        <label class="form-label small fw-bold text-uppercase text-muted mb-2 d-block text-center text-md-start">
                            Size
                        </label>
                        <select class="form-select rounded-pill mx-auto mx-md-0" 
                                style="width: 200px;" 
                                id="detailSize">
                            <option value="Small">Small (5cm*5cm)</option>
                            <option value="Medium" selected>Medium (10cm*10cm)</option>
                        </select>
                    </div>
                    ` : ''}

                    <div class="my-4">
                        <label class="form-label small fw-bold text-uppercase text-muted mb-2 d-block text-center text-md-start">Quantity</label>
                        <div class="input-group border rounded-pill overflow-hidden mx-auto mx-md-0" style="width: 130px;">
                            <button class="btn btn-link text-dark text-decoration-none px-3" type="button" id="detailDec">—</button>
                            <input type="text" class="form-control border-0 text-center fw-bold bg-transparent" id="detailQty" value="1" readonly>
                            <button class="btn btn-link text-dark text-decoration-none px-3" type="button" id="detailInc">+</button>
                        </div>
                    </div>

                    <div class="d-grid gap-2 gap-md-3">
                        <button class="btn btn-dark btn-lg rounded-pill py-3 fw-bold shadow-sm" id="detailAddToCart">Add to cart</button>
                        <button class="btn btn-outline-dark btn-lg rounded-pill py-3 fw-bold" id="detailBuyNow">Buy it now</button>
                    </div>

                </div>
            </div>
        </div>
    </div>
    `;

    setupDetailEventListeners(product);
}
function setupDetailEventListeners(product) {

    // =========================
    // SIZE + PRICE LOGIC
    // =========================

    const sizeSelect = document.getElementById("detailSize");
    const priceElement = document.getElementById("detailPrice");

    // Size/price logic only for stickers
    if (product.category === 'stickers' && sizeSelect && priceElement) {
        const sizePrices = { Small: 20, Medium: 25 };

        // set default size
        product.size = sizeSelect.value;
        product.price = sizePrices[product.size];
        priceElement.textContent = `LE ${product.price.toFixed(2)}`;

        // update when size changes
        sizeSelect.addEventListener("change", () => {
            product.size = sizeSelect.value;
            product.price = sizePrices[product.size];
            priceElement.textContent = `LE ${product.price.toFixed(2)}`;
        });
    }

    // =========================
    // QUANTITY LOGIC
    // =========================

    const qtyInput = document.getElementById('detailQty');
    const incBtn = document.getElementById('detailInc');
    const decBtn = document.getElementById('detailDec');

    if (incBtn && decBtn && qtyInput) {

        incBtn.onclick = () => {
            const newQty = parseInt(qtyInput.value) + 1;
            // Cap at available stock
            if (product.stock != null && newQty > product.stock) {
                showCartToast(`⚠️ Only ${product.stock} available in stock`);
                return;
            }
            qtyInput.value = newQty;
        };

        decBtn.onclick = () => {
            if (parseInt(qtyInput.value) > 1) {
                qtyInput.value = parseInt(qtyInput.value) - 1;
            }
        };
    }

    // =========================
    // ADD TO CART
    // =========================

    const addBtn = document.getElementById('detailAddToCart');
    const buyBtn = document.getElementById('detailBuyNow');

    // Disable buttons if out of stock
    if (product.stock != null && product.stock <= 0) {
        if (addBtn) {
            addBtn.disabled = true;
            addBtn.classList.replace('btn-dark', 'btn-secondary');
            addBtn.textContent = 'Out of Stock';
        }
        if (buyBtn) {
            buyBtn.disabled = true;
            buyBtn.textContent = 'Out of Stock';
        }
    }

    if (addBtn) {
        addBtn.onclick = () => {
            if (product.stock != null && product.stock <= 0) {
                showCartToast('❌ This product is out of stock');
                return;
            }
            const qty = parseInt(qtyInput.value) || 1;

            addToCart(
                product.name,
                product.price,
                qty,
                product.size,
                '',
                "🟢",
                product.id
            );

            showCartToast(`✅ ${qty}x ${product.name}${product.size ? ' (' + product.size + ')' : ''} added!`);
        };
    }

    if (buyBtn) {
        buyBtn.onclick = () => {
            if (product.stock != null && product.stock <= 0) {
                showCartToast('❌ This product is out of stock');
                return;
            }
            const qty = parseInt(qtyInput.value) || 1;

            addToCart(
                product.name,
                product.price,
                qty,
                product.size || '',
                '',
                "🟢",
                product.id
            );

            const checkoutPath = window.location.pathname.includes("/pages/") ? "checkout.html" : "pages/checkout.html";
            window.location.href = checkoutPath;

        };
    }

    // =========================
    // RECOMMENDATIONS
    // =========================

    renderBestSellers(
        products.filter(p => p.id !== product.id),
        4
    );
}

function attachDetailEvents(product) {
    const minus = document.getElementById('qtyMinus');
    const plus = document.getElementById('qtyPlus');
    const input = document.getElementById('qtyInput');
    const addBtn = document.getElementById('addBtn');

    plus.onclick = () => input.value = parseInt(input.value) + 1;
    minus.onclick = () => {
        if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
    };

    addBtn.onclick = () => {
        // Assuming your cart function is called addToCart
        if (typeof addToCart === 'function') {
            addToCart(product.id, product.name, product.price, parseInt(input.value));
            // Show toast
            const toast = new bootstrap.Toast(document.getElementById('cartToast'));
            toast.show();
        }
    };
}

// Function to go back to the home view
function closeBestsellerDetail() {
    document.getElementById('productDetailPage').style.display = 'none';
    document.getElementById('first-section').style.display = 'block';
    document.getElementById('bestSeller').style.display = 'block';
    document.getElementById('shopByCategory').style.display = 'block';
    window.scrollTo(0, 0);
}
function openBestsellerDetail(productId) {

    history.pushState({ page: 'home' }, "", window.location.href);
    history.pushState({ page: 'detail', id: productId }, "", `#product-${productId}`);

    const product = products.find(p => p.id == productId);
    if (!product) return;

    const landingSections = ['first-section', 'bestSeller', 'shopByCategory'];
    landingSections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    let detailView = document.getElementById('bestsellerDetailView');
    if (!detailView) {
        detailView = document.createElement('div');
        detailView.id = 'bestsellerDetailView';
        document.body.insertBefore(detailView, document.querySelector('footer'));
    }

    detailView.style.display = 'block';
    window.scrollTo(0, 0);

    const relatedProducts = products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 2);

    const showSizeOption =
        product.category === "stickers";

    detailView.innerHTML = `
     <div class="container my-4 my-md-5 animate__animated animate__fadeIn">
        <div class="row g-4 g-lg-5 justify-content-center">
            
            <div class="col-10 col-sm-8 col-md-5 col-lg-4">
                <div class="product-image-wrapper bg-white border rounded-4 overflow-hidden shadow-sm">
                    <img src="${product.image}" class="img-fluid w-100 p-3 p-md-4" alt="${product.name}" style="max-height: 400px; object-fit: contain;">
                </div>
            </div>

            <div class="col-12 col-md-6 col-lg-5">
                <div class="product-info-sticky text-center text-md-start">

                    <h1 class="fw-bold h3 h2-md mb-2">${product.name}</h1>

                    <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-4">
                        <span class="fs-4 fw-bold text-dark" id="detailPrice">LE ${product.price.toFixed(2)}</span>
                        <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 small">In Stock</span>
                    </div>

                    ${showSizeOption ? `
                    <div class="my-4">
                        <label class="form-label small fw-bold text-uppercase text-muted mb-2 d-block text-center text-md-start">
                            Size
                        </label>
                        <select class="form-select rounded-pill mx-auto mx-md-0" 
                                style="width: 200px;" 
                                id="detailSize">
                            <option value="Small">Small (5cm*5cm)</option>
                            <option value="Medium" selected>Medium (10cm*10cm)</option>
                        </select>
                    </div>
                    ` : ''}

                    <div class="my-4">
                        <label class="form-label small fw-bold text-uppercase text-muted mb-2 d-block text-center text-md-start">Quantity</label>
                        <div class="input-group border rounded-pill overflow-hidden mx-auto mx-md-0" style="width: 130px;">
                            <button class="btn btn-link text-dark text-decoration-none px-3" type="button" id="detailDec">—</button>
                            <input type="text" class="form-control border-0 text-center fw-bold bg-transparent" id="detailQty" value="1" readonly>
                            <button class="btn btn-link text-dark text-decoration-none px-3" type="button" id="detailInc">+</button>
                        </div>
                    </div>

                    <div class="d-grid gap-2 gap-md-3">
                        <button class="btn btn-dark btn-lg rounded-pill py-3 fw-bold shadow-sm" id="detailAddToCart">Add to cart</button>
                        <button class="btn btn-outline-dark btn-lg rounded-pill py-3 fw-bold" id="detailBuyNow">Buy it now</button>
                    </div>

                </div>
            </div>
        </div>

        <div class="mt-5 pt-5 border-top">
            <h4 class="fw-bold text-center mb-4">You may also like</h4>
            <div class="row g-3 justify-content-center">
                ${relatedProducts.map(p => `
                    <div class="col-6 col-md-3">
                        <div class="card h-100 border-0 shadow-sm product-card-hover rounded-4 overflow-hidden" 
                             style="cursor:pointer" onclick="openProductDetail('${p.id}')">
                            <img src="${p.image}" class="card-img-top p-3" alt="${p.name}" style="height: 180px; object-fit: contain;">
                            <div class="card-body text-center pt-0">
                                <h6 class="fw-bold small mb-1">${p.name}</h6>
                                <p class="text-success small fw-bold m-0">LE ${p.price.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
    `;

    setupDetailEventListeners(product);
}
document.querySelectorAll('.nav-link[href*="#contact"]').forEach(link => {
    link.addEventListener('click', function (e) {
        const footerSection = document.getElementById('contact');
        const isInPagesFolder = window.location.pathname.includes('/pages/') ||
            window.location.pathname.includes('category.html');
        if (footerSection) {
            e.preventDefault();
            footerSection.scrollIntoView({ behavior: 'smooth' });
        } else if (isInPagesFolder) {
            window.location.href = '../index.html#contact';
        }
    });
});
function backToHome() {
    window.location.href = "index.html";
}
window.onpopstate = function (event) {
    if (event.state && event.state.page === 'list') {
        // Restore category page view
        const filterSection = document.querySelector('.filter-section');
        const paginationNav = document.getElementById('pagination')?.closest('nav');
        if (filterSection) filterSection.style.display = '';
        if (paginationNav) paginationNav.style.display = 'block';

        currentPage = event.state.pageNum || 1;
        if (categoryFilter && event.state.category) {
            categoryFilter.value = event.state.category;
        }
        filterAndSortProducts();
        renderProductsPage(currentFilteredProducts, currentPage);

    } else if (event.state && event.state.page === 'home') {
        // Restore home page sections
        const detailView = document.getElementById('bestsellerDetailView');
        if (detailView) detailView.style.display = 'none';

        ['first-section', 'bestSeller', 'shopByCategory'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = '';
        });
        window.scrollTo(0, 0);

    } else if (!event.state || event.state.page !== 'detail') {
        window.location.href = "index.html";
    }
};


