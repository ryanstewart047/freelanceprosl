import api from './index';

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
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

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred during password reset request' };
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

export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/profiles/${userId}`, profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while updating user profile' };
  }
};

export const uploadProfilePhoto = async (userId, photoFile) => {
  try {
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    const response = await api.post(`/profiles/${userId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while uploading profile photo' };
  }
};

export const uploadDocument = async (userId, documentFile, documentType) => {
  try {
    const formData = new FormData();
    formData.append('document', documentFile);
    formData.append('type', documentType);
    
    const response = await api.post(`/profiles/${userId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while uploading document' };
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
