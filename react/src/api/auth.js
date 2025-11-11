import api from './axios';

export async function registerUser(payload) {
  const { data } = await api.post('/register/', payload);
  return data;
}

export async function fetchMe() {
  const { data } = await api.get('/me/');
  return data;
}
