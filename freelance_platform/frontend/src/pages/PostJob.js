import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../api/marketplace';
import '../styles/PostJob.css';

const PostJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills: '',
    budget: '',
    duration: '',
    experienceLevel: 'intermediate'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Graphic Design',
    'Content Writing',
    'Marketing',
    'Data Entry',
    'Virtual Assistant',
    'Other'
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'expert', label: 'Expert' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.skills.trim()) {
      newErrors.skills = 'Required skills are required';
    }
    
    if (!formData.budget.trim()) {
      newErrors.budget = 'Budget is required';
    } else if (isNaN(formData.budget) || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Budget must be a positive number';
    }
    
    if (!formData.duration.trim()) {
      newErrors.duration = 'Project duration is required';
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
      // Transform skills from comma-separated string to array
      const skillsArray = formData.skills.split(',').map(skill => skill.trim());
      
      const jobData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        skills: skillsArray,
        budget: parseFloat(formData.budget),
        duration: formData.duration,
        experience_level: formData.experienceLevel
      };
      
      const response = await createJob(jobData);
      
      // If job posting is successful, redirect to the job details page
      if (response.success) {
        navigate(`/jobs/${response.data.id}`, { state: { message: 'Job posted successfully!' } });
      }
    } catch (error) {
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to post job. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-job-container">
      <div className="post-job-form-wrapper">
        <h1>Post a New Job</h1>
        <p>Fill out the form below to post a new job on our platform</p>
        
        {errors.submit && <div className="error-message">{errors.submit}</div>}
        
        <form onSubmit={handleSubmit} className="post-job-form">
          <div className="form-group">
            <label htmlFor="title">Job Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              placeholder="e.g., 'React Developer for E-commerce Website'"
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={errors.category ? 'error' : ''}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <span className="error-text">{errors.category}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Job Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              className={errors.description ? 'error' : ''}
              placeholder="Describe the project in detail, including objectives, deliverables, and timeline..."
            ></textarea>
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="skills">Required Skills (comma separated)</label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className={errors.skills ? 'error' : ''}
              placeholder="e.g., 'React, JavaScript, CSS, Responsive Design'"
            />
            {errors.skills && <span className="error-text">{errors.skills}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="budget">Budget (USD)</label>
              <input
                type="text"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className={errors.budget ? 'error' : ''}
                placeholder="e.g., '500'"
              />
              {errors.budget && <span className="error-text">{errors.budget}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="duration">Project Duration</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className={errors.duration ? 'error' : ''}
                placeholder="e.g., '2 weeks'"
              />
              {errors.duration && <span className="error-text">{errors.duration}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="experienceLevel">Experience Level</label>
            <div className="experience-level-options">
              {experienceLevels.map(level => (
                <label key={level.value} className={`experience-level-option ${formData.experienceLevel === level.value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="experienceLevel"
                    value={level.value}
                    checked={formData.experienceLevel === level.value}
                    onChange={handleChange}
                  />
                  {level.label}
                </label>
              ))}
            </div>
          </div>
          
          <button type="submit" className="post-job-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Posting Job...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
