import client from './client';

export const getCustomers = () => client.get('/customers');
export const getCustomer = (id) => client.get(`/customers/${id}`);
export const createCustomer = (data) => client.post('/customers', data);
export const deleteCustomer = (id) => client.delete(`/customers/${id}`);
