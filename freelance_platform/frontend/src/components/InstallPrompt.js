import React, { useState, useEffect } from 'react';
import '../styles/components/InstallPrompt.css';

const InstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showManualPrompt, setShowManualPrompt] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installStatus, setInstallStatus] = useState(null); // 'success', 'failed', or null

  useEffect(() => {
    // Show manual install prompt after 20 seconds if no automatic one is triggered
    const timer = setTimeout(() => {
      // Check if not already in standalone mode and no prompt has been shown
      if (!window.matchMedia('(display-mode: standalone)').matches && !showPrompt) {
        setShowManualPrompt(true);
      }
    }, 20000);

    const handler = (e) => {
      // Prevent the default prompt
      e.preventDefault();
      // Store the event for later use
      setInstallPromptEvent(e);
      // Show our custom prompt
      setShowPrompt(true);
      // If we show automatic prompt, don't show manual one
      clearTimeout(timer);
    };

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handler);

    // Check if the app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isAppInstalled) {
      setShowPrompt(false);
      setShowManualPrompt(false);
      clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, [showPrompt]);

  // Add event listener for appinstalled event
  useEffect(() => {
    const handleAppInstalled = () => {
      console.log('App was successfully installed');
      setInstalling(false);
      setInstallStatus('success');
      // Hide prompt after successful installation after a delay
      setTimeout(() => {
        setShowPrompt(false);
      }, 3000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPromptEvent) return;

    // Set installing state to show progress
    setInstalling(true);

    // Show the native install prompt
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

  const handleCloseClick = () => {
    setShowPrompt(false);
    setShowManualPrompt(false);
    // Store preference in localStorage to not show again for some time
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  const handleManualInstallClick = () => {
    // Show instructions based on browser
    setShowManualPrompt(false);
    setShowPrompt(true);
    // We don't have the install event, but we can still show instructions
  };

  // Don't show if we've checked local storage and user dismissed recently
  useEffect(() => {
    const dismissedTime = localStorage.getItem('installPromptDismissed');
    if (dismissedTime) {
      const HOUR_IN_MS = 3600000; // 1 hour (reduced from 24 hours)
      const wasRecentlyDismissed = Date.now() - Number(dismissedTime) < HOUR_IN_MS;
      if (wasRecentlyDismissed) {
        setShowPrompt(false);
        setShowManualPrompt(false);
      }
    }
  }, []);

  // Detect iOS device
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  if (!showPrompt && !showManualPrompt) return null;

  if (showManualPrompt) {
    return (
      <div className="install-prompt">
        <div className="install-prompt-content">
          <div className="install-prompt-header">
            <img src="images/favicon.svg" alt="FreelancePro SL" className="install-logo" />
            <h3>Add to Home Screen</h3>
            <button className="install-close" onClick={handleCloseClick}>×</button>
          </div>
          <p>Install FreelancePro SL on your device for quick access!</p>
          <div className="install-buttons">
            <button className="install-later" onClick={handleCloseClick}>Maybe Later</button>
            <button className="install-now" onClick={handleManualInstallClick}>Show Me How</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <div className="install-prompt-header">
          <img src="images/favicon.svg" alt="FreelancePro SL" className="install-logo" />
          <h3>Install FreelancePro SL</h3>
          <button className="install-close" onClick={handleCloseClick}>×</button>
        </div>
        {isIOS ? (
          <div>
            <p>To install this app on your iOS device:</p>
            <ol className="install-instructions">
              <li>Tap the Share button <span className="ios-share-icon">⎅</span> at the bottom of your screen</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" in the top right corner</li>
            </ol>
          </div>
        ) : installPromptEvent ? (
          <div>
            <p>Install this app on your device for quick and easy access when you're on the go!</p>
            {installStatus === 'success' && <p className="install-status success">Installation successful!</p>}
            {installStatus === 'failed' && <p className="install-status failed">Installation cancelled</p>}
            <div className="install-buttons">
              <button className="install-later" onClick={handleCloseClick} disabled={installing}>Maybe Later</button>
              <button 
                className={`install-now ${installing ? 'installing' : ''}`} 
                onClick={handleInstallClick}
                disabled={installing}
              >
                {installing ? 'Installing...' : 'Install Now'}
                {installing && <span className="loading-spinner"></span>}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p>To install this app on your device:</p>
            <ol className="install-instructions">
              <li>Open the menu (three dots) in your browser</li> 
              <li>Select "Install app" or "Add to Home screen"</li>
            </ol>
            <div className="install-buttons">
              <button className="install-later" onClick={handleCloseClick}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;
