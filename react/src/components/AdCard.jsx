import React, { useMemo, useState } from 'react';
import { Card, Tooltip, Typography, message } from 'antd';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { addFavorite, removeFavorite } from '../api/ads';

const { Text } = Typography;

function formatPrice(price) {
  if (typeof price !== 'number') return '';
  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  } catch (e) {
    return `${price} ₽`;
  }
}

export default function AdCard({ ad }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isAuthenticated = Boolean(token);

  const [isFavorited, setIsFavorited] = useState(Boolean(ad?.is_favorited));
  const [favCount, setFavCount] = useState(typeof ad?.favorites_count === 'number' ? ad.favorites_count : 0);
  const [loading, setLoading] = useState(false);

  const createdAt = useMemo(() => {
    if (!ad?.created_at) return '';
    return dayjs(ad.created_at).format('DD.MM.YYYY HH:mm');
  }, [ad]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      message.info('Необходимо войти, чтобы добавить в избранное');
      return;
    }
    if (!ad?.id) return;
    try {
      setLoading(true);
      const res = isFavorited ? await removeFavorite(ad.id) : await addFavorite(ad.id);
      if (res && typeof res.is_favorited === 'boolean') {
        setIsFavorited(res.is_favorited);
      }
      if (res && typeof res.favorites_count === 'number') {
        setFavCount(res.favorites_count);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.detail || 'Ошибка изменения избранного';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const heartIcon = isFavorited ? (
    <HeartFilled style={{ color: '#ff4d4f' }} />
  ) : (
    <HeartOutlined />
  );

  return (
    <div data-easytag="id1-src/components/AdCard.jsx">
      <Card
        hoverable
        title={ad?.title || 'Без названия'}
        size="small"
        extra={
          <Tooltip title={isAuthenticated ? (isFavorited ? 'Убрать из избранного' : 'В избранное') : 'Войдите, чтобы использовать избранное'}>
            <span
              role="button"
              aria-label="favorite-toggle"
              onClick={handleToggleFavorite}
              style={{ cursor: isAuthenticated ? 'pointer' : 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              data-easytag="id2-src/components/AdCard.jsx"
            >
              {heartIcon}
              <Text type="secondary">{favCount}</Text>
            </span>
          </Tooltip>
        }
        loading={loading}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <Text strong>Цена: </Text>
            <Text>{formatPrice(ad?.price)}</Text>
          </div>
          <div>
            <Text type="secondary">Размещено: {createdAt}</Text>
          </div>
        </div>
      </Card>
    </div>
  );
}
