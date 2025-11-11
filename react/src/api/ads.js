import api from './axios';

export async function fetchAd(id) {
  const res = await api.get(`/ads/${id}/`);
  return res.data;
}

export async function deleteAd(id) {
  await api.delete(`/ads/${id}/`);
}

export async function addFavorite(id) {
  const res = await api.post(`/ads/${id}/favorite/`);
  return res.data; // { is_favorited, favorites_count }
}

export async function removeFavorite(id) {
  const res = await api.delete(`/ads/${id}/favorite/`);
  return res.data; // { is_favorited, favorites_count }
}

export async function approveAd(id) {
  const res = await api.post(`/ads/${id}/approve/`);
  return res.data;
}

export async function rejectAd(id) {
  const res = await api.post(`/ads/${id}/reject/`);
  return res.data;
}
