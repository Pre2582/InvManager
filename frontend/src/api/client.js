import axios from 'axios';
import useAuthStore from '@/store/authStore';
import useToastStore from '@/store/toastStore';

const BASE_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'inv_token';

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Guard against multiple concurrent requests all firing the redirect at once.
let _sessionExpired = false;

function handleSessionExpiry() {
  if (_sessionExpired) return;
  _sessionExpired = true;

  useAuthStore.getState().logout();
  useToastStore.getState().addToast({
    type: 'error',
    message: 'Your session has expired. Please log in again.',
    duration: 5000,
  });
  // replace() removes the current page from history so Back doesn't return to a stale session
  window.location.replace('/login');
}

function tokenIsExpired(token) {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// ── Request interceptor ─────────────────────────────────────────────────────
// Attach the JWT; proactively expire the session before the round-trip if the
// token is already past its expiry time.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return config;

    if (tokenIsExpired(token)) {
      handleSessionExpiry();
      // Abort the outgoing request — the page is navigating away anyway.
      return Promise.reject(new Error('Session expired'));
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ────────────────────────────────────────────────────
// Catch server-side 401s (e.g. token revoked or clock-skew expiry) and auto-
// logout, except on the auth endpoints themselves where 401 = wrong password.
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      handleSessionExpiry();
      return Promise.reject(new Error('Session expired'));
    }

    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
