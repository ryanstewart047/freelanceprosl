/**
 * Cookie management service
 * Handles cookie operations throughout the application
 */

// Set a cookie
export const setCookie = (name, value, days = 365) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

// Get a cookie by name
export const getCookie = (name) => {
  const cookieName = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return null;
};

// Delete a cookie
export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
};

// Get user's cookie consent preferences
export const getCookieConsent = () => {
  return localStorage.getItem('cookieConsent');
};

// Check if analytics cookies are allowed
export const canUseAnalytics = () => {
  const consent = getCookieConsent();
  return consent === 'accepted';
};

// Check if marketing cookies are allowed
export const canUseMarketing = () => {
  const consent = getCookieConsent();
  return consent === 'accepted';
};

// Check if essential cookies are allowed (always true as they're necessary)
export const canUseEssential = () => {
  return true;
};

// Initialize cookie-dependent services based on user preferences
export const initializeCookieServices = () => {
  const consent = getCookieConsent();
  
  if (consent === 'accepted') {
    // Initialize analytics (e.g., Google Analytics)
    console.log('Initializing analytics services');
    
    // Initialize marketing cookies
    console.log('Initializing marketing services');
  }
  
  if (consent === 'essential' || consent === 'accepted') {
    // Initialize essential services
    console.log('Initializing essential services');
  }
};

export default {
  setCookie,
  getCookie,
  deleteCookie,
  getCookieConsent,
  canUseAnalytics,
  canUseMarketing,
  canUseEssential,
  initializeCookieServices
};
