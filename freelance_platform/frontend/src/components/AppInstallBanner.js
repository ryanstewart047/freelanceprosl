import React, { useState, useEffect, useCallback } from 'react';
import '../styles/components/AppInstallBanner.css';

// Detect if it's a mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Detect if it's already installed as PWA
const isRunningStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         navigator.standalone === true;
};

const AppInstallBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [installStatus, setInstallStatus] = useState(null); // 'success', 'failed', or null
  const [autoInstallAttempted, setAutoInstallAttempted] = useState(false);
  
  // Function to handle automatic installation
  const autoInstall = useCallback(async () => {
    if (!installPromptEvent || autoInstallAttempted) {
      return;
    }
    
    try {
      console.log('Attempting automatic installation...');
      setInstalling(true);
      
      await installPromptEvent.prompt();
      const choiceResult = await installPromptEvent.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('Auto-installation accepted');
        setInstallStatus('success');
        setTimeout(() => {
          setShowBanner(false);
        }, 3000);
      } else {
        console.log('Auto-installation declined');
        setInstalling(false);
        setShowBanner(true);
      }
      
      setInstallPromptEvent(null);
    } catch (error) {
      console.error('Auto-installation error:', error);
      setInstalling(false);
      setShowBanner(true);
    }
  }, [installPromptEvent, autoInstallAttempted]);
  
  // Manual installation handler
  const handleInstall = useCallback(async () => {
    setInstalling(true);
    
    if (!installPromptEvent) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        alert('To install on iOS:\n\n1. Tap the share icon (rectangle with arrow) at the bottom of your screen\n\n2. Scroll down and select "Add to Home Screen"\n\n3. Tap "Add" in the top right corner');
      } else if (isAndroid) {
        alert('To install on Android:\n\n1. Tap the menu icon (three dots) in the top right of your browser\n\n2. Select "Install app" or "Add to Home screen"\n\n3. Follow the on-screen instructions');
      } else {
        alert('To install:\n\n1. Look for the install icon in your browser\'s address bar\n\n2. Click it and follow the prompts');
      }
      
      setInstalling(false);
      return;
    }
    
    try {
      await installPromptEvent.prompt();
      const choiceResult = await installPromptEvent.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setInstallStatus('success');
        setTimeout(() => {
          if (installing) {
            setInstalling(false);
            setTimeout(() => {
              setShowBanner(false);
            }, 2000);
          }
        }, 3000);
      } else {
        setInstalling(false);
        setInstallStatus('failed');
        setTimeout(() => {
          setInstallStatus(null);
        }, 3000);
      }
      
      setInstallPromptEvent(null);
    } catch (error) {
      console.error('Install prompt error:', error);
      setInstalling(false);
      setInstallStatus('failed');
      setTimeout(() => {
        setInstallStatus(null);
      }, 3000);
    }
  }, [installPromptEvent, installing]);
  
  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('appBannerDismissed', 'true');
  };
  
  // Auto-install logic for repeat mobile visitors
  useEffect(() => {
    if (!isMobileDevice()) return;

    const visitCount = parseInt(localStorage.getItem('siteVisitCount') || '0');
    localStorage.setItem('siteVisitCount', (visitCount + 1).toString());
    
    const shouldAutoPrompt = 
      visitCount >= 2 && 
      !localStorage.getItem('appBannerDismissed') && 
      !isRunningStandalone() &&
      !autoInstallAttempted;
      
    if (shouldAutoPrompt && installPromptEvent) {
      setAutoInstallAttempted(true);
      setTimeout(() => {
        autoInstall();
      }, 3000);
    }
  }, [installPromptEvent, autoInstallAttempted, autoInstall]);
  
  // Capture beforeinstallprompt event for MOBILE devices only
  useEffect(() => {
    // DO NOT show banner on desktop
    if (!isMobileDevice()) {
      setShowBanner(false);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      
      const visitCount = parseInt(localStorage.getItem('siteVisitCount') || '0');
      const shouldAutoPrompt = 
        visitCount >= 2 && 
        !localStorage.getItem('appBannerDismissed') && 
        !isRunningStandalone() &&
        !autoInstallAttempted;
        
      if (!shouldAutoPrompt) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    const isStandalone = isRunningStandalone();
    const bannerDismissed = localStorage.getItem('appBannerDismissed');
    
    if (!isStandalone && !bannerDismissed && isMobileDevice()) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [autoInstallAttempted]);
  
  useEffect(() => {
    const handleAppInstalled = () => {
      setInstalling(false);
      setInstallStatus('success');
      setTimeout(() => {
        setShowBanner(false);
      }, 3000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
  
  // Never render on Desktop
  if (!isMobileDevice() || !showBanner) return null;
  
  return (
    <div className="app-install-banner">
      <div className="app-install-content">
        <img src={`${process.env.PUBLIC_URL}/images/icon-192.png`} alt="FreelancePro SL" className="app-banner-icon" />
        <div className="app-banner-text">
          <p><strong>Install FreelancePro SL</strong> for quick access</p>
          {installing && <p className="install-status in-progress">Installing...</p>}
          {installStatus === 'success' && <p className="install-status success">Installed successfully!</p>}
          {installStatus === 'failed' && <p className="install-status failed">Installation cancelled</p>}
        </div>
      </div>
      <div className="app-install-actions">
        <button 
          className={`app-install-button ${installing ? 'installing' : ''}`} 
          onClick={handleInstall}
          disabled={installing}
        >
          {installing ? 'Installing...' : 'Install Now'}
          {installing && <span className="loading-spinner"></span>}
        </button>
        <button className="app-dismiss-button" onClick={handleDismiss} aria-label="Close install banner" title="Close">
          <span className="dismiss-icon">×</span>
        </button>
      </div>
    </div>
  );
};

export default AppInstallBanner;
