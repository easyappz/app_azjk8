import api from './axios';

// GET /api/ads/
export async function listAds(params) {
  const query = {
    q: params?.q || undefined,
    min_price: params?.min_price ?? undefined,
    max_price: params?.max_price ?? undefined,
    ordering: params?.ordering || undefined,
    page: params?.page || undefined,
  };
  const res = await api.get('/ads/', { params: query });
  return res.data;
}

// POST /api/ads/:id/favorite/
export async function addFavorite(adId) {
  const res = await api.post(`/ads/${adId}/favorite/`);
  return res.data;
}

// DELETE /api/ads/:id/favorite/
export async function removeFavorite(adId) {
  const res = await api.delete(`/ads/${adId}/favorite/`);
  return res.data;
}
