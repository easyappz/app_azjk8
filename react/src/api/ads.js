import api from './axios';

export function list(params = {}) {
  return api.get('/ads/', { params });
}

export function retrieve(id) {
  return api.get(`/ads/${id}/`);
}

export function create(payload) {
  return api.post('/ads/', payload);
}

export function update(id, payload) {
  return api.put(`/ads/${id}/`, payload);
}

export function partialUpdate(id, payload) {
  return api.patch(`/ads/${id}/`, payload);
}

export function destroy(id) {
  return api.delete(`/ads/${id}/`);
}

export function mine() {
  return api.get('/ads/mine/');
}

export function favorites() {
  return api.get('/ads/favorites/');
}

export function favoriteAdd(id) {
  return api.post(`/ads/${id}/favorite/`);
}

export function favoriteRemove(id) {
  return api.delete(`/ads/${id}/favorite/`);
}

export function approve(id) {
  return api.post(`/ads/${id}/approve/`);
}

export function reject(id) {
  return api.post(`/ads/${id}/reject/`);
}
