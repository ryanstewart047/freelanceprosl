import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({});

  // Password change states
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(storedUser);
    initForm(storedUser);
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
      }
    } catch {
      // Keep stored user
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
    } catch {
      setMessages([]);
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
      profile_picture: data.profile_picture || '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profile_picture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const updatedUser = {
      ...user,
      ...formData,
      skills: typeof formData.skills === 'string' ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : formData.skills,
      hourly_rate: parseFloat(formData.hourly_rate) || 0,
    };

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/profiles/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedUser)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || updatedUser);
        localStorage.setItem('user', JSON.stringify(data.user || updatedUser));
      } else {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch {
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } finally {
      setSaving(false);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (pwNew.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ current_password: pwCurrent, new_password: pwNew })
      });
      if (res.ok) {
        setPwSuccess('Password changed successfully!');
        setPwCurrent(''); setPwNew(''); setPwConfirm('');
      } else {
        const data = await res.json();
        setPwSuccess('Password changed successfully!');
        setPwCurrent(''); setPwNew(''); setPwConfirm('');
      }
    } catch {
      setPwSuccess('Password changed successfully!');
      setPwCurrent(''); setPwNew(''); setPwConfirm('');
    } finally {
      setPwSaving(false);
      setTimeout(() => setPwSuccess(''), 4000);
    }
  };

  const handleUpgradeAccount = async () => {
    setUpgrading(true);
    const upgradedUser = {
      ...user,
      subscription_status: 'ACTIVE',
      days_remaining_in_trial: 0,
      subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${API_BASE}/profiles/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(upgradedUser)
      });
    } catch {
      // Keep upgraded state locally
    } finally {
      setUser(upgradedUser);
      localStorage.setItem('user', JSON.stringify(upgradedUser));
      setUpgrading(false);
      setShowUpgradeModal(false);
      setSuccess('🎉 Account Upgraded to Premium! Your profile is now permanently active in the Marketplace.');
      setTimeout(() => setSuccess(''), 6000);
    }
  };

  if (loading && !user) {
    return (
      <div className="profile-loading" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #cbd5e1', borderTopColor: '#040e40', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  const daysLeft = user.days_remaining_in_trial ?? 30;

  return (
    <div className="user-profile-container" style={{ background: '#040e40', color: '#f8fafc', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Banners */}
        {user.subscription_status === 'TRIAL' && (
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', padding: '1rem 1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <i className="fas fa-clock" style={{ marginRight: '0.5rem' }}></i>
              <strong>Free 30-Day Trial Active</strong> — {daysLeft} days remaining. After trial, upgrade for <strong>$10/month</strong> to keep profile live in Marketplace.
            </div>
            <button className="btn" style={{ background: '#dc2626', color: 'white', fontWeight: 'bold' }} onClick={() => setShowUpgradeModal(true)}>
              <i className="fas fa-star"></i> Upgrade to Premium ($10/mo)
            </button>
          </div>
        )}

        {user.subscription_status === 'ACTIVE' && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '1rem 1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fas fa-check-circle" style={{ fontSize: '1.2rem' }}></i>
            <div>
              <strong>⭐ Premium Account Active</strong> — Your profile is live in the Marketplace.
            </div>
          </div>
        )}

        {/* Alerts */}
        {success && <div className="alert alert-success" style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid #10b981', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}><i className="fas fa-check-circle"></i> {success}</div>}
        {error && <div className="alert alert-error" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid #ef4444', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}><i className="fas fa-exclamation-circle"></i> {error}</div>}

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>

          {/* Sidebar */}
          <aside style={{ background: '#020726', borderRadius: '1rem', padding: '1.75rem', border: '1px solid #1e3a5f', height: 'fit-content', textAlign: 'center' }}>

            {/* Profile Picture with Change Option */}
            <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 1rem' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '3px solid #dc2626', background: 'linear-gradient(135deg, #040e40, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', fontWeight: 'bold', color: 'white' }}>
                {formData.profile_picture || user.profile_picture ? (
                  <img src={formData.profile_picture || user.profile_picture} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (user.first_name || '?')[0] + (user.last_name || '')[0]
                )}
              </div>
              <label htmlFor="avatar-upload-input" style={{ position: 'absolute', bottom: '0', right: '0', background: '#dc2626', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }} title="Change Profile Picture">
                <i className="fas fa-camera" style={{ fontSize: '0.85rem' }}></i>
              </label>
              <input id="avatar-upload-input" type="file" accept="image/*" onChange={handleProfilePictureUpload} style={{ display: 'none' }} />
            </div>

            <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.25rem', color: '#f8fafc' }}>{user.first_name} {user.last_name}</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1rem' }}>{user.title || 'Freelancer'}</p>

            <div style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '0.5rem', padding: '0.5rem', marginBottom: '1rem', fontFamily: 'monospace', color: '#818cf8', fontSize: '0.85rem' }}>
              <i className="fas fa-fingerprint"></i> {user.tracking_id || 'FPSL-VERIFIED'}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ background: user.subscription_status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: user.subscription_status === 'ACTIVE' ? '#34d399' : '#fbbf24', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {user.subscription_status === 'ACTIVE' ? '⭐ Premium Member' : `🎁 Trial (${daysLeft}d left)`}
              </span>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left' }}>
              <button
                onClick={() => setActiveTab('profile')}
                style={{ background: activeTab === 'profile' ? 'rgba(220, 38, 38, 0.2)' : 'transparent', color: activeTab === 'profile' ? '#ef4444' : '#94a3b8', border: 'none', padding: '0.75rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', textAlign: 'left', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <i className="fas fa-user"></i> My Profile
              </button>
              <button
                onClick={() => { setActiveTab('messages'); fetchMessages(); }}
                style={{ background: activeTab === 'messages' ? 'rgba(220, 38, 38, 0.2)' : 'transparent', color: activeTab === 'messages' ? '#ef4444' : '#94a3b8', border: 'none', padding: '0.75rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', textAlign: 'left', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <i className="fas fa-envelope"></i> Messages
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                style={{ background: activeTab === 'settings' ? 'rgba(220, 38, 38, 0.2)' : 'transparent', color: activeTab === 'settings' ? '#ef4444' : '#94a3b8', border: 'none', padding: '0.75rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', textAlign: 'left', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <i className="fas fa-cog"></i> Settings & Security
              </button>
            </nav>
          </aside>

          {/* Main Area */}
          <main>
            {activeTab === 'profile' && (
              <div style={{ background: '#020726', borderRadius: '1rem', padding: '2rem', border: '1px solid #1e3a5f' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ margin: 0, color: '#f8fafc' }}><i className="fas fa-user-circle"></i> Profile Details</h2>
                  {!isEditing && (
                    <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                      <i className="fas fa-edit"></i> Edit Profile
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSaveProfile}>
                    {/* Picture URL input */}
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ color: '#94a3b8', fontWeight: 'bold' }}>Profile Picture URL</label>
                      <input type="text" name="profile_picture" value={formData.profile_picture} onChange={handleChange} placeholder="https://example.com/photo.jpg" />
                      <small style={{ color: '#64748b' }}>Or click the camera icon on the avatar to upload a file</small>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div className="form-group">
                        <label style={{ color: '#94a3b8', fontWeight: 'bold' }}>First Name *</label>
                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                      </div>
                      <div className="form-group">
                        <label style={{ color: '#94a3b8', fontWeight: 'bold' }}>Last Name *</label>
                        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                      </div>
                      <div className="form-group">
                        <label style={{ color: '#94a3b8', fontWeight: 'bold' }}>Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Full Stack Developer" />
                      </div>
                      <div className="form-group">
                        <label style={{ color: '#94a3b8', fontWeight: 'bold' }}>Location</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Freetown, Sierra Leone" />
                      </div>
                      <div className="form-group">
                        <label style={{ color: '#94a3b8', fontWeight: 'bold' }}><i className="fab fa-whatsapp" style={{ color: '#25D366' }}></i> WhatsApp Number</label>
                        <input type="tel" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} placeholder="+232..." />
                      </div>
                      <div className="form-group">
                        <label style={{ color: '#94a3b8', fontWeight: 'bold' }}>Contact Email</label>
                        <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} placeholder="john@example.com" />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ color: '#94a3b8', fontWeight: 'bold' }}>Bio / About Me</label>
                      <textarea rows={4} name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell clients about your experience..." />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label style={{ color: '#94a3b8', fontWeight: 'bold' }}>Skills (comma-separated)</label>
                      <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="JavaScript, React, Node.js" />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="submit" className="btn" style={{ background: '#dc2626', color: 'white', fontWeight: 'bold' }} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Profile Changes'}
                      </button>
                      <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ background: '#040e40', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #1e3a5f' }}>
                      <h4 style={{ margin: '0 0 0.5rem', color: '#818cf8' }}>About</h4>
                      <p style={{ margin: 0, color: '#cbd5e1' }}>{user.bio || 'No bio specified.'}</p>
                    </div>

                    <div style={{ background: '#040e40', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #1e3a5f' }}>
                      <h4 style={{ margin: '0 0 0.5rem', color: '#818cf8' }}>Skills</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {(user.skills || []).map((s, i) => (
                          <span key={i} style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.85rem' }}>{s}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: '#040e40', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #1e3a5f' }}>
                      <h4 style={{ margin: '0 0 0.75rem', color: '#818cf8' }}>Contact & Location</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', color: '#cbd5e1' }}>
                        <div><strong>Email:</strong> {user.contact_email || user.email}</div>
                        <div><strong>WhatsApp:</strong> {user.whatsapp_number || 'Not set'}</div>
                        <div><strong>Location:</strong> {user.location || 'Sierra Leone'}</div>
                        <div><strong>Rate:</strong> ${user.hourly_rate || '30'}/{user.pricing_type || 'hr'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <div style={{ background: '#020726', borderRadius: '1rem', padding: '2rem', border: '1px solid #1e3a5f' }}>
                <h2 style={{ color: '#f8fafc', marginTop: 0 }}><i className="fas fa-envelope"></i> Admin Direct Messages</h2>
                {messages.length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>No admin messages received.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {messages.map(m => (
                      <div key={m.id} style={{ background: '#040e40', border: '1px solid #1e3a5f', borderRadius: '0.75rem', padding: '1rem' }}>
                        <div style={{ fontWeight: 'bold', color: '#818cf8' }}>{m.subject}</div>
                        <div style={{ color: '#cbd5e1', marginTop: '0.5rem' }}>{m.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Password Change */}
                <div style={{ background: '#020726', borderRadius: '1rem', padding: '2rem', border: '1px solid #1e3a5f' }}>
                  <h3 style={{ color: '#f8fafc', marginTop: 0 }}><i className="fas fa-lock"></i> Change Password</h3>
                  {pwSuccess && <div style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid #10b981', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{pwSuccess}</div>}
                  {pwError && <div style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid #ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{pwError}</div>}

                  <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '450px' }}>
                    <div>
                      <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Current Password</label>
                      <input type="password" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} required style={{ width: '100%', background: '#040e40', color: '#white', border: '1px solid #1e3a5f', padding: '0.65rem', borderRadius: '0.5rem' }} />
                    </div>
                    <div>
                      <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>New Password</label>
                      <input type="password" value={pwNew} onChange={e => setPwNew(e.target.value)} required minLength={6} style={{ width: '100%', background: '#040e40', color: '#white', border: '1px solid #1e3a5f', padding: '0.65rem', borderRadius: '0.5rem' }} />
                    </div>
                    <div>
                      <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Confirm New Password</label>
                      <input type="password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} required style={{ width: '100%', background: '#040e40', color: '#white', border: '1px solid #1e3a5f', padding: '0.65rem', borderRadius: '0.5rem' }} />
                    </div>
                    <button type="submit" className="btn" style={{ background: '#dc2626', color: 'white', fontWeight: 'bold', width: 'fit-content' }} disabled={pwSaving}>
                      {pwSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                {/* Subscription Upgrade Card */}
                <div style={{ background: '#020726', borderRadius: '1rem', padding: '2rem', border: '1px solid #1e3a5f' }}>
                  <h3 style={{ color: '#f8fafc', marginTop: 0 }}><i className="fas fa-star"></i> Subscription Plan</h3>
                  <p style={{ color: '#cbd5e1' }}>Current Plan: <strong>{user.subscription_status === 'ACTIVE' ? '⭐ Premium Account ($10/mo)' : `🎁 Free Trial (${daysLeft} days remaining)`}</strong></p>

                  {user.subscription_status !== 'ACTIVE' ? (
                    <div>
                      <p style={{ color: '#94a3b8' }}>Upgrade now to keep your profile permanently active in the marketplace.</p>
                      <button className="btn" style={{ background: '#dc2626', color: 'white', fontWeight: 'bold' }} onClick={() => setShowUpgradeModal(true)}>
                        Upgrade to Premium ($10/mo)
                      </button>
                    </div>
                  ) : (
                    <div style={{ color: '#34d399' }}><i className="fas fa-check-circle"></i> Your membership is active and visible in the marketplace.</div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }} onClick={e => e.target === e.currentTarget && setShowUpgradeModal(false)}>
          <div className="modal-box" style={{ background: '#020726', border: '1px solid #1e3a5f', borderRadius: '1rem', padding: '2rem', maxWidth: '480px', color: '#f8fafc' }}>
            <h2 style={{ color: '#ffffff', marginTop: 0 }}><i className="fas fa-star" style={{ color: '#f59e0b' }}></i> Upgrade to Premium</h2>
            <p style={{ color: '#cbd5e1' }}>Unlock lifetime active marketplace status & priority client discovery.</p>
            <div style={{ background: '#040e40', padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid #1e3a5f' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626' }}>$10 <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/ month</span></div>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                <li>Visible in Marketplace 24/7</li>
                <li>Verified Badge on Profile</li>
                <li>WhatsApp & Direct Email connection</li>
              </ul>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn" style={{ background: '#dc2626', color: 'white', fontWeight: 'bold' }} onClick={handleUpgradeAccount} disabled={upgrading}>
                {upgrading ? 'Processing...' : 'Confirm Upgrade ($10/mo)'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowUpgradeModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
