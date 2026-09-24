import api from './api';
import { leadApi } from './leadApi';
import { campaignApi } from './campaignApi';

export const auditApi = {
  auditUrl: (url) => api.post('/audit', { url })
};

export const outreachApi = {
  getOutreaches: (params) => api.get('/outreach', { params }),
  createOutreach: (data) => api.post('/outreach', data),
  updateOutreach: (id, data) => api.patch(`/outreach/${id}`, data)
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats')
};

export const settingsApi = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.patch('/settings', data),
  triggerSeed: () => api.post('/settings/seed')
};

export const logsApi = {
  getLogs: (params) => api.get('/logs', { params }),
  clearLogs: () => api.delete('/logs')
};

export { leadApi, campaignApi };
