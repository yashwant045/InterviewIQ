import api from './api';

export const interviewService = {
  async createInterview(data) {
    const res = await api.post('/interviews', data);
    return res.data.data;
  },

  async getInterviews() {
    const res = await api.get('/interviews');
    return res.data.data;
  },

  async getInterviewDetails(id) {
    const res = await api.get(`/interviews/${id}`);
    return res.data.data;
  },

  async startInterview(id) {
    const res = await api.post(`/interviews/${id}/start`);
    return res.data.data;
  },

  async submitAnswer(id, data) {
    const res = await api.post(`/interviews/${id}/answer`, data);
    return res.data.data;
  },

  async getReport(id) {
    const res = await api.get(`/interviews/${id}/report`);
    return res.data.data;
  },

  async getDashboardAnalytics() {
    const res = await api.get('/analytics/dashboard');
    return res.data.data;
  },

  async uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async getLatestResume() {
    const res = await api.get('/resumes/latest');
    return res.data.data;
  },
};

