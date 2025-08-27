import React, { useState } from 'react';
import '../styles/components/ReviewForm.css';

const ReviewForm = ({ onSubmit, jobId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleRatingHover = (hoveredValue) => {
    setHoveredRating(hoveredValue);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await onSubmit({
        job_id: jobId,
        rating,
        comment
      });
      
      // Clear form on success
      setRating(0);
      setComment('');
      setSuccess('Your review has been submitted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError(error.message || 'An error occurred while submitting your review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form">
      <h3>Leave a Review</h3>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="rating-container">
          <p>Rate your experience:</p>
          <div 
            className="star-rating" 
            onMouseLeave={handleRatingLeave}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <span
                key={value}
                className={`star ${value <= (hoveredRating || rating) ? 'filled' : ''}`}
                onClick={() => handleRatingChange(value)}
                onMouseEnter={() => handleRatingHover(value)}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="comment">Comments (optional):</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience working on this project..."
            rows={4}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
