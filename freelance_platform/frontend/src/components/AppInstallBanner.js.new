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
  
  // Function to handle automatic installation (defined with useCallback to avoid dependency issues)
  const autoInstall = useCallback(async () => {
    if (!installPromptEvent || autoInstallAttempted) {
      return;
    }
    
    try {
      console.log('Attempting automatic installation...');
      setInstalling(true);
      
      // Attempt to show the install prompt
      await installPromptEvent.prompt();
      
      // User must still respond to the prompt
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
        // Still show the banner if they decline
        setShowBanner(true);
      }
      
      // Clear the stored prompt event
      setInstallPromptEvent(null);
    } catch (error) {
      console.error('Auto-installation error:', error);
      setInstalling(false);
      // Show the banner if auto-install fails
      setShowBanner(true);
    }
  }, [installPromptEvent, autoInstallAttempted]);
  
  // Manual installation handler
  const handleInstall = useCallback(async () => {
    // Set installing state to show progress immediately
    setInstalling(true);
    
    if (!installPromptEvent) {
      console.log('No install prompt event captured, showing manual instructions');
      
      // Detect platform for specific instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        alert('To install on iOS:\n\n1. Tap the share icon (rectangle with arrow) at the bottom of your screen\n\n2. Scroll down and select "Add to Home Screen"\n\n3. Tap "Add" in the top right corner');
      } else if (isAndroid) {
        alert('To install on Android:\n\n1. Tap the menu icon (three dots) in the top right of your browser\n\n2. Select "Install app" or "Add to Home screen"\n\n3. Follow the on-screen instructions to complete installation');
      } else {
        // Desktop browsers
        alert('To install:\n\n1. Look for the install icon in your browser\'s address bar (usually on the right side)\n\n2. Click it and follow the prompts to install\n\n3. If you don\'t see an icon, open your browser menu and look for "Install" or "Add to desktop" option');
      }
      
      // Reset installing state after showing instructions
      setInstalling(false);
      return;
    }
    
    try {
      console.log('Triggering install prompt...');
      
      // Show the install prompt - this is the key step for installation
      await installPromptEvent.prompt();
      
      // Wait for the user to respond to the prompt
      const choiceResult = await installPromptEvent.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setInstallStatus('success');
        
        // The appinstalled event should handle this, but as a fallback:
        setTimeout(() => {
          if (installing) {
            setInstalling(false);
            // If banner is still showing, hide it after successful installation
            setTimeout(() => {
              setShowBanner(false);
            }, 2000);
          }
        }, 3000);
      } else {
        console.log('User dismissed the install prompt');
        setInstalling(false);
        setInstallStatus('failed');
        setTimeout(() => {
          setInstallStatus(null);
        }, 3000);
      }
      
      // Clear the stored prompt event since it can only be used once
      setInstallPromptEvent(null);
      
    } catch (error) {
      console.error('Install prompt error:', error);
      setInstalling(false);
      setInstallStatus('failed');
      alert('There was an error during installation. Please try the manual installation method from your browser menu.');
      setTimeout(() => {
        setInstallStatus(null);
      }, 3000);
    }
  }, [installPromptEvent, installing]);
  
  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('appBannerDismissed', 'true');
  };
  
  // Auto-install logic for repeated visitors
  useEffect(() => {
    // Check for repeat visitors (3+ visits) to auto-prompt install
    const visitCount = parseInt(localStorage.getItem('siteVisitCount') || '0');
    localStorage.setItem('siteVisitCount', (visitCount + 1).toString());
    
    // If user has visited 3+ times and hasn't dismissed install or installed yet
    const shouldAutoPrompt = 
      visitCount >= 2 && 
      !localStorage.getItem('appBannerDismissed') && 
      !isRunningStandalone() &&
      !autoInstallAttempted;
      
    if (shouldAutoPrompt && installPromptEvent) {
      // Mark that we've attempted auto-install
      setAutoInstallAttempted(true);
      // We'll attempt to auto-install after a slight delay
      setTimeout(() => {
        autoInstall();
      }, 3000);
    }
  }, [installPromptEvent, autoInstallAttempted, autoInstall]);
  
  // Capture beforeinstallprompt event
  useEffect(() => {
    // Function to handle the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setInstallPromptEvent(e);
      console.log('beforeinstallprompt event captured');
      
      // Check if we should attempt auto-install (for returning visitors)
      const visitCount = parseInt(localStorage.getItem('siteVisitCount') || '0');
      const shouldAutoPrompt = 
        visitCount >= 2 && 
        !localStorage.getItem('appBannerDismissed') && 
        !isRunningStandalone() &&
        !autoInstallAttempted;
        
      if (shouldAutoPrompt) {
        // Auto installation will be handled by the other useEffect
        // Just make sure we don't show the banner until user decides
        console.log('Will attempt auto-install for returning visitor');
      } else {
        // Otherwise show the banner
        setShowBanner(true);
      }
    };

    // Add event listener for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Don't show if already in standalone mode
    const isStandalone = isRunningStandalone();
    
    // Check if banner was dismissed before
    const bannerDismissed = localStorage.getItem('appBannerDismissed');
    
    // If we don't get the beforeinstallprompt event within 3 seconds and we're not in standalone mode,
    // show the banner anyway for manual installation
    if (!isStandalone && !bannerDismissed) {
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
  
  if (!showBanner) return null;
  
  return (
    <div className="app-install-banner">
      <div className="app-install-content">
        <img src={`${process.env.PUBLIC_URL}/images/icon-192.png`} alt="FreelancePro SL" className="app-banner-icon" />
        <div className="app-banner-text">
          <p><strong>Install FreelancePro SL</strong> for offline access</p>
          {installing && <p className="install-status in-progress">Installation in progress...</p>}
          {installStatus === 'success' && <p className="install-status success">Successfully installed! You can now launch the app from your home screen.</p>}
          {installStatus === 'failed' && <p className="install-status failed">Installation cancelled or failed. Try again later.</p>}
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
        <button className="app-dismiss-button" onClick={handleDismiss} aria-label="Dismiss">
          <span className="dismiss-icon">×</span>
        </button>
      </div>
    </div>
  );
};

export default AppInstallBanner;
