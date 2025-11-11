import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Tabs, List, Button, Space, Tag, Typography, Popconfirm, message, Pagination, Row, Col, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, StarOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { getMyAds, getFavoriteAds, deleteAd, removeFavorite } from '../api/ads';

const { Text } = Typography;

function formatPrice(value) {
  if (typeof value !== 'number') return '';
  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
  } catch (_) {
    return `${value} ₽`;
  }
}

function StatusTag({ approved }) {
  return approved ? <Tag color="green">Одобрено</Tag> : <Tag color="orange">На модерации</Tag>;
}

function AdRow({ item, variant, onEdit, onDelete, onUnfavorite }) {
  return (
    <div data-easytag="id3-src/pages/ProfilePage.jsx">
      <List.Item
        actions={
          variant === 'mine'
            ? [
                <Button key="edit" icon={<EditOutlined />} onClick={() => onEdit(item)}>
                  Редактировать
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Удалить объявление"
                  description="Вы уверены, что хотите удалить это объявление?"
                  okText="Да"
                  cancelText="Отмена"
                  onConfirm={() => onDelete(item)}
                >
                  <Button danger icon={<DeleteOutlined />}>Удалить</Button>
                </Popconfirm>,
              ]
            : [
                <Popconfirm
                  key="unfav"
                  title="Убрать из избранного"
                  okText="Да"
                  cancelText="Отмена"
                  onConfirm={() => onUnfavorite(item)}
                >
                  <Button icon={<StarOutlined />}>
                    Удалить из избранного
                  </Button>
                </Popconfirm>,
              ]
        }
      >
        <List.Item.Meta
          title={
            <Space size={8} wrap>
              <Link to={`/ads/${item.id}`}>{item.title}</Link>
              <StatusTag approved={item.is_approved} />
            </Space>
          }
          description={
            <Space size={16} wrap>
              <Text strong>{formatPrice(item.price)}</Text>
              <Text type="secondary">Автор: {item?.owner?.username}</Text>
            </Space>
          }
        />
      </List.Item>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();

  const [activeKey, setActiveKey] = useState('mine');

  const [mineState, setMineState] = useState({ loading: false, data: null, page: 1 });
  const [favState, setFavState] = useState({ loading: false, data: null, page: 1 });

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      window.handleRoutes(['/', '/profile', '/create']);
    }
  }, []);

  const loadMine = useCallback(async (page = 1) => {
    setMineState((s) => ({ ...s, loading: true }));
    try {
      const data = await getMyAds(page);
      setMineState({ loading: false, data, page });
    } catch (err) {
      setMineState((s) => ({ ...s, loading: false }));
      const detail = err?.response?.data?.detail;
      message.error(detail || 'Не удалось загрузить мои объявления');
    }
  }, []);

  const loadFav = useCallback(async (page = 1) => {
    setFavState((s) => ({ ...s, loading: true }));
    try {
      const data = await getFavoriteAds(page);
      setFavState({ loading: false, data, page });
    } catch (err) {
      setFavState((s) => ({ ...s, loading: false }));
      const detail = err?.response?.data?.detail;
      message.error(detail || 'Не удалось загрузить избранное');
    }
  }, []);

  useEffect(() => {
    if (activeKey === 'mine') {
      loadMine(mineState.page || 1);
    } else if (activeKey === 'favorites') {
      loadFav(favState.page || 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const onEdit = useCallback(
    (item) => {
      navigate(`/ads/${item.id}/edit`);
    },
    [navigate]
  );

  const onDeleteAd = useCallback(async (item) => {
    try {
      await deleteAd(item.id);
      message.success('Объявление удалено');
      loadMine(mineState.page || 1);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      message.error(detail || 'Не удалось удалить объявление');
    }
  }, [loadMine, mineState.page]);

  const onUnfavorite = useCallback(async (item) => {
    try {
      await removeFavorite(item.id);
      message.success('Удалено из избранного');
      loadFav(favState.page || 1);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      message.error(detail || 'Не удалось удалить из избранного');
    }
  }, [loadFav, favState.page]);

  const mineList = useMemo(() => mineState.data?.results || [], [mineState.data]);
  const mineTotal = mineState.data?.count || 0;

  const favList = useMemo(() => favState.data?.results || [], [favState.data]);
  const favTotal = favState.data?.count || 0;

  const items = [
    {
      key: 'mine',
      label: 'Мои объявления',
      children: (
        <div data-easytag="id2-src/pages/ProfilePage.jsx">
          <List
            locale={{ emptyText: <Empty description="Пока нет объявлений" /> }}
            loading={mineState.loading}
            dataSource={mineList}
            renderItem={(item) => (
              <AdRow
                item={item}
                variant="mine"
                onEdit={onEdit}
                onDelete={onDeleteAd}
              />
            )}
          />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <Pagination
              current={mineState.page}
              total={mineTotal}
              pageSize={10}
              showSizeChanger={false}
              onChange={(p) => loadMine(p)}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'favorites',
      label: 'Избранное',
      children: (
        <div data-easytag="id5-src/pages/ProfilePage.jsx">
          <List
            locale={{ emptyText: <Empty description="Избранных объявлений нет" /> }}
            loading={favState.loading}
            dataSource={favList}
            renderItem={(item) => (
              <AdRow
                item={item}
                variant="favorites"
                onUnfavorite={onUnfavorite}
              />
            )}
          />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <Pagination
              current={favState.page}
              total={favTotal}
              pageSize={10}
              showSizeChanger={false}
              onChange={(p) => loadFav(p)}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }} data-easytag="id1-src/pages/ProfilePage.jsx">
      <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
        <Col flex="auto">
          <Typography.Title level={3} style={{ margin: 0 }}>
            Личный кабинет
          </Typography.Title>
        </Col>
        <Col>
          <Link to="/create" data-easytag="id4-src/pages/ProfilePage.jsx">
            <Button type="primary" icon={<PlusOutlined />}>Создать объявление</Button>
          </Link>
        </Col>
      </Row>

      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        items={items}
      />
    </div>
  );
}
