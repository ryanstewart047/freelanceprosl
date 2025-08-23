import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api/auth';
import '../styles/components/Header.css';

const Header = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    // Prevent body scrolling when mobile menu is open
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    // Cleanup function
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              <h1>FreelancePro <span>SL</span></h1>
            </Link>
          </div>

          <nav className={`main-nav ${isMenuOpen ? 'active' : ''}`}>
            <ul>
              <li><Link to="/" onClick={closeMenu}>Home</Link></li>
              <li><Link to="/marketplace" onClick={closeMenu}>Marketplace</Link></li>
              <li><Link to="/freelancers" onClick={closeMenu}>Freelancers</Link></li>
              <li><Link to="/about" onClick={closeMenu}>About Us</Link></li>
              <li><Link to="/contact" onClick={closeMenu}>Contact</Link></li>
            </ul>
          </nav>

          <div className="auth-buttons">
            {user ? (
              <div className="user-menu">
                <button className="user-menu-button" onClick={toggleMenu}>
                  {user.profile_picture ? (
                    <img src={user.profile_picture} alt={user.username} />
                  ) : (
                    <div className="user-initial">{user.username[0]}</div>
                  )}
                  <span className="username">{user.username}</span>
                </button>
                {isMenuOpen && (
                  <div className="dropdown-menu">
                    <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
                    {user.role === 'client' && (
                      <Link to="/post-job" onClick={closeMenu}>Post a Job</Link>
                    )}
                    <Link to="/profile" onClick={closeMenu}>My Profile</Link>
                    <Link to="/messages" onClick={closeMenu}>Messages</Link>
                    <button onClick={() => { handleLogout(); closeMenu(); }}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">Login</Link>
                <Link to="/register" className="btn btn-primary">Sign Up</Link>
              </>
            )}
          </div>

          <button className={`mobile-menu-button ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
      
      {/* Overlay for mobile menu */}
      <div className={`menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu}></div>
    </header>
  );
};

export default Header;
