import api from './index';

export const getSubscriptionPlans = async () => {
  try {
    const response = await api.get('/payments/subscription-plans');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching subscription plans' };
  }
};

export const getCurrentSubscription = async () => {
  try {
    const response = await api.get('/payments/my-subscription');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching current subscription' };
  }
};

export const subscribeToFreelancerPlan = async (planData) => {
  try {
    const response = await api.post('/payments/subscribe', planData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while processing subscription' };
  }
};

export const cancelSubscription = async () => {
  try {
    const response = await api.post('/payments/cancel-subscription');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while canceling subscription' };
  }
};

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

export const initiatePaymentWithMobileMoney = async (paymentData) => {
  try {
    const response = await api.post('/payments/mobile-money', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while processing mobile money payment' };
  }
};

export const verifyMobileMoneyPayment = async (transactionId) => {
  try {
    const response = await api.get(`/payments/mobile-money/verify/${transactionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while verifying mobile money payment' };
  }
};

export const getSupportedMobileMoneyProviders = async () => {
  try {
    const response = await api.get('/payments/mobile-money/providers');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching mobile money providers' };
  }
};
