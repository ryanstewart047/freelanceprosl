import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/AdminDashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [actionModal, setActionModal] = useState(null); // {user, action, label}

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
    if (res.status === 403) {
      navigate('/login');
      throw new Error('Unauthorized');
    }
    return res;
  }, [navigate]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!storedUser || storedUser.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchStats();
    fetchUsers();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const res = await apiRequest('/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (roleFilter) params.append('role', roleFilter);
      const res = await apiRequest(`/admin/users?${params.toString()}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/admin/messages');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, extraData = {}) => {
    try {
      setSuccess(''); setError('');
      const res = await apiRequest(`/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ action, ...extraData })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        fetchUsers();
        fetchStats();
      } else {
        setError(data.error || 'Action failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setActionModal(null);
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${username}'s account? This cannot be undone.`)) return;
    try {
      const res = await apiRequest(`/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        fetchUsers();
        fetchStats();
      } else {
        setError(data.error || 'Delete failed');
      }
    } catch {
      setError('Network error');
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
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Message sent to ${msgTarget.username}`);
        setMessageModal(false);
        setMsgSubject(''); setMsgBody(''); setMsgTarget(null);
        if (activeTab === 'messages') fetchMessages();
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch {
      setError('Network error');
    } finally {
      setSendingMsg(false);
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
    if (user.subscription_status === 'TRIAL') return <span className="badge badge-info">Trial ({user.days_remaining_in_trial}d)</span>;
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
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <i className="fas fa-shield-alt"></i>
          <span>Admin Panel</span>
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
          navigate('/login');
        }}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Alerts */}
        {success && <div className="alert alert-success"><i className="fas fa-check-circle"></i> {success} <button onClick={() => setSuccess('')}>×</button></div>}
        {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error} <button onClick={() => setError('')}>×</button></div>}

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="admin-section">
            <h1 className="section-title"><i className="fas fa-tachometer-alt"></i> Dashboard Overview</h1>
            {stats ? (
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
            ) : (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading statistics...</p>
              </div>
            )}
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
                <option value="expired">Expired</option>
              </select>
              <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="freelancer">Freelancer</option>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
              <button className="btn btn-primary" onClick={fetchUsers}>
                <i className="fas fa-search"></i> Search
              </button>
              <button className="btn btn-outline" onClick={() => { setSearch(''); setStatusFilter(''); setRoleFilter(''); setTimeout(fetchUsers, 50); }}>
                Reset
              </button>
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
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan="8" className="empty-row">No users found</td></tr>
                    ) : users.map(u => (
                      <tr key={u.id} className={u.is_disabled ? 'row-disabled' : u.is_suspended ? 'row-suspended' : ''}>
                        <td>
                          <span className="tracking-id-cell">{u.tracking_id || 'N/A'}</span>
                        </td>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-sm">
                              {u.profile_picture
                                ? <img src={u.profile_picture} alt={u.username} />
                                : <div className="avatar-initials-sm">{(u.first_name||'?')[0]}{(u.last_name||'')[0]}</div>
                              }
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
                        <td className="date-cell">
                          {u.trial_end_date ? new Date(u.trial_end_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="date-cell">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="action-buttons">
                            {/* Message */}
                            <button
                              className="action-btn action-msg" title="Send Message"
                              onClick={() => openMessageModal(u)}
                            ><i className="fas fa-envelope"></i></button>

                            {/* Suspend / Unsuspend */}
                            {!u.is_suspended ? (
                              <button
                                className="action-btn action-warn" title="Suspend"
                                onClick={() => setActionModal({ user: u, action: 'suspend', label: 'Suspend' })}
                              ><i className="fas fa-pause-circle"></i></button>
                            ) : (
                              <button
                                className="action-btn action-ok" title="Unsuspend"
                                onClick={() => handleUserAction(u.id, 'unsuspend')}
                              ><i className="fas fa-play-circle"></i></button>
                            )}

                            {/* Disable / Enable */}
                            {!u.is_disabled ? (
                              <button
                                className="action-btn action-danger" title="Disable Account"
                                onClick={() => setActionModal({ user: u, action: 'disable', label: 'Disable' })}
                              ><i className="fas fa-ban"></i></button>
                            ) : (
                              <button
                                className="action-btn action-ok" title="Enable Account"
                                onClick={() => handleUserAction(u.id, 'enable')}
                              ><i className="fas fa-check-circle"></i></button>
                            )}

                            {/* Extend Trial */}
                            <button
                              className="action-btn action-info" title="Extend Trial 30 Days"
                              onClick={() => handleUserAction(u.id, 'extend_trial', { days: 30 })}
                            ><i className="fas fa-calendar-plus"></i></button>

                            {/* Activate Subscription */}
                            <button
                              className="action-btn action-ok" title="Grant 1 Month Subscription"
                              onClick={() => handleUserAction(u.id, 'activate_subscription', { months: 1 })}
                            ><i className="fas fa-star"></i></button>

                            {/* Delete */}
                            {u.role !== 'admin' && (
                              <button
                                className="action-btn action-delete" title="Delete Account"
                                onClick={() => handleDeleteUser(u.id, u.username)}
                              ><i className="fas fa-trash-alt"></i></button>
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
            <div className="section-header-row">
              <h1 className="section-title"><i className="fas fa-envelope"></i> Sent Messages</h1>
            </div>
            {loading ? (
              <div className="loading-spinner"><div className="spinner"></div></div>
            ) : messages.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>No messages sent yet. Go to Users tab to message a user.</p>
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
                    <div className="msg-read-status">
                      {m.is_read
                        ? <span className="read-badge"><i className="fas fa-eye"></i> Read</span>
                        : <span className="unread-badge"><i className="fas fa-eye-slash"></i> Unread</span>
                      }
                    </div>
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
                <input
                  type="text" placeholder="Message subject..." required
                  value={msgSubject} onChange={e => setMsgSubject(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  rows={6} placeholder="Type your message here..." required
                  value={msgBody} onChange={e => setMsgBody(e.target.value)}
                />
                <small>This message will be sent in-app and via email notification.</small>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary" disabled={sendingMsg}>
                  {sendingMsg ? <><i className="fas fa-spinner fa-spin"></i> Sending...</> : <><i className="fas fa-paper-plane"></i> Send Message</>}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setMessageModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM ACTION MODAL */}
      {actionModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setActionModal(null)}>
          <div className="modal-box modal-confirm">
            <div className="modal-header">
              <h3><i className="fas fa-exclamation-triangle"></i> Confirm Action</h3>
              <button className="modal-close" onClick={() => setActionModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to <strong>{actionModal.label}</strong> the account of{' '}
                <strong>@{actionModal.user.username}</strong>?
              </p>
              {actionModal.action === 'disable' && (
                <p className="warning-note"><i className="fas fa-info-circle"></i> Disabled accounts cannot log in.</p>
              )}
              {actionModal.action === 'suspend' && (
                <p className="warning-note"><i className="fas fa-info-circle"></i> Suspended accounts cannot log in and are hidden from the marketplace.</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                className={`btn ${actionModal.action === 'disable' ? 'btn-danger' : 'btn-warning'}`}
                onClick={() => handleUserAction(actionModal.user.id, actionModal.action)}
              >
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
