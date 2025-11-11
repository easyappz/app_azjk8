import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import * as authApi from '../api/auth';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: false,
  loginWithToken: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistAuth = useCallback((newToken, newUser) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    }
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    }
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const fetchMe = useCallback(async () => {
    const res = await authApi.me();
    const data = res?.data;
    const me = data?.user || data;
    if (!me) throw new Error('Invalid me response');
    setUser(me);
    localStorage.setItem('user', JSON.stringify(me));
    return me;
  }, []);

  const loginWithToken = useCallback(async (providedToken) => {
    setLoading(true);
    try {
      if (!providedToken) throw new Error('Токен не задан');
      persistAuth(providedToken, null);
      const me = await fetchMe();
      message.success('Вход выполнен');
      return { token: providedToken, user: me };
    } catch (e) {
      clearAuth();
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fetchMe, persistAuth, clearAuth]);

  const register = useCallback(async ({ username, email, password }) => {
    setLoading(true);
    try {
      const res = await authApi.register({ username, email, password });
      const { token: receivedToken, user: receivedUser } = res.data || {};
      if (!receivedToken) {
        throw new Error('Сервер не вернул токен');
      }
      if (receivedUser) {
        persistAuth(receivedToken, receivedUser);
        message.success('Регистрация успешна');
        return { token: receivedToken, user: receivedUser };
      }
      persistAuth(receivedToken, null);
      const me = await fetchMe();
      message.success('Регистрация успешна');
      return { token: receivedToken, user: me };
    } finally {
      setLoading(false);
    }
  }, [fetchMe, persistAuth]);

  const logout = useCallback(() => {
    clearAuth();
    message.info('Вы вышли из аккаунта');
  }, [clearAuth]);

  useEffect(() => {
    let isMounted = true;
    const bootstrap = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && isMounted) {
          setToken(storedToken);
          if (storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch { /* ignore */ }
          }
          try {
            await fetchMe();
          } catch (e) {
            clearAuth();
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    bootstrap();
    return () => { isMounted = false; };
  }, [fetchMe, clearAuth]);

  const value = useMemo(() => ({ user, token, loginWithToken, register, logout, loading }), [user, token, loginWithToken, register, logout, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
