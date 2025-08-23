import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserProfile } from '../api/auth';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile(id);
        setProfile(response.data);
      } catch (err) {
        setError('Failed to load profile. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-error">{error}</div>;
  }

  if (!profile) {
    return <div className="profile-not-found">User not found</div>;
  }

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={`${profile.first_name} ${profile.last_name}`} />
          ) : (
            <div className="avatar-placeholder">
              {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h1>{profile.first_name} {profile.last_name}</h1>
          {profile.title && <h2>{profile.title}</h2>}
          <div className="profile-meta">
            <span className="location">
              <i className="fa fa-map-marker"></i> {profile.location || 'Location not specified'}
            </span>
            <span className="member-since">
              <i className="fa fa-calendar"></i> Member since {new Date(profile.created_at).toLocaleDateString()}
            </span>
          </div>
          {profile.rating && (
            <div className="profile-rating">
              <span className="stars">{'★'.repeat(Math.floor(profile.rating))}{'☆'.repeat(5 - Math.floor(profile.rating))}</span>
              <span className="rating-value">{profile.rating.toFixed(1)}</span>
              <span className="reviews-count">({profile.reviews_count || 0} reviews)</span>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-about">
          <h3>About</h3>
          <p>{profile.bio || 'No bio provided.'}</p>
        </div>

        {profile.user_type === 'freelancer' && (
          <>
            <div className="profile-skills">
              <h3>Skills</h3>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="skills-list">
                  {profile.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              ) : (
                <p>No skills listed.</p>
              )}
            </div>

            <div className="profile-experience">
              <h3>Experience</h3>
              {profile.experience && profile.experience.length > 0 ? (
                <div className="experience-list">
                  {profile.experience.map((exp, index) => (
                    <div key={index} className="experience-item">
                      <h4>{exp.title} at {exp.company}</h4>
                      <p className="experience-period">{exp.from_date} - {exp.to_date || 'Present'}</p>
                      <p className="experience-description">{exp.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No experience listed.</p>
              )}
            </div>

            <div className="profile-education">
              <h3>Education</h3>
              {profile.education && profile.education.length > 0 ? (
                <div className="education-list">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="education-item">
                      <h4>{edu.degree} in {edu.field_of_study}</h4>
                      <p className="education-institution">{edu.institution}</p>
                      <p className="education-period">{edu.from_year} - {edu.to_year || 'Present'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No education listed.</p>
              )}
            </div>
          </>
        )}

        <div className="profile-reviews">
          <h3>Reviews</h3>
          {profile.reviews && profile.reviews.length > 0 ? (
            <div className="reviews-list">
              {profile.reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <span className="reviewer-name">{review.reviewer_name}</span>
                      <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="review-rating">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                  <p className="review-content">{review.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
