import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JobCard from '../components/JobCard';
import { getJobs, getSkills } from '../api/marketplace';
import '../styles/pages/Marketplace.css';

const Marketplace = () => {
  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'open',
    minBudget: '',
    maxBudget: '',
    skill: '',
    search: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch jobs with current filters
        const jobParams = { status: filters.status };
        const jobsResponse = await getJobs(jobParams);
        
        // Fetch skills for filter dropdown
        const skillsResponse = await getSkills();
        
        setJobs(jobsResponse.jobs || []);
        setSkills(skillsResponse.skills || []);
        setError('');
      } catch (err) {
        setError('Failed to load marketplace data. Please try again later.');
        console.error('Marketplace error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters.status]); // Re-fetch when status filter changes

  // Apply client-side filtering for other filters
  const filteredJobs = jobs.filter(job => {
    // Budget filter
    if (filters.minBudget && job.budget < parseFloat(filters.minBudget)) {
      return false;
    }
    
    if (filters.maxBudget && job.budget > parseFloat(filters.maxBudget)) {
      return false;
    }
    
    // Search filter (title and description)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // The filtering happens automatically via the filteredJobs calculation
  };

  const handlePostJob = () => {
    navigate('/post-job');
  };

  return (
    <div className="marketplace-page">
      
      <section className="marketplace-hero">
        <div className="container">
          <h1>Find Your Perfect Project</h1>
          <p>Browse thousands of freelance opportunities matching your skills and interests</p>
          <div className="marketplace-search">
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={filters.search}
              onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
            />
            <button className="btn btn-primary" onClick={handleSearch}>
              <i className="fas fa-search"></i> Search
            </button>
          </div>
        </div>
      </section>
      
      <section className="marketplace-main">
        <div className="container">
          <div className="marketplace-header">
            <div className="marketplace-stats">
              <h2>Available Projects</h2>
              <p>{filteredJobs.length} projects found</p>
            </div>
            <button className="btn btn-primary post-job-btn" onClick={handlePostJob}>
              <i className="fas fa-plus-circle"></i> Post a Job
            </button>
          </div>
          
          <div className="marketplace-layout">
            <div className="filters-panel">
              <div className="filters-header">
                <h3><i className="fas fa-filter"></i> Filters</h3>
                <button className="reset-filters" onClick={() => setFilters({
                  status: 'open',
                  minBudget: '',
                  maxBudget: '',
                  skill: '',
                  search: filters.search
                })}>
                  Reset
                </button>
              </div>
              
              <form onSubmit={handleSearch}>
                <div className="form-group">
                  <label htmlFor="status">Project Status</label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="">All</option>
                  </select>
                </div>
                
                <div className="form-group budget-range">
                  <label>Budget Range</label>
                  <div className="budget-inputs">
                    <div className="input-with-icon">
                      <i className="fas fa-dollar-sign"></i>
                      <input
                        type="number"
                        id="minBudget"
                        name="minBudget"
                        placeholder="Min budget"
                        value={filters.minBudget}
                        onChange={handleFilterChange}
                        min="0"
                        step="10"
                        className="budget-input"
                      />
                    </div>
                    <div className="input-with-icon">
                      <i className="fas fa-dollar-sign"></i>
                      <input
                        type="number"
                        id="maxBudget"
                        name="maxBudget"
                        placeholder="Max budget"
                        value={filters.maxBudget}
                        onChange={handleFilterChange}
                        min="0"
                        step="10"
                        className="budget-input"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="skill">Required Skills</label>
                  <select
                    id="skill"
                    name="skill"
                    value={filters.skill}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Skills</option>
                    {skills.map(skill => (
                      <option key={skill.id} value={skill.name}>
                        {skill.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button type="submit" className="btn btn-secondary apply-filters-btn">
                  <i className="fas fa-check"></i> Apply Filters
                </button>
              </form>
            </div>
            
            <div className="jobs-panel">
              {loading ? (
                <div className="loading-indicator">
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <p>Searching for perfect projects...</p>
                </div>
              ) : error ? (
                <div className="error-message">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>{error}</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="no-results">
                  <div className="no-results-icon">
                    <i className="fas fa-search"></i>
                  </div>
                  <h3>No projects found</h3>
                  <p>Try adjusting your filters or search criteria</p>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setFilters({
                      status: 'open',
                      minBudget: '',
                      maxBudget: '',
                      skill: '',
                      search: ''
                    })}
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="job-sorting">
                    <span>Sort by:</span>
                    <select name="sort" defaultValue="newest">
                      <option value="newest">Newest First</option>
                      <option value="budget-high">Budget: High to Low</option>
                      <option value="budget-low">Budget: Low to High</option>
                      <option value="deadline">Deadline</option>
                    </select>
                  </div>
                  <div className="jobs-grid">
                    {filteredJobs.map(job => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                  {filteredJobs.length > 0 && (
                    <div className="pagination">
                      <button disabled><i className="fas fa-chevron-left"></i></button>
                      <button className="active">1</button>
                      <button>2</button>
                      <button>3</button>
                      <button><i className="fas fa-chevron-right"></i></button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Marketplace;
