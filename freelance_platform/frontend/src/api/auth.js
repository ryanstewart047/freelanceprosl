import api from './index';

export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred during login' };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred during registration' };
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching user data' };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/profiles/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching user profile' };
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put('/auth/change-password', { current_password: currentPassword, new_password: newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while changing password' };
  }
};

export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while refreshing token' };
  }
};
