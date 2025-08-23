import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Footer.css';

const Footer = () => {
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
              <a href="https://facebook.com" className="social-icon">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://twitter.com" className="social-icon">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" className="social-icon">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://linkedin.com" className="social-icon">
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
            <form>
              <input type="email" name="email" className="contact-input" placeholder="Your email address..." />
              <textarea name="message" className="contact-input" placeholder="Your message..."></textarea>
              <button type="submit" className="btn btn-primary">Send</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} FreelancePro SL. All rights reserved. | Developed by Ryan Stewart</p>
          <div className="footer-bottom-links">
            <Link to="/terms">Terms & Conditions</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
