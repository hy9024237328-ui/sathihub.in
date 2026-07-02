import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API = '/api/v1';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CACHED_USER_KEY = 'cached_user';

export const authAxios = axios.create({ timeout: 15000 });
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => { if (error) reject(error); else resolve(token); });
  refreshQueue = [];
};

authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

authAxios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return Promise.reject(error);
      if (isRefreshing) {
        return new Promise((resolve, reject) => { refreshQueue.push({ resolve, reject }); })
          .then((newToken) => { original.headers.Authorization = `Bearer ${newToken}`; return authAxios(original); });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const res = await axios.post(`${API}/auth/refresh`, { refresh_token: refreshToken });
        const newAccessToken = res.data.data.access_token;
        localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
        authAxios.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return authAxios(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(CACHED_USER_KEY);
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      } finally { isRefreshing = false; }
    }
    return Promise.reject(error);
  }
);

const mergeUserData = (data) => ({
  ...data.user, profile: data.profile || null,
  sathihub_profile: data.sathihub_profile || null, documents: data.documents || [],
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutRef = useRef(null);

  const fetchCurrentUser = useCallback(async () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!accessToken) { setLoading(false); return; }
    try {
      const response = await authAxios.get(`${API}/user/me`);
      const merged = mergeUserData(response.data.data);
      setUser(merged);
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(merged));
    } catch (error) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem(ACCESS_TOKEN_KEY); localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(CACHED_USER_KEY); setUser(null);
      } else {
        const cached = localStorage.getItem(CACHED_USER_KEY);
        if (cached) { try { setUser(JSON.parse(cached)); } catch (_) {} }
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCurrentUser(); }, [fetchCurrentUser]);
  useEffect(() => {
    const handler = () => { setUser(null); setLoading(false); };
    logoutRef.current = handler;
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = (accessToken, refreshToken, userData) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) authAxios.post(`${API}/auth/logout`, { refresh_token: refreshToken }).catch(() => {});
    localStorage.removeItem(ACCESS_TOKEN_KEY); localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(CACHED_USER_KEY); setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authAxios.get(`${API}/user/me`);
      const merged = mergeUserData(response.data.data);
      setUser(merged); localStorage.setItem(CACHED_USER_KEY, JSON.stringify(merged));
      return merged;
    } catch (_) { return user; }
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, updateUser, getAccessToken, token: localStorage.getItem(ACCESS_TOKEN_KEY) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
