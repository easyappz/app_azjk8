import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, Input, InputNumber, List, Row, Select, Space, Typography, Pagination, message } from 'antd';
import AdCard from '../components/AdCard';
import { listAds } from '../api/ads';

const { Title, Text } = Typography;

const ORDERING_OPTIONS = [
  { label: 'Сначала новые', value: '-created_at' },
  { label: 'Сначала дешёвые', value: 'price' },
  { label: 'Сначала дорогие', value: '-price' },
];

const INITIAL_FILTERS = {
  q: '',
  min_price: null,
  max_price: null,
  ordering: '-created_at',
};

export default function HomePage() {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const pageSize = 10; // DRF default unless configured; used only for UI

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listAds({ ...filters, page });
      if (data && Array.isArray(data.results)) {
        setItems(data.results);
        setTotal(typeof data.count === 'number' ? data.count : data.results.length);
      } else if (Array.isArray(data)) {
        setItems(data);
        setTotal(data.length);
      } else {
        setItems([]);
        setTotal(0);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.detail || 'Не удалось загрузить объявления';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const onValuesChange = (_, all) => {
    const next = {
      q: all.q || '',
      min_price: all.min_price ?? null,
      max_price: all.max_price ?? null,
      ordering: all.ordering || '-created_at',
    };
    setFilters(next);
    setPage(1);
  };

  const handleSearch = (value) => {
    form.setFieldsValue({ q: value });
    const all = { ...form.getFieldsValue(), q: value };
    onValuesChange(null, all);
  };

  const handleReset = () => {
    form.resetFields();
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const totalLabel = useMemo(() => {
    if (!total) return null;
    return `Найдено: ${total}`;
  }, [total]);

  return (
    <div style={{ padding: 16 }} data-easytag="id1-src/pages/HomePage.jsx">
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={3} style={{ margin: 0 }}>Объявления</Title></Col>
        <Col>{totalLabel ? <Text type="secondary">{totalLabel}</Text> : null}</Col>
      </Row>

      <Form
        form={form}
        layout="inline"
        initialValues={INITIAL_FILTERS}
        onValuesChange={onValuesChange}
        style={{ marginBottom: 16 }}
      >
        <Form.Item name="q" label="">
          <Input.Search
            allowClear
            placeholder="Поиск"
            onSearch={handleSearch}
            style={{ width: 260 }}
          />
        </Form.Item>

        <Form.Item name="min_price" label="Цена от">
          <InputNumber
            min={0}
            placeholder="Минимум"
            style={{ width: 140 }}
          />
        </Form.Item>

        <Form.Item name="max_price" label="Цена до">
          <InputNumber
            min={0}
            placeholder="Максимум"
            style={{ width: 140 }}
          />
        </Form.Item>

        <Form.Item name="ordering" label="Сортировка">
          <Select options={ORDERING_OPTIONS} style={{ width: 200 }} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button onClick={handleReset}>Сброс</Button>
          </Space>
        </Form.Item>
      </Form>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }}
        dataSource={items}
        loading={loading}
        locale={{ emptyText: 'Нет объявлений' }}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <AdCard ad={item} />
          </List.Item>
        )}
      />

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <Pagination
          current={page}
          onChange={(p) => setPage(p)}
          pageSize={pageSize}
          total={total}
          showSizeChanger={false}
          showTotal={(t) => `Всего: ${t}`}
        />
      </div>
    </div>
  );
}
