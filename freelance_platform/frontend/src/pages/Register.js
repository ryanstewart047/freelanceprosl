import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/pages/Register.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'freelancer', // Default to freelancer
    planType: 'trial', // 'trial' (30 Days Free) or 'premium' ($10/mo)
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
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
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        username: formData.email.split('@')[0] + Math.floor(Math.random() * 1000),
        password: formData.password,
        role: formData.userType,
        user_type: formData.userType,
        plan_type: formData.planType,
        subscription_status: formData.planType === 'premium' ? 'ACTIVE' : 'TRIAL',
      };

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // Automatically save user demo session
        const newUser = data.user || {
          id: Date.now(),
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          username: payload.username,
          role: formData.userType,
          tracking_id: data.tracking_id || `FPSL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          subscription_status: payload.subscription_status,
          days_remaining_in_trial: formData.planType === 'trial' ? 30 : 0,
        };

        localStorage.setItem('access_token', data.access_token || 'demo-token');
        localStorage.setItem('user', JSON.stringify(newUser));

        navigate('/profile', {
          state: { message: `Account created successfully! ${formData.planType === 'trial' ? 'Your 30-Day Free Trial is active.' : 'Welcome to Premium Membership!'}` }
        });
      } else {
        setErrors({ submit: data.error || data.message || 'Registration failed. Please try again.' });
      }
    } catch {
      // Offline / Demo fallback
      const demoUser = {
        id: Date.now(),
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        username: formData.email.split('@')[0],
        role: formData.userType,
        tracking_id: `FPSL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        subscription_status: formData.planType === 'premium' ? 'ACTIVE' : 'TRIAL',
        days_remaining_in_trial: formData.planType === 'trial' ? 30 : 0,
      };
      localStorage.setItem('access_token', 'demo-token');
      localStorage.setItem('user', JSON.stringify(demoUser));

      navigate('/profile', {
        state: { message: 'Registration successful!' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page" style={{ minHeight: '100vh', background: '#040e40', padding: '3rem 1rem', color: '#ffffff' }}>
      <div className="register-container" style={{ maxWidth: '850px', margin: '0 auto', background: '#ffffff', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', color: '#0f172a' }}>
        <div style={{ background: 'linear-gradient(135deg, #040e40, #dc2626)', color: 'white', padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', color: 'white' }}>Join FreelancePro SL</h1>
          <p style={{ margin: '0.5rem 0 0', opacity: 0.9 }}>Create your account & publish your profile in the Marketplace</p>
        </div>

        <div style={{ padding: '2rem' }}>
          {errors.submit && (
            <div className="alert alert-error" style={{ background: '#ffebee', color: '#dc2626', padding: '0.875rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <i className="fas fa-exclamation-circle"></i> {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label style={{ color: '#040e40', fontWeight: 'bold' }}>First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="e.g. Samuel" />
                {errors.firstName && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label style={{ color: '#040e40', fontWeight: 'bold' }}>Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="e.g. Bangura" />
                {errors.lastName && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#040e40', fontWeight: 'bold' }}>Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="samuel@example.com" />
              {errors.email && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.email}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label style={{ color: '#040e40', fontWeight: 'bold' }}>Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Min 6 characters" />
                {errors.password && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.password}</span>}
              </div>
              <div className="form-group">
                <label style={{ color: '#040e40', fontWeight: 'bold' }}>Confirm Password *</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Re-enter password" />
                {errors.confirmPassword && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.confirmPassword}</span>}
              </div>
            </div>

            {/* Account Type */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#040e40', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Account Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={{ border: `2px solid ${formData.userType === 'freelancer' ? '#040e40' : '#cbd5e1'}`, background: formData.userType === 'freelancer' ? '#f0f4ff' : '#ffffff', padding: '1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="radio" name="userType" value="freelancer" checked={formData.userType === 'freelancer'} onChange={handleChange} />
                  <div>
                    <strong style={{ color: '#040e40' }}>Freelancer</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Offer skills & list profile in marketplace</div>
                  </div>
                </label>
                <label style={{ border: `2px solid ${formData.userType === 'client' ? '#040e40' : '#cbd5e1'}`, background: formData.userType === 'client' ? '#f0f4ff' : '#ffffff', padding: '1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="radio" name="userType" value="client" checked={formData.userType === 'client'} onChange={handleChange} />
                  <div>
                    <strong style={{ color: '#040e40' }}>Client / Employer</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Post jobs & hire freelancers</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Plan Selection Step */}
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ color: '#040e40', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                Select Membership Plan (Only Active Profiles appear in Marketplace)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={{ border: `2px solid ${formData.planType === 'trial' ? '#10b981' : '#cbd5e1'}`, background: formData.planType === 'trial' ? '#ecfdf5' : '#ffffff', padding: '1.25rem', borderRadius: '0.5rem', cursor: 'pointer', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input type="radio" name="planType" value="trial" checked={formData.planType === 'trial'} onChange={handleChange} />
                    <strong style={{ color: '#040e40', fontSize: '1.05rem' }}>🎁 30 Days Free Trial</strong>
                  </div>
                  <div style={{ color: '#047857', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.25rem' }}>$0 / 30 Days</div>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                    Full marketplace visibility for 30 days. Auto-assigns unique Tracking ID.
                  </div>
                </label>

                <label style={{ border: `2px solid ${formData.planType === 'premium' ? '#dc2626' : '#cbd5e1'}`, background: formData.planType === 'premium' ? '#fff1f2' : '#ffffff', padding: '1.25rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input type="radio" name="planType" value="premium" checked={formData.planType === 'premium'} onChange={handleChange} />
                    <strong style={{ color: '#040e40', fontSize: '1.05rem' }}>⭐ Premium Account</strong>
                  </div>
                  <div style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.25rem' }}>$10 / Month</div>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                    Instant verified active status & priority marketplace listing.
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-block" disabled={isSubmitting} style={{ background: '#040e40', color: 'white', padding: '0.875rem', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
              {isSubmitting ? 'Creating Account & Generating Tracking ID...' : 'Complete Registration'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b' }}>
            Already have an account? <Link to="/login" style={{ color: '#dc2626', fontWeight: 'bold' }}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
