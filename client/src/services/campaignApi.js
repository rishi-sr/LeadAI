import api from './api';

export const campaignApi = {
  createCampaign: (data) => api.post('/campaigns', data),
  getCampaigns: () => api.get('/campaigns'),
  getCampaignById: (id) => api.get(`/campaigns/${id}`),
  rerunCampaign: (id) => api.post(`/campaigns/${id}/rerun`)
};
