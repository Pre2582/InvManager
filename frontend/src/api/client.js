import axios from 'axios';
import useAuthStore, { REFRESH_TOKEN_KEY } from '@/store/authStore';
import useToastStore from '@/store/toastStore';

const BASE_URL  = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'inv_token';

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Session expiry (called only when refresh itself fails) ──────────────────
let _sessionExpired = false;

function handleSessionExpiry() {
  if (_sessionExpired) return;
  _sessionExpired = true;

  useAuthStore.getState().logout();
  useToastStore.getState().addToast({
    type:     'error',
    message:  'Your session has expired. Please log in again.',
    duration: 5000,
  });
  window.location.replace('/login');
}

// ── Silent token refresh ────────────────────────────────────────────────────
// Use a raw axios instance so the refresh call never goes through our
// interceptors (avoids infinite retry loops and circular module issues).
const refreshClient = axios.create({ baseURL: `${BASE_URL}/api/v1` });

let isRefreshing  = false;
let refreshQueue  = []; // [{resolve, reject}]

function drainQueue(error, token = null) {
  refreshQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  refreshQueue = [];
}

async function silentRefresh() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) throw new Error('No refresh token available.');

  const { data } = await refreshClient.post('/auth/refresh', { refresh_token: refreshToken });
  // Persist new tokens and update Zustand store
  useAuthStore.getState().setAccessToken(data.access_token, data.refresh_token);
  return data.access_token;
}

// ── Request interceptor — attach access token ───────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — refresh on 401, propagate other errors ───────────
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original      = error.config;
    const isAuthRoute   = original?.url?.includes('/auth/');
    const is401         = error.response?.status === 401;

    if (is401 && !isAuthRoute && !original._retried) {
      // If another request is already refreshing, queue this one.
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      original._retried = true;
      isRefreshing = true;

      try {
        const newToken = await silentRefresh();
        original.headers.Authorization = `Bearer ${newToken}`;
        drainQueue(null, newToken);
        return apiClient(original);
      } catch (refreshError) {
        drainQueue(refreshError);
        handleSessionExpiry();
        return Promise.reject(new Error('Session expired'));
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      error.response?.data?.detail  ||
      error.response?.data?.message ||
      error.message                 ||
      'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
