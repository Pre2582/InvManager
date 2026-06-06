import { create } from 'zustand';
import * as authApi from '@/api/auth';

const TOKEN_KEY         = 'inv_token';
const REFRESH_TOKEN_KEY = 'inv_refresh_token';

function parseToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function isExpired(token) {
  const payload = parseToken(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now();
}

const storedToken = localStorage.getItem(TOKEN_KEY);
const validToken  = storedToken && !isExpired(storedToken) ? storedToken : null;
if (storedToken && !validToken) {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

const useAuthStore = create((set) => ({
  token:    validToken,
  username: validToken ? (parseToken(validToken)?.sub      ?? null)  : null,
  isAdmin:  validToken ? (parseToken(validToken)?.is_admin ?? false) : false,

  login: async (username, password) => {
    const { access_token, refresh_token } = await authApi.login({ username, password });
    localStorage.setItem(TOKEN_KEY,         access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    const payload = parseToken(access_token);
    set({ token: access_token, username: payload?.sub ?? username, isAdmin: payload?.is_admin ?? false });
  },

  signup: async (username, email, password) => {
    await authApi.signup({ username, email, password });
    const { access_token, refresh_token } = await authApi.login({ username, password });
    localStorage.setItem(TOKEN_KEY,         access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    const payload = parseToken(access_token);
    set({ token: access_token, username: payload?.sub ?? username, isAdmin: payload?.is_admin ?? false });
  },

  // Called by the Axios interceptor after a silent token refresh.
  setAccessToken: (access_token, refresh_token) => {
    localStorage.setItem(TOKEN_KEY, access_token);
    if (refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    const payload = parseToken(access_token);
    set({ token: access_token, username: payload?.sub ?? null, isAdmin: payload?.is_admin ?? false });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    set({ token: null, username: null, isAdmin: false });
  },
}));

export { REFRESH_TOKEN_KEY };
export default useAuthStore;
