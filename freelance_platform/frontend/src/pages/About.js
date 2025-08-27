import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/About.css';

const About = () => {
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

  // Testimonial data
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Marketing Manager',
      company: 'SL Digital',
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
      text: 'FreelancePro SL has transformed how our company finds talent. We\'ve connected with amazing freelancers who deliver exceptional results on time and within budget.',
    },
    {
      id: 2,
      name: 'Michael Kamara',
      role: 'Freelance Developer',
      company: 'Self-employed',
      avatar: 'https://randomuser.me/api/portraits/men/54.jpg',
      text: 'As a freelancer in Sierra Leone, this platform has opened up so many opportunities for me. I\'ve found consistent work and built long-term relationships with clients around the country.',
    },
    {
      id: 3,
      name: 'Aminata Sesay',
      role: 'Startup Founder',
      company: 'EcoTech SL',
      avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
      text: 'When we needed specialized skills for our startup, FreelancePro SL connected us with talented professionals who understood our vision and helped bring it to life.',
    },
  ];

  // Team members data
  const teamMembers = [
    {
      id: 1,
      name: 'Ryan Stewart',
      role: 'Founder & CEO',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      bio: 'With over 15 years of experience in technology and entrepreneurship, Ryan founded FreelancePro SL to bridge the gap between talented professionals and businesses in Sierra Leone.',
    },
    {
      id: 2,
      name: 'Fatima Bangura',
      role: 'Chief Operations Officer',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      bio: 'Fatima brings 10+ years of operational excellence to ensure FreelancePro SL delivers a seamless experience for both freelancers and clients.',
    },
    {
      id: 3,
      name: 'Mohamed Conteh',
      role: 'Head of Technology',
      avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
      bio: 'Mohamed leads our technology team, building robust and innovative solutions that power the FreelancePro SL platform.',
    },
    {
      id: 4,
      name: 'Isatu Koroma',
      role: 'Community Manager',
      avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
      bio: 'Isatu focuses on building and nurturing our community of freelancers and clients, ensuring positive experiences for everyone on the platform.',
    },
  ];

  return (
    <div className="about-page">
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="scroll-animation">About FreelancePro SL</h1>
              <p className="scroll-animation">
                Empowering Sierra Leone's freelance economy through technology and community
              </p>
              <div className="hero-stats scroll-animation">
                <div className="stat-item">
                  <span className="stat-number">5,000+</span>
                  <span className="stat-label">Freelancers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">2,000+</span>
                  <span className="stat-label">Businesses</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">10,000+</span>
                  <span className="stat-label">Projects</span>
                </div>
              </div>
              <div className="hero-cta scroll-animation">
                <Link to="/register" className="btn btn-light">Join Our Community</Link>
                <Link to="/how-it-works" className="btn btn-outline-light">Learn More</Link>
              </div>
            </div>
            <div className="hero-illustration scroll-animation">
              <div className="illustration-container">
                <i className="fas fa-users-gear"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-wave"></div>
      </div>

      <div className="container">
        <div className="section mission-section scroll-animation">
          <div className="section-content">
            <h2>Our Mission</h2>
            <p>
              At FreelancePro SL, we're on a mission to transform how work happens in Sierra Leone. 
              We're creating opportunities for talented professionals to showcase their skills, 
              find meaningful work, and build sustainable careers while helping businesses access 
              the specialized expertise they need to grow and thrive.
            </p>
            <p>
              We believe in the power of connecting talent with opportunity, regardless of location 
              or background. By providing a trusted platform for freelancers and clients to collaborate, 
              we're contributing to the growth of Sierra Leone's digital economy and empowering the 
              next generation of entrepreneurs and professionals.
            </p>
          </div>
          <div className="section-image">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Team collaboration" />
          </div>
        </div>

        <div className="section story-section scroll-animation">
          <div className="section-image">
            <img src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Freetown cityscape" />
          </div>
          <div className="section-content">
            <h2>Our Story</h2>
            <p>
              FreelancePro SL was founded in 2023 by Ryan Stewart, who recognized the gap between 
              the growing pool of talented professionals in Sierra Leone and businesses seeking 
              specialized skills for their projects.
            </p>
            <p>
              What began as a small initiative to connect freelancers with local businesses has 
              grown into Sierra Leone's premier freelance marketplace, serving thousands of users 
              across the country and beyond. Our journey has been driven by a commitment to quality, 
              trust, and community – values that continue to guide us as we grow.
            </p>
          </div>
        </div>

        <div className="values-section scroll-animation">
          <h2 className="section-title">Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-handshake"></i>
              </div>
              <h3>Trust & Integrity</h3>
              <p>We build trust through transparency, secure payments, and honest communication.</p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Community</h3>
              <p>We foster a supportive community where professionals can connect, learn, and grow together.</p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-star"></i>
              </div>
              <h3>Quality</h3>
              <p>We're committed to maintaining high standards for work quality and professional conduct.</p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-lightbulb"></i>
              </div>
              <h3>Innovation</h3>
              <p>We continuously innovate to provide better tools and opportunities for our users.</p>
            </div>
          </div>
        </div>

        <div className="team-section scroll-animation">
          <h2 className="section-title">Meet Our Team</h2>
          <div className="team-grid">
            {teamMembers.map(member => (
              <div key={member.id} className="team-card">
                <div className="team-avatar">
                  <img src={member.avatar} alt={member.name} />
                </div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
                <div className="team-social">
                  <a href="#"><i className="fab fa-linkedin"></i></a>
                  <a href="#"><i className="fab fa-twitter"></i></a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="testimonials-section scroll-animation">
          <h2 className="section-title">What People Say</h2>
          <div className="testimonials-container">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-content">
                  <div className="quote-icon">
                    <i className="fas fa-quote-left"></i>
                  </div>
                  <p>{testimonial.text}</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <img src={testimonial.avatar} alt={testimonial.name} />
                  </div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cta-section scroll-animation">
          <h2>Join Our Community</h2>
          <p>Whether you're a freelancer looking for opportunities or a business seeking talent, we invite you to be part of our growing community.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
