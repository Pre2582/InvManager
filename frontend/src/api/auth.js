import client from './client';

export const login        = (credentials)   => client.post('/auth/login',   credentials);
export const signup       = (data)          => client.post('/auth/signup',   data);
export const refreshToken = (refresh_token) => client.post('/auth/refresh',  { refresh_token });
