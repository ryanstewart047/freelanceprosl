import api from './index';

export const initiateDeposit = async (depositData) => {
  try {
    const response = await api.post('/payments/deposit', depositData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while initiating deposit' };
  }
};

export const getTransactions = async (filters = {}) => {
  try {
    const response = await api.get('/payments/transactions', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching transactions' };
  }
};

export const releasePayment = async (transactionId) => {
  try {
    const response = await api.post(`/payments/release/${transactionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while releasing payment' };
  }
};
