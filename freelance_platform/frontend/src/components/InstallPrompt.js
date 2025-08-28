import React, { useState, useEffect } from 'react';
import '../styles/components/InstallPrompt.css';

const InstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent the default prompt
      e.preventDefault();
      // Store the event for later use
      setInstallPromptEvent(e);
      // Show our custom prompt
      setShowPrompt(true);
    };

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handler);

    // Check if the app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isAppInstalled) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPromptEvent) return;

    // Show the native install prompt
    installPromptEvent.prompt();

    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // Clear the stored prompt event
      setInstallPromptEvent(null);
      // Hide our custom prompt
      setShowPrompt(false);
    });
  };

  const handleCloseClick = () => {
    setShowPrompt(false);
    // Store preference in localStorage to not show again for some time
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // Don't show if we've checked local storage and user dismissed recently
  useEffect(() => {
    const dismissedTime = localStorage.getItem('installPromptDismissed');
    if (dismissedTime) {
      const DAY_IN_MS = 86400000; // 24 hours
      const wasRecentlyDismissed = Date.now() - Number(dismissedTime) < DAY_IN_MS;
      if (wasRecentlyDismissed) {
        setShowPrompt(false);
      }
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <div className="install-prompt-header">
          <img src="/images/favicon.svg" alt="FreelancePro SL" className="install-logo" />
          <h3>Install FreelancePro SL</h3>
          <button className="install-close" onClick={handleCloseClick}>×</button>
        </div>
        <p>Install this app on your device for quick and easy access when you're on the go!</p>
        <div className="install-buttons">
          <button className="install-later" onClick={handleCloseClick}>Maybe Later</button>
          <button className="install-now" onClick={handleInstallClick}>Install Now</button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
