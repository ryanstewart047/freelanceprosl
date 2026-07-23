import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/pages/FreelancerProfile.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DEMO_FREELANCERS = {
  1: {
    id: 1, tracking_id: 'FPSL-A1B2C3',
    first_name: 'John', last_name: 'Doe', username: 'johndoe',
    title: 'Full Stack Web Developer', category: 'Development',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python'],
    hourly_rate: 45, pricing_type: 'hourly', rating: 4.9, review_count: 87,
    bio: 'Experienced full stack developer with 5+ years building modern web applications, e-commerce platforms, and high-performance REST APIs.',
    location: 'Freetown, Sierra Leone', whatsapp_number: '+23276000001', contact_email: 'john@example.com',
    availability: 'Full Time', is_active_profile: true, days_remaining_in_trial: 22,
  },
  2: {
    id: 2, tracking_id: 'FPSL-D4E5F6',
    first_name: 'Sarah', last_name: 'Smith', username: 'sarahsmith',
    title: 'UI/UX Designer & Brand Strategist', category: 'Design',
    skills: ['Figma', 'Adobe XD', 'Sketch', 'UI Design', 'Wireframing'],
    hourly_rate: 55, pricing_type: 'hourly', rating: 4.8, review_count: 64,
    bio: 'Passionate UI/UX designer creating intuitive, beautiful user interfaces and branding systems for web and mobile products.',
    location: 'Bo, Sierra Leone', whatsapp_number: '+23276000002', contact_email: 'sarah@example.com',
    availability: 'Part Time', is_active_profile: true, days_remaining_in_trial: 15,
  },
  3: {
    id: 3, tracking_id: 'FPSL-G7H8I9',
    first_name: 'Michael', last_name: 'Turay', username: 'mturay',
    title: 'Mobile Diagnostics & Hardware Technician', category: 'Technology',
    skills: ['Phone Repair', 'Tablet Repair', 'Hardware Diagnostics', 'Circuit Repair'],
    hourly_rate: 35, pricing_type: 'per_project', rating: 4.7, review_count: 43,
    bio: 'Expert hardware technician offering fast smartphone, tablet, and laptop diagnostic and repair services.',
    location: 'Makeni, Sierra Leone', whatsapp_number: '+23276000003', contact_email: 'michael@example.com',
    availability: 'Full Time', is_active_profile: true, days_remaining_in_trial: 8,
  }
};

const FreelancerProfile = () => {
  const { id } = useParams();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/profiles/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setFreelancer(data.user);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.log('API call failed, using demo freelancer profile:', err);
    }

    // Fallback to demo profile data
    const demoData = DEMO_FREELANCERS[id] || {
      id: parseInt(id) || 1,
      tracking_id: `FPSL-USER${id || 1}`,
      first_name: 'Sierra',
      last_name: 'Freelancer',
      username: `user_${id || 1}`,
      title: 'Skilled Professional',
      category: 'General',
      skills: ['Communication', 'Problem Solving', 'Customer Care'],
      hourly_rate: 30,
      pricing_type: 'hourly',
      rating: 4.8,
      review_count: 12,
      bio: 'Professional freelancer offering reliable services across Sierra Leone.',
      location: 'Sierra Leone',
      whatsapp_number: '+23276000000',
      contact_email: 'freelancer@example.com',
      availability: 'Full Time',
      is_active_profile: true,
      days_remaining_in_trial: 30,
    };

    setFreelancer(demoData);
    setLoading(false);
  };

  const getWhatsAppUrl = (number) => {
    if (!number) return null;
    const clean = number.replace(/[^\d+]/g, '');
    return `https://wa.me/${clean}`;
  };

  if (loading) {
    return (
      <div className="freelancer-profile-page">
        <div className="container">
          <div className="loading-spinner" style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p>Loading freelancer profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!freelancer) return null;

  return (
    <div className="freelancer-profile-page">
      <div className="container">
        <div className="back-navigation" style={{ margin: '1.5rem 0' }}>
          <Link to="/freelancers" className="btn btn-outline btn-sm">
            <i className="fas fa-arrow-left"></i> Back to Freelancers
          </Link>
        </div>

        <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          {/* Main Details */}
          <div className="profile-main-card" style={{ background: '#ffffff', borderRadius: '1rem', padding: '2rem', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div className="profile-header-flex" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="profile-avatar-large" style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #040e40, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
                {(freelancer.first_name || '?')[0]}{(freelancer.last_name || '')[0]}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#040e40' }}>{freelancer.first_name} {freelancer.last_name}</h1>
                  <span className="tracking-badge" style={{ background: '#e0e7ff', color: '#3730a3', padding: '0.2rem 0.6rem', borderRadius: '0.375rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    <i className="fas fa-fingerprint"></i> {freelancer.tracking_id || 'FPSL-VERIFIED'}
                  </span>
                </div>
                <p style={{ color: '#64748b', fontSize: '1.05rem', margin: '0.25rem 0' }}>{freelancer.title || 'Freelancer'}</p>
                <div style={{ color: '#f59e0b', fontSize: '0.95rem' }}>
                  {'★'.repeat(Math.floor(freelancer.rating || 5))} ({freelancer.rating || 5.0} • {freelancer.review_count || 10} reviews)
                </div>
              </div>
            </div>

            <section style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#040e40', fontSize: '1.1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                <i className="fas fa-user"></i> About
              </h3>
              <p style={{ color: '#334155', lineHeight: '1.7' }}>{freelancer.bio}</p>
            </section>

            <section style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#040e40', fontSize: '1.1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                <i className="fas fa-tools"></i> Skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(freelancer.skills || []).map((skill, index) => (
                  <span key={index} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '999px', padding: '0.3rem 0.8rem', fontSize: '0.85rem', fontWeight: '500' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h3 style={{ color: '#040e40', fontSize: '1.1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                <i className="fas fa-info-circle"></i> Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: '#475569' }}>
                <div><strong>Location:</strong> {freelancer.location || 'Sierra Leone'}</div>
                <div><strong>Availability:</strong> {freelancer.availability || 'Available'}</div>
                <div><strong>Rate:</strong> {freelancer.hourly_rate ? `$${freelancer.hourly_rate}/${freelancer.pricing_type || 'hr'}` : 'Negotiable'}</div>
                <div><strong>Status:</strong> <span style={{ color: '#10b981', fontWeight: 'bold' }}>Active Profile</span></div>
              </div>
            </section>
          </div>

          {/* Sidebar Hire Card */}
          <div className="profile-action-card" style={{ background: '#040e40', color: 'white', borderRadius: '1rem', padding: '2rem', height: 'fit-content' }}>
            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Contact & Hire</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#38bdf8', marginBottom: '1.5rem' }}>
              {freelancer.hourly_rate ? `$${freelancer.hourly_rate}` : 'Negotiable'}
              <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}> / {freelancer.pricing_type || 'hr'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {getWhatsAppUrl(freelancer.whatsapp_number) && (
                <a
                  href={getWhatsAppUrl(freelancer.whatsapp_number)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ background: '#25D366', color: 'white', fontWeight: 'bold', justifyContent: 'center' }}
                >
                  <i className="fab fa-whatsapp"></i> Chat on WhatsApp
                </a>
              )}

              {freelancer.contact_email && (
                <a
                  href={`mailto:${freelancer.contact_email}`}
                  className="btn btn-outline"
                  style={{ borderColor: '#ffffff', color: 'white', justifyContent: 'center' }}
                >
                  <i className="fas fa-envelope"></i> Send Direct Email
                </a>
              )}

              <Link
                to={`/contact?freelancer=${freelancer.id}`}
                className="btn"
                style={{ background: '#dc2626', color: 'white', fontWeight: 'bold', justifyContent: 'center' }}
              >
                <i className="fas fa-paper-plane"></i> Hire For Project
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;
