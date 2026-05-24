/* ============================================
   Admin Dashboard JavaScript
   ============================================ */
const API_BASE = '/api';

// --- Auth Guard ---
function getToken() {
    return localStorage.getItem('adminToken');
}
function requireAuth() {
    if (!getToken()) {
        window.location.href = 'admin-login.html';
    }
}
requireAuth();

// --- API Helper ---
async function api(method, path, body = null) {
    const opts = {
        method,
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, opts);
    const data = await res.json();
    if (res.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminName');
        window.location.href = 'admin-login.html';
        return;
    }
    return data;
}

// --- Toast ---
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// --- Tab Switching ---
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById('pageTitle').textContent =
        tabName === 'products' ? 'Products' : tabName === 'orders' ? 'Orders' : 'Offers';
    // Load data
    if (tabName === 'products') loadProducts();
    else if (tabName === 'orders') loadOrders();
    else if (tabName === 'offers') loadOffers();
}

// --- Logout ---
function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    window.location.href = 'admin-login.html';
}

// ========== PRODUCTS ==========
async function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '<tr><td colspan="6"><div class="loading"><div class="spinner"></div></div></td></tr>';
    try {
        const res = await api('GET', '/product/get-all-products');
        if (res && res.success && res.data.length > 0) {
            tbody.innerHTML = res.data.map(p => `
                <tr>
                    <td><img src="${p.image}" class="product-thumb" alt="${p.name}"></td>
                    <td><strong>${escHtml(p.name)}</strong></td>
                    <td>${escHtml(p.category)}</td>
                    <td>${escHtml(p.type)}</td>
                    <td>
                        ${p.originalPrice && p.originalPrice !== p.price ?
                    `<del style="color:var(--gray-500);font-size:0.9em">${p.originalPrice} LE</del><br><strong style="color:var(--green-600)">${p.price} LE</strong>` :
                    `${p.price} LE`}
                    </td>
                    <td>${p.stock ?? '—'}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn btn-warning btn-sm" onclick="openEditModal('${p.id || p._id}','${escAttr(p.name)}', ${p.originalPrice ?? p.price}, ${p.stock ?? 0}, '${escAttr(p.category)}')">✏️ Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="confirmDelete('${p.id || p._id}','${escAttr(p.name)}')">🗑️ Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📦</div><p>No products found</p></div></td></tr>';
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><p>Failed to load products</p></div></td></tr>';
    }
}

// Delete product
let deleteTargetId = null;
function confirmDelete(id, name) {
    deleteTargetId = id;
    document.getElementById('deleteProductName').textContent = name;
    document.getElementById('deleteModal').classList.add('show');
}
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    deleteTargetId = null;
}
async function executeDelete() {
    if (!deleteTargetId) return;
    try {
        const res = await api('DELETE', `/admin/product/${deleteTargetId}`);
        if (res && res.success) {
            showToast('Product deleted successfully');
            loadProducts();
        } else {
            showToast(res?.message || 'Failed to delete', 'error');
        }
    } catch (err) {
        showToast('Error deleting product', 'error');
    }
    closeDeleteModal();
}

// Edit product
let editTargetId = null;
let editTargetCategory = null;
function openEditModal(id, name, price, stock, category) {
    editTargetId = id;
    editTargetCategory = category || '';
    document.getElementById('editName').value = name;
    const priceInput = document.getElementById('editPrice');
    const priceLabel = document.querySelector('#editModal label[for="editPrice"]');

    if (editTargetCategory === 'stickers') {
        priceInput.value = 20;
        priceInput.readOnly = true;
        priceInput.style.backgroundColor = '#e9ecef';
        priceInput.style.cursor = 'not-allowed';
        if (priceLabel) priceLabel.textContent = 'Price (LE) — Fixed for stickers (Small: 20, Medium: 25)';
    } else {
        priceInput.value = price;
        priceInput.readOnly = false;
        priceInput.style.backgroundColor = '';
        priceInput.style.cursor = '';
        if (priceLabel) priceLabel.textContent = 'Original Price (LE)';
    }

    document.getElementById('editStock').value = stock ?? 0;
    document.getElementById('editModal').classList.add('show');
}
function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    editTargetId = null;
    editTargetCategory = null;
}
async function executeEdit() {
    const name = document.getElementById('editName').value.trim();
    const stock = document.getElementById('editStock').value;

    // For stickers, price is fixed at 20
    const price = editTargetCategory === 'stickers' ? 20 : Number(document.getElementById('editPrice').value);

    if (!name) { showToast('Name is required', 'error'); return; }
    if (editTargetCategory !== 'stickers' && !price) { showToast('Price is required', 'error'); return; }
    if (!editTargetId) return;

    try {
        const res = await api('PUT', `/admin/product/${editTargetId}`, {
            name,
            price: price,
            stock: Number(stock)
        });
        if (res && res.success) {
            showToast('Product updated successfully');
            loadProducts();
        } else {
            showToast(res?.message || 'Failed to update', 'error');
        }
    } catch (err) {
        showToast('Error updating product', 'error');
    }
    closeEditModal();
}

// ========== ORDERS ==========
async function loadOrders() {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '<tr><td colspan="7"><div class="loading"><div class="spinner"></div></div></td></tr>';
    try {
        const res = await api('GET', '/admin/orders');
        if (res && res.success && res.data.length > 0) {
            tbody.innerHTML = res.data.map(o => {
                const productsList = o.products.map(p => `${p.name} ×${p.quantity}`).join(', ');
                const date = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return `
                <tr>
                    <td><strong>${escHtml(o.name)}</strong><br><small style="color:var(--gray-500)">${escHtml(o.email)}</small></td>
                    <td>${escHtml(o.phone)}</td>
                    <td style="max-width:200px">${escHtml(productsList)}</td>
                    <td><strong>${o.totalPrice} LE</strong></td>
                    <td><span class="badge ${o.status ? 'badge-success' : 'badge-pending'}">${o.status ? 'Completed' : 'Pending'}</span></td>
                    <td>${o.paymentMethod.toUpperCase()}</td>
                    <td>${date}</td>
                </tr>
            `}).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📋</div><p>No orders yet</p></div></td></tr>';
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><p>Failed to load orders</p></div></td></tr>';
    }
}

// ========== OFFERS ==========
async function loadOffers() {
    const tbody = document.getElementById('offersTableBody');
    tbody.innerHTML = '<tr><td colspan="5"><div class="loading"><div class="spinner"></div></div></td></tr>';
    try {
        const res = await api('GET', '/admin/offers');
        if (res && res.success && res.data.length > 0) {
            tbody.innerHTML = res.data.map(o => {
                const expiry = new Date(o.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const start = new Date(o.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const now = new Date();
                const startDate = new Date(o.startDate);
                const expiryDate = new Date(o.expiryDate);
                const hasStarted = startDate <= now;
                const isExpired = expiryDate < now;
                const isActive = o.isActive && hasStarted && !isExpired;
                return `
                <tr>
                    <td><strong>${escHtml(o.title)}</strong><br><small class="text-muted">${start} - ${expiry}</small></td>
                    <td><span class="badge badge-offer">${escHtml(o.category)}</span></td>
                    <td><strong>${o.discountValue}${o.discountType === 'percentage' ? '%' : ' LE'}</strong></td>
                    <td><span style="color:${isActive ? 'var(--green-600)' : 'var(--red-500)'}">${isActive ? 'Active' : 'Inactive/Expired'}</span></td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteOffer('${o._id}')">🗑️ Delete</button>
                    </td>
                </tr>
            `}).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">🏷️</div><p>No offers yet</p></div></td></tr>';
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><p>Failed to load offers</p></div></td></tr>';
    }
}

async function createOffer(e) {
    e.preventDefault();
    const title = document.getElementById('offerTitle').value.trim();
    const category = document.getElementById('offerCategory').value;
    const discountType = document.getElementById('offerType').value;
    const discountValueInput = document.getElementById('offerDiscount').value;
    const startDate = document.getElementById('offerStart').value;
    const expiryDate = document.getElementById('offerExpiry').value;

    // Validate required fields
    if (!title || !category || !discountType || !discountValueInput || !startDate || !expiryDate) {
        showToast('Please fill all fields', 'error');
        return;
    }

    // Validate title is not empty after trim
    if (title.length === 0) {
        showToast('Offer title cannot be empty', 'error');
        return;
    }

    // Validate discount value is a valid number
    const discountValue = Number(discountValueInput);
    if (isNaN(discountValue) || discountValue <= 0) {
        showToast('Discount value must be a positive number', 'error');
        return;
    }

    // Validate discount value range based on type
    if (discountType === 'percentage') {
        if (discountValue < 1 || discountValue > 100) {
            showToast('Percentage discount must be between 1 and 100', 'error');
            return;
        }
    } else if (discountType === 'fixed') {
        if (discountValue <= 0) {
            showToast('Fixed discount amount must be greater than 0', 'error');
            return;
        }
    }

    // Validate dates
    const start = new Date(startDate);
    const expiry = new Date(expiryDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time for date comparison

    if (isNaN(start.getTime()) || isNaN(expiry.getTime())) {
        showToast('Invalid date format', 'error');
        return;
    }

    if (expiry <= start) {
        showToast('Expiry date must be after start date', 'error');
        return;
    }

    if (expiry < now) {
        showToast('Expiry date cannot be in the past', 'error');
        return;
    }

    try {
        const payload = {
            title,
            category,
            discountType,
            discountValue,
            startDate,
            expiryDate
        };
        console.log('Sending offer data:', payload);
        const res = await api('POST', '/admin/offer', payload);
        console.log('Server response:', res);

        if (res && res.success) {
            showToast('Offer created successfully');
            document.getElementById('offerForm').reset();
            loadOffers();
        } else {
            console.error('Create offer failed:', res);
            showToast(res?.message || 'Failed to create offer', 'error');
        }
    } catch (err) {
        console.error('Network/JS error:', err);
        showToast('Error creating offer', 'error');
    }
}

async function deleteOffer(id) {
    if (!confirm('Delete this offer?')) return;
    try {
        const res = await api('DELETE', `/admin/offer/${id}`);
        if (res && res.success) {
            showToast('Offer deleted');
            loadOffers();
        } else {
            showToast(res?.message || 'Failed to delete offer', 'error');
        }
    } catch (err) {
        showToast('Error deleting offer', 'error');
    }
}

// --- Helpers ---
function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escAttr(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    const nameEl = document.getElementById('adminNameDisplay');
    if (nameEl) nameEl.textContent = localStorage.getItem('adminName') || 'Admin';
    loadProducts();
});
