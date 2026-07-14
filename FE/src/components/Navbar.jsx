import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import logoImg from '../assets/logo.jpg';

const Navbar = () => {
  const { cart, user, logout } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const closeMenu = () => setIsMenuOpen(false);

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.classList.toggle('mobile-nav-open', isMenuOpen);
    return () => document.body.classList.remove('mobile-nav-open');
  }, [isMenuOpen]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        closeMenu();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeMenu();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <nav
      ref={navRef}
      className={`navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm ${isMenuOpen ? 'menu-open' : ''}`}
    >
      <div className="container">
        {/* TOGGLER */}
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen(open => !open)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* LOGO */}
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/" onClick={closeMenu}>
          <img src={logoImg} alt="Apple Store" className="logo-img" />
        </Link>

        {/* Avoid Bootstrap .collapse — React owns open/close via .show */}
        <div className={`navbar-collapse mobile-nav-panel ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-0 align-items-center elegant-nav">
            <li className={`nav-item dropdown ${user ? '' : 'd-none'}`} id="userMenu">
              <a className="nav-link dropdown-toggle fw-semibold user-box" href="#" role="button" data-bs-toggle="dropdown">
                <span id="userName">{user?.name || 'User'}</span>
              </a>
              <ul className="dropdown-menu">
                <li>
                  <button className="dropdown-item text-danger" id="logoutBtn" onClick={() => { logout(); closeMenu(); window.location.href = '/'; }}>Logout</button>
                </li>
              </ul>
            </li>

            <li className="nav-item"><Link className="nav-link active" to="/" onClick={closeMenu}>Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=stickers" onClick={closeMenu}>Stickers</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=sticker sheets" onClick={closeMenu}>Sticker Sheets</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=laptop stickers" onClick={closeMenu}>Laptop Stickers</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=visa stickers" onClick={closeMenu}>Visa Stickers</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=mugs" onClick={closeMenu}>Mugs</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=medals" onClick={closeMenu}>Medlas</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=coaster" onClick={closeMenu}>Coaster</Link></li>
            <li className="nav-item">
              <a className="nav-link smart-contact-link" href="#contact" onClick={closeMenu}>Contact</a>
            </li>
          </ul>
        </div>

        {/* ICONS */}
        <div className="icon-group d-flex align-items-center">
          {!user && (
            <a href="#" className="nav-icon me-2" id="userIcon" data-bs-toggle="modal" data-bs-target="#loginModal" onClick={closeMenu}>
              <i className="fa-solid fa-user"></i>
            </a>
          )}

          <a href="#" className="nav-icon me-2" data-bs-toggle="modal" data-bs-target="#searchModal" onClick={closeMenu}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </a>

          <a href="#" className="nav-icon btn btn-outline-success position-relative" data-bs-toggle="modal" data-bs-target="#cartModal" onClick={closeMenu}>
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
