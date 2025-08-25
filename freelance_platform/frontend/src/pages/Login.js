import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth';
import '../styles/pages/Login.css';
// Import login illustration
import loginIllustration from '../assets/login-illustration.svg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await loginUser(email, password);
      
      // Store tokens and user data in localStorage
      localStorage.setItem('accessToken', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.error || 'Login failed. Please check your credentials and try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-panel">
          <div className="login-welcome">
            <div className="welcome-content">
              <h2>Welcome Back</h2>
              <p>Connect with Sierra Leone's top talent and opportunities</p>
              <div className="welcome-image">
                <img src={loginIllustration} alt="Login illustration" />
              </div>
            </div>
          </div>
          
          <div className="login-form-container">
            <div className="login-header">
              <h1>Sign In</h1>
              <p>Access your FreelancePro SL account</p>
            </div>
            
            {error && (
              <div className="alert alert-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">
                  <i className="fas fa-envelope"></i>
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={loading}
                  className={error && !email ? 'error' : ''}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">
                  <i className="fas fa-lock"></i>
                  <span>Password</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={loading}
                    className={error && !password ? 'error' : ''}
                  />
                </div>
              </div>
              
              <div className="form-options">
                <div className="remember-me">
                  <input 
                    type="checkbox" 
                    id="remember" 
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <label htmlFor="remember">Remember me</label>
                </div>
                
                <Link to="/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>
              
              <button 
                type="submit" 
                className="btn-login"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i>
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
            
            <div className="login-separator">
              <span>or continue with</span>
            </div>
            
            <div className="social-login">
              <button className="btn-social btn-google">
                <i className="fab fa-google"></i>
              </button>
              
              <button className="btn-social btn-facebook">
                <i className="fab fa-facebook-f"></i>
              </button>
              
              <button className="btn-social btn-linkedin">
                <i className="fab fa-linkedin-in"></i>
              </button>
            </div>
            
            <div className="login-footer">
              <p>
                Don't have an account? <Link to="/register">Create Account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
