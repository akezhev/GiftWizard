import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.giftwizard.com';
const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: 30000, headers: { 'Content-Type': 'application/json' } });
apiClient.interceptors.request.use((config) => { const token = localStorage.getItem('auth_token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
apiClient.interceptors.response.use((response) => response, (error) => { if (error.response?.status === 401) { localStorage.removeItem('auth_token'); window.location.href = '/login'; } return Promise.reject(error); });

export const api = {
  generateGiftRecommendations: async (answers) => { const response = await apiClient.post('/api/quiz/generate', answers); return response.data; },
  getPopularGifts: async () => { const response = await apiClient.get('/api/gifts/popular'); return response.data; },
  getGiftDetails: async (id) => { const response = await apiClient.get(`/api/gifts/${id}`); return response.data; },
  getNearbyStores: async (lat, lon, radius = 5) => { const response = await apiClient.get('/api/marketplaces/nearby', { params: { lat, lon, radius } }); return response.data; },
  getMarketplaceOffers: async (giftIds) => { const response = await apiClient.post('/api/marketplaces/offers', { giftIds }); return response.data; },
  searchGifts: async (query, filters) => { const response = await apiClient.get('/api/search', { params: { q: query, ...filters } }); return response.data; },
  saveFavorite: async (giftId) => { const response = await apiClient.post('/api/user/favorites', { giftId }); return response.data; },
  getFavorites: async () => { const response = await apiClient.get('/api/user/favorites'); return response.data; },
};