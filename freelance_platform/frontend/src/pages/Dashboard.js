import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import { getJobs } from '../api/marketplace';
import { getTransactions } from '../api/payments';
import '../styles/pages/Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [jobs, setJobs] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch jobs
        const jobsResponse = await getJobs();
        
        // Fetch transactions
        const transactionsResponse = await getTransactions();
        
        setJobs(jobsResponse.jobs || []);
        setTransactions(transactionsResponse.transactions || []);
        setError('');
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [navigate]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-indicator">Loading dashboard data...</div>
      );
    }
    
    if (error) {
      return (
        <div className="error-message">
          {error}
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'jobs':
        return renderJobs();
      case 'proposals':
        return renderProposals();
      case 'transactions':
        return renderTransactions();
      case 'messages':
        return renderMessages();
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => {
    if (!user) return null;
    
    // Filter jobs based on user role
    const relevantJobs = user.role === 'client' 
      ? jobs.filter(job => job.client_id === user.id)
      : jobs.filter(job => job.freelancer_id === user.id);
    
    // Get recent jobs (up to 3)
    const recentJobs = relevantJobs.slice(0, 3);
    
    // Get recent transactions (up to 3)
    const recentTransactions = transactions.slice(0, 3);
    
    return (
      <div className="dashboard-overview">
        <div className="welcome-banner">
          <h2>Welcome back, {user.first_name || user.username}!</h2>
          <p>Here's what's happening with your account</p>
        </div>
        
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-briefcase"></i>
            </div>
            <div className="stat-content">
              <h3>{relevantJobs.length}</h3>
              <p>{user.role === 'client' ? 'Posted Jobs' : 'Active Jobs'}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-file-invoice-dollar"></i>
            </div>
            <div className="stat-content">
              <h3>{transactions.length}</h3>
              <p>Transactions</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-star"></i>
            </div>
            <div className="stat-content">
              <h3>{user.role === 'freelancer' ? '4.8' : '0'}</h3>
              <p>Rating</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-comments"></i>
            </div>
            <div className="stat-content">
              <h3>0</h3>
              <p>Unread Messages</p>
            </div>
          </div>
        </div>
        
        <div className="dashboard-sections">
          <div className="dashboard-section">
            <div className="section-header">
              <h3>Recent Jobs</h3>
              <Link to="/dashboard/jobs">View All</Link>
            </div>
            
            {recentJobs.length === 0 ? (
              <div className="empty-state">
                <p>No jobs found. {user.role === 'client' ? 'Post a job' : 'Browse the marketplace'} to get started.</p>
                <Link 
                  to={user.role === 'client' ? '/post-job' : '/marketplace'} 
                  className="btn btn-primary"
                >
                  {user.role === 'client' ? 'Post a Job' : 'Find Jobs'}
                </Link>
              </div>
            ) : (
              <div className="jobs-list">
                {recentJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
          
          <div className="dashboard-section">
            <div className="section-header">
              <h3>Recent Transactions</h3>
              <Link to="/dashboard/transactions">View All</Link>
            </div>
            
            {recentTransactions.length === 0 ? (
              <div className="empty-state">
                <p>No transactions found.</p>
              </div>
            ) : (
              <div className="transactions-list">
                {recentTransactions.map(transaction => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-details">
                      <p className="transaction-title">{transaction.job_title}</p>
                      <p className="transaction-parties">
                        {transaction.payer} → {transaction.payee}
                      </p>
                    </div>
                    <div className="transaction-amount">
                      <p className="amount">${transaction.amount}</p>
                      <p className={`status status-${transaction.status}`}>
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderJobs = () => {
    if (!user) return null;
    
    // Filter jobs based on user role
    const relevantJobs = user.role === 'client' 
      ? jobs.filter(job => job.client_id === user.id)
      : jobs.filter(job => job.freelancer_id === user.id);
    
    return (
      <div className="dashboard-jobs">
        <div className="section-header">
          <h2>{user.role === 'client' ? 'My Posted Jobs' : 'My Jobs'}</h2>
          
          {user.role === 'client' && (
            <Link to="/post-job" className="btn btn-primary">
              Post a New Job
            </Link>
          )}
        </div>
        
        {relevantJobs.length === 0 ? (
          <div className="empty-state">
            <p>No jobs found. {user.role === 'client' ? 'Post a job' : 'Browse the marketplace'} to get started.</p>
            <Link 
              to={user.role === 'client' ? '/post-job' : '/marketplace'} 
              className="btn btn-primary"
            >
              {user.role === 'client' ? 'Post a Job' : 'Find Jobs'}
            </Link>
          </div>
        ) : (
          <div className="jobs-grid">
            {relevantJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderProposals = () => {
    return (
      <div className="dashboard-proposals">
        <div className="section-header">
          <h2>My Proposals</h2>
        </div>
        
        <div className="empty-state">
          <p>No proposals found. Browse the marketplace to find jobs and submit proposals.</p>
          <Link to="/marketplace" className="btn btn-primary">
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  };

  const renderTransactions = () => {
    return (
      <div className="dashboard-transactions">
        <div className="section-header">
          <h2>Transactions</h2>
        </div>
        
        {transactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions found.</p>
          </div>
        ) : (
          <div className="transactions-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Job</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>
                      <Link to={`/jobs/${transaction.job_id}`}>
                        {transaction.job_title}
                      </Link>
                    </td>
                    <td>{transaction.payer}</td>
                    <td>{transaction.payee}</td>
                    <td>${transaction.amount}</td>
                    <td>${transaction.platform_fee}</td>
                    <td>
                      <span className={`status-badge status-${transaction.status}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderMessages = () => {
    return (
      <div className="dashboard-messages">
        <div className="section-header">
          <h2>Messages</h2>
        </div>
        
        <div className="empty-state">
          <p>No messages found.</p>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="dashboard-page">
        <Header />
        <div className="container">
          <div className="loading-indicator">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Header />
      
      <div className="dashboard-container">
        <div className="dashboard-sidebar">
          <div className="user-profile">
            <div className="user-avatar">
              {user.profile_picture ? (
                <img src={user.profile_picture} alt={user.username} />
              ) : (
                <div className="avatar-placeholder">{user.username[0]}</div>
              )}
            </div>
            <div className="user-info">
              <h3>{user.first_name} {user.last_name}</h3>
              <p>{user.role}</p>
            </div>
          </div>
          
          <nav className="dashboard-nav">
            <ul>
              <li className={activeTab === 'overview' ? 'active' : ''}>
                <button onClick={() => setActiveTab('overview')}>
                  <i className="fas fa-tachometer-alt"></i> Overview
                </button>
              </li>
              <li className={activeTab === 'jobs' ? 'active' : ''}>
                <button onClick={() => setActiveTab('jobs')}>
                  <i className="fas fa-briefcase"></i> Jobs
                </button>
              </li>
              {user.role === 'freelancer' && (
                <li className={activeTab === 'proposals' ? 'active' : ''}>
                  <button onClick={() => setActiveTab('proposals')}>
                    <i className="fas fa-file-alt"></i> Proposals
                  </button>
                </li>
              )}
              <li className={activeTab === 'transactions' ? 'active' : ''}>
                <button onClick={() => setActiveTab('transactions')}>
                  <i className="fas fa-file-invoice-dollar"></i> Transactions
                </button>
              </li>
              <li className={activeTab === 'messages' ? 'active' : ''}>
                <button onClick={() => setActiveTab('messages')}>
                  <i className="fas fa-comments"></i> Messages
                </button>
              </li>
              <li>
                <Link to="/profile">
                  <i className="fas fa-user-circle"></i> Profile
                </Link>
              </li>
              <li>
                <Link to="/settings">
                  <i className="fas fa-cog"></i> Settings
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
