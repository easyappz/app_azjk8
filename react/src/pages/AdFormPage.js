import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import * as adsApi from '../api/ads';
import { getErrorMessage } from '../utils/format';

function AdFormPage({ mode = 'create' }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await adsApi.retrieve(id);
        form.setFieldsValue({
          title: res.data.title,
          description: res.data.description,
          price: res.data.price,
        });
      } catch (e) {
        message.error(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    };
    if (mode === 'edit' && id) load();
  }, [id, mode, form]);

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      if (mode === 'edit' && id) {
        const res = await adsApi.update(id, values);
        message.success('Объявление обновлено');
        navigate(`/ads/${res.data.id}`);
      } else {
        const res = await adsApi.create(values);
        message.success('Объявление создано и отправлено на модерацию');
        navigate(`/ads/${res.data.id}`);
      }
    } catch (e) {
      if (e?.errorFields) return; // form validation error
      message.error(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-easytag="id13-src/pages/AdFormPage.js">
      <Card title={mode === 'edit' ? 'Редактирование объявления' : 'Создание объявления'} loading={loading}>
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item label="Заголовок" name="title" rules={[{ required: true, message: 'Введите заголовок' }]}>
            <Input placeholder="Короткое и понятное название" disabled={submitting} />
          </Form.Item>
          <Form.Item label="Описание" name="description" rules={[{ required: true, message: 'Введите описание' }]}>
            <Input.TextArea rows={4} placeholder="Подробности объявления" disabled={submitting} />
          </Form.Item>
          <Form.Item label="Цена" name="price" rules={[{ required: true, message: 'Укажите цену' }]}>
            <InputNumber min={0} style={{ width: 200 }} addonAfter="₽" disabled={submitting} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} data-easytag="id14-src/pages/AdFormPage.js">
            {mode === 'edit' ? 'Сохранить' : 'Создать'}
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default AdFormPage;
