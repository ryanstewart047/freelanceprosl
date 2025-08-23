import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/HowItWorks.css';

const HowItWorks = () => {
  useEffect(() => {
    // Add scroll animation observer
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.scroll-animation');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      }, { threshold: 0.1 });
      
      elements.forEach(element => {
        observer.observe(element);
      });
    };
    
    // Initialize scroll animations
    setTimeout(() => {
      animateOnScroll();
    }, 100);
  }, []);

  return (
    <div className="how-it-works-page">
      <div className="hero-section">
        <div className="container">
          <div className="hero-content scroll-animation">
            <span className="hero-tagline">Your Guide to Success</span>
            <h1>How FreelancePro SL Works</h1>
            <p>
              Connecting talent with opportunity in Sierra Leone's premier freelance marketplace
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">1000+</span>
                <span className="stat-label">Freelancers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Clients</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">2500+</span>
                <span className="stat-label">Projects</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="section user-types scroll-animation">
          <div className="user-type client">
            <div className="icon-circle">
              <i className="fas fa-briefcase"></i>
            </div>
            <h2>For Clients</h2>
            <p>Post jobs, find talent, and get work done</p>
            <Link to="/register?type=client" className="btn btn-primary">Post a Job</Link>
          </div>
          
          <div className="user-type freelancer">
            <div className="icon-circle">
              <i className="fas fa-laptop"></i>
            </div>
            <h2>For Freelancers</h2>
            <p>Find projects, showcase skills, and earn money</p>
            <Link to="/register?type=freelancer" className="btn btn-secondary">Apply as Freelancer</Link>
          </div>
        </div>

        <div className="steps-section">
          <div className="section-header scroll-animation">
            <span className="section-subtitle">Getting Started</span>
            <h2 className="section-title">For Clients</h2>
            <p className="section-description">Follow these simple steps to find and hire the perfect freelancer for your project</p>
          </div>
          
          <div className="process-cards">
            <div className="process-card scroll-animation">
              <div className="card-icon">
                <i className="fas fa-pencil-alt"></i>
              </div>
              <div className="card-content">
                <h3>Post a Job</h3>
                <p>Describe your project, set your budget, and specify the skills you need. Be as detailed as possible to attract the right talent.</p>
              </div>
              <div className="card-image">
                <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Post a job" />
              </div>
            </div>
            
            <div className="process-card scroll-animation">
              <div className="card-icon">
                <i className="fas fa-search"></i>
              </div>
              <div className="card-content">
                <h3>Review Proposals</h3>
                <p>Receive proposals from qualified freelancers. Review their profiles, portfolios, and ratings to find the perfect match for your project.</p>
              </div>
              <div className="card-image">
                <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Review proposals" />
              </div>
            </div>
            
            <div className="process-card scroll-animation">
              <div className="card-icon">
                <i className="fas fa-handshake"></i>
              </div>
              <div className="card-content">
                <h3>Hire & Collaborate</h3>
                <p>Select the best freelancer for your project, agree on terms, and start working together through our secure platform.</p>
              </div>
              <div className="card-image">
                <img src="https://images.unsplash.com/photo-1528901166007-3784c7dd3653?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Hire and collaborate" />
              </div>
            </div>
            
            <div className="process-card scroll-animation">
              <div className="card-icon">
                <i className="fas fa-lock"></i>
              </div>
              <div className="card-content">
                <h3>Pay Securely</h3>
                <p>Release payment only when you're satisfied with the work. Our platform ensures secure transactions and protects both parties.</p>
              </div>
              <div className="card-image">
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Pay securely" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="steps-section freelancer-steps">
          <div className="section-header scroll-animation">
            <span className="section-subtitle">Earn Income</span>
            <h2 className="section-title">For Freelancers</h2>
            <p className="section-description">Launch your freelance career and connect with clients seeking your skills</p>
          </div>
          
          <div className="process-cards">
            <div className="process-card scroll-animation">
              <div className="card-icon">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="card-content">
                <h3>Create Your Profile</h3>
                <p>Showcase your skills, experience, and portfolio. A complete profile helps clients find you and understand your expertise.</p>
              </div>
              <div className="card-image">
                <img src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Create profile" />
              </div>
            </div>
            
            <div className="process-card scroll-animation">
              <div className="card-icon">
                <i className="fas fa-search-dollar"></i>
              </div>
              <div className="card-content">
                <h3>Browse Available Jobs</h3>
                <p>Explore our marketplace for jobs that match your skills and interests. Filter by category, budget, and project type.</p>
              </div>
              <div className="card-image">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Browse jobs" />
              </div>
            </div>
            
            <div className="process-card scroll-animation">
              <div className="card-icon">
                <i className="fas fa-paper-plane"></i>
              </div>
              <div className="card-content">
                <h3>Submit Proposals</h3>
                <p>Send personalized proposals to clients explaining why you're the best fit for their project. Highlight relevant experience and approach.</p>
              </div>
              <div className="card-image">
                <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Submit proposals" />
              </div>
            </div>
            
            <div className="process-card scroll-animation">
              <div className="card-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="card-content">
                <h3>Get Hired & Deliver</h3>
                <p>Once hired, communicate clearly with your client, deliver quality work on time, and build your reputation on our platform.</p>
              </div>
              <div className="card-image">
                <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Deliver work" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="faq-section scroll-animation">
          <h2 className="section-title">Frequently Asked Questions</h2>
          
          <div className="faq-item">
            <h3>How much does it cost to use FreelancePro SL?</h3>
            <p>For clients, posting jobs is free. We charge a small service fee when you hire a freelancer. For freelancers, joining and bidding is free, but we deduct a 10% service fee from payments.</p>
          </div>
          
          <div className="faq-item">
            <h3>How do I know if a freelancer is reliable?</h3>
            <p>Check the freelancer's profile for reviews, ratings, completed projects, and portfolio samples. You can also start with a small test project to evaluate their skills.</p>
          </div>
          
          <div className="faq-item">
            <h3>How are payments handled?</h3>
            <p>We offer secure payment protection through our platform. Clients deposit funds upfront, but freelancers are only paid when work is completed and approved.</p>
          </div>
          
          <div className="faq-item">
            <h3>What if I'm not satisfied with the work?</h3>
            <p>We encourage clear communication to resolve issues. If needed, our dispute resolution process can help mediate and find a fair solution.</p>
          </div>
        </div>
        
        <div className="cta-section scroll-animation">
          <h2>Ready to Get Started?</h2>
          <p>Join the growing community of professionals on FreelancePro SL</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary">Sign Up Today</Link>
            <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
