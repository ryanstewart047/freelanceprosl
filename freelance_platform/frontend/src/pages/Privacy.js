import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/Privacy.css';

const Privacy = () => {
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

  // Table of contents
  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'information-collected', title: 'Information We Collect' },
    { id: 'use-of-information', title: 'How We Use Your Information' },
    { id: 'information-sharing', title: 'Information Sharing and Disclosure' },
    { id: 'data-security', title: 'Data Security' },
    { id: 'user-rights', title: 'Your Rights and Choices' },
    { id: 'cookies', title: 'Cookies and Tracking Technologies' },
    { id: 'children', title: 'Children\'s Privacy' },
    { id: 'changes', title: 'Changes to This Privacy Policy' },
    { id: 'contact', title: 'Contact Us' },
  ];

  // Scroll to section
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="privacy-page">
      <div className="hero-section">
        <div className="container">
          <h1 className="scroll-animation">Privacy Policy</h1>
          <p className="scroll-animation">
            Last updated: June 1, 2023
          </p>
        </div>
      </div>

      <div className="container">
        <div className="privacy-content">
          <div className="table-of-contents scroll-animation">
            <h2>Table of Contents</h2>
            <ul>
              {sections.map((section) => (
                <li key={section.id}>
                  <button onClick={() => scrollToSection(section.id)}>
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="privacy-sections">
            <section id="introduction" className="scroll-animation">
              <h2>1. Introduction</h2>
              <p>
                FreelancePro SL ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services (collectively, the "Services").
              </p>
              <p>
                We value your trust and strive to maintain the highest standards of data protection. Please read this Privacy Policy carefully. By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
              </p>
            </section>

            <section id="information-collected" className="scroll-animation">
              <h2>2. Information We Collect</h2>
              <p>
                We collect several types of information from and about users of our Services:
              </p>
              <h3>Personal Information</h3>
              <p>
                This includes information that can be used to identify you, such as:
              </p>
              <ul>
                <li>Name, email address, phone number, and physical address</li>
                <li>Profile information and profile picture</li>
                <li>Account login credentials</li>
                <li>Payment information (processed securely through our payment processors)</li>
                <li>Portfolio samples and work history</li>
                <li>Education and professional qualifications</li>
                <li>Reviews, ratings, and feedback</li>
              </ul>
              <h3>Non-Personal Information</h3>
              <p>
                We also collect non-personal information that does not directly identify you:
              </p>
              <ul>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>IP address and location data</li>
                <li>Usage patterns and preferences</li>
                <li>Device information</li>
              </ul>
            </section>

            <section id="use-of-information" className="scroll-animation">
              <h2>3. How We Use Your Information</h2>
              <p>
                We use the information we collect for various purposes, including:
              </p>
              <ul>
                <li>Creating and managing your account</li>
                <li>Providing and improving our Services</li>
                <li>Processing transactions and payments</li>
                <li>Connecting freelancers with clients</li>
                <li>Communicating with you about our Services, updates, and promotions</li>
                <li>Customizing your experience on our platform</li>
                <li>Analyzing usage patterns to improve our Services</li>
                <li>Preventing fraudulent activities and ensuring security</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section id="information-sharing" className="scroll-animation">
              <h2>4. Information Sharing and Disclosure</h2>
              <p>
                We may share your information in the following circumstances:
              </p>
              <h3>Within Our Platform</h3>
              <p>
                When you create a profile, certain information may be visible to other users of our platform, such as your name, profile picture, skills, and reviews.
              </p>
              <h3>Service Providers</h3>
              <p>
                We may share your information with third-party service providers who help us operate our business and deliver services to you, such as payment processors, hosting providers, and customer support services.
              </p>
              <h3>Legal Requirements</h3>
              <p>
                We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).
              </p>
              <h3>Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of the transaction.
              </p>
              <h3>With Your Consent</h3>
              <p>
                We may share your information with third parties when we have your explicit consent to do so.
              </p>
            </section>

            <section id="data-security" className="scroll-animation">
              <h2>5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.
              </p>
              <p>
                However, please be aware that no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
              </p>
              <p>
                We regularly review our security procedures and consider new technology and methods as necessary.
              </p>
            </section>

            <section id="user-rights" className="scroll-animation">
              <h2>6. Your Rights and Choices</h2>
              <p>
                You have certain rights regarding your personal information:
              </p>
              <ul>
                <li><strong>Access:</strong> You can request a copy of the personal information we hold about you.</li>
                <li><strong>Correction:</strong> You can request that we correct inaccurate or incomplete information.</li>
                <li><strong>Deletion:</strong> You can request that we delete your personal information.</li>
                <li><strong>Objection:</strong> You can object to our processing of your personal information.</li>
                <li><strong>Restriction:</strong> You can request that we restrict the processing of your personal information.</li>
                <li><strong>Portability:</strong> You can request a copy of your data in a structured, commonly used, and machine-readable format.</li>
                <li><strong>Withdraw Consent:</strong> You can withdraw consent where we process your information based on consent.</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the information provided in the "Contact Us" section.
              </p>
            </section>

            <section id="cookies" className="scroll-animation">
              <h2>7. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to enhance your experience on our platform. Cookies are small text files that are stored on your device when you visit our website.
              </p>
              <p>
                We use the following types of cookies:
              </p>
              <ul>
                <li><strong>Essential Cookies:</strong> These cookies are necessary for the basic functionality of our website.</li>
                <li><strong>Analytical/Performance Cookies:</strong> These cookies help us understand how visitors interact with our website.</li>
                <li><strong>Functionality Cookies:</strong> These cookies enable personalized features and remember your preferences.</li>
                <li><strong>Targeting Cookies:</strong> These cookies are used to deliver relevant advertisements.</li>
              </ul>
              <p>
                You can control cookies through your browser settings. However, disabling certain cookies may limit your ability to use some features of our Services.
              </p>
            </section>

            <section id="children" className="scroll-animation">
              <h2>8. Children's Privacy</h2>
              <p>
                Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18 without verification of parental consent, we will take steps to remove that information from our servers.
              </p>
            </section>

            <section id="changes" className="scroll-animation">
              <h2>9. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p>
                We encourage you to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </section>

            <section id="contact" className="scroll-animation">
              <h2>10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p>
                <strong>Email:</strong> support@itservicesfreetown.com<br />
                <strong>Phone:</strong> +23233399391<br />
                <strong>Address:</strong> Freetown, Sierra Leone
              </p>
            </section>
          </div>
        </div>

        <div className="privacy-cta scroll-animation">
          <p>By using our services, you acknowledge that you have read and understood this Privacy Policy and agree to our collection, use, and disclosure practices described herein.</p>
          <div className="cta-buttons">
            <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
            <Link to="/terms" className="btn btn-primary">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
