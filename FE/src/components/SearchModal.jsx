import React from 'react';

const SearchModal = () => {
  return (
    <div className="modal fade" id="searchModal" tabIndex="-1" aria-labelledby="searchModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content search-modal-content">
          <div className="modal-header border-0 pb-0">
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <h3 className="modal-title text-center mb-4" id="searchModalLabel">Search Products</h3>
            <div className="search-container">
              <div className="input-group input-group-lg">
                <input type="text" className="form-control search-input" id="searchInput" placeholder="Search for stickers, products..." autoFocus />
                <button className="btn btn-primary" type="button" id="searchButton">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
              <div id="searchResults" className="search-results mt-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
