import { create } from 'zustand';
import * as authApi from '@/api/auth';

const TOKEN_KEY = 'inv_token';

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
const validToken = storedToken && !isExpired(storedToken) ? storedToken : null;
if (storedToken && !validToken) localStorage.removeItem(TOKEN_KEY);

const useAuthStore = create((set) => ({
  token:    validToken,
  username: validToken ? (parseToken(validToken)?.sub     ?? null)  : null,
  isAdmin:  validToken ? (parseToken(validToken)?.is_admin ?? false) : false,

  login: async (username, password) => {
    const { access_token } = await authApi.login({ username, password });
    localStorage.setItem(TOKEN_KEY, access_token);
    const payload = parseToken(access_token);
    set({ token: access_token, username: payload?.sub ?? username, isAdmin: payload?.is_admin ?? false });
  },

  signup: async (username, email, password) => {
    await authApi.signup({ username, email, password });
    const { access_token } = await authApi.login({ username, password });
    localStorage.setItem(TOKEN_KEY, access_token);
    const payload = parseToken(access_token);
    set({ token: access_token, username: payload?.sub ?? username, isAdmin: payload?.is_admin ?? false });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, username: null, isAdmin: false });
  },
}));

export default useAuthStore;
