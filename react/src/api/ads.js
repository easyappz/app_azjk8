import api from './axios';

export async function getMyAds(page = 1) {
  const params = {};
  if (page && page > 1) params.page = page;
  const { data } = await api.get('/ads/mine/', { params });
  return data;
}

export async function getFavoriteAds(page = 1) {
  const params = {};
  if (page && page > 1) params.page = page;
  const { data } = await api.get('/ads/favorites/', { params });
  return data;
}

export async function deleteAd(id) {
  if (!id) throw new Error('Missing ad id');
  await api.delete(`/ads/${id}/`);
}

export async function removeFavorite(id) {
  if (!id) throw new Error('Missing ad id');
  const { data } = await api.delete(`/ads/${id}/favorite/`);
  return data;
}
