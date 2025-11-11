import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Typography, Space, Button, Popconfirm, Tag, Spin, Alert, message } from 'antd';
import { HeartOutlined, HeartFilled, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchAd, deleteAd, addFavorite, removeFavorite, approveAd, rejectAd } from '../api/ads';
import { getMe } from '../api/auth';

const { Title, Paragraph, Text } = Typography;

function AdDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStaff, setIsStaff] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);

  const loadAd = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [adData, meData] = await Promise.all([
        fetchAd(id),
        (async () => {
          if (!token) return null;
          try {
            const data = await getMe();
            return data;
          } catch (e) {
            return null;
          }
        })(),
      ]);
      setAd(adData);
      const maybeStaff = (meData && (meData.user?.is_staff === true)) ? true : false;
      setIsStaff(maybeStaff);
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || 'Ошибка загрузки объявления';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    loadAd();
  }, [loadAd]);

  const priceText = useMemo(() => {
    if (!ad) return '';
    try {
      return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(ad.price);
    } catch (_) {
      return `${ad.price} ₽`;
    }
  }, [ad]);

  const showStatus = useMemo(() => {
    if (!ad) return false;
    return ad.is_owner || isStaff;
  }, [ad, isStaff]);

  const onToggleFavorite = async () => {
    if (!ad) return;
    if (!token) {
      message.error('Требуется авторизация для добавления в избранное');
      return;
    }
    setActionLoading(true);
    try {
      let data;
      if (ad.is_favorited) {
        data = await removeFavorite(ad.id);
      } else {
        data = await addFavorite(ad.id);
      }
      setAd((prev) => ({ ...(prev || {}), ...data }));
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || 'Не удалось изменить избранное';
      message.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const onDelete = async () => {
    if (!ad) return;
    setActionLoading(true);
    try {
      await deleteAd(ad.id);
      message.success('Объявление удалено');
      navigate('/');
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || 'Не удалось удалить объявление';
      message.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const onApprove = async () => {
    if (!ad) return;
    setActionLoading(true);
    try {
      const updated = await approveAd(ad.id);
      setAd(updated);
      message.success('Объявление одобрено');
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || 'Не удалось одобрить объявление';
      message.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const onReject = async () => {
    if (!ad) return;
    setActionLoading(true);
    try {
      const updated = await rejectAd(ad.id);
      setAd(updated);
      message.success('Объявление отклонено');
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || 'Не удалось отклонить объявление';
      message.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div data-easytag="id1-src/pages/AdDetailPage.jsx" style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div data-easytag="id1-src/pages/AdDetailPage.jsx" style={{ maxWidth: 920, margin: '0 auto', padding: 24 }}>
        <Alert type="error" message="Ошибка" description={error} />
      </div>
    );
  }

  if (!ad) {
    return (
      <div data-easytag="id1-src/pages/AdDetailPage.jsx" style={{ maxWidth: 920, margin: '0 auto', padding: 24 }}>
        <Alert type="warning" message="Объявление не найдено" />
      </div>
    );
  }

  return (
    <div data-easytag="id1-src/pages/AdDetailPage.jsx" style={{ maxWidth: 920, margin: '0 auto', padding: 24 }}>
      <Card
        title={
          <Space align="center" size={12}>
            <Title level={3} style={{ margin: 0 }}>{ad.title}</Title>
            {showStatus && (
              ad.is_approved ? (
                <Tag color="green" data-easytag="id7-src/pages/AdDetailPage.jsx">Одобрено</Tag>
              ) : (
                <Tag color="orange" data-easytag="id8-src/pages/AdDetailPage.jsx">Не одобрено</Tag>
              )
            )}
          </Space>
        }
        extra={
          <Space>
            <Button
              data-easytag="id2-src/pages/AdDetailPage.jsx"
              type={ad.is_favorited ? 'primary' : 'default'}
              icon={ad.is_favorited ? <HeartFilled /> : <HeartOutlined />}
              onClick={onToggleFavorite}
              loading={actionLoading}
            >
              {ad.favorites_count}
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Title level={4} style={{ marginTop: 0 }}>{priceText}</Title>
          <div style={{ minHeight: 160, background: '#fafafa', border: '1px dashed #e8e8e8', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text type="secondary">Тут будет изображение (пусто)</Text>
          </div>
          <div>
            <Title level={5} style={{ marginBottom: 8 }}>Описание</Title>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{ad.description}</Paragraph>
          </div>
          <div>
            <Space size={24} wrap>
              <Text><Text type="secondary">Продавец:</Text> {ad.owner?.username}</Text>
              <Text>
                <Text type="secondary">Создано:</Text> {dayjs(ad.created_at).format('DD.MM.YYYY HH:mm')}
              </Text>
            </Space>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <Space wrap>
              {ad.is_owner && (
                <>
                  <Button
                    data-easytag="id3-src/pages/AdDetailPage.jsx"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/ads/${ad.id}/edit`)}
                  >
                    Редактировать
                  </Button>
                  <Popconfirm
                    title="Удалить объявление?"
                    description="Действие необратимо"
                    okText="Удалить"
                    cancelText="Отмена"
                    onConfirm={onDelete}
                  >
                    <Button
                      data-easytag="id4-src/pages/AdDetailPage.jsx"
                      danger
                      icon={<DeleteOutlined />}
                      loading={actionLoading}
                    >
                      Удалить
                    </Button>
                  </Popconfirm>
                </>
              )}
            </Space>

            <Space wrap>
              {isStaff && !ad.is_approved && (
                <>
                  <Button
                    data-easytag="id5-src/pages/AdDetailPage.jsx"
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={onApprove}
                    loading={actionLoading}
                  >
                    Одобрить
                  </Button>
                  <Button
                    data-easytag="id6-src/pages/AdDetailPage.jsx"
                    danger
                    icon={<CloseOutlined />}
                    onClick={onReject}
                    loading={actionLoading}
                  >
                    Отклонить
                  </Button>
                </>
              )}
            </Space>
          </div>
        </Space>
      </Card>
    </div>
  );
}

export default AdDetailPage;
