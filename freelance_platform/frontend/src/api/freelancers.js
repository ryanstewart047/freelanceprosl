import api from './index';

export const getFreelancers = async (filters = {}) => {
  try {
    const response = await api.get('/freelancers', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching freelancers' };
  }
};

export const getFreelancerById = async (id) => {
  try {
    const response = await api.get(`/freelancers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching freelancer details' };
  }
};

export const getFreelancerReviews = async (id) => {
  try {
    const response = await api.get(`/freelancers/${id}/reviews`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching freelancer reviews' };
  }
};

export const getFreelancerPortfolio = async (id) => {
  try {
    const response = await api.get(`/freelancers/${id}/portfolio`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching freelancer portfolio' };
  }
};

export const submitFreelancerReview = async (id, reviewData) => {
  try {
    const response = await api.post(`/freelancers/${id}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while submitting the review' };
  }
};

export const searchFreelancers = async (searchQuery) => {
  try {
    const response = await api.get('/freelancers/search', { params: { query: searchQuery } });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while searching for freelancers' };
  }
};

export const updateFreelancerProfile = async (id, profileData) => {
  try {
    const response = await api.put(`/freelancers/${id}`, profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while updating the profile' };
  }
};
