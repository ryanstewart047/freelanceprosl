import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/Freelancers.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Freelancers = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    skill: '',
    minRate: '',
    maxRate: '',
    rating: 0,
  });

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ role: 'freelancer' });
      if (filters.skill) params.append('skill', filters.skill);
      if (search) params.append('search', search);
      const res = await fetch(`${API_BASE}/profiles/users?${params.toString()}`);
      const data = await res.json();
      setFreelancers(data.users || []);
    } catch (err) {
      console.log('API error, using demo data:', err);
      setFreelancers(getDemoFreelancers());
    } finally {
      setLoading(false);
    }
  };

  const getDemoFreelancers = () => [
    {
      id: 1, tracking_id: 'FPSL-A1B2C3',
      first_name: 'John', last_name: 'Doe', username: 'johndoe',
      title: 'Full Stack Developer', category: 'Development',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      hourly_rate: 45, pricing_type: 'hourly', rating: 4.9, review_count: 87,
      profile_picture: null, bio: 'Experienced full stack developer with 5+ years in web application development.',
      whatsapp_number: '+23276000001', contact_email: 'john@example.com',
      is_active_profile: true, days_remaining_in_trial: 22,
    },
    {
      id: 2, tracking_id: 'FPSL-D4E5F6',
      first_name: 'Sarah', last_name: 'Smith', username: 'sarahsmith',
      title: 'UI/UX Designer', category: 'Design',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'UI Design'],
      hourly_rate: 55, pricing_type: 'hourly', rating: 4.8, review_count: 64,
      profile_picture: null, bio: 'Passionate UI/UX designer focused on intuitive, beautiful user experiences.',
      whatsapp_number: '+23276000002', contact_email: 'sarah@example.com',
      is_active_profile: true, days_remaining_in_trial: 15,
    },
    {
      id: 3, tracking_id: 'FPSL-G7H8I9',
      first_name: 'Michael', last_name: 'Turay', username: 'mturay',
      title: 'Mobile Technician', category: 'Technology',
      skills: ['Phone Repair', 'Tablet Repair', 'Diagnostics'],
      hourly_rate: 35, pricing_type: 'per_project', rating: 4.7, review_count: 43,
      profile_picture: null, bio: 'Experienced mobile technician specializing in smartphone and tablet repairs.',
      whatsapp_number: '+23276000003', contact_email: 'michael@example.com',
      is_active_profile: true, days_remaining_in_trial: 8,
    },
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFreelancers();
  };

  const filteredFreelancers = freelancers.filter(f => {
    if (filters.category && (f.category || '') !== filters.category) return false;
    if (filters.rating > 0 && (f.rating || 0) < parseFloat(filters.rating)) return false;
    if (filters.minRate && (f.hourly_rate || 0) < parseFloat(filters.minRate)) return false;
    if (filters.maxRate && (f.hourly_rate || 0) > parseFloat(filters.maxRate)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (`${f.first_name} ${f.last_name}`).toLowerCase().includes(q) ||
        (f.title || '').toLowerCase().includes(q) ||
        (f.tracking_id || '').toLowerCase().includes(q) ||
        (f.skills || []).some(s => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getWhatsAppUrl = (number) => {
    if (!number) return null;
    const clean = number.replace(/[^\d+]/g, '');
    return `https://wa.me/${clean}`;
  };

  const getPricingLabel = (type) => {
    switch (type) {
      case 'hourly': return '/hr';
      case 'fixed': return ' fixed';
      case 'per_project': return '/project';
      default: return '/hr';
    }
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating || 0);
    const half = (rating || 0) % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <span className="stars">
        {'★'.repeat(full)}
        {half ? '½' : ''}
        {'☆'.repeat(empty)}
      </span>
    );
  };

  return (
    <div className="freelancers-page">
      <div className="hero-section">
        <div className="container">
          <h1>Find Expert Freelancers</h1>
          <p>Connect with skilled professionals – all profiles verified & active</p>
          <form className="search-container" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by name, skill, or tracking ID..."
              className="search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </div>

      <div className="container main-content">
        <div className="filters-section">
          <h2>Filters</h2>

          <div className="filter-group">
            <label>Category</label>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Writing">Writing</option>
              <option value="Marketing">Marketing</option>
              <option value="Technology">Technology</option>
              <option value="Virtual Assistant">Virtual Assistant</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Min Rate ($)</label>
            <input type="number" name="minRate" value={filters.minRate} onChange={handleFilterChange} placeholder="e.g. 10" min="0" />
          </div>
          <div className="filter-group">
            <label>Max Rate ($)</label>
            <input type="number" name="maxRate" value={filters.maxRate} onChange={handleFilterChange} placeholder="e.g. 200" min="0" />
          </div>

          <div className="filter-group">
            <label>Minimum Rating</label>
            <select name="rating" value={filters.rating} onChange={handleFilterChange}>
              <option value="0">Any Rating</option>
              <option value="3">3.0+</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
              <option value="4.8">4.8+</option>
            </select>
          </div>

          <button className="btn btn-secondary" onClick={fetchFreelancers}>Apply Filters</button>
          <button className="btn btn-outline" onClick={() => { setFilters({ category: '', skill: '', minRate: '', maxRate: '', rating: 0 }); setSearch(''); }}>Reset</button>
        </div>

        <div className="freelancers-list">
          <div className="list-header">
            <h2>{filteredFreelancers.length} Active Freelancer{filteredFreelancers.length !== 1 ? 's' : ''} Found</h2>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Finding freelancers...</p>
            </div>
          ) : error ? (
            <div className="error-msg"><i className="fas fa-exclamation-triangle"></i> {error}</div>
          ) : filteredFreelancers.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-user-slash"></i>
              <h3>No active freelancers found</h3>
              <p>Try adjusting your filters or search term</p>
            </div>
          ) : (
            filteredFreelancers.map(f => (
              <div key={f.id} className="freelancer-card">
                {/* Active badge */}
                <div className="card-active-badge">
                  <i className="fas fa-check-circle"></i> Active
                </div>

                <div className="card-left">
                  <div className="freelancer-avatar">
                    {f.profile_picture ? (
                      <img src={f.profile_picture} alt={`${f.first_name} ${f.last_name}`} />
                    ) : (
                      <div className="avatar-initials">
                        {(f.first_name || '?')[0]}{(f.last_name || '')[0]}
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-body">
                  <div className="card-title-row">
                    <h3>{f.first_name} {f.last_name}</h3>
                    <span className="tracking-badge" title="Unique Tracking ID">
                      <i className="fas fa-fingerprint"></i> {f.tracking_id || 'N/A'}
                    </span>
                  </div>
                  <p className="freelancer-title">{f.title || 'Freelancer'}</p>

                  {/* Rating */}
                  <div className="freelancer-rating">
                    {renderStars(f.rating)}
                    <span className="rating-text">
                      {f.rating ? `${f.rating} (${f.review_count || 0} reviews)` : 'No reviews yet'}
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="freelancer-bio">{f.bio || 'No bio provided.'}</p>

                  {/* Skills */}
                  <div className="freelancer-skills">
                    {(f.skills || []).slice(0, 5).map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))}
                    {(f.skills || []).length > 5 && (
                      <span className="skill-tag more-skills">+{f.skills.length - 5} more</span>
                    )}
                  </div>
                </div>

                <div className="card-right">
                  {/* Pricing */}
                  <div className="freelancer-price">
                    <span className="price-value">
                      {f.hourly_rate ? `$${f.hourly_rate}` : 'Negotiable'}
                    </span>
                    {f.hourly_rate && (
                      <span className="price-unit">{getPricingLabel(f.pricing_type)}</span>
                    )}
                  </div>

                  {/* Trial badge */}
                  {f.days_remaining_in_trial > 0 && (
                    <div className="trial-badge">
                      <i className="fas fa-clock"></i> {f.days_remaining_in_trial}d trial
                    </div>
                  )}

                  {/* Actions */}
                  <div className="freelancer-actions">
                    <Link to={`/freelancers/${f.id}`} className="btn btn-primary btn-sm">
                      <i className="fas fa-user"></i> View Profile
                    </Link>

                    {getWhatsAppUrl(f.whatsapp_number) && (
                      <a
                        href={getWhatsAppUrl(f.whatsapp_number)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm"
                        title="Chat on WhatsApp"
                      >
                        <i className="fab fa-whatsapp"></i> WhatsApp
                      </a>
                    )}

                    {(f.contact_email || f.email) && (
                      <a
                        href={`mailto:${f.contact_email || f.email}`}
                        className="btn btn-outline btn-sm"
                        title="Send Email"
                      >
                        <i className="fas fa-envelope"></i> Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Freelancers;
