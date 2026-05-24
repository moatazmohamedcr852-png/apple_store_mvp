// checkout.js

// DOM ELEMENTS
const checkoutPlaceOrderBtn = document.getElementById('placeOrder');
const checkoutOrderMsg = document.getElementById('orderMsg');
const checkoutNameInput = document.getElementById('Name');
const checkoutEmailInput = document.getElementById('email');
const checkoutPhoneInput = document.getElementById('phone');
const checkoutAddressInput = document.getElementById('address');
const checkoutCitySelect = document.getElementById('city');
const checkoutVisaRadio = document.getElementById('pmVisa');
const checkoutCodRadio = document.getElementById('pmCod');
const checkoutVisaFields = document.getElementById('visaFields');
const checkoutCodNote = document.getElementById('codNote');

// Toggle payment fields
[checkoutVisaRadio, checkoutCodRadio].forEach(radio => {
  radio?.addEventListener('change', () => {
    checkoutVisaFields?.classList.toggle('d-none', !checkoutVisaRadio.checked);
    checkoutCodNote?.classList.toggle('d-none', checkoutVisaRadio.checked);
    renderCheckout(); // update shipping cost
  });
});

// Calculate shipping cost
function getShipping() {
  const city = checkoutCitySelect?.value;
  if (!city) return 0;
  const baseShipping = shippingByGovernorate[city] || 0;
  const codExtra = checkoutCodRadio?.checked ? 2 : 0;
  return baseShipping + codExtra;
}

// Calculate subtotal
function getSubtotal() {
  return cart.reduce((s, i) => s + i.price * i.quantity, 0);
}

// Place Order
checkoutPlaceOrderBtn?.addEventListener('click', async () => {
  if (!cart.length || checkoutPlaceOrderBtn.disabled) return;

  const name = checkoutNameInput?.value.trim();
  const email = checkoutEmailInput?.value.trim();
  const phone = checkoutPhoneInput?.value.trim();
  const address = checkoutAddressInput?.value.trim();
  const city = checkoutCitySelect?.value.trim();
  const PhoneNumber = checkoutPhoneInput?.value.trim();



  if (!name || !email || !phone || !address || !city || !PhoneNumber) {
    checkoutOrderMsg.textContent = '❌ Please fill in all required fields.';
    checkoutOrderMsg.style.color = 'red';
    return;
  }

  // Check stock
  const soldOut = cart.find(c => {
    const product = products.find(p => p.id == c.productId);
    return !product || c.quantity > product.stock;
  });

  if (soldOut) {
    checkoutOrderMsg.textContent = '❌ Some items are out of stock.';
    checkoutOrderMsg.style.color = 'red';
    return;
  }

  const total = getSubtotal();
  if (total < 50) {
    checkoutOrderMsg.textContent = '❌ Please add items worth at least 50 LE to proceed.';
    checkoutOrderMsg.style.color = 'red';
    return;
  }

  checkoutPlaceOrderBtn.disabled = true;
  checkoutPlaceOrderBtn.textContent = 'Processing...';




  try {
    const productsPayload = {};
    cart.forEach(item => {
      productsPayload[item.productId] = Number(item.quantity);
    });

    const transactionPayload = {
      name,
      email,
      phoneNumber: phone,
      address,
      city: checkoutCitySelect?.value || '',
      products: productsPayload,
      totalPrice: getSubtotal() + getShipping(),
      paymentMethod: checkoutVisaRadio?.checked ? 'visa' : 'cash',
      status: false
    };

    const res = await fetch('/api/transaction/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(transactionPayload)
    });

    const result = await res.json();

    if (!res.ok) {
      const errorMessage =
        result.errorDetails?.map(e => `${e.field}: ${e.message}`).join(", ") ||
        result.message ||
        "Signup failed";
      throw new Error(errorMessage);
    }

    // Update local stock
    cart.forEach(c => {
      const product = products.find(p => p.id == c.productId);
      if (product) product.stock -= c.quantity;
    });
    localStorage.setItem('products', JSON.stringify(products));

    // Clear cart

    // Clear cart
    cart = [];
    cartCount = 0;
    localStorage.removeItem('cart');

    // Refresh UI
    if (typeof renderProducts === 'function') renderProducts(products);
    renderCheckout();
    if (typeof renderCartOffcanvas === 'function') renderCartOffcanvas();
    if (typeof updateCartCount === 'function') updateCartCount();

    checkoutOrderMsg.textContent = '✅ Order placed successfully!';
    checkoutOrderMsg.style.color = 'green';
    checkoutPlaceOrderBtn.textContent = 'Order Placed ✓';

  } catch (err) {
    console.error('Order Error:', err);
    checkoutOrderMsg.textContent = `❌ ${err.message || 'Error connecting to server'}`;
    checkoutOrderMsg.style.color = 'red';
    checkoutPlaceOrderBtn.disabled = false;
    checkoutPlaceOrderBtn.textContent = 'Place Order';
  }
});
