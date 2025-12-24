import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const authAPI = {
  signup: async (username, email, password) => {
    const response = await axios.post(`${API_URL}/auth/signup`, {
      username,
      email,
      password
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    return response.data;
  },

  getUsers: async () => {
    const response = await axios.get(`${API_URL}/auth/users`);
    return response.data;
  }
};

export const chatAPI = {
  getMessages: async (userId) => {
    const response = await axios.get(`${API_URL}/chat/messages/${userId}`);
    return response.data;
  },

  markAsRead: async (userId) => {
    const response = await axios.put(`${API_URL}/chat/messages/${userId}/read`);
    return response.data;
  }
};

