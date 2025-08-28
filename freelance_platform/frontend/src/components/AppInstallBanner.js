import React, { useState, useEffect } from 'react';
import '../styles/components/AppInstallBanner.css';

const AppInstallBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    // Check if it's a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Don't show if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if banner was dismissed before
    const bannerDismissed = localStorage.getItem('appBannerDismissed');
    
    // Show after 5 seconds on mobile devices that aren't in standalone mode
    if (isMobile && !isStandalone && !bannerDismissed) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('appBannerDismissed', 'true');
  };
  
  if (!showBanner) return null;
  
  return (
    <div className="app-install-banner">
      <div className="app-install-content">
        <img src="images/favicon.svg" alt="FreelancePro SL" className="app-banner-icon" />
        <div className="app-banner-text">
          <p>Install our app for a better experience</p>
        </div>
      </div>
      <div className="app-install-actions">
        <button className="app-install-button">Install</button>
        <button className="app-dismiss-button" onClick={handleDismiss}>
          <span className="dismiss-icon">×</span>
        </button>
      </div>
    </div>
  );
};

export default AppInstallBanner;
