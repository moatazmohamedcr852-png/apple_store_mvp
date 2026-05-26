import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const { cart, user, logout } = useAppContext();
  
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
      <div className="container">
        {/* TOGGLER */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* LOGO */}
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <img src="/src/assets/logo.jpg" alt="Apple Store" className="logo-img" />
        </Link>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-0 align-items-center elegant-nav">
            <li className={`nav-item dropdown ${user ? '' : 'd-none'}`} id="userMenu">
              <a className="nav-link dropdown-toggle fw-semibold user-box" href="#" role="button" data-bs-toggle="dropdown">
                <span id="userName">{user?.name || 'User'}</span>
              </a>
              <ul className="dropdown-menu">
                <li>
                  <button className="dropdown-item text-danger" id="logoutBtn" onClick={() => { logout(); window.location.href = '/'; }}>Logout</button>
                </li>
              </ul>
            </li>

            <li className="nav-item"><Link className="nav-link active" to="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=stickers">Stickers</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=sticker sheets">Sticker Sheets</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=laptop stickers">Laptop Stickers</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=visa stickers">Visa Stickers</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=mugs">Mugs</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=medals">Medlas</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=coaster">Coaster</Link></li>
            <li className="nav-item">
              <a className="nav-link smart-contact-link" href="#contact">Contact</a>
            </li>
          </ul>
        </div>

        {/* ICONS */}
        <div className="icon-group d-flex align-items-center">
          {/* User icon (logged out) */}
          {!user && (
            <a href="#" className="nav-icon me-2" id="userIcon" data-bs-toggle="modal" data-bs-target="#loginModal">
              <i className="fa-solid fa-user"></i>
            </a>
          )}

          <a href="#" className="nav-icon me-2" data-bs-toggle="modal" data-bs-target="#searchModal">
            <i className="fa-solid fa-magnifying-glass"></i>
          </a>

          <a href="#" className="nav-icon btn btn-outline-success position-relative" data-bs-toggle="modal" data-bs-target="#cartModal">
            <i className="bi bi-cart3"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-count">
              {cartCount}
            </span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
