import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import { registerUser, fetchMe } from '../api/auth';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshMe: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const isAuthenticated = !!token && !!user;

  const refreshMe = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchMe();
      setUser(data.user);
    } catch (e) {
      // token invalid
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    if (token && !user) {
      refreshMe();
    }
  }, [token, user, refreshMe]);

  const login = useCallback(async ({ username, password }) => {
    // Per OpenAPI provided, there is no login endpoint described.
    // We fail explicitly to comply with the contract and inform the user.
    const err = new Error('Эндпоинт входа не описан в OpenAPI. Авторизация по паролю недоступна.');
    throw err;
  }, []);

  const register = useCallback(async ({ username, email, password }) => {
    const payload = { username, email, password };
    const res = await registerUser(payload);
    if (res && res.token) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user || null);
      message.success('Регистрация прошла успешно');
    }
    return res;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    message.info('Вы вышли из аккаунта');
  }, []);

  const value = useMemo(() => ({ user, token, isAuthenticated, login, register, logout, refreshMe }), [user, token, isAuthenticated, login, register, logout, refreshMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
