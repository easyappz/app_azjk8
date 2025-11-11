import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Empty, Form, Input, InputNumber, List, Row, Select, Space, Spin, Tag } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import * as adsApi from '../api/ads';
import { formatCurrency, getErrorMessage } from '../utils/format';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const { token } = useAuth();

  const orderingOptions = useMemo(() => ([
    { value: 'created_at', label: 'Сначала старые' },
    { value: '-created_at', label: 'Сначала новые' },
    { value: 'price', label: 'Цена по возрастанию' },
    { value: '-price', label: 'Цена по убыванию' },
  ]), []);

  const load = async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const params = {
        q: values.q || values.search || undefined,
        min_price: values.min_price ?? undefined,
        max_price: values.max_price ?? undefined,
        ordering: values.ordering || undefined,
      };
      const res = await adsApi.list(params);
      setItems(res.data?.results || res.data || []);
    } catch (e) {
      // error surfaced by interceptor or individual messages
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // initial

  const toggleFavorite = async (ad) => {
    if (!token) {
      try { const { message } = await import('antd'); message.warning('Требуется авторизация'); } catch (_) {}
      navigate('/');
      return;
    }
    const id = ad.id;
    const optimistic = !ad.is_favorited;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_favorited: optimistic, favorites_count: i.favorites_count + (optimistic ? 1 : -1) } : i)));
    try {
      if (optimistic) await adsApi.favoriteAdd(id); else await adsApi.favoriteRemove(id);
    } catch (e) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_favorited: !optimistic, favorites_count: i.favorites_count + (optimistic ? -1 : 1) } : i)));
    }
  };

  return (
    <div data-easytag="id9-src/pages/HomePage.js">
      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical" onFinish={load}>
          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item label="Поиск" name="q">
                <Input placeholder="Заголовок или описание" allowClear />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item label="Мин. цена" name="min_price">
                <InputNumber style={{ width: '100%' }} min={0} addonAfter="₽" />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item label="Макс. цена" name="max_price">
                <InputNumber style={{ width: '100%' }} min={0} addonAfter="₽" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Сортировка" name="ordering" initialValue="-created_at">
                <Select options={orderingOptions} allowClear placeholder="Выберите сортировку" />
              </Form.Item>
            </Col>
            <Col xs={24} md={2}>
              <Form.Item label=" ">
                <Button type="primary" htmlType="submit" block loading={loading} data-easytag="id10-src/pages/HomePage.js">Применить</Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {loading ? (
        <Spin />
      ) : items && items.length > 0 ? (
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={items}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <Card
                title={<Link to={`/ads/${item.id}`}>{item.title}</Link>}
                actions={[
                  <Space key="price"><Tag color="blue">{formatCurrency(item.price)}</Tag></Space>,
                  <Button
                    key="fav"
                    type={item.is_favorited ? 'primary' : 'default'}
                    icon={item.is_favorited ? <HeartFilled /> : <HeartOutlined />}
                    onClick={() => toggleFavorite(item)}
                  >{item.is_favorited ? 'В избранном' : 'В избранное'}</Button>,
                ]}
              >
                <div style={{ minHeight: 60 }}>{item.description}</div>
                {!item.is_approved && <Tag color="orange">На модерации</Tag>}
                <div style={{ marginTop: 8, color: '#888' }}>Избранное: {item.favorites_count || 0}</div>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="Объявления не найдены" />
      )}
    </div>
  );
}

export default HomePage;
