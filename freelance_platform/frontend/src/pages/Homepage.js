import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/Homepage.css';

const Homepage = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="homepage-hero">
        <div className="container">
          <h1>Find the perfect <span className="highlight">freelance</span> service</h1>
          <p>Connect with talented professionals to grow your business or start your freelance career today</p>
          <div className="hero-actions">
            <Link to="/marketplace" className="btn btn-primary btn-lg">
              <i className="fas fa-search"></i> Find Work
            </Link>
            <Link to="/post-job" className="btn btn-secondary btn-lg">
              <i className="fas fa-plus-circle"></i> Post a Job
            </Link>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="services">
        <div className="container">
          <div className="section-header">
            <h2>Popular Services</h2>
            <p>Find the services you need to grow your business</p>
          </div>
          
          <div className="service-categories">
            <div className="service-category">
              <div className="service-icon">
                <i className="fas fa-code"></i>
              </div>
              <h3>Web Development</h3>
              <p>Custom websites, e-commerce solutions, and web applications</p>
              <Link to="/marketplace?category=development" className="btn btn-outline">Explore</Link>
            </div>
            
            <div className="service-category">
              <div className="service-icon">
                <i className="fas fa-paint-brush"></i>
              </div>
              <h3>Design & Creative</h3>
              <p>Logo design, UI/UX, illustrations, and branding</p>
              <Link to="/marketplace?category=design" className="btn btn-outline">Explore</Link>
            </div>
            
            <div className="service-category">
              <div className="service-icon">
                <i className="fas fa-pencil-alt"></i>
              </div>
              <h3>Writing & Translation</h3>
              <p>Content writing, copywriting, and translations</p>
              <Link to="/marketplace?category=writing" className="btn btn-outline">Explore</Link>
            </div>
            
            <div className="service-category">
              <div className="service-icon">
                <i className="fas fa-bullhorn"></i>
              </div>
              <h3>Digital Marketing</h3>
              <p>SEO, social media marketing, and advertising</p>
              <Link to="/marketplace?category=marketing" className="btn btn-outline">Explore</Link>
            </div>
            
            <div className="service-category">
              <div className="service-icon">
                <i className="fas fa-tools"></i>
              </div>
              <h3>Household Repairs</h3>
              <p>Plumbing, electrical work, carpentry, and general home maintenance</p>
              <Link to="/marketplace?category=household" className="btn btn-outline">Explore</Link>
            </div>
            
            <div className="service-category">
              <div className="service-icon">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3>Gadget Repairs</h3>
              <p>Phone, laptop, tablet, and other electronic device repairs</p>
              <Link to="/marketplace?category=gadgets" className="btn btn-outline">Explore</Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Getting started is easy</p>
          </div>
          
          <div className="steps">
            <div className="step-card">
              <div className="step-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <h3>Post a Job</h3>
            </div>
            
            <div className="step-card">
              <div className="step-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>Review Proposals</h3>
            </div>
            
            <div className="step-card">
              <div className="step-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Work Together</h3>
            </div>
            
            <div className="step-card">
              <div className="step-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h3>Payment & Review</h3>
            </div>
          </div>

          <div className="step-descriptions">
            <div className="step-description">
              <p>Create a detailed job posting describing your project, budget, and timeline.</p>
            </div>
            
            <div className="step-description">
              <p>Receive proposals from talented freelancers and select the best match for your needs.</p>
            </div>
            
            <div className="step-description">
              <p>Collaborate effectively using our platform's tools and communication features.</p>
            </div>
            
            <div className="step-description">
              <p>Release payment securely when the work is completed to your satisfaction.</p>
            </div>
          </div>
          
          <div className="cta-button">
            <Link to="/how-it-works" className="btn btn-primary">Learn More</Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What Our Users Say</h2>
            <p>Success stories from our community</p>
          </div>
          
          <div className="testimonial-cards">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"I found an amazing developer on FreelancePro who helped me build my e-commerce website in record time. The quality of work was outstanding!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <img src="/images/testimonial1.jpg" alt="Client" />
                </div>
                <div className="author-info">
                  <h4>Sarah Johnson</h4>
                  <p>Small Business Owner</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"As a freelance designer, FreelancePro has been a game-changer for finding consistent work. The platform is easy to use and the payment system is secure."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <img src="/images/testimonial2.jpg" alt="Freelancer" />
                </div>
                <div className="author-info">
                  <h4>Michael Chen</h4>
                  <p>Graphic Designer</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"I've been using FreelancePro for all my content writing needs. The quality of freelancers on this platform is exceptional compared to others I've tried."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <img src="/images/testimonial3.jpg" alt="Client" />
                </div>
                <div className="author-info">
                  <h4>David Thompson</h4>
                  <p>Marketing Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to get started?</h2>
            <p>Join thousands of clients and freelancers who are already using our platform.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">Sign Up Now</Link>
              <Link to="/how-it-works" className="btn btn-outline btn-lg">Learn More</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
