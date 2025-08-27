import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/LearnMoreSlider.css';

const LearnMoreSlider = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Slider data - unique content for the Learn More page
  const sliderData = [
    {
      title: "Your Journey Starts Here",
      description: "Discover how FreelancePro SL transforms the way professionals connect in Sierra Leone.",
      buttonText: "Sign Up Today",
      buttonLink: "/register",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      title: "Flexible Work, Better Life",
      description: "Create your own schedule and work with clients from around the world on meaningful projects.",
      buttonText: "Join Now",
      buttonLink: "/register",
      image: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      title: "Empowering Sierra Leone",
      description: "Together we're building a digital economy that creates opportunities for talented professionals.",
      buttonText: "Get Started",
      buttonLink: "/register",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    }
  ];
  
  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prevSlide) => (prevSlide + 1) % sliderData.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [sliderData.length]);
  
  // Manual navigation
  const goToSlide = (index) => {
    setActiveSlide(index);
  };
  
  const nextSlide = () => {
    setActiveSlide((prevSlide) => (prevSlide + 1) % sliderData.length);
  };
  
  const prevSlide = () => {
    setActiveSlide((prevSlide) => (prevSlide - 1 + sliderData.length) % sliderData.length);
  };

  return (
    <div className="learn-more-slider">
      <div className="learn-slider-container">
        {sliderData.map((slide, index) => (
          <div 
            key={index} 
            className={`learn-slide ${index === activeSlide ? 'active' : ''}`}
          >
            <div className="learn-slide-content">
              <div className="learn-slide-text">
                <span className="learn-slide-tagline">Freelance Platform</span>
                <h1>{slide.title}</h1>
                <p>{slide.description}</p>
                <Link to={slide.buttonLink} className="btn btn-primary btn-lg">
                  {slide.buttonText}
                </Link>
              </div>
              <div className="learn-slide-image">
                <img src={slide.image} alt={`Slide ${index + 1}`} />
              </div>
            </div>
          </div>
        ))}
        
        <button className="learn-slider-arrow learn-prev" onClick={prevSlide}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <button className="learn-slider-arrow learn-next" onClick={nextSlide}>
          <i className="fas fa-chevron-right"></i>
        </button>
        
        <div className="learn-slider-progress">
          <div className="learn-progress-bar">
            {sliderData.map((_, index) => (
              <div 
                key={index} 
                className={`learn-progress-segment ${index === activeSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              >
                <div className="learn-progress-dot"></div>
                <div className="learn-progress-line"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnMoreSlider;
