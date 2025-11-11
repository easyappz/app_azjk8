import React, { useMemo, useState } from 'react';
import { Layout, Menu, Button, Modal, Form, Input, Space, Typography } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/format';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, register, loginWithToken, loading } = useAuth();

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const selectedKey = useMemo(() => {
    if (location.pathname === '/') return 'home';
    if (location.pathname.startsWith('/create')) return 'create';
    if (location.pathname.startsWith('/profile')) return 'profile';
    return '';
  }, [location.pathname]);

  const onLoginSubmit = async () => {
    try {
      setSubmitting(true);
      const { token } = await loginForm.validateFields();
      await loginWithToken(token.trim());
      setLoginOpen(false);
      loginForm.resetFields();
      navigate('/profile');
    } catch (e) {
      // error already handled in context where appropriate
    } finally {
      setSubmitting(false);
    }
  };

  const onRegisterSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await registerForm.validateFields();
      await register(values);
      setRegisterOpen(false);
      registerForm.resetFields();
      navigate('/profile');
    } catch (e) {
      const msg = getErrorMessage(e);
      if (msg) {
        // message shown by axios interceptor or component, keep silent here
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }} data-easytag="id1-src/components/AppLayout.js">
      <Header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          <Title level={4} style={{ color: 'white', margin: 0 }}>Объявления</Title>
        </Link>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          style={{ flex: 1 }}
          items={[
            { key: 'home', label: <Link to="/">Главная</Link> },
            { key: 'create', label: <Link to="/create">Создать объявление</Link> },
            { key: 'profile', label: <Link to="/profile">Личный кабинет</Link> },
          ]}
        />
        {user ? (
          <Space>
            <Text style={{ color: 'white' }}>Привет, {user.username}</Text>
            <Button onClick={logout} loading={loading} data-easytag="id2-src/components/AppLayout.js">Выйти</Button>
          </Space>
        ) : (
          <Space>
            <Button onClick={() => setLoginOpen(true)} data-easytag="id3-src/components/AppLayout.js">Войти</Button>
            <Button type="primary" onClick={() => setRegisterOpen(true)} data-easytag="id4-src/components/AppLayout.js">Регистрация</Button>
          </Space>
        )}
      </Header>
      <Content style={{ padding: 24 }}>
        {children}
      </Content>
      <Footer style={{ textAlign: 'center' }}>Сайт объявлений • React + Django</Footer>

      <Modal
        title="Вход"
        open={loginOpen}
        onOk={onLoginSubmit}
        onCancel={() => setLoginOpen(false)}
        confirmLoading={submitting}
        okText="Войти"
        cancelText="Отмена"
        destroyOnClose
      >
        <Form layout="vertical" form={loginForm} name="loginForm">
          <Form.Item label="Токен" name="token" rules={[{ required: true, message: 'Введите токен' }]}>
            <Input placeholder="Вставьте ваш токен" disabled={submitting} data-easytag="id5-src/components/AppLayout.js" />
          </Form.Item>
          <Text type="secondary">У вас ещё нет токена? Зарегистрируйтесь — система выдаст токен автоматически.</Text>
        </Form>
      </Modal>

      <Modal
        title="Регистрация"
        open={registerOpen}
        onOk={onRegisterSubmit}
        onCancel={() => setRegisterOpen(false)}
        confirmLoading={submitting}
        okText="Зарегистрироваться"
        cancelText="Отмена"
        destroyOnClose
      >
        <Form layout="vertical" form={registerForm} name="registerForm">
          <Form.Item label="Имя пользователя" name="username" rules={[{ required: true, message: 'Введите имя пользователя' }]}>
            <Input placeholder="Например: ivan" disabled={submitting} data-easytag="id6-src/components/AppLayout.js" />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Некорректный email' }]}>
            <Input placeholder="example@mail.ru" disabled={submitting} data-easytag="id7-src/components/AppLayout.js" />
          </Form.Item>
          <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }, { min: 6, message: 'Минимум 6 символов' }]}>
            <Input.Password placeholder="Введите пароль" disabled={submitting} data-easytag="id8-src/components/AppLayout.js" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default AppLayout;
