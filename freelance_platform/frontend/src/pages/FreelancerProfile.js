import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import { getUserById, getUserReviews, createReview } from '../api/marketplace';
import '../styles/pages/FreelancerProfile.css';

const FreelancerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [freelancer, setFreelancer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        // Fetch freelancer data
        const freelancerData = await getUserById(id);
        setFreelancer(freelancerData);
        
        // Fetch reviews
        const reviewsData = await getUserReviews(id);
        setReviews(reviewsData.reviews || []);
        
      } catch (err) {
        setError('Failed to load freelancer profile. Please try again later.');
        console.error('Freelancer profile error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleContact = () => {
    navigate(`/messages/new/${id}`);
  };

  const handleHire = () => {
    navigate(`/post-job?freelancer=${id}`);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      // In a real app, you'd need a job ID that connects the freelancer and client
      // For demo purposes, we're using a placeholder
      const demoJobId = 1; 
      await createReview(demoJobId, reviewData);
      
      // Refresh reviews
      const reviewsData = await getUserReviews(id);
      setReviews(reviewsData.reviews || []);
      
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  };

  if (loading) {
    return (
      <div className="freelancer-profile-page">
        <div className="container">
          <div className="loading-indicator">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !freelancer) {
    return (
      <div className="freelancer-profile-page">
        <div className="container">
          <div className="error-message">
            {error || 'Freelancer not found'}
            <p>
              <Link to="/freelancers" className="btn btn-primary">
                Back to Freelancers
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings yet';

  return (
    <div className="freelancer-profile-page">
      <div className="container">
        <div className="back-navigation">
          <Link to="/freelancers" className="back-link">← Back to Freelancers</Link>
        </div>
        
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-icon">
              {freelancer.profile_picture ? (
                <img 
                  src={freelancer.profile_picture} 
                  alt={`${freelancer.first_name} ${freelancer.last_name}`} 
                />
              ) : (
                <div className="avatar-placeholder">
                  {freelancer.first_name?.[0] || freelancer.username[0]}
                </div>
              )}
            </div>
            <h1>{freelancer.first_name} {freelancer.last_name}</h1>
            <p className="username">@{freelancer.username}</p>
            
            <div className="profile-rating">
              <span className="rating-stars">
                {typeof avgRating === 'string' ? (
                  avgRating
                ) : (
                  <>
                    {avgRating} <span className="stars">★★★★★</span>
                  </>
                )}
              </span>
              <span className="review-count">
                ({reviews.length} reviews)
              </span>
            </div>
            
            {freelancer.hourly_rate && (
              <div className="profile-price">
                <span className="price-value">${freelancer.hourly_rate}</span>/hr
              </div>
            )}
            
            <div className="profile-actions">
              <button 
                className="btn btn-primary"
                onClick={handleHire}
              >
                Hire Me
              </button>
              <button 
                className="btn btn-outline"
                onClick={handleContact}
              >
                Contact
              </button>
            </div>
          </div>
          
          <div className="profile-card-content">
            <section className="profile-section">
              <h2>About Me</h2>
              <p>{freelancer.bio || 'No bio provided.'}</p>
            </section>
            
            <section className="profile-section">
              <h2>Skills</h2>
              <div className="skills-list">
                {freelancer.skills && freelancer.skills.length > 0 ? (
                  freelancer.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p>No skills listed</p>
                )}
              </div>
            </section>
            
            <section className="profile-section">
              <h2>Availability</h2>
              <p>{freelancer.availability || 'Not specified'}</p>
            </section>
          </div>
        </div>
        
        <div className="reviews-card">
          <h2>Client Reviews</h2>
          
          {reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet.</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.reviewer.profile_picture ? (
                          <img 
                            src={review.reviewer.profile_picture} 
                            alt={review.reviewer.username} 
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {review.reviewer.first_name?.[0] || review.reviewer.username[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="reviewer-name">
                          {review.reviewer.first_name} {review.reviewer.last_name}
                        </p>
                        <p className="review-date">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="review-rating">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span 
                          key={index} 
                          className={`star ${index < review.rating ? 'filled' : ''}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="review-content">
                    <p>{review.comment || 'No comment provided.'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Only show review form if user is logged in and is not viewing their own profile */}
          {user && user.id !== parseInt(id) && (
            <ReviewForm onSubmit={handleSubmitReview} jobId={1} />
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;
