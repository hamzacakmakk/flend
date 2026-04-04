import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Dashboard ──────────────────────────────────
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

// ─── Campaigns ──────────────────────────────────
export const getCampaignSuggestions = async () => {
  const response = await api.get('/campaigns/suggestions');
  return response.data;
};

// ─── Notifications ──────────────────────────────
export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

// ─── Alert Rules ────────────────────────────────
export const createAlertRule = async (ruleData) => {
  const response = await api.post('/alerts/rules', ruleData);
  return response.data;
};

export const getAlertRules = async () => {
  const response = await api.get('/alerts/rules');
  return response.data;
};

export default api;
