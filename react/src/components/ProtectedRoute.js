import React from 'react';
import { Navigate } from 'react-router-dom';
import { message } from 'antd';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) return children; // defer decision until auth bootstrap finished

  if (!token) {
    try { message.warning('Требуется авторизация'); } catch (_) {}
    return <Navigate to="/" replace />;
  }
  return children;
}

export default ProtectedRoute;
