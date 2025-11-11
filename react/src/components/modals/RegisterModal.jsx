import React, { useState } from 'react';
import { Modal, Form, Input, Button, Alert } from 'antd';
import { useAuth } from '../../context/AuthContext';

function RegisterModal({ open, onClose, onRegistered }) {
  const { register } = useAuth();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleOk = async () => {
    try {
      setError('');
      const values = await form.validateFields();
      setSubmitting(true);
      await register({ username: values.username, email: values.email, password: values.password });
      onClose();
      form.resetFields();
      if (onRegistered) onRegistered();
    } catch (e) {
      if (e && e.response && e.response.data) {
        setError(typeof e.response.data === 'string' ? e.response.data : JSON.stringify(e.response.data));
      } else if (e && e.message) {
        setError(e.message);
      } else {
        setError('Не удалось выполнить регистрацию.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Зарегистрироваться" onOk={handleOk} onCancel={onClose} okText="Зарегистрироваться" cancelText="Отмена" confirmLoading={submitting} destroyOnClose>
      {error ? <Alert type="error" message={error} style={{ marginBottom: 12 }} /> : null}
      <Form form={form} layout="vertical" name="register_form" preserve={false}>
        <Form.Item label="Имя пользователя" name="username" rules={[{ required: true, message: 'Введите имя пользователя' }]}>
          <Input autoComplete="username" placeholder="username" data-easytag="id1-src/components/modals/RegisterModal.jsx" />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Введите корректный email' }] }>
          <Input autoComplete="email" placeholder="email@example.com" data-easytag="id2-src/components/modals/RegisterModal.jsx" />
        </Form.Item>
        <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }, { min: 6, message: 'Минимум 6 символов' }]}>
          <Input.Password autoComplete="new-password" placeholder="••••••" data-easytag="id3-src/components/modals/RegisterModal.jsx" />
        </Form.Item>
      </Form>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button type="primary" onClick={handleOk} loading={submitting}>Зарегистрироваться</Button>
      </div>
    </Modal>
  );
}

export default RegisterModal;
