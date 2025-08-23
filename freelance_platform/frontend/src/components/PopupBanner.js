import React, { useEffect } from 'react';
import '../styles/components/PopupBanner.css';

const PopupBanner = ({ onClose }) => {
  // Prevent scrolling when popup is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  // Close popup when ESC key is pressed
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-banner" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        <div className="popup-content">
          <h2>Under Construction</h2>
          <p>
            Thank you for visiting FreelancePro SL! Our platform is currently under construction as we work to bring you the best freelancing experience in Sierra Leone.
          </p>
          <p>
            We encourage you to check back soon for updates. For any inquiries, please contact:
          </p>
          <div className="popup-contact">
            <p><strong>Ryan Stewart</strong></p>
            <p><i className="fas fa-phone"></i> +23233399391</p>
            <p><i className="fas fa-envelope"></i> support@itservicesfreetown.com</p>
          </div>
          <div className="popup-socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupBanner;
