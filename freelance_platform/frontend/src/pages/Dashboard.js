import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/pages/Dashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [jobs, setJobs] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(storedUser);
    fetchDashboardData(storedUser);
  }, [navigate]);

  const fetchDashboardData = async (storedUser) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const jobsRes = await fetch(`${API_BASE}/jobs/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data.jobs || []);
      } else {
        setJobs(getDemoJobs(storedUser));
      }
    } catch {
      setJobs(getDemoJobs(storedUser));
    } finally {
      setLoading(false);
    }
  };

  const getDemoJobs = (u) => [
    { id: 1, title: 'E-commerce Website Redesign', budget: 450, status: 'in_progress', category: 'Development', created_at: '2026-07-15' },
    { id: 2, title: 'Mobile App UI/UX Mockups', budget: 300, status: 'completed', category: 'Design', created_at: '2026-07-10' },
    { id: 3, title: 'SEO Content Writing & Optimization', budget: 180, status: 'open', category: 'Writing', created_at: '2026-07-18' }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #cbd5e1', borderTopColor: '#040e40', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  const daysLeft = user.days_remaining_in_trial ?? 30;

  return (
    <div className="user-dashboard-wrapper" style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Dashboard Header Bar */}
        <div className="dashboard-header-card" style={{ background: 'linear-gradient(135deg, #040e40, #020726)', color: 'white', borderRadius: '1rem', padding: '1.75rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 10px 25px rgba(4,14,64,0.15)' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'white', fontWeight: 700 }}>
              Welcome back, {user.first_name || user.username}!
            </h1>
            <p style={{ margin: '0.35rem 0 0', opacity: 0.8, fontSize: '0.95rem' }}>
              Manage your jobs, account subscription, and client activity
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem 0.875rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
              <i className="fas fa-fingerprint" style={{ color: '#38bdf8' }}></i> {user.tracking_id || 'FPSL-VERIFIED'}
            </span>

            <Link to="/profile" className="btn" style={{ background: '#dc2626', color: 'white', fontWeight: 600 }}>
              <i className="fas fa-user-edit"></i> Edit Profile
            </Link>
          </div>
        </div>

        {/* Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>

          {/* Sidebar Navigation */}
          <aside className="dashboard-sidebar-card" style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0', height: 'fit-content', boxShadow: '0 4px 6px rgba(0,0,0,0.03)' }}>
            <div style={{ textAlignment: 'center', paddingBottom: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #040e40, #dc2626)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  (user.first_name || '?')[0] + (user.last_name || '')[0]
                )}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#040e40' }}>{user.first_name} {user.last_name}</h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'capitalize' }}>{user.role}</span>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {[
                { id: 'overview', icon: 'fa-tachometer-alt', label: 'Overview' },
                { id: 'jobs', icon: 'fa-briefcase', label: 'My Jobs' },
                { id: 'transactions', icon: 'fa-receipt', label: 'Transactions' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', border: 'none', borderRadius: '0.5rem',
                    background: activeTab === tab.id ? '#040e40' : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#475569',
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                  }}
                >
                  <i className={`fas ${tab.icon}`}></i> {tab.label}
                </button>
              ))}

              <Link
                to="/profile"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', color: '#475569', textDecoration: 'none',
                  fontWeight: 500, borderRadius: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9'
                }}
              >
                <i className="fas fa-cog"></i> Account Settings
              </Link>
            </nav>
          </aside>

          {/* Main Dashboard Content */}
          <main>
            {activeTab === 'overview' && (
              <div>
                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '0.875rem', border: '1px solid #e2e8f0', borderTop: '4px solid #040e40' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Active Jobs</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#040e40', marginTop: '0.25rem' }}>{jobs.length}</div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '0.875rem', border: '1px solid #e2e8f0', borderTop: '4px solid #dc2626' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Membership Status</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: user.subscription_status === 'ACTIVE' ? '#10b981' : '#f59e0b', marginTop: '0.4rem' }}>
                      {user.subscription_status === 'ACTIVE' ? '⭐ Premium Active' : `🎁 Free Trial (${daysLeft}d)`}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '0.875rem', border: '1px solid #e2e8f0', borderTop: '4px solid #10b981' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Profile Rating</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>4.9 ★</div>
                  </div>
                </div>

                {/* Recent Jobs */}
                <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ color: '#040e40', marginTop: 0, marginBottom: '1rem' }}><i className="fas fa-briefcase"></i> Recent Projects</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {jobs.map(job => (
                      <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '0.5rem', background: '#fafafa' }}>
                        <div>
                          <strong style={{ color: '#040e40', fontSize: '1.05rem' }}>{job.title}</strong>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>Category: {job.category} • Posted: {job.created_at}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.1rem' }}>${job.budget}</span>
                          <div><span style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '999px', textTransform: 'uppercase' }}>{job.status}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                <h2 style={{ color: '#040e40', marginTop: 0 }}>My Active Jobs</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {jobs.map(job => (
                    <div key={job.id} style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}>
                      <h3 style={{ margin: '0 0 0.5rem', color: '#040e40' }}>{job.title}</h3>
                      <p style={{ color: '#64748b', margin: '0 0 0.75rem' }}>Budget: ${job.budget} • Category: {job.category}</p>
                      <Link to={`/jobs/${job.id}`} className="btn btn-outline btn-sm">View Job Details</Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                <h2 style={{ color: '#040e40', marginTop: 0 }}>Transaction History</h2>
                <p style={{ color: '#64748b' }}>No recent transaction history recorded.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
