// let cart = [];
// let cartCount = 0;
// let cartItemIdCounter = 0;

// const params = new URLSearchParams(window.location.search);
// const activeCategory = params.get('cat');

// const allProducts = [
//     { name:'Sparkle Pack', description:'10 Premium Sparkle Stickers', price:'$9.99', emoji:'✨', category:'cute', badge:'Hot', badgeClass:'bg-danger' },
//     { name:'Art Collection', description:'15 Artistic Design Stickers', price:'$14.99', emoji:'🎨', category:'art', badge:'Popular', badgeClass:'bg-success' },
//     { name:'Star Bundle', description:'20 Star-Themed Stickers', price:'$12.99', emoji:'🌟', category:'cute', badge:'New' },
//     { name:'Professional Pack', description:'12 Business Stickers', price:'$11.99', emoji:'💼', category:'business', badge:'Trending', badgeClass:'bg-warning' },
//     { name:'Football Pack', description:'Football Stickers', price:'$13.99', emoji:'⚽', category:'football' },
//     { name:'Anime Pack', description:'Anime Stickers', price:'$15.99', emoji:'🧑‍🎤', category:'anime' }
// ];

// function addProductToBestSeller(product) {
//     const container = document.getElementById('bestSellerContainer');
//     if (!container) return;

//     container.insertAdjacentHTML('beforeend', `
//         <div class="col-6 col-md-4 col-lg-3">
//             <div class="product-card">
//                 <div class="product-image">
//                     ${product.badge ? `<div class="product-badge ${product.badgeClass || ''}">${product.badge}</div>` : ''}
//                     <div style="font-size:2rem;height:100px;display:flex;align-items:center;justify-content:center">
//                         ${product.emoji}
//                     </div>
//                 </div>
//                 <div class="product-info">
//                     <h5>${product.name}</h5>
//                     <p class="text-muted">${product.description}</p>
//                     <div class="d-flex justify-content-between align-items-center">
//                         <span class="price">${product.price}</span>
//                         <button class="btn btn-primary btn-sm choose-options-btn"
//                             data-product-name="${product.name}"
//                             data-product-price="${product.price}"
//                             data-product-description="${product.description}"
//                             data-product-emoji="${product.emoji}">
//                             Choose options
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `);
// }

// function initBestSellerProducts() {
//     const container = document.getElementById('bestSellerContainer');
//     if (!container) return;
//     container.innerHTML = '';

//     const products = activeCategory
//         ? allProducts.filter(p => p.category === activeCategory)
//         : allProducts;

//     products.forEach(addProductToBestSeller);
// }

// function addToCart(name, price, quantity = 1, size = '', emoji = '✨') {
//     cart.push({
//         id: cartItemIdCounter++,
//         name,
//         price: parseFloat(price),
//         quantity,
//         size,
//         emoji
//     });

//     cartCount += quantity;
//     updateCartCount();
//     renderCart();
//     showNotification(`${quantity}x ${name} added to cart!`);
// }

// function updateCartCount() {
//     const el = document.querySelector('.cart-count');
//     if (!el) return;
//     el.textContent = cartCount;
//     el.style.display = cartCount ? 'inline-block' : 'none';
// }

// function showNotification(message) {
//     const n = document.createElement('div');
//     n.className = 'notification';
//     n.style.cssText = `
//         position:fixed;top:20px;right:20px;
//         background:#28a745;color:#fff;
//         padding:1rem 1.5rem;border-radius:10px;
//         z-index:9999;
//     `;
//     n.textContent = message;
//     document.body.appendChild(n);
//     setTimeout(() => n.remove(), 3000);
// }

// function initProductOptions() {
//     document.addEventListener('click', e => {
//         const btn = e.target.closest('.choose-options-btn');
//         if (!btn) return;
//         openProductOptionsModal(btn);
//     });

//     productOptionsForm?.addEventListener('submit', e => {
//         e.preventDefault();
//         const qty = parseInt(productQuantity.value) || 1;
//         if (!productSize.value) return showNotification('Select size');
//         addToCart(
//             `${productOptionsName.value} (${productSize.value})`,
//             productOptionsBasePrice.value,
//             qty,
//             productSize.value,
//             productOptionsImage.textContent
//         );
//         bootstrap.Modal.getInstance(productOptionsModal).hide();
//         productOptionsForm.reset();
//     });
// }

// function openProductOptionsModal(btn) {
//     productOptionsModalLabel.textContent = btn.dataset.productName;
//     productOptionsDescription.textContent = btn.dataset.productDescription;
//     productOptionsPrice.textContent = btn.dataset.productPrice;
//     productOptionsName.value = btn.dataset.productName;
//     productOptionsBasePrice.value = btn.dataset.productPrice.replace('$','');
//     productOptionsImage.innerHTML = `<div style="font-size:4rem">${btn.dataset.productEmoji}</div>`;
//     new bootstrap.Modal(productOptionsModal).show();
// }

// function renderCart() {
//     const container = document.getElementById('cartItemsContainer');
//     const summary = document.getElementById('cartSummary');
//     const subtotalEl = document.getElementById('cartSubtotal');
//     const totalEl = document.getElementById('cartTotal');

//     if (!container) return;
//     container.innerHTML = '';

//     if (!cart.length) {
//         summary.style.display = 'none';
//         container.innerHTML = `<div class="text-center py-5 text-muted">Your cart is empty</div>`;
//         return;
//     }

//     let subtotal = 0;

//     cart.forEach(item => {
//         const total = item.price * item.quantity;
//         subtotal += total;

//         container.insertAdjacentHTML('beforeend', `
//             <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
//                 <div class="d-flex gap-3 align-items-center">
//                     <div style="font-size:2rem">${item.emoji}</div>
//                     <div>
//                         <strong>${item.name}</strong>
//                         <div class="small text-muted">Qty: ${item.quantity}</div>
//                     </div>
//                 </div>
//                 <div class="d-flex gap-3 align-items-center">
//                     <strong>$${total.toFixed(2)}</strong>
//                     <button class="btn btn-sm btn-outline-danger remove-item" data-id="${item.id}">&times;</button>
//                 </div>
//             </div>
//         `);
//     });

//     subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
//     totalEl.textContent = `$${subtotal.toFixed(2)}`;
//     summary.style.display = 'block';
// }

// document.addEventListener('click', e => {
//     const btn = e.target.closest('.remove-item');
//     if (!btn) return;

//     const i = cart.findIndex(x => x.id == btn.dataset.id);
//     if (i !== -1) {
//         cartCount -= cart[i].quantity;
//         cart.splice(i, 1);
//         updateCartCount();
//         renderCart();
//     }
// });

// function initQuantityButtons() {
//     increaseQty?.addEventListener('click', () => productQuantity.value = Math.min(99, (+productQuantity.value || 1) + 1));
//     decreaseQty?.addEventListener('click', () => productQuantity.value = Math.max(1, (+productQuantity.value || 1) - 1));
// }

// checkoutButton?.addEventListener('click', () => {
//     if (!cart.length) return showNotification('Your cart is empty');
//     localStorage.setItem('cart', JSON.stringify(cart));
//     localStorage.setItem('cartCount', cartCount);
//     location.href = './pages/checkOut.html';
// });

// document.addEventListener('DOMContentLoaded', () => {
//     updateCartCount();
//     initBestSellerProducts();
//     initProductOptions();
//     initQuantityButtons();
//     document.getElementById('cartModal')?.addEventListener('show.bs.modal', renderCart);

//     const title = document.getElementById('categoryTitle');
//     if (title && activeCategory) title.textContent = `${activeCategory[0].toUpperCase()}${activeCategory.slice(1)} Stickers`;
// });
