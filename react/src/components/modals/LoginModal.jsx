import React, { useState } from 'react';
import { Modal, Form, Input, Button, Alert } from 'antd';
import { useAuth } from '../../context/AuthContext';

function LoginModal({ open, onClose }) {
  const { login } = useAuth();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleOk = async () => {
    try {
      setError('');
      const values = await form.validateFields();
      setSubmitting(true);
      await login({ username: values.username, password: values.password });
      onClose();
      form.resetFields();
    } catch (e) {
      if (e && e.response && e.response.data) {
        setError(typeof e.response.data === 'string' ? e.response.data : JSON.stringify(e.response.data));
      } else if (e && e.message) {
        setError(e.message);
      } else {
        setError('Не удалось выполнить вход.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Войти" onOk={handleOk} onCancel={onClose} okText="Войти" cancelText="Отмена" confirmLoading={submitting} destroyOnClose>
      {error ? <Alert type="error" message={error} style={{ marginBottom: 12 }} /> : null}
      <Form form={form} layout="vertical" name="login_form" preserve={false}>
        <Form.Item label="Имя пользователя" name="username" rules={[{ required: true, message: 'Введите имя пользователя' }]}>
          <Input autoComplete="username" placeholder="username" data-easytag="id1-src/components/modals/LoginModal.jsx" />
        </Form.Item>
        <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
          <Input.Password autoComplete="current-password" placeholder="••••••" data-easytag="id2-src/components/modals/LoginModal.jsx" />
        </Form.Item>
      </Form>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button type="primary" onClick={handleOk} loading={submitting}>Войти</Button>
      </div>
    </Modal>
  );
}

export default LoginModal;
