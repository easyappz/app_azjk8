import React, { useEffect, useState } from 'react';
import { Button, Card, Descriptions, Empty, List, Space, Spin, Tabs, Tag, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import * as adsApi from '../api/ads';
import { formatCurrency, getErrorMessage } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { HeartFilled, HeartOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

function ProfilePage() {
  const { user } = useAuth();
  const [loadingMine, setLoadingMine] = useState(true);
  const [loadingFav, setLoadingFav] = useState(false);
  const [mine, setMine] = useState([]);
  const [favs, setFavs] = useState([]);
  const navigate = useNavigate();

  const loadMine = async () => {
    setLoadingMine(true);
    try {
      const res = await adsApi.mine();
      setMine(res.data?.results || res.data || []);
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setLoadingMine(false);
    }
  };

  const loadFav = async () => {
    setLoadingFav(true);
    try {
      const res = await adsApi.favorites();
      setFavs(res.data?.results || res.data || []);
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setLoadingFav(false);
    }
  };

  useEffect(() => { loadMine(); }, []);

  const removeMine = async (id) => {
    try {
      await adsApi.destroy(id);
      message.success('Объявление удалено');
      await loadMine();
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const toggleFav = async (ad) => {
    const optimistic = !ad.is_favorited;
    setFavs((prev) => prev.map((i) => (i.id === ad.id ? { ...i, is_favorited: optimistic, favorites_count: i.favorites_count + (optimistic ? 1 : -1) } : i)));
    try {
      if (optimistic) await adsApi.favoriteAdd(ad.id); else await adsApi.favoriteRemove(ad.id);
    } catch (e) {
      setFavs((prev) => prev.map((i) => (i.id === ad.id ? { ...i, is_favorited: !optimistic, favorites_count: i.favorites_count + (optimistic ? -1 : 1) } : i)));
    }
  };

  return (
    <div data-easytag="id15-src/pages/ProfilePage.js">
      <Card title="Профиль" style={{ marginBottom: 16 }}>
        {user ? (
          <Descriptions column={1}>
            <Descriptions.Item label="Имя пользователя">{user.username}</Descriptions.Item>
            {user.email && <Descriptions.Item label="Email">{user.email}</Descriptions.Item>}
          </Descriptions>
        ) : (
          <Spin />
        )}
      </Card>

      <Tabs
        defaultActiveKey="mine"
        items={[
          {
            key: 'mine',
            label: 'Мои объявления',
            children: (
              loadingMine ? <Spin /> : (mine.length === 0 ? <Empty description="У вас нет объявлений" /> : (
                <List
                  dataSource={mine}
                  renderItem={(item) => (
                    <List.Item key={item.id}
                      actions={[
                        <Link key="edit" to={`/ads/${item.id}/edit`}><Button icon={<EditOutlined />}>Редактировать</Button></Link>,
                        <Button key="del" danger icon={<DeleteOutlined />} onClick={() => removeMine(item.id)}>Удалить</Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={<Link to={`/ads/${item.id}`}>{item.title}</Link>}
                        description={
                          <Space>
                            <Tag color="blue">{formatCurrency(item.price)}</Tag>
                            {!item.is_approved && <Tag color="orange">На модерации</Tag>}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ))
            ),
          },
          {
            key: 'fav',
            label: 'Избранное',
            children: (
              <>
                <div style={{ marginBottom: 12 }}>
                  <Button onClick={loadFav} loading={loadingFav}>Обновить</Button>
                </div>
                {loadingFav ? <Spin /> : (favs.length === 0 ? <Empty description="Нет избранных объявлений" /> : (
                  <List
                    dataSource={favs}
                    renderItem={(item) => (
                      <List.Item key={item.id}
                        actions={[
                          <Button key="fav" type={item.is_favorited ? 'primary' : 'default'} icon={item.is_favorited ? <HeartFilled /> : <HeartOutlined />} onClick={() => toggleFav(item)}>
                            {item.is_favorited ? 'В избранном' : 'В избранное'}
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          title={<Link to={`/ads/${item.id}`}>{item.title}</Link>}
                          description={<Tag color="blue">{formatCurrency(item.price)}</Tag>}
                        />
                      </List.Item>
                    )}
                  />
                ))}
              </>
            ),
          },
        ]}
      />

      <div style={{ marginTop: 16 }}>
        <Button type="primary" onClick={() => navigate('/create')}>Создать объявление</Button>
      </div>
    </div>
  );
}

export default ProfilePage;
