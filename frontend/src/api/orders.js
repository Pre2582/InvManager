import client from './client';

export const getOrders = () => client.get('/orders');
export const getOrder = (id) => client.get(`/orders/${id}`);
export const createOrder = (data) => client.post('/orders', data);
export const cancelOrder = (id) => client.delete(`/orders/${id}`);
export const updateOrderStatus = (id, status) => client.patch(`/orders/${id}/status`, { status });
