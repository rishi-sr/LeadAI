import api from './api';

export const leadApi = {
  getLeads: (params) => api.get('/leads', { params }),
  getLeadById: (id) => api.get(`/leads/${id}`),
  updateLead: (id, data) => api.patch(`/leads/${id}`, data),
  addNote: (id, text) => api.post(`/leads/${id}/notes`, { text }),
  analyzeLead: (id, data = {}) => api.post(`/leads/${id}/analyze`, data),
  generatePitch: (id) => api.post(`/leads/${id}/generate-pitch`),
  bulkUpdateStage: (leadIds, stage) => api.post('/leads/bulk-stage', { leadIds, stage }),
  deleteLead: (id) => api.delete(`/leads/${id}`),
  exportLeads: (params) => {
    return api.get('/leads/export', {
      params,
      responseType: 'blob'
    });
  }
};
