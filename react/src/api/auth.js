import api from './axios';

export async function getMe() {
  const res = await api.get('/me/');
  return res.data; // { user: { id, username, ...maybe is_staff } }
}
