import React, { useState, useMemo } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginModal from './modals/LoginModal';
import RegisterModal from './modals/RegisterModal';
import { useAuth } from '../context/AuthContext';

const { Header, Content, Footer } = Layout;

function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith('/create') || location.pathname.startsWith('/ads/') && location.pathname.endsWith('/edit')) {
      return 'create';
    }
    if (location.pathname.startsWith('/profile')) {
      return 'profile';
    }
    return 'home';
  }, [location.pathname]);

  const onMenuClick = (e) => {
    if (e.key === 'home') {
      navigate('/');
    } else if (e.key === 'create') {
      if (!isAuthenticated) {
        setLoginOpen(true);
        return;
      }
      navigate('/create');
    } else if (e.key === 'profile') {
      if (!isAuthenticated) {
        setLoginOpen(true);
        return;
      }
      navigate('/profile');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Профиль',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Выйти',
      onClick: () => {
        logout();
        navigate('/');
      },
    },
  ];

  return (
    <Layout data-easytag="id1-src/components/AppLayout.jsx" style={{ minHeight: '100vh' }}>
      <Header style={{ position: 'sticky', top: 0, zIndex: 1000, width: '100%', display: 'flex', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontWeight: 700, marginRight: 24, cursor: 'pointer' }} onClick={() => navigate('/')}>Easy Ads</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          onClick={onMenuClick}
          items={[
            { key: 'home', label: 'Главная' },
            { key: 'create', label: 'Создать объявление' },
            { key: 'profile', label: 'Личный кабинет' },
          ]}
          style={{ flex: 1, minWidth: 0 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!isAuthenticated ? (
            <Space>
              <Button type="primary" onClick={() => setLoginOpen(true)} data-easytag="id2-src/components/AppLayout.jsx">Войти</Button>
              <Button onClick={() => setRegisterOpen(true)} data-easytag="id3-src/components/AppLayout.jsx">Зарегистрироваться</Button>
            </Space>
          ) : (
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={['click']}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <span style={{ color: '#fff' }}>{user?.username || 'Пользователь'}</span>
              </Space>
            </Dropdown>
          )}
        </div>
      </Header>
      <Content style={{ padding: 24 }}>
        <div data-easytag="id4-src/components/AppLayout.jsx" style={{ maxWidth: 1200, margin: '0 auto' }}>{children}</div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Easy Ads © {new Date().getFullYear()}</Footer>

      <LoginModal open={isLoginOpen} onClose={() => setLoginOpen(false)} />
      <RegisterModal open={isRegisterOpen} onClose={() => setRegisterOpen(false)} onRegistered={() => setLoginOpen(true)} />
    </Layout>
  );
}

export default AppLayout;
