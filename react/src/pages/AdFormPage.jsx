import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Button, Space, Typography, message, Spin } from 'antd';
import { createAd, getAd, updateAd } from '../api/ads';

const { Title, Text } = Typography;

function extractApiError(error) {
  if (error && error.response) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
      try {
        const parts = [];
        Object.keys(data).forEach((key) => {
          const value = data[key];
          if (Array.isArray(value)) {
            parts.push(value.join(' '));
          } else if (typeof value === 'string') {
            parts.push(value);
          } else if (value && typeof value === 'object') {
            parts.push(JSON.stringify(value));
          }
        });
        if (parts.length > 0) return parts.join(' ');
      } catch (_) {
        // no-op
      }
    }
    if (error.response.status === 401) return 'Для выполнения действия требуется авторизация.';
    if (error.response.status === 403) return 'Недостаточно прав для выполнения действия.';
  }
  return error?.message || 'Произошла ошибка. Попробуйте ещё раз.';
}

export default function AdFormPage() {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = useMemo(() => Boolean(id), [id]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [isOwner, setIsOwner] = useState(true);

  // Load ad data for edit mode
  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!isEdit) return;
      setLoading(true);
      try {
        const { data } = await getAd(id);
        if (!isMounted) return;
        setIsOwner(Boolean(data?.is_owner));
        if (!data?.is_owner) {
          message.warning('У вас нет прав на редактирование этого объявления.');
          navigate(`/ads/${id}`);
          return;
        }
        form.setFieldsValue({
          title: data?.title || '',
          description: data?.description || '',
          price: typeof data?.price === 'number' ? data.price : 0,
        });
      } catch (error) {
        const msg = extractApiError(error);
        message.error(msg);
        if (error?.response?.status === 401) {
          navigate('/login');
        } else if (error?.response?.status === 404) {
          navigate('/');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [id, isEdit, form, navigate]);

  const onFinish = async (values) => {
    const payload = {
      title: values.title,
      description: values.description,
      price: Number(values.price),
    };
    setSubmitting(true);
    try {
      if (isEdit) {
        if (!isOwner) {
          message.error('Недостаточно прав для редактирования.');
          return;
        }
        const { data } = await updateAd(id, payload);
        message.success('Изменения сохранены.');
        navigate(`/ads/${data.id}`);
      } else {
        const { data } = await createAd(payload);
        message.success('Объявление отправлено на модерацию.');
        navigate(`/ads/${data.id}`);
      }
    } catch (error) {
      const msg = extractApiError(error);
      message.error(msg);
      if (error?.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const titleText = isEdit ? 'Редактировать объявление' : 'Создать объявление';
  const submitText = isEdit ? 'Сохранить' : 'Создать';

  return (
    <div data-easytag="id1-src/pages/AdFormPage.jsx" style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Title level={3} style={{ margin: 0 }}>{titleText}</Title>
          {isEdit && !isOwner && (
            <Text type="danger">У вас нет прав для редактирования этого объявления.</Text>
          )}
          <Spin spinning={loading}>
            <Form
              data-easytag="id2-src/pages/AdFormPage.jsx"
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                title: '',
                description: '',
                price: 0,
              }}
            >
              <Form.Item
                label="Заголовок"
                name="title"
                rules={[{ required: true, message: 'Введите заголовок' }]}
              >
                <Input placeholder="Введите заголовок" maxLength={200} />
              </Form.Item>

              <Form.Item
                label="Описание"
                name="description"
                rules={[{ required: true, message: 'Введите описание' }]}
              >
                <Input.TextArea placeholder="Введите описание" rows={6} />
              </Form.Item>

              <Form.Item
                label="Цена"
                name="price"
                rules={[{ required: true, message: 'Укажите цену' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={1} placeholder="0" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button type="primary" htmlType="submit" loading={submitting} disabled={loading}>
                    {submitText}
                  </Button>
                  <Button onClick={() => navigate(-1)} disabled={submitting}>Отмена</Button>
                </Space>
              </Form.Item>
            </Form>
          </Spin>
        </Space>
      </Card>
    </div>
  );
}
