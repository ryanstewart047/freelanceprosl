import React, { useState, useEffect } from 'react';
import '../styles/components/CookieSettings.css';
import { getCookieConsent } from '../services/cookieService';

const CookieSettings = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState({
    essential: true, // Always true as essential cookies are required
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Load current preferences
    const currentConsent = getCookieConsent();
    
    if (currentConsent === 'accepted') {
      setPreferences({
        essential: true,
        analytics: true,
        marketing: true
      });
    } else if (currentConsent === 'essential') {
      setPreferences({
        essential: true,
        analytics: false,
        marketing: false
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const savePreferences = () => {
    // If both analytics and marketing are enabled, store as 'accepted'
    // If only essential is enabled, store as 'essential'
    const consentType = preferences.analytics && preferences.marketing 
      ? 'accepted' 
      : 'essential';
    
    localStorage.setItem('cookieConsent', consentType);
    
    // Reload the page to apply new cookie settings
    onClose();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="cookie-settings-overlay">
      <div className="cookie-settings-container">
        <div className="cookie-settings-header">
          <h2>Cookie Settings</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="cookie-settings-content">
          <p>
            Customize your cookie preferences below. Essential cookies are required for the website
            to function properly and cannot be disabled.
          </p>
          
          <div className="cookie-settings-options">
            <div className="cookie-option">
              <div className="cookie-option-header">
                <div>
                  <h3>Essential Cookies</h3>
                  <span className="required-badge">Required</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    name="essential" 
                    checked={true} 
                    disabled={true}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <p>
                These cookies are necessary for the website to function properly and cannot be disabled.
                They don't collect any personal information and are used only for essential functionality.
              </p>
            </div>
            
            <div className="cookie-option">
              <div className="cookie-option-header">
                <div>
                  <h3>Analytics Cookies</h3>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    name="analytics" 
                    checked={preferences.analytics} 
                    onChange={handleChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <p>
                These cookies help us understand how visitors interact with our website by collecting anonymous 
                information. We use this data to improve our website's performance and user experience.
              </p>
            </div>
            
            <div className="cookie-option">
              <div className="cookie-option-header">
                <div>
                  <h3>Marketing Cookies</h3>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    name="marketing" 
                    checked={preferences.marketing} 
                    onChange={handleChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <p>
                These cookies are used to deliver relevant advertisements and track the effectiveness of 
                our marketing campaigns. They may also be used to limit the number of times you see an 
                advertisement.
              </p>
            </div>
          </div>
        </div>
        
        <div className="cookie-settings-footer">
          <button className="cookie-btn cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="cookie-btn save-btn" onClick={savePreferences}>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieSettings;
