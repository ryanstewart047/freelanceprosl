import React, { useState, useEffect } from 'react';
import '../styles/components/InstallPrompt.css';

// Mobile detection helper
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const InstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showManualPrompt, setShowManualPrompt] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installStatus, setInstallStatus] = useState(null);

  useEffect(() => {
    // Only run on mobile
    if (!isMobileDevice()) return;

    const timer = setTimeout(() => {
      if (!window.matchMedia('(display-mode: standalone)').matches && !showPrompt) {
        setShowManualPrompt(true);
      }
    }, 20000);

    const handler = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setShowPrompt(true);
      clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
      setShowManualPrompt(false);
      clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, [showPrompt]);

  useEffect(() => {
    const handleAppInstalled = () => {
      setInstalling(false);
      setInstallStatus('success');
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
    setInstalling(true);
    installPromptEvent.prompt();
    installPromptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        setInstallStatus('success');
      } else {
        setInstalling(false);
        setInstallStatus('failed');
        setTimeout(() => setInstallStatus(null), 3000);
      }
      setInstallPromptEvent(null);
    });
  };

  const handleCloseClick = () => {
    setShowPrompt(false);
    setShowManualPrompt(false);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  useEffect(() => {
    if (!isMobileDevice()) return;
    const dismissedTime = localStorage.getItem('installPromptDismissed');
    if (dismissedTime) {
      const HOUR_IN_MS = 3600000;
      const wasRecentlyDismissed = Date.now() - Number(dismissedTime) < HOUR_IN_MS;
      if (wasRecentlyDismissed) {
        setShowPrompt(false);
        setShowManualPrompt(false);
      }
    }
  }, []);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Never render on desktop or if prompt dismissed
  if (!isMobileDevice() || (!showPrompt && !showManualPrompt)) return null;

  if (showManualPrompt) {
    return (
      <div className="install-prompt">
        <div className="install-prompt-content">
          <div className="install-prompt-header">
            <img src="images/favicon.svg" alt="FreelancePro SL" className="install-logo" />
            <h3>Add to Home Screen</h3>
            <button className="install-close" onClick={handleCloseClick} title="Close">×</button>
          </div>
          <p>Install FreelancePro SL on your mobile device for quick access!</p>
          <div className="install-buttons">
            <button className="install-later" onClick={handleCloseClick}>Maybe Later</button>
            <button className="install-now" onClick={() => { setShowManualPrompt(false); setShowPrompt(true); }}>Show Me How</button>
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
          <button className="install-close" onClick={handleCloseClick} title="Close">×</button>
        </div>
        {isIOS ? (
          <div>
            <p>To install this app on your iOS device:</p>
            <ol className="install-instructions">
              <li>Tap the Share button <span className="ios-share-icon">⎅</span> at the bottom of your screen</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" in the top right corner</li>
            </ol>
            <div className="install-buttons">
              <button className="install-later" onClick={handleCloseClick}>Close</button>
            </div>
          </div>
        ) : installPromptEvent ? (
          <div>
            <p>Install this app on your device for quick access!</p>
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
