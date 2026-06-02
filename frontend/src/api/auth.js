import client from './client';

/**
 * Log in a user with username/email and password.
 * @param {{ username, password }} credentials
 */
export const login = (credentials) => client.post('/auth/login', credentials);

/**
 * Register a new user in the system.
 * @param {{ username, email, password }} data
 */
export const signup = (data) => client.post('/auth/signup', data);
