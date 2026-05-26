import React, { useState, useEffect } from 'react';
import { getAdminProducts, getOrders, getOffers, deleteProduct, updateProduct, createOffer, deleteOffer } from '../services/api';
import { API_BASE } from '../config/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [offers, setOffers] = useState([]);
  const [adminName, setAdminName] = useState('Admin');
  
  // Modals
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showToast, setShowToast] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState({ id: null, name: '', price: 0, stock: 0, category: '' });

  const [showAddProduct, setShowAddProduct] = useState(false);

  // Offer Form
  const [offerForm, setOfferForm] = useState({ title: '', category: '', discountType: 'percentage', discountValue: '', startDate: '', expiryDate: '' });

  useEffect(() => {
    const name = localStorage.getItem('adminName');
    if (name) setAdminName(name);

    if (!localStorage.getItem('adminToken')) {
      window.location.href = '/pages/admin-login.html';
      return;
    }

    loadProducts();
  }, []);

  const triggerToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const lgout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    window.location.href = '/pages/admin-login.html';
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'products') loadProducts();
    if (tab === 'orders') loadOrders();
    if (tab === 'offers') loadOffers();
  };

  const loadProducts = async () => {
    const res = await getAdminProducts();
    if (res?.success) setProducts(res.data);
  };

  const loadOrders = async () => {
    const res = await getOrders();
    if (res?.success) setOrders(res.data);
  };

  const loadOffers = async () => {
    const res = await getOffers();
    if (res?.success) setOffers(res.data);
  };

  // --- Deletion ---
  const attemptDelete = (id, name) => {
    setDeleteTarget({ id, name });
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteProduct(deleteTarget.id);
    if (res?.success) {
      triggerToast('Product deleted successfully');
      loadProducts();
    } else triggerToast(res?.message || 'Failed', 'error');
    setShowDeleteModal(false);
  };

  // --- Editing ---
  const attemptEdit = (p) => {
    setEditTarget({ id: p.id || p._id, name: p.name, price: p.originalPrice ?? p.price, stock: p.stock ?? 0, category: p.category });
    setShowEditModal(true);
  };
  const confirmEdit = async () => {
    const price = editTarget.category === 'stickers' ? 20 : Number(editTarget.price);
    const res = await updateProduct(editTarget.id, { name: editTarget.name, price, stock: Number(editTarget.stock) });
    if (res?.success) {
      triggerToast('Updated successfully');
      loadProducts();
    } else triggerToast(res?.message || 'Failed', 'error');
    setShowEditModal(false);
  };

  // --- Offers ---
  const submitOffer = async (e) => {
    e.preventDefault();
    const res = await createOffer({ ...offerForm, discountValue: Number(offerForm.discountValue) });
    if (res?.success) {
      triggerToast('Offer created successfully');
      setOfferForm({ title: '', category: '', discountType: 'percentage', discountValue: '', startDate: '', expiryDate: '' });
      loadOffers();
    } else triggerToast(res?.message || 'Failed', 'error');
  };

  return (
    <>
      <div className={`toast toast-${toastType} ${showToast ? 'show' : ''}`} id="toast">{toastMsg}</div>

      {showDeleteModal && (
        <div className="modal-overlay show" id="deleteModal" style={{ display: 'flex' }}>
          <div className="modal">
            <h3>⚠️ Delete Product</h3>
            <p>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.</p>
            <div className="modal-btns">
              <button className="btn" style={{ background: 'var(--gray-100)', color: 'var(--gray-700)' }} onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay show" id="editModal" style={{ display: 'flex' }}>
          <div className="modal">
            <h3>✏️ Edit Product</h3>
            <div className="form-group">
              <label htmlFor="editName">Name</label>
              <input type="text" id="editName" value={editTarget.name} onChange={e => setEditTarget({ ...editTarget, name: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label htmlFor="editPrice">Original Price (LE)</label>
              <input type="number" id="editPrice" step="0.01" value={editTarget.price} onChange={e => setEditTarget({ ...editTarget, price: e.target.value })} readOnly={editTarget.category === 'stickers'} style={editTarget.category === 'stickers' ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}} />
            </div>
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label htmlFor="editStock">Stock</label>
              <input type="number" id="editStock" value={editTarget.stock} onChange={e => setEditTarget({ ...editTarget, stock: e.target.value })} />
            </div>
            <div className="modal-btns">
              <button className="btn" style={{ background: 'var(--gray-100)', color: 'var(--gray-700)' }} onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="icon">🍎</div>
            <span>Apple Store</span>
          </div>
          <nav className="sidebar-nav">
            <button className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => handleTabSwitch('products')}>
              <span className="nav-icon">📦</span>
              <span>Products</span>
            </button>
            <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => handleTabSwitch('orders')}>
              <span className="nav-icon">📋</span>
              <span>Orders</span>
            </button>
            <button className={`nav-item ${activeTab === 'offers' ? 'active' : ''}`} onClick={() => handleTabSwitch('offers')}>
              <span className="nav-icon">🏷️</span>
              <span>Offers</span>
            </button>
          </nav>
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={lgout}>
              <span className="nav-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="main-content">
          <div className="page-header">
            <h1 id="pageTitle">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <span className="admin-name">👋 Hello, <span id="adminNameDisplay">{adminName}</span></span>
          </div>

          <div className={`tab-content ${activeTab === 'products' ? 'active' : ''}`} id="tab-products">
            <div className="card">
              <div className="card-header">
                <h2>All Products</h2>
                <button className="btn btn-primary" onClick={() => setShowAddProduct(!showAddProduct)}>
                  ➕ Add Product
                </button>
              </div>

              {showAddProduct && (
                <div id="addProductCard" style={{ marginBottom: '20px', padding: '20px', background: 'var(--green-50)', borderRadius: '12px', border: '1px solid var(--green-200)' }}>
                  <h3 style={{ marginBottom: '16px', fontSize: '15px', color: 'var(--green-800)' }}>Add New Product</h3>
                  <form id="addProductForm" onSubmit={async (e) => {
                    e.preventDefault();
                    const name = document.getElementById('apName').value;
                    const priceInput = document.getElementById('apPrice');
                    const price = priceInput ? Number(priceInput.value) : 20; // Default stickers price
                    const stock = Number(document.getElementById('apStock').value);
                    const category = document.getElementById('apCategory').value;
                    let image = document.getElementById('apImage').value || 'https://via.placeholder.com/300?text=New+Product';
                    
                    const res = await fetch(`${API_BASE}/admin/product`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ name, price, stock, category, image })
                    });
                    
                    if (res.ok) {
                      triggerToast('Product added successfully');
                      document.getElementById('addProductForm').reset();
                      loadProducts();
                    } else {
                      triggerToast('Failed to add product', 'error');
                    }
                  }}>
                    <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                      <div className="form-group" style={{ flex: 1 }}><label>Name</label><input type="text" id="apName" required placeholder="Product name" className="form-control" /></div>
                      <div className="form-group" id="apPriceGroup" style={{ flex: 1 }}><label id="apPriceLabel">Price (LE)</label><input type="number" id="apPrice" required placeholder="0.00" step="0.01" className="form-control" /></div>
                    </div>
                    <div className="form-row" style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                      <div className="form-group" style={{ flex: 1 }}><label>Stock</label><input type="number" id="apStock" placeholder="0" className="form-control" /></div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Category</label>
                        <select id="apCategory" required className="form-control" onChange={(e) => {
                          const apPrice = document.getElementById('apPrice');
                          if (e.target.value === 'stickers') {
                            apPrice.value = '20';
                            apPrice.readOnly = true;
                            apPrice.style.backgroundColor = '#e9ecef';
                          } else {
                            apPrice.readOnly = false;
                            apPrice.style.backgroundColor = '';
                          }
                        }}>
                          <option value="">Select category...</option>
                          <option value="stickers">Stickers</option>
                          <option value="sticker sheets">Sticker Sheets</option>
                          <option value="mugs">Mugs</option>
                          <option value="medals">Medals</option>
                          <option value="coaster">Coasters</option>
                          <option value="visa stickers">Visa Stickers</option>
                          <option value="laptop stickers">Laptop Stickers</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '15px' }}><label>Image URL</label><input type="text" id="apImage" placeholder="https://..." className="form-control" /></div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>Save Product</button>
                  </form>
                </div>
              )}

              <div className="table-wrap">
                <table>
                  <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Type</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                  <tbody id="productsTableBody">
                    {products.map(p => (
                      <tr key={p.id || p._id}>
                        <td><img src={p.image} className="product-thumb" alt={p.name} /></td>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.category}</td>
                        <td>{p.type}</td>
                        <td>{p.price} LE</td>
                        <td>{p.stock ?? '—'}</td>
                        <td>
                          <div className="action-btns">
                            <button className="btn btn-warning btn-sm" onClick={() => attemptEdit(p)}>✏️ Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => attemptDelete(p.id || p._id, p.name)}>🗑️ Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'orders' ? 'active' : ''}`} id="tab-orders">
             <div className="card">
                <div className="card-header"><h2>All Orders</h2></div>
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>Customer</th><th>Phone</th><th>Products</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th></tr></thead>
                        <tbody id="ordersTableBody">
                           {orders.map(o => (
                               <tr key={o._id || o.id}>
                                   <td><strong>{o.name}</strong><br/><small style={{color:'var(--gray-500)'}}>{o.email}</small></td>
                                   <td>{o.phone}</td>
                                   <td style={{maxWidth:'200px'}}>{o.products?.map(p => `${p.name} ×${p.quantity}`).join(', ')}</td>
                                   <td><strong>{o.totalPrice} LE</strong></td>
                                   <td><span className={`badge ${o.status ? 'badge-success' : 'badge-pending'}`}>{o.status ? 'Completed' : 'Pending'}</span></td>
                                   <td>{o.paymentMethod?.toUpperCase()}</td>
                                   <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
             </div>
          </div>

          <div className={`tab-content ${activeTab === 'offers' ? 'active' : ''}`} id="tab-offers">
            <div className="card">
              <div className="card-header"><h2>Create New Offer</h2></div>
              <form id="offerForm" onSubmit={submitOffer}>
                <div className="form-row">
                   <div className="form-group"><label>Offer Title</label><input type="text" value={offerForm.title} onChange={e=>setOfferForm({...offerForm, title: e.target.value})} required /></div>
                   <div className="form-group">
                       <label>Category</label>
                       <select value={offerForm.category} onChange={e=>setOfferForm({...offerForm, category: e.target.value})} required>
                           <option value="">Select category</option>
                           <option value="stickers">Stickers</option>
                       </select>
                   </div>
                </div>
                {/* Form fields identical to vanilla */}
                <button type="submit" className="btn btn-primary">🏷️ Create Offer</button>
              </form>
            </div>
            <div className="card mt-4">
              <div className="card-header"><h2>Active Offers</h2></div>
              <div className="table-wrap">
                  <table>
                      <thead><tr><th>Title</th><th>Category</th><th>Discount</th><th>Expires</th><th>Actions</th></tr></thead>
                      <tbody id="offersTableBody">
                          {offers.map(o => (
                              <tr key={o._id}>
                                  <td><strong>{o.title}</strong></td>
                                  <td><span className="badge badge-offer">{o.category}</span></td>
                                  <td><strong>{o.discountValue}{o.discountType === 'percentage' ? '%' : ' LE'}</strong></td>
                                  <td>{new Date(o.expiryDate).toLocaleDateString()}</td>
                                  <td>
                                      <button className="btn btn-danger btn-sm" onClick={async () => {
                                          await deleteOffer(o._id); loadOffers();
                                      }}>🗑️ Delete</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
