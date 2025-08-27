import React, { useState, useEffect } from 'react';
import '../styles/components/CookieConsent.css';
import CookieSettings from './CookieSettings';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (cookieConsent === null) {
      // If no choice has been made, show the popup
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setVisible(false);
    // Here you can initialize analytics or other cookie-dependent services
    console.log('Cookies accepted');
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setVisible(false);
    // Here you can ensure no tracking cookies are set
    console.log('Cookies declined');
  };

  const customizeCookies = () => {
    // Open the cookie settings modal
    setShowSettings(true);
  };
  
  const closeSettings = () => {
    setShowSettings(false);
  };

  if (!visible) return null;

  return (
    <>
      <div className="cookie-consent-container">
        <div className="cookie-consent">
          <div className="cookie-content">
            <div className="cookie-icon">
              <i className="fas fa-cookie-bite"></i>
            </div>
            <div className="cookie-text">
              <h3>Cookie Notice</h3>
              <p>
                We use cookies to enhance your browsing experience, serve personalized ads or content, 
                and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                <a href="/privacy" className="cookie-link">Privacy Policy</a>
              </p>
            </div>
          </div>
          <div className="cookie-buttons">
            <button 
              className="cookie-btn customize-btn" 
              onClick={customizeCookies}
            >
              Customize
            </button>
            <button 
              className="cookie-btn decline-btn" 
              onClick={declineCookies}
            >
              Decline
            </button>
            <button 
              className="cookie-btn accept-btn" 
              onClick={acceptCookies}
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
      {showSettings && <CookieSettings isOpen={showSettings} onClose={closeSettings} />}
    </>
  );
};

export default CookieConsent;
