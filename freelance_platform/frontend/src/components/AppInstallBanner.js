import React, { useState, useEffect } from 'react';
import '../styles/components/AppInstallBanner.css';

const AppInstallBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [installStatus, setInstallStatus] = useState(null); // 'success', 'failed', or null
  
  useEffect(() => {
    // Function to handle the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setInstallPromptEvent(e);
      console.log('beforeinstallprompt event captured');
    };

    // Add event listener for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if it's a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Don't show if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         navigator.standalone === true;
    
    // Check if banner was dismissed before
    const bannerDismissed = localStorage.getItem('appBannerDismissed');
    
    // Show after 5 seconds on all devices that aren't in standalone mode
    if (!isStandalone && !bannerDismissed) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 5000);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  // Add event listener for appinstalled event
  useEffect(() => {
    const handleAppInstalled = () => {
      console.log('App was successfully installed');
      setInstalling(false);
      setInstallStatus('success');
      // Hide banner after successful installation
      setTimeout(() => {
        setShowBanner(false);
      }, 3000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
  
  const handleInstall = () => {
    if (!installPromptEvent) {
      console.log('No install prompt event captured');
      // Show manual instructions if no install prompt event
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        alert('To install on iOS: tap the share icon and select "Add to Home Screen"');
      } else {
        alert('To install: open browser menu and select "Install app" or "Add to Home screen"');
      }
      return;
    }
    
    // Set installing state to show progress
    setInstalling(true);
    
    // Show the install prompt
    installPromptEvent.prompt();
    
    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        // The appinstalled event will handle success
      } else {
        console.log('User dismissed the install prompt');
        setInstalling(false);
        setInstallStatus('failed');
        // Reset status after 3 seconds
        setTimeout(() => {
          setInstallStatus(null);
        }, 3000);
      }
      // Clear the stored prompt event
      setInstallPromptEvent(null);
    });
  };
  
  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('appBannerDismissed', 'true');
  };
  
  if (!showBanner) return null;
  
  return (
    <div className="app-install-banner">
      <div className="app-install-content">
        <img src={`${process.env.PUBLIC_URL}/images/favicon.svg`} alt="FreelancePro SL" className="app-banner-icon" />
        <div className="app-banner-text">
          <p>Install our app for a better experience</p>
          {installStatus === 'success' && <p className="install-status success">Installation successful!</p>}
          {installStatus === 'failed' && <p className="install-status failed">Installation cancelled</p>}
        </div>
      </div>
      <div className="app-install-actions">
        <button 
          className={`app-install-button ${installing ? 'installing' : ''}`} 
          onClick={handleInstall}
          disabled={installing}
        >
          {installing ? 'Installing...' : 'Install'}
          {installing && <span className="loading-spinner"></span>}
        </button>
        <button className="app-dismiss-button" onClick={handleDismiss}>
          <span className="dismiss-icon">×</span>
        </button>
      </div>
    </div>
  );
};

export default AppInstallBanner;
