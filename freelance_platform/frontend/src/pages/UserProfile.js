import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/pages/UserProfile.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [messages, setMessages] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    fetchProfile(storedUser);
  }, [navigate]);

  const fetchProfile = async (storedUser) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        initForm(data);
      } else {
        setUser(storedUser);
        initForm(storedUser);
      }
    } catch {
      setUser(storedUser);
      initForm(storedUser);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/admin/my-messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.log('Could not load messages:', err);
    }
  };

  const initForm = (data) => {
    setFormData({
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      title: data.title || '',
      location: data.location || '',
      bio: data.bio || '',
      phone_number: data.phone_number || '',
      whatsapp_number: data.whatsapp_number || '',
      contact_email: data.contact_email || data.email || '',
      hourly_rate: data.hourly_rate || '',
      pricing_type: data.pricing_type || 'hourly',
      availability: data.availability || '',
      skills: (data.skills || []).join(', '),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        hourly_rate: parseFloat(formData.hourly_rate) || 0,
      };
      const res = await fetch(`${API_BASE}/profiles/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getSubscriptionStatusColor = (status) => {
    switch (status) {
      case 'TRIAL': return '#f59e0b';
      case 'ACTIVE': return '#10b981';
      case 'EXPIRED': return '#ef4444';
      case 'CANCELLED': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getWhatsAppUrl = (number) => {
    if (!number) return null;
    const clean = number.replace(/[^\d+]/g, '');
    return `https://wa.me/${clean}`;
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!user) return null;

  const daysLeft = user.days_remaining_in_trial || 0;
  const trialExpired = daysLeft === 0 && user.subscription_status === 'TRIAL';

  return (
    <div className="user-profile-container">
      {/* Status Banner */}
      {user.subscription_status === 'TRIAL' && (
        <div className={`subscription-banner ${trialExpired ? 'expired' : daysLeft <= 7 ? 'warning' : 'info'}`}>
          <div className="banner-content">
            {trialExpired ? (
              <>
                <i className="fas fa-exclamation-triangle"></i>
                <strong>Trial Expired!</strong> Your profile is no longer visible in the Marketplace.
                <button className="btn btn-primary btn-sm" style={{ marginLeft: '1rem' }}>
                  Subscribe for $10/month
                </button>
              </>
            ) : (
              <>
                <i className="fas fa-clock"></i>
                <strong>Free Trial Active</strong> — {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining.
                After your trial, continue for just <strong>$10/month</strong>.
                {daysLeft <= 7 && (
                  <button className="btn btn-warning btn-sm" style={{ marginLeft: '1rem' }}>
                    Subscribe Now
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {user.subscription_status === 'ACTIVE' && (
        <div className="subscription-banner active">
          <i className="fas fa-check-circle"></i>
          <strong>Active Subscription</strong> — Your profile is live in the Marketplace.
          {user.subscription_end_date && (
            <span style={{ marginLeft: '0.5rem' }}>
              Renews: {new Date(user.subscription_end_date).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
      {user.is_suspended && (
        <div className="subscription-banner suspended">
          <i className="fas fa-ban"></i>
          <strong>Account Suspended</strong> — Please contact support for assistance.
        </div>
      )}

      {/* Alerts */}
      {success && <div className="alert alert-success"><i className="fas fa-check-circle"></i> {success}</div>}
      {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}

      <div className="profile-wrapper">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="sidebar-avatar">
            {user.profile_picture ? (
              <img src={user.profile_picture} alt={user.username} />
            ) : (
              <div className="avatar-initials large">
                {(user.first_name || '?')[0]}{(user.last_name || '')[0]}
              </div>
            )}
          </div>
          <h2 className="sidebar-name">{user.first_name} {user.last_name}</h2>
          <p className="sidebar-title">{user.title || 'No title set'}</p>

          {/* Tracking ID */}
          <div className="tracking-id-box">
            <i className="fas fa-fingerprint"></i>
            <span>{user.tracking_id || 'Generating...'}</span>
          </div>

          {/* Subscription Status */}
          <div className="status-pill" style={{ backgroundColor: getSubscriptionStatusColor(user.subscription_status) }}>
            {user.subscription_status === 'TRIAL' ? `Free Trial (${daysLeft}d left)` : user.subscription_status}
          </div>

          {/* Quick Links */}
          {getWhatsAppUrl(user.whatsapp_number) && (
            <a href={getWhatsAppUrl(user.whatsapp_number)} target="_blank" rel="noopener noreferrer"
               className="btn btn-whatsapp btn-block">
              <i className="fab fa-whatsapp"></i> WhatsApp Me
            </a>
          )}

          {/* Tab Nav */}
          <nav className="profile-tab-nav">
            <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
              <i className="fas fa-user"></i> Profile
            </button>
            <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => { setActiveTab('messages'); fetchMessages(); }}>
              <i className="fas fa-envelope"></i> Messages
            </button>
            <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
              <i className="fas fa-cog"></i> Settings
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="profile-main">

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="profile-tab-content">
              <div className="tab-header">
                <h2>My Profile</h2>
                {!isEditing && (
                  <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                    <i className="fas fa-edit"></i> Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <form className="profile-edit-form" onSubmit={handleSave}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="first_name">First Name *</label>
                      <input id="first_name" name="first_name" type="text" value={formData.first_name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="last_name">Last Name *</label>
                      <input id="last_name" name="last_name" type="text" value={formData.last_name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="title">Professional Title</label>
                      <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} placeholder="e.g. Senior Web Developer" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="location">Location</label>
                      <input id="location" name="location" type="text" value={formData.location} onChange={handleChange} placeholder="e.g. Freetown, Sierra Leone" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone_number">Phone Number</label>
                      <input id="phone_number" name="phone_number" type="tel" value={formData.phone_number} onChange={handleChange} placeholder="+232..." />
                    </div>
                    <div className="form-group">
                      <label htmlFor="whatsapp_number">
                        <i className="fab fa-whatsapp" style={{ color: '#25D366' }}></i> WhatsApp Number
                      </label>
                      <input id="whatsapp_number" name="whatsapp_number" type="tel" value={formData.whatsapp_number} onChange={handleChange} placeholder="+232..." />
                      <small>Clients will use this to chat with you on WhatsApp</small>
                    </div>
                    <div className="form-group">
                      <label htmlFor="contact_email">Contact Email</label>
                      <input id="contact_email" name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} />
                      <small>This email is shown publicly to clients</small>
                    </div>
                    <div className="form-group">
                      <label htmlFor="hourly_rate">Rate ($)</label>
                      <input id="hourly_rate" name="hourly_rate" type="number" value={formData.hourly_rate} onChange={handleChange} placeholder="e.g. 25" min="0" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pricing_type">Pricing Type</label>
                      <select id="pricing_type" name="pricing_type" value={formData.pricing_type} onChange={handleChange}>
                        <option value="hourly">Per Hour</option>
                        <option value="per_project">Per Project</option>
                        <option value="fixed">Fixed Rate</option>
                        <option value="negotiable">Negotiable</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="availability">Availability</label>
                      <select id="availability" name="availability" value={formData.availability} onChange={handleChange}>
                        <option value="">Select...</option>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="weekends">Weekends Only</option>
                        <option value="as_needed">As Needed</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="bio">Bio / About Me</label>
                    <textarea id="bio" name="bio" rows={5} value={formData.bio} onChange={handleChange} placeholder="Tell clients about yourself, your experience, and what you offer..." />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="skills">Skills <small>(comma-separated)</small></label>
                    <input id="skills" name="skills" type="text" value={formData.skills} onChange={handleChange} placeholder="e.g. JavaScript, React, Node.js, Photography" />
                    <small>These skills will appear on your public profile in the Marketplace</small>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Changes</>}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)} disabled={saving}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-view">
                  <section className="profile-section-card">
                    <h3><i className="fas fa-user-circle"></i> About</h3>
                    <p>{user.bio || 'No bio provided yet. Click Edit Profile to add one.'}</p>
                  </section>

                  <section className="profile-section-card">
                    <h3><i className="fas fa-tools"></i> Skills</h3>
                    {user.skills && user.skills.length > 0 ? (
                      <div className="skills-list">
                        {user.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                      </div>
                    ) : (
                      <p className="muted">No skills added yet.</p>
                    )}
                  </section>

                  <section className="profile-section-card">
                    <h3><i className="fas fa-dollar-sign"></i> Pricing</h3>
                    <div className="info-row">
                      <span className="info-label">Rate:</span>
                      <span className="info-value">
                        {user.hourly_rate ? `$${user.hourly_rate}` : 'Not set'}
                        {user.pricing_type && user.pricing_type !== 'negotiable' && (
                          <span className="muted"> / {user.pricing_type === 'hourly' ? 'hour' : user.pricing_type === 'per_project' ? 'project' : 'fixed'}</span>
                        )}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Availability:</span>
                      <span className="info-value">{user.availability ? user.availability.replace('_', ' ') : 'Not set'}</span>
                    </div>
                  </section>

                  <section className="profile-section-card">
                    <h3><i className="fas fa-address-card"></i> Contact Information</h3>
                    <div className="contact-grid">
                      {user.contact_email && (
                        <a href={`mailto:${user.contact_email}`} className="contact-item">
                          <i className="fas fa-envelope"></i> {user.contact_email}
                        </a>
                      )}
                      {user.phone_number && (
                        <div className="contact-item">
                          <i className="fas fa-phone"></i> {user.phone_number}
                        </div>
                      )}
                      {user.whatsapp_number && (
                        <a href={`https://wa.me/${user.whatsapp_number.replace(/[^\d+]/g, '')}`} target="_blank" rel="noopener noreferrer" className="contact-item whatsapp">
                          <i className="fab fa-whatsapp"></i> {user.whatsapp_number}
                        </a>
                      )}
                      {user.location && (
                        <div className="contact-item">
                          <i className="fas fa-map-marker-alt"></i> {user.location}
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="profile-section-card">
                    <h3><i className="fas fa-id-badge"></i> Account Details</h3>
                    <div className="info-row">
                      <span className="info-label">Tracking ID:</span>
                      <span className="info-value tracking-id">{user.tracking_id || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Status:</span>
                      <span className="info-value">
                        <span className={`status-pill status-${(user.subscription_status || '').toLowerCase()}`}>
                          {user.subscription_status}
                        </span>
                      </span>
                    </div>
                    {user.trial_end_date && (
                      <div className="info-row">
                        <span className="info-label">Trial Ends:</span>
                        <span className="info-value">{new Date(user.trial_end_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="info-row">
                      <span className="info-label">Member Since:</span>
                      <span className="info-value">{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </section>
                </div>
              )}
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
            <div className="profile-tab-content">
              <div className="tab-header">
                <h2><i className="fas fa-envelope"></i> Admin Messages</h2>
              </div>
              {messages.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                  <p>No messages from the administration yet.</p>
                </div>
              ) : (
                <div className="messages-list">
                  {messages.map(msg => (
                    <div key={msg.id} className="message-card">
                      <div className="message-header">
                        <span className="message-subject">{msg.subject}</span>
                        <span className="message-date">{new Date(msg.created_at).toLocaleString()}</span>
                      </div>
                      <div className="message-from">From: {msg.sender_name}</div>
                      <div className="message-body">{msg.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="profile-tab-content">
              <div className="tab-header">
                <h2><i className="fas fa-cog"></i> Account Settings</h2>
              </div>
              <section className="profile-section-card">
                <h3>Change Password</h3>
                <form className="settings-form" onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  const currentPw = fd.get('current_password');
                  const newPw = fd.get('new_password');
                  const confirmPw = fd.get('confirm_password');
                  if (newPw !== confirmPw) { setError('New passwords do not match'); return; }
                  try {
                    const token = localStorage.getItem('access_token');
                    const res = await fetch(`${API_BASE}/auth/change-password`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ current_password: currentPw, new_password: newPw })
                    });
                    const data = await res.json();
                    if (res.ok) { setSuccess('Password updated successfully!'); e.target.reset(); }
                    else { setError(data.error || 'Password change failed'); }
                  } catch { setError('Network error'); }
                }}>
                  <div className="form-group">
                    <label htmlFor="current_password">Current Password</label>
                    <input type="password" id="current_password" name="current_password" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="new_password">New Password</label>
                    <input type="password" id="new_password" name="new_password" required minLength={6} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirm_password">Confirm New Password</label>
                    <input type="password" id="confirm_password" name="confirm_password" required />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-key"></i> Update Password
                  </button>
                </form>
              </section>

              <section className="profile-section-card">
                <h3>Subscription</h3>
                <p>Current Plan: <strong>{user.subscription_status}</strong></p>
                {user.subscription_status === 'TRIAL' && (
                  <div>
                    <p>{daysLeft > 0 ? `${daysLeft} days remaining in your free trial.` : 'Your free trial has expired.'}</p>
                    <button className="btn btn-primary">
                      <i className="fas fa-star"></i> Subscribe for $10/month
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
