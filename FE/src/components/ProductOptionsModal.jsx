import React from 'react';

const ProductOptionsModal = () => {
  return (
    <div className="modal fade" id="productOptionsModal" tabIndex="-1" aria-labelledby="productOptionsModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          {/* Modal Header */}
          <div className="modal-header border-0 pb-0">
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4">
            <div className="row g-4">
              {/* Product Details */}
              <div className="col-md-12">
                <h3 id="productOptionsModalLabel">Product Name</h3>
                <p className="text-muted" id="productOptionsCategory">Category</p>
                <p className="text-muted" id="plusOption">(For special size contact us)</p>
                <div className="mb-4">
                  <span id="productOptionsPrice" className="fs-4">$0.00</span>
                </div>

                <form id="productOptionsForm">
                  <input type="hidden" id="productOptionsName" defaultValue="" />
                  <input type="hidden" id="productOptionsBasePrice" defaultValue="" />
                  <input type="hidden" id="productOptionsCategoryInput" defaultValue="" />

                  <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="productSize">Size</label>
                    <select className="form-select form-select-sm" id="productSize" required>
                      <option value="">Choose an option</option>
                      <option value="small">Small (5cm*5cm)</option>
                      <option value="medium">Medium (10cm*10cm)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="productQuantity">Quantity</label>
                    <div className="input-group input-group-lg">
                      <button type="button" className="btn btn-outline-secondary" id="decreaseQty">-</button>
                      <input type="number" id="productQuantity" className="form-control text-center" defaultValue="1" min="1" max="99" />
                      <button type="button" className="btn btn-outline-secondary" id="increaseQty">+</button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg w-100">
                    <i className="bi bi-cart-plus me-2"></i>Add to Cart
                  </button>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductOptionsModal;
