import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/FreelancerCard.css';

const FreelancerCard = ({ freelancer }) => {
  return (
    <div className="freelancer-card">
      <div className="freelancer-card-header">
        <div className="freelancer-avatar">
          {freelancer.profile_picture ? (
            <img src={freelancer.profile_picture} alt={freelancer.username} />
          ) : (
            <div className="avatar-placeholder">{freelancer.first_name?.[0] || freelancer.username[0]}</div>
          )}
        </div>
        <div className="freelancer-info">
          <h3 className="freelancer-name">
            {freelancer.first_name} {freelancer.last_name}
          </h3>
          <p className="freelancer-username">@{freelancer.username}</p>
          {freelancer.hourly_rate && (
            <p className="freelancer-rate">${freelancer.hourly_rate}/hr</p>
          )}
        </div>
      </div>
      
      <div className="freelancer-bio">
        <p>{freelancer.bio || 'No bio provided'}</p>
      </div>
      
      <div className="freelancer-skills">
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
      
      <div className="freelancer-card-footer">
        <Link to={`/freelancers/${freelancer.id}`} className="btn btn-outline">
          View Profile
        </Link>
        <Link to={`/messages/new/${freelancer.id}`} className="btn btn-primary">
          Contact
        </Link>
      </div>
    </div>
  );
};

export default FreelancerCard;
