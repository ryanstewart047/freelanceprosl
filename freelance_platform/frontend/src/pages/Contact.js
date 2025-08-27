import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import '../styles/pages/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For scroll animations
  useEffect(() => {
    const scrollElements = document.querySelectorAll('.scroll-animation');

    const elementInView = (el, dividend = 1) => {
      const elementTop = el.getBoundingClientRect().top;
      return (
        elementTop <=
        (window.innerHeight || document.documentElement.clientHeight) / dividend
      );
    };

    const displayScrollElement = (element) => {
      element.classList.add('animate');
    };

    const handleScrollAnimation = () => {
      scrollElements.forEach((el) => {
        if (elementInView(el, 1.25)) {
          displayScrollElement(el);
        }
      });
    };

    window.addEventListener('scroll', handleScrollAnimation);
    // Trigger once on load
    handleScrollAnimation();

    return () => {
      window.removeEventListener('scroll', handleScrollAnimation);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      tempErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.subject.trim()) {
      tempErrors.subject = 'Subject is required';
      isValid = false;
    }

    if (!formData.message.trim()) {
      tempErrors.message = 'Message is required';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      }, 1500);
    }
  };

  return (
    <div className="contact-page">
      <Helmet>
        <title>Contact Us - FreelancePro SL</title>
        <meta name="description" content="Get in touch with the FreelancePro SL team for questions, support, or feedback." />
      </Helmet>

      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Get in Touch</h1>
              <p>Have questions? We'd love to hear from you. Our team is ready to help.</p>
            </div>
            <div className="hero-decoration">
              <div className="contact-illustration">
                <i className="fas fa-comments"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="contact-cards-container scroll-animation">
          <div className="contact-card">
            <div className="card-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <div className="card-content">
              <h3>Visit Us</h3>
              <p>123 Freelance Street</p>
              <p>Freetown, Sierra Leone</p>
            </div>
          </div>
          
          <div className="contact-card">
            <div className="card-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <div className="card-content">
              <h3>Email Us</h3>
              <p>info@freelancepro-sl.com</p>
              <p>support@freelancepro-sl.com</p>
            </div>
          </div>
          
          <div className="contact-card">
            <div className="card-icon">
              <i className="fas fa-phone-alt"></i>
            </div>
            <div className="card-content">
              <h3>Call Us</h3>
              <p>+232 76 123 456</p>
              <p>+232 77 987 654</p>
            </div>
          </div>
        </div>

        <div className="contact-main-content">
          <div className="contact-form-container scroll-animation">
            <div className="form-header">
              <h2>Send a Message</h2>
              <p>Fill out the form below and we'll get back to you as soon as possible.</p>
            </div>
            
            {submitSuccess ? (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                <h3>Thank you for your message!</h3>
                <p>We've received your inquiry and will get back to you as soon as possible.</p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setSubmitSuccess(false)}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <div className="error-message">{errors.name}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Your Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={handleChange}
                    className={errors.subject ? 'error' : ''}
                  />
                  {errors.subject && <div className="error-message">{errors.subject}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={handleChange}
                    className={errors.message ? 'error' : ''}
                  ></textarea>
                  {errors.message && <div className="error-message">{errors.message}</div>}
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
          
          <div className="contact-info-sidebar scroll-animation">
            <div className="sidebar-section">
              <h3>Connect With Us</h3>
              <p>Follow us on social media for the latest updates and opportunities.</p>
              <div className="social-icons">
                <a href="#" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="#" aria-label="YouTube">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
            
            <div className="sidebar-section">
              <h3>Business Hours</h3>
              <div className="hours-item">
                <span className="day">Monday-Friday:</span>
                <span className="time">8am-6pm</span>
              </div>
              <div className="hours-item">
                <span className="day">Weekend:</span>
                <span className="time">9am-3pm</span>
              </div>
              <p className="hours-note">Online Support Only on Weekends</p>
            </div>
            
            <div className="sidebar-section">
              <h3>Need Help?</h3>
              <p>Check out our <a href="/how-it-works">How It Works</a> page or <a href="/faq">FAQs</a> for quick answers.</p>
            </div>
          </div>
        </div>

        <div className="map-section scroll-animation">
          <h2>Find Us</h2>
          <div className="map-container">
            {/* Replace with actual Google Maps embed */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d252171.49607496296!2d-13.358859031249992!3d8.465478100000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xf04366c6c577ce5%3A0xf93d42a825e8f253!2sFreetown%2C%20Sierra%20Leone!5e0!3m2!1sen!2sus!4v1697060042048!5m2!1sen!2sus"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="FreelancePro SL Office Location"
            ></iframe>
          </div>
        </div>

        <div className="faq-section scroll-animation">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How do I create an account?</h3>
              <p>To create an account, click on the "Register" button in the top navigation menu and follow the instructions. You'll need a valid email address and password.</p>
            </div>
            <div className="faq-item">
              <h3>How can I post a job?</h3>
              <p>Once registered and logged in, go to the "Post a Job" page, fill out the job details form, and submit. Your job will be reviewed and posted shortly.</p>
            </div>
            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>We accept credit/debit cards, bank transfers, and mobile money. All payments are processed securely through our trusted payment partners.</p>
            </div>
            <div className="faq-item">
              <h3>How do I contact a freelancer?</h3>
              <p>You can contact freelancers through our messaging system after you have posted a job and received applications, or by directly reaching out on their profile page.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
