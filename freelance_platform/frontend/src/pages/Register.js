import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth';
import '../styles/pages/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'client', // Default to client
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Call the register API
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        user_type: formData.userType
      };
      
      const response = await registerUser(userData);
      
      // If registration is successful, redirect to login
      if (response.success) {
        navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
      }
    } catch (error) {
      setErrors({ 
        submit: error.response?.data?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-panel">
          <div className="register-welcome">
            <div className="welcome-content">
              <h2>Start Your Journey Today</h2>
              <p>Join Sierra Leone's premier freelance community and unlock a world of opportunities.</p>
              <div className="welcome-image">
                <img 
                  src="https://img.freepik.com/free-photo/african-american-business-woman-working-laptop-office_1303-10865.jpg" 
                  alt="Professional working on laptop" 
                />
              </div>
              <div className="welcome-benefits">
                <div className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Create your professional profile</span>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Connect with clients and freelancers</span>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Start earning or hiring today</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="register-form-container">
            <div className="register-header">
              <h1>Create Account</h1>
              <p>Join FreelancePro SL in minutes</p>
            </div>
            
            {errors.submit && (
              <div className="alert alert-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{errors.submit}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">
                    <i className="fas fa-user"></i>
                    <span>First Name</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? 'error' : ''}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">
                    <i className="fas fa-user"></i>
                    <span>Last Name</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? 'error' : ''}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">
                  <i className="fas fa-envelope"></i>
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter your email address"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="password">
                  <i className="fas fa-lock"></i>
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Create a password (min. 6 characters)"
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <i className="fas fa-lock"></i>
                  <span>Confirm Password</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
              
              <div className="form-group account-type">
                <label><i className="fas fa-user-tag"></i><span>I want to:</span></label>
                <div className="user-type-selection">
                  <label className={`user-type-option ${formData.userType === 'client' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="userType"
                      value="client"
                      checked={formData.userType === 'client'}
                      onChange={handleChange}
                    />
                    <i className="fas fa-briefcase"></i>
                    <span>Hire Freelancers</span>
                  </label>
                  <label className={`user-type-option ${formData.userType === 'freelancer' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="userType"
                      value="freelancer"
                      checked={formData.userType === 'freelancer'}
                      onChange={handleChange}
                    />
                    <i className="fas fa-laptop-code"></i>
                    <span>Work as a Freelancer</span>
                  </label>
                </div>
              </div>
              
              <button type="submit" className="btn-register" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus"></i>
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>
            
            <div className="register-separator">
              <span>or sign up with</span>
            </div>
            
            <div className="social-register">
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
            
            <div className="register-footer">
              <p>
                Already have an account? <Link to="/login">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
