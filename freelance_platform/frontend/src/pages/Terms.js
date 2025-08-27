import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/Terms.css';

const Terms = () => {
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
    { id: 'user-accounts', title: 'User Accounts' },
    { id: 'platform-rules', title: 'Platform Rules and Conduct' },
    { id: 'fees', title: 'Fees and Payments' },
    { id: 'disputes', title: 'Dispute Resolution' },
    { id: 'intellectual-property', title: 'Intellectual Property' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'termination', title: 'Termination' },
    { id: 'changes', title: 'Changes to Terms' },
    { id: 'governing-law', title: 'Governing Law' },
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
    <div className="terms-page">
      <div className="hero-section">
        <div className="container">
          <h1 className="scroll-animation">Terms and Conditions</h1>
          <p className="scroll-animation">
            Last updated: June 1, 2023
          </p>
        </div>
      </div>

      <div className="container">
        <div className="terms-content">
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

          <div className="terms-sections">
            <section id="introduction" className="scroll-animation">
              <h2>1. Introduction</h2>
              <p>
                Welcome to FreelancePro SL. These Terms and Conditions govern your use of the FreelancePro SL platform and services (collectively, the "Services") operated by FreelancePro SL ("we," "us," or "our").
              </p>
              <p>
                By accessing or using our Services, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access or use our Services.
              </p>
            </section>

            <section id="user-accounts" className="scroll-animation">
              <h2>2. User Accounts</h2>
              <p>
                When you create an account with us, you must provide accurate, complete, and up-to-date information. You are responsible for safeguarding the password you use to access our Services and for any activities or actions under your password.
              </p>
              <p>
                You may register as either a "Client" or a "Freelancer":
              </p>
              <ul>
                <li>
                  <strong>Clients</strong> are users who post projects and hire freelancers.
                </li>
                <li>
                  <strong>Freelancers</strong> are users who offer their professional services and apply for projects.
                </li>
              </ul>
              <p>
                We reserve the right to disable any user account at any time if, in our opinion, you have failed to comply with these Terms and Conditions.
              </p>
            </section>

            <section id="platform-rules" className="scroll-animation">
              <h2>3. Platform Rules and Conduct</h2>
              <p>
                When using our Services, you agree not to:
              </p>
              <ul>
                <li>Violate any applicable laws or regulations</li>
                <li>Impersonate another person or misrepresent your affiliation with a person or entity</li>
                <li>Post or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
                <li>Attempt to circumvent any security measures or interfere with the proper working of the Services</li>
                <li>Engage in any fraudulent activities</li>
                <li>Post false or misleading information</li>
                <li>Attempt to communicate with other users outside of our platform to avoid service fees</li>
                <li>Create multiple accounts for deceptive purposes</li>
              </ul>
            </section>

            <section id="fees" className="scroll-animation">
              <h2>4. Fees and Payments</h2>
              <p>
                FreelancePro SL charges service fees for the use of our platform. The fees may vary depending on the type of service and may be updated from time to time.
              </p>
              <p>
                For Clients:
              </p>
              <ul>
                <li>Posting a job is free</li>
                <li>A service fee of 5% is charged on the total project value when hiring a freelancer</li>
              </ul>
              <p>
                For Freelancers:
              </p>
              <ul>
                <li>Creating a profile and applying to jobs is free</li>
                <li>A service fee of 10% is deducted from payments received</li>
              </ul>
              <p>
                All payments are processed securely through our platform. Clients must deposit funds before work begins, and payments are released to freelancers only when the work is completed and approved.
              </p>
            </section>

            <section id="disputes" className="scroll-animation">
              <h2>5. Dispute Resolution</h2>
              <p>
                In the event of a dispute between a Client and a Freelancer, we encourage direct communication to resolve the issue. If this is unsuccessful, either party may request mediation through our dispute resolution process.
              </p>
              <p>
                To initiate a dispute, contact our support team within 14 days of the incident. We will review the case and make a fair determination based on the evidence provided by both parties.
              </p>
              <p>
                Our decision is final and binding. We reserve the right to release, refund, or hold funds in escrow based on our judgment of the dispute.
              </p>
            </section>

            <section id="intellectual-property" className="scroll-animation">
              <h2>6. Intellectual Property</h2>
              <p>
                Unless otherwise specified, all content on our platform is owned by FreelancePro SL or its licensors and is protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                For work created by Freelancers for Clients:
              </p>
              <ul>
                <li>Intellectual property rights are transferred to the Client only upon full payment</li>
                <li>Until full payment is received, the Freelancer retains all rights to their work</li>
                <li>Clients and Freelancers may agree to different terms in their contract</li>
              </ul>
              <p>
                You may not use, reproduce, distribute, or create derivative works based on our content without our express permission.
              </p>
            </section>

            <section id="liability" className="scroll-animation">
              <h2>7. Limitation of Liability</h2>
              <p>
                FreelancePro SL serves as a platform connecting Clients and Freelancers. We are not a party to any agreement between users and do not guarantee the quality, safety, or legality of services provided.
              </p>
              <p>
                To the maximum extent permitted by law, we disclaim all warranties, express or implied, including but not limited to implied warranties of merchantability and fitness for a particular purpose.
              </p>
              <p>
                We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our Services.
              </p>
            </section>

            <section id="termination" className="scroll-animation">
              <h2>8. Termination</h2>
              <p>
                We may terminate or suspend your account and access to our Services immediately, without prior notice or liability, for any reason, including but not limited to a breach of these Terms and Conditions.
              </p>
              <p>
                You may terminate your account at any time by contacting us. Upon termination, your right to use the Services will immediately cease.
              </p>
              <p>
                All provisions of these Terms and Conditions which by their nature should survive termination shall survive, including but not limited to ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </section>

            <section id="changes" className="scroll-animation">
              <h2>9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms and Conditions at any time. We will provide notice of significant changes by posting an announcement on our platform or sending an email to the address associated with your account.
              </p>
              <p>
                Your continued use of our Services after such modifications constitutes your acceptance of the revised Terms and Conditions.
              </p>
            </section>

            <section id="governing-law" className="scroll-animation">
              <h2>10. Governing Law</h2>
              <p>
                These Terms and Conditions shall be governed by and construed in accordance with the laws of Sierra Leone, without regard to its conflict of law provisions.
              </p>
              <p>
                Any dispute arising out of or relating to these Terms and Conditions shall be subject to the exclusive jurisdiction of the courts of Sierra Leone.
              </p>
            </section>

            <section id="contact" className="scroll-animation">
              <h2>11. Contact Us</h2>
              <p>
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <p>
                <strong>Email:</strong> support@itservicesfreetown.com<br />
                <strong>Phone:</strong> +23233399391<br />
                <strong>Address:</strong> Freetown, Sierra Leone
              </p>
            </section>
          </div>
        </div>

        <div className="terms-cta scroll-animation">
          <p>By using our services, you acknowledge that you have read and understood these Terms and Conditions and agree to be bound by them.</p>
          <div className="cta-buttons">
            <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
            <Link to="/privacy" className="btn btn-primary">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
