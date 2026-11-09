import api from './api';

export const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.data?.token) {
      localStorage.setItem('interviewiq_token', res.data.data.token);
      localStorage.setItem('interviewiq_user', JSON.stringify(res.data.data.user));
    }
    return res.data.data;
  },

  async register(name, email, password) {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.data?.token) {
      localStorage.setItem('interviewiq_token', res.data.data.token);
      localStorage.setItem('interviewiq_user', JSON.stringify(res.data.data.user));
    }
    return res.data.data;
  },

  async getProfile() {
    const res = await api.get('/users/profile');
    return res.data.data;
  },

  async updateProfile(profileData) {
    const res = await api.put('/users/profile', profileData);
    return res.data.data;
  },

  logout() {
    localStorage.removeItem('interviewiq_token');
    localStorage.removeItem('interviewiq_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('interviewiq_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
};

