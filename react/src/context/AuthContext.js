import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

const ME_ENDPOINTS = ['auth/me/', 'me/'];
const REGISTER_ENDPOINTS = ['auth/register/', 'register/'];
const LOGIN_ENDPOINTS = ['auth/login/'];

async function trySequential(endpoints, method, payload) {
  let lastError = null;
  for (const ep of endpoints) {
    try {
      if (method === 'get') {
        return await api.get(`/${ep}`);
      }
      if (method === 'post') {
        return await api.post(`/${ep}`, payload);
      }
    } catch (err) {
      lastError = err;
      if (err?.response && (err.response.status === 404 || err.response.status === 405)) {
        continue;
      }
      throw err;
    }
  }
  if (lastError) throw lastError;
  throw new Error('No endpoint available');
}

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
    const res = await trySequential(ME_ENDPOINTS, 'get');
    const data = res?.data;
    const me = data?.user || data; // allow { user: {...} } or direct user object
    if (!me) throw new Error('Invalid me response');
    setUser(me);
    localStorage.setItem('user', JSON.stringify(me));
    return me;
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const res = await trySequential(LOGIN_ENDPOINTS, 'post', { username, password });
      const { token: receivedToken } = res.data || {};
      if (!receivedToken) {
        throw new Error('Token is missing in login response');
      }
      persistAuth(receivedToken, null);
      const me = await fetchMe();
      return { token: receivedToken, user: me };
    } finally {
      setLoading(false);
    }
  }, [fetchMe, persistAuth]);

  const register = useCallback(async ({ username, email, password }) => {
    setLoading(true);
    try {
      const res = await trySequential(REGISTER_ENDPOINTS, 'post', { username, email, password });
      const { token: receivedToken, user: receivedUser } = res.data || {};
      if (!receivedToken) {
        throw new Error('Token is missing in register response');
      }
      // Prefer server-provided user; if absent, fetch me
      if (receivedUser) {
        persistAuth(receivedToken, receivedUser);
        return { token: receivedToken, user: receivedUser };
      }
      persistAuth(receivedToken, null);
      const me = await fetchMe();
      return { token: receivedToken, user: me };
    } finally {
      setLoading(false);
    }
  }, [fetchMe, persistAuth]);

  const logout = useCallback(() => {
    clearAuth();
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
            // If token invalid, clear auth
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

  const value = useMemo(() => ({ user, token, login, register, logout, loading }), [user, token, login, register, logout, loading]);

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
