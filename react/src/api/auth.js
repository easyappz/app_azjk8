import api from './axios';

// OpenAPI: /api/register/ POST
export function register(payload) {
  return api.post('/register/', payload);
}

// OpenAPI: /api/me/ GET
export function me() {
  return api.get('/me/');
}
