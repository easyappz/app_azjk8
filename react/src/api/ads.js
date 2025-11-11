import api from './axios';

// OpenAPI reference: POST /api/ads/  -> AdCreate
export function createAd(payload) {
  return api.post('/ads/', payload);
}

// OpenAPI reference: GET /api/ads/{id}/
export function getAd(id) {
  return api.get(`/ads/${id}/`);
}

// OpenAPI reference: PUT /api/ads/{id}/  -> AdCreate
export function updateAd(id, payload) {
  return api.put(`/ads/${id}/`, payload);
}
