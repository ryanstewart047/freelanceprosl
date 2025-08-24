import api from './index';

export const getConversations = async () => {
  try {
    const response = await api.get('/messages/conversations');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching conversations' };
  }
};

export const getMessages = async (conversationId) => {
  try {
    const response = await api.get(`/messages/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching messages' };
  }
};

export const sendMessage = async (conversationId, content) => {
  try {
    const response = await api.post(`/messages/conversations/${conversationId}`, { content });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while sending message' };
  }
};

export const createConversation = async (recipientId, initialMessage) => {
  try {
    const response = await api.post('/messages/conversations', { 
      recipient_id: recipientId,
      initial_message: initialMessage 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while creating conversation' };
  }
};

export const markAsRead = async (conversationId) => {
  try {
    const response = await api.put(`/messages/conversations/${conversationId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while marking messages as read' };
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await api.get('/messages/unread-count');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'An error occurred while fetching unread messages count' };
  }
};
