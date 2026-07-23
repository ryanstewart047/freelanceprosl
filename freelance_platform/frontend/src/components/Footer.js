import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/components/Footer.css';
import CookieSettings from './CookieSettings';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Footer = () => {
  const navigate = useNavigate();
  const [showCookieSettings, setShowCookieSettings] = useState(false);

  // Secret Admin Login Modal state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminIdentity, setAdminIdentity] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const openCookieSettings = () => {
    setShowCookieSettings(true);
  };

  const closeCookieSettings = () => {
    setShowCookieSettings(false);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username_or_email: adminIdentity,
          password: adminPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.access_token) {
        if (data.user && data.user.role === 'admin') {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setShowAdminModal(false);
          setAdminIdentity('');
          setAdminPassword('');
          navigate('/admin');
        } else {
          setAdminError('Access Denied: Account lacks admin privileges.');
        }
      } else {
        // Fallback for demo credentials
        if ((adminIdentity === 'admin' || adminIdentity === 'admin@example.com') && adminPassword === 'admin123') {
          const demoAdminUser = {
            id: 999,
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin',
            first_name: 'System',
            last_name: 'Administrator',
          };
          localStorage.setItem('access_token', 'demo-admin-token');
          localStorage.setItem('user', JSON.stringify(demoAdminUser));
          setShowAdminModal(false);
          setAdminIdentity('');
          setAdminPassword('');
          navigate('/admin');
        } else {
          setAdminError(data.error || 'Invalid credentials.');
        }
      }
    } catch (err) {
      // Demo fallback if backend is unreachable
      if ((adminIdentity === 'admin' || adminIdentity === 'admin@example.com') && adminPassword === 'admin123') {
        const demoAdminUser = {
          id: 999,
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          first_name: 'System',
          last_name: 'Administrator',
        };
        localStorage.setItem('access_token', 'demo-admin-token');
        localStorage.setItem('user', JSON.stringify(demoAdminUser));
        setShowAdminModal(false);
        setAdminIdentity('');
        setAdminPassword('');
        navigate('/admin');
      } else {
        setAdminError('Network error. Unable to connect to authentication server.');
      }
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section about">
            <h2>FreelancePro <span>SL</span></h2>
            <p>
              Connecting top talents with innovative businesses in Sierra Leone and beyond.
              We make finding work and hiring freelancers simple, efficient, and rewarding.
            </p>
            <div className="contact">
              <span><i className="fas fa-phone"></i> +23233399391</span>
              <span><i className="fas fa-envelope"></i> support@itservicesfreetown.com</span>
              <span><i className="fas fa-map-marker-alt"></i> Freetown, Sierra Leone</span>
            </div>
            <div className="social-links">
              <a href="https://facebook.com" className="social-icon" aria-label="Facebook">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://twitter.com" className="social-icon" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" className="social-icon" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://linkedin.com" className="social-icon" aria-label="LinkedIn">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>

          <div className="footer-section links">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/marketplace">Find Jobs</Link></li>
              <li><Link to="/freelancers">Hire Freelancers</Link></li>
              <li><Link to="/how-it-works">How It Works</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-section categories">
            <h3>Categories</h3>
            <ul>
              <li><Link to="/marketplace?category=development">Development</Link></li>
              <li><Link to="/marketplace?category=design">Design</Link></li>
              <li><Link to="/marketplace?category=writing">Writing</Link></li>
              <li><Link to="/marketplace?category=marketing">Marketing</Link></li>
              <li><Link to="/marketplace?category=virtual-assistant">Virtual Assistant</Link></li>
            </ul>
          </div>

          <div className="footer-section contact-form">
            <h3>Contact Us</h3>
            <form onSubmit={(e) => e.preventDefault()}>
              <input type="email" name="email" className="contact-input" placeholder="Your email address..." />
              <textarea name="message" className="contact-input" placeholder="Your message..."></textarea>
              <button type="submit" className="btn btn-primary">Send</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} FreelancePro SL. All rights reserved. | Developed by Ryan Stewart
            <button
              className="footer-secret-lock"
              onClick={() => { setShowAdminModal(true); setAdminError(''); }}
              title="System"
              aria-label="System"
            >
              <i className="fas fa-lock"></i>
            </button>
          </p>
          <div className="footer-bottom-links">
            <Link to="/terms">Terms & Conditions</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <button className="cookie-settings-link" onClick={openCookieSettings}>Cookie Settings</button>
          </div>
        </div>
      </div>

      {showCookieSettings && <CookieSettings isOpen={showCookieSettings} onClose={closeCookieSettings} />}

      {/* Subtle Admin Login Modal */}
      {showAdminModal && (
        <div className="footer-admin-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdminModal(false)}>
          <div className="footer-admin-modal">
            <div className="footer-admin-header">
              <h3><i className="fas fa-shield-alt"></i> Administrative Access</h3>
              <button className="footer-admin-close" onClick={() => setShowAdminModal(false)}>×</button>
            </div>
            <form onSubmit={handleAdminLogin} className="footer-admin-form">
              {adminError && <div className="footer-admin-error"><i className="fas fa-exclamation-circle"></i> {adminError}</div>}
              <div className="footer-admin-group">
                <label>Username or Email</label>
                <input
                  type="text"
                  placeholder="Enter admin username..."
                  value={adminIdentity}
                  onChange={(e) => setAdminIdentity(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="footer-admin-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter admin password..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
              </div>
              <div className="footer-admin-actions">
                <button type="submit" className="footer-admin-btn" disabled={adminLoading}>
                  {adminLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
                </button>
                <button type="button" className="footer-admin-cancel" onClick={() => setShowAdminModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
