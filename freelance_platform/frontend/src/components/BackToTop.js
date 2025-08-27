import React, { useState, useEffect } from 'react';
import '../styles/components/BackToTop.css';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className={`back-to-top ${isVisible ? 'visible' : ''}`} onClick={scrollToTop} aria-label="Scroll to top">
      <i className="fas fa-arrow-up"></i>
    </div>
  );
};

export default BackToTop;
