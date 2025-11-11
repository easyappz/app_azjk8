import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button, Card, Descriptions, Space, Spin, Tag, Popconfirm, message } from 'antd';
import { HeartFilled, HeartOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import * as adsApi from '../api/ads';
import { formatCurrency, getErrorMessage } from '../utils/format';
import { useAuth } from '../context/AuthContext';

function AdDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ad, setAd] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adsApi.retrieve(id);
      setAd(res.data);
    } catch (e) {
      const msg = getErrorMessage(e);
      if (msg) message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const toggleFavorite = async () => {
    if (!token) {
      message.warning('Требуется авторизация');
      navigate('/');
      return;
    }
    if (!ad) return;
    const optimistic = !ad.is_favorited;
    setAd({ ...ad, is_favorited: optimistic, favorites_count: (ad.favorites_count || 0) + (optimistic ? 1 : -1) });
    try {
      if (optimistic) await adsApi.favoriteAdd(ad.id); else await adsApi.favoriteRemove(ad.id);
    } catch (e) {
      setAd({ ...ad, is_favorited: !optimistic, favorites_count: (ad.favorites_count || 0) + (optimistic ? -1 : 1) });
    }
  };

  const onDelete = async () => {
    if (!ad) return;
    setSaving(true);
    try {
      await adsApi.destroy(ad.id);
      message.success('Объявление удалено');
      navigate('/');
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const onApprove = async () => {
    if (!ad) return;
    setSaving(true);
    try {
      await adsApi.approve(ad.id);
      message.success('Объявление одобрено');
      await load();
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const onReject = async () => {
    if (!ad) return;
    setSaving(true);
    try {
      await adsApi.reject(ad.id);
      message.success('Объявление отклонено');
      await load();
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin />;
  if (!ad) return null;

  const canEdit = ad.is_owner === true;
  const canModerate = user && user.is_staff === true; // will show only if backend provides this flag

  return (
    <div data-easytag="id11-src/pages/AdDetailPage.js">
      <Card
        title={ad.title}
        extra={
          <Space>
            <Button
              type={ad.is_favorited ? 'primary' : 'default'}
              icon={ad.is_favorited ? <HeartFilled /> : <HeartOutlined />}
              onClick={toggleFavorite}
            >{ad.is_favorited ? 'В избранном' : 'В избранное'}</Button>
            {canEdit && (
              <>
                <Link to={`/ads/${ad.id}/edit`}>
                  <Button icon={<EditOutlined />} data-easytag="id12-src/pages/AdDetailPage.js">Редактировать</Button>
                </Link>
                <Popconfirm title="Удалить объявление?" okText="Удалить" cancelText="Отмена" onConfirm={onDelete}>
                  <Button danger icon={<DeleteOutlined />} loading={saving}>Удалить</Button>
                </Popconfirm>
              </>
            )}
            {canModerate && (
              <>
                <Button icon={<CheckOutlined />} onClick={onApprove} loading={saving}>Одобрить</Button>
                <Button icon={<CloseOutlined />} danger onClick={onReject} loading={saving}>Отклонить</Button>
              </>
            )}
          </Space>
        }
      >
        {!ad.is_approved && <Tag color="orange">На модерации</Tag>}
        <Descriptions column={1} style={{ marginTop: 12 }}>
          <Descriptions.Item label="Описание">{ad.description}</Descriptions.Item>
          <Descriptions.Item label="Цена">{formatCurrency(ad.price)}</Descriptions.Item>
          <Descriptions.Item label="Избранное">{ad.favorites_count || 0}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}

export default AdDetailPage;
