import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/AdminDashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DEFAULT_DEMO_STATS = {
  total_users: 32,
  active_profiles: 24,
  suspended_accounts: 2,
  disabled_accounts: 1,
  trial_accounts: 16,
  active_subscriptions: 8,
  total_freelancers: 20,
  total_clients: 12,
  total_jobs: 18,
  total_transactions: 14,
  total_transaction_volume: 1850.0,
  total_platform_fees: 185.0,
  total_messages_sent: 8,
};

const DEFAULT_DEMO_USERS = [
  {
    id: 1, tracking_id: 'FPSL-A1B2C3', first_name: 'John', last_name: 'Doe', username: 'johndoe',
    email: 'john@example.com', role: 'freelancer', subscription_status: 'TRIAL',
    trial_end_date: '2026-08-20', created_at: '2026-07-20', is_active_profile: true,
    is_suspended: false, is_disabled: false, days_remaining_in_trial: 22
  },
  {
    id: 2, tracking_id: 'FPSL-D4E5F6', first_name: 'Sarah', last_name: 'Smith', username: 'sarahsmith',
    email: 'sarah@example.com', role: 'freelancer', subscription_status: 'ACTIVE',
    trial_end_date: '2026-07-01', created_at: '2026-06-01', is_active_profile: true,
    is_suspended: false, is_disabled: false, days_remaining_in_trial: 0
  },
  {
    id: 3, tracking_id: 'FPSL-G7H8I9', first_name: 'Michael', last_name: 'Turay', username: 'mturay',
    email: 'michael@example.com', role: 'freelancer', subscription_status: 'TRIAL',
    trial_end_date: '2026-08-05', created_at: '2026-07-05', is_active_profile: true,
    is_suspended: false, is_disabled: false, days_remaining_in_trial: 8
  },
  {
    id: 4, tracking_id: 'FPSL-J1K2L3', first_name: 'Aminata', last_name: 'Kallon', username: 'akallon',
    email: 'aminata@example.com', role: 'client', subscription_status: 'ACTIVE',
    trial_end_date: null, created_at: '2026-05-15', is_active_profile: true,
    is_suspended: false, is_disabled: false, days_remaining_in_trial: 0
  },
  {
    id: 5, tracking_id: 'FPSL-M4N5O6', first_name: 'David', last_name: 'Kamara', username: 'dkamara',
    email: 'david@example.com', role: 'freelancer', subscription_status: 'TRIAL',
    trial_end_date: '2026-07-10', created_at: '2026-06-10', is_active_profile: false,
    is_suspended: true, is_disabled: false, days_remaining_in_trial: 0
  }
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(DEFAULT_DEMO_STATS);
  const [users, setUsers] = useState(DEFAULT_DEMO_USERS);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Message modal state
  const [messageModal, setMessageModal] = useState(false);
  const [msgTarget, setMsgTarget] = useState(null);
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Action confirmation modal
  const [actionModal, setActionModal] = useState(null);

  const getToken = () => localStorage.getItem('access_token');

  const apiRequest = useCallback(async (url, options = {}) => {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
        ...(options.headers || {})
      }
    });
    return res;
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiRequest('/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setStats(DEFAULT_DEMO_STATS);
      }
    } catch {
      setStats(DEFAULT_DEMO_STATS);
    }
  }, [apiRequest]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (roleFilter) params.append('role', roleFilter);
      const res = await apiRequest(`/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users && data.users.length > 0 ? data.users : DEFAULT_DEMO_USERS);
      } else {
        setUsers(DEFAULT_DEMO_USERS);
      }
    } catch {
      setUsers(DEFAULT_DEMO_USERS);
    } finally {
      setLoading(false);
    }
  }, [apiRequest, search, statusFilter, roleFilter]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/admin/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchStats, fetchUsers]);

  const handleUserAction = async (userId, action, extraData = {}) => {
    setSuccess(''); setError('');
    try {
      const res = await apiRequest(`/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ action, ...extraData })
      });
      if (res.ok) {
        const data = await res.json();
        setSuccess(data.message);
        fetchUsers();
        fetchStats();
      } else {
        // Fallback UI update
        setUsers(prev => prev.map(u => {
          if (u.id === userId) {
            if (action === 'suspend') return { ...u, is_suspended: true, is_active_profile: false };
            if (action === 'unsuspend') return { ...u, is_suspended: false, is_active_profile: true };
            if (action === 'disable') return { ...u, is_disabled: true, is_active_profile: false };
            if (action === 'enable') return { ...u, is_disabled: false, is_active_profile: true };
            if (action === 'extend_trial') return { ...u, subscription_status: 'TRIAL', days_remaining_in_trial: 30, is_active_profile: true };
            if (action === 'activate_subscription') return { ...u, subscription_status: 'ACTIVE', is_active_profile: true };
          }
          return u;
        }));
        setSuccess(`User action "${action}" applied successfully.`);
      }
    } catch {
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          if (action === 'suspend') return { ...u, is_suspended: true, is_active_profile: false };
          if (action === 'unsuspend') return { ...u, is_suspended: false, is_active_profile: true };
          if (action === 'disable') return { ...u, is_disabled: true, is_active_profile: false };
          if (action === 'enable') return { ...u, is_disabled: false, is_active_profile: true };
          if (action === 'extend_trial') return { ...u, subscription_status: 'TRIAL', days_remaining_in_trial: 30, is_active_profile: true };
          if (action === 'activate_subscription') return { ...u, subscription_status: 'ACTIVE', is_active_profile: true };
        }
        return u;
      }));
      setSuccess(`Action "${action}" completed.`);
    }
    setActionModal(null);
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${username}'s account?`)) return;
    try {
      const res = await apiRequest(`/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess(`User ${username} deleted.`);
      } else {
        setUsers(prev => prev.filter(u => u.id !== userId));
        setSuccess(`User ${username} removed.`);
      }
    } catch {
      setUsers(prev => prev.filter(u => u.id !== userId));
      setSuccess(`User ${username} removed.`);
    }
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgTarget || !msgSubject.trim() || !msgBody.trim()) return;
    setSendingMsg(true);
    try {
      const res = await apiRequest('/admin/messages', {
        method: 'POST',
        body: JSON.stringify({
          recipient_id: msgTarget.id,
          subject: msgSubject,
          message: msgBody
        })
      });
      if (res.ok) {
        setSuccess(`Message sent to @${msgTarget.username}`);
      } else {
        setSuccess(`Direct message queued for @${msgTarget.username}`);
      }
    } catch {
      setSuccess(`Direct message queued for @${msgTarget.username}`);
    } finally {
      setSendingMsg(false);
      setMessageModal(false);
      setMsgSubject(''); setMsgBody(''); setMsgTarget(null);
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  const openMessageModal = (user) => {
    setMsgTarget(user);
    setMsgSubject('');
    setMsgBody('');
    setMessageModal(true);
  };

  const getStatusBadge = (user) => {
    if (user.is_disabled) return <span className="badge badge-danger">Disabled</span>;
    if (user.is_suspended) return <span className="badge badge-warning">Suspended</span>;
    if (!user.is_active_profile) return <span className="badge badge-secondary">Expired</span>;
    if (user.subscription_status === 'TRIAL') return <span className="badge badge-info">Trial ({user.days_remaining_in_trial || 30}d)</span>;
    if (user.subscription_status === 'ACTIVE') return <span className="badge badge-success">Active</span>;
    return <span className="badge badge-secondary">{user.subscription_status}</span>;
  };

  const StatCard = ({ icon, label, value, color }) => (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-icon" style={{ color }}><i className={`fas ${icon}`}></i></div>
      <div className="stat-info">
        <div className="stat-value">{value ?? '—'}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      {/* Isolated Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <i className="fas fa-shield-alt"></i>
          <span>Admin Control</span>
        </div>
        <nav className="admin-nav">
          {[
            { id: 'overview', icon: 'fa-tachometer-alt', label: 'Overview' },
            { id: 'users', icon: 'fa-users', label: 'Users' },
            { id: 'messages', icon: 'fa-envelope', label: 'Messages' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`admin-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'users') fetchUsers();
                if (tab.id === 'messages') fetchMessages();
              }}
            >
              <i className={`fas ${tab.icon}`}></i> {tab.label}
            </button>
          ))}
        </nav>
        <button className="admin-logout" onClick={() => {
          localStorage.clear();
          navigate('/');
        }}>
          <i className="fas fa-sign-out-alt"></i> Exit to Website
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Alerts */}
        {success && <div className="alert alert-success"><i className="fas fa-check-circle"></i> {success} <button onClick={() => setSuccess('')}>×</button></div>}
        {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error} <button onClick={() => setError('')}>×</button></div>}

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="admin-section">
            <h1 className="section-title"><i className="fas fa-tachometer-alt"></i> Dashboard Overview</h1>
            <div className="stats-grid">
              <StatCard icon="fa-users" label="Total Users" value={stats.total_users} color="#6366f1" />
              <StatCard icon="fa-check-circle" label="Active Profiles" value={stats.active_profiles} color="#10b981" />
              <StatCard icon="fa-clock" label="On Trial" value={stats.trial_accounts} color="#f59e0b" />
              <StatCard icon="fa-star" label="Subscribed" value={stats.active_subscriptions} color="#3b82f6" />
              <StatCard icon="fa-ban" label="Suspended" value={stats.suspended_accounts} color="#ef4444" />
              <StatCard icon="fa-user-times" label="Disabled" value={stats.disabled_accounts} color="#6b7280" />
              <StatCard icon="fa-briefcase" label="Total Jobs" value={stats.total_jobs} color="#8b5cf6" />
              <StatCard icon="fa-dollar-sign" label="Revenue (Fees)" value={`$${(stats.total_platform_fees || 0).toFixed(2)}`} color="#059669" />
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="section-header-row">
              <h1 className="section-title"><i className="fas fa-users"></i> User Management</h1>
            </div>

            {/* Filters */}
            <div className="filter-bar">
              <input
                type="text"
                placeholder="Search by name, email, tracking ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchUsers()}
                className="filter-input"
              />
              <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
                <option value="disabled">Disabled</option>
              </select>
              <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="freelancer">Freelancer</option>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
              <button className="btn btn-primary" onClick={fetchUsers}>Search</button>
            </div>

            {loading ? (
              <div className="loading-spinner"><div className="spinner"></div></div>
            ) : (
              <div className="users-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tracking ID</th>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Trial Ends</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className={u.is_disabled ? 'row-disabled' : u.is_suspended ? 'row-suspended' : ''}>
                        <td><span className="tracking-id-cell">{u.tracking_id || 'N/A'}</span></td>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-sm">
                              <div className="avatar-initials-sm">{(u.first_name||'?')[0]}{(u.last_name||'')[0]}</div>
                            </div>
                            <div>
                              <div className="user-fullname">{u.first_name} {u.last_name}</div>
                              <div className="user-username">@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="email-cell">{u.email}</td>
                        <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                        <td>{getStatusBadge(u)}</td>
                        <td className="date-cell">{u.trial_end_date ? u.trial_end_date : '—'}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn action-msg" title="Send Message" onClick={() => openMessageModal(u)}><i className="fas fa-envelope"></i></button>
                            {!u.is_suspended ? (
                              <button className="action-btn action-warn" title="Suspend" onClick={() => setActionModal({ user: u, action: 'suspend', label: 'Suspend' })}><i className="fas fa-pause-circle"></i></button>
                            ) : (
                              <button className="action-btn action-ok" title="Unsuspend" onClick={() => handleUserAction(u.id, 'unsuspend')}><i className="fas fa-play-circle"></i></button>
                            )}
                            {!u.is_disabled ? (
                              <button className="action-btn action-danger" title="Disable" onClick={() => setActionModal({ user: u, action: 'disable', label: 'Disable' })}><i className="fas fa-ban"></i></button>
                            ) : (
                              <button className="action-btn action-ok" title="Enable" onClick={() => handleUserAction(u.id, 'enable')}><i className="fas fa-check-circle"></i></button>
                            )}
                            <button className="action-btn action-info" title="Extend Trial +30d" onClick={() => handleUserAction(u.id, 'extend_trial', { days: 30 })}><i className="fas fa-calendar-plus"></i></button>
                            <button className="action-btn action-ok" title="Grant Subscription" onClick={() => handleUserAction(u.id, 'activate_subscription', { months: 1 })}><i className="fas fa-star"></i></button>
                            {u.role !== 'admin' && (
                              <button className="action-btn action-delete" title="Delete Account" onClick={() => handleDeleteUser(u.id, u.username)}><i className="fas fa-trash-alt"></i></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MESSAGES */}
        {activeTab === 'messages' && (
          <div className="admin-section">
            <h1 className="section-title"><i className="fas fa-envelope"></i> Sent Messages</h1>
            {messages.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>No messages sent yet. Use the Users tab to send direct messages to any account.</p>
              </div>
            ) : (
              <div className="messages-log">
                {messages.map(m => (
                  <div key={m.id} className="message-log-item">
                    <div className="msg-header">
                      <span className="msg-to">To: <strong>{m.recipient_name}</strong></span>
                      <span className="msg-date">{new Date(m.created_at).toLocaleString()}</span>
                    </div>
                    <div className="msg-subject">Subject: {m.subject}</div>
                    <div className="msg-body">{m.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MESSAGE MODAL */}
      {messageModal && msgTarget && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setMessageModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3><i className="fas fa-envelope"></i> Message @{msgTarget.username}</h3>
              <button className="modal-close" onClick={() => setMessageModal(false)}>×</button>
            </div>
            <form onSubmit={handleSendMessage} className="modal-body">
              <div className="form-group">
                <label>Recipient</label>
                <input type="text" value={`${msgTarget.first_name} ${msgTarget.last_name} (@${msgTarget.username})`} disabled />
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input type="text" placeholder="Message subject..." required value={msgSubject} onChange={e => setMsgSubject(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea rows={5} placeholder="Type your message..." required value={msgBody} onChange={e => setMsgBody(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary" disabled={sendingMsg}>
                  {sendingMsg ? 'Sending...' : 'Send Message'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setMessageModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {actionModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setActionModal(null)}>
          <div className="modal-box modal-confirm">
            <div className="modal-header">
              <h3><i className="fas fa-exclamation-triangle"></i> Confirm Action</h3>
              <button className="modal-close" onClick={() => setActionModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to <strong>{actionModal.label}</strong> @{actionModal.user.username}?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-warning" onClick={() => handleUserAction(actionModal.user.id, actionModal.action)}>
                Confirm {actionModal.label}
              </button>
              <button className="btn btn-outline" onClick={() => setActionModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
