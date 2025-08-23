import api from './index';

export const getJobs = async (filters = {}) => {
  try {
    const response = await api.get('/marketplace/jobs', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching jobs' };
  }
};

export const getJobById = async (jobId) => {
  try {
    const response = await api.get(`/marketplace/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching job details' };
  }
};

export const createJob = async (jobData) => {
  try {
    const response = await api.post('/marketplace/jobs', jobData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while creating job' };
  }
};

export const updateJob = async (jobId, jobData) => {
  try {
    const response = await api.put(`/marketplace/jobs/${jobId}`, jobData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while updating job' };
  }
};

export const deleteJob = async (jobId) => {
  try {
    const response = await api.delete(`/marketplace/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while deleting job' };
  }
};

export const getJobProposals = async (jobId) => {
  try {
    const response = await api.get(`/marketplace/jobs/${jobId}/proposals`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching proposals' };
  }
};

export const submitProposal = async (jobId, proposalData) => {
  try {
    const response = await api.post(`/marketplace/jobs/${jobId}/proposals`, proposalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while submitting proposal' };
  }
};

export const hireFreelancer = async (jobId, freelancerId) => {
  try {
    const response = await api.post(`/marketplace/jobs/${jobId}/hire/${freelancerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while hiring freelancer' };
  }
};

export const getSkills = async () => {
  try {
    const response = await api.get('/marketplace/skills');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching skills' };
  }
};

export const getUsers = async (filters = {}) => {
  try {
    const response = await api.get('/profiles/users', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching users' };
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/profiles/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching user details' };
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/profiles/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while updating profile' };
  }
};

export const uploadProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/profiles/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while uploading profile picture' };
  }
};

export const getUserReviews = async (userId) => {
  try {
    const response = await api.get(`/profiles/users/${userId}/reviews`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching user reviews' };
  }
};

export const createReview = async (jobId, reviewData) => {
  try {
    const response = await api.post(`/profiles/jobs/${jobId}/review`, reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while creating review' };
  }
};
