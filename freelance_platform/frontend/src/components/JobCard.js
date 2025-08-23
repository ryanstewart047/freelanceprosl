import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/JobCard.css';

const JobCard = ({ job }) => {
  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <h3 className="job-title">
          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
        </h3>
        <span className={`job-status status-${job.status}`}>
          {job.status.replace('_', ' ')}
        </span>
      </div>

      <div className="job-description">
        <p>{job.description.length > 150 
          ? `${job.description.substring(0, 150)}...` 
          : job.description}
        </p>
      </div>

      <div className="job-details">
        <div className="job-budget">
          <span className="label">Budget</span>
          <span className="value">${job.budget}</span>
        </div>
        
        {job.deadline && (
          <div className="job-deadline">
            <span className="label">Deadline</span>
            <span className="value">{formatDate(job.deadline)}</span>
          </div>
        )}
        
        <div className="job-posted">
          <span className="label">Posted</span>
          <span className="value">{formatDate(job.created_at)}</span>
        </div>
      </div>

      <div className="job-card-footer">
        <Link to={`/jobs/${job.id}`} className="btn btn-primary">
          <i className="fas fa-eye"></i> View Details
        </Link>
        
        {job.status === 'open' && (
          <Link to={`/jobs/${job.id}/apply`} className="btn btn-outline">
            <i className="fas fa-paper-plane"></i> Apply Now
          </Link>
        )}
      </div>
    </div>
  );
};

export default JobCard;
