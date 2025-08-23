import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getJobById, submitProposal } from '../api/marketplace';
import '../styles/JobDetails.css';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proposalData, setProposalData] = useState({
    coverLetter: '',
    bidAmount: '',
    estimatedDuration: ''
  });
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await getJobById(id);
        setJob(response.data);
      } catch (err) {
        setError('Failed to load job details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleProposalChange = (e) => {
    const { name, value } = e.target;
    setProposalData({
      ...proposalData,
      [name]: value
    });
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      await submitProposal(id, {
        cover_letter: proposalData.coverLetter,
        bid_amount: parseFloat(proposalData.bidAmount),
        estimated_duration: parseInt(proposalData.estimatedDuration)
      });
      
      // Reset form and show success message
      setProposalData({
        coverLetter: '',
        bidAmount: '',
        estimatedDuration: ''
      });
      setShowProposalForm(false);
      
      // Redirect to proposals page or show success message
      navigate('/dashboard/proposals', { state: { message: 'Proposal submitted successfully!' } });
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit proposal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="job-details-loading">Loading job details...</div>;
  }

  if (error) {
    return <div className="job-details-error">{error}</div>;
  }

  if (!job) {
    return <div className="job-details-not-found">Job not found</div>;
  }

  return (
    <div className="job-details-container">
      <div className="job-details-header">
        <Link to="/marketplace" className="back-to-jobs">← Back to Jobs</Link>
        <h1>{job.title}</h1>
        <div className="job-meta">
          <span className="job-category">{job.category}</span>
          <span className="job-posted">Posted {new Date(job.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="job-details-content">
        <div className="job-details-main">
          <div className="job-description">
            <h2>Project Description</h2>
            <p>{job.description}</p>
          </div>

          <div className="job-requirements">
            <h2>Requirements</h2>
            <ul>
              {job.skills && job.skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>

          {job.attachments && job.attachments.length > 0 && (
            <div className="job-attachments">
              <h2>Attachments</h2>
              <ul>
                {job.attachments.map((attachment, index) => (
                  <li key={index}>
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                      {attachment.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="job-details-sidebar">
          <div className="job-info-card">
            <div className="job-info-item">
              <h3>Budget</h3>
              <p>${job.budget}</p>
            </div>
            <div className="job-info-item">
              <h3>Duration</h3>
              <p>{job.duration}</p>
            </div>
            <div className="job-info-item">
              <h3>Experience Level</h3>
              <p>{job.experience_level}</p>
            </div>
            <div className="job-info-item">
              <h3>Proposals</h3>
              <p>{job.proposal_count || 0} submitted</p>
            </div>
            <div className="job-info-item">
              <h3>Client</h3>
              <p>
                <Link to={`/profiles/${job.client_id}`}>
                  {job.client_name}
                </Link>
              </p>
              <p className="client-rating">
                {job.client_rating ? `★ ${job.client_rating}/5` : 'New Client'}
              </p>
            </div>
          </div>

          {!showProposalForm ? (
            <button 
              className="submit-proposal-btn"
              onClick={() => setShowProposalForm(true)}
            >
              Submit a Proposal
            </button>
          ) : (
            <div className="proposal-form-container">
              <h2>Submit Your Proposal</h2>
              {submitError && <div className="proposal-error">{submitError}</div>}
              <form onSubmit={handleProposalSubmit} className="proposal-form">
                <div className="form-group">
                  <label htmlFor="bidAmount">Your Bid (USD)</label>
                  <input
                    type="number"
                    id="bidAmount"
                    name="bidAmount"
                    value={proposalData.bidAmount}
                    onChange={handleProposalChange}
                    min="1"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="estimatedDuration">Estimated Duration (days)</label>
                  <input
                    type="number"
                    id="estimatedDuration"
                    name="estimatedDuration"
                    value={proposalData.estimatedDuration}
                    onChange={handleProposalChange}
                    min="1"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="coverLetter">Cover Letter</label>
                  <textarea
                    id="coverLetter"
                    name="coverLetter"
                    value={proposalData.coverLetter}
                    onChange={handleProposalChange}
                    rows="6"
                    required
                    placeholder="Explain why you're the best fit for this project..."
                  ></textarea>
                </div>
                
                <div className="proposal-actions">
                  <button 
                    type="button" 
                    className="cancel-proposal-btn"
                    onClick={() => setShowProposalForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-proposal-btn"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Proposal'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
