import { useState, useCallback } from 'react';
import * as ordersApi from '@/api/orders';
import useToast from '@/hooks/useToast';

const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersApi.getOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (payload) => {
    const order = await ordersApi.createOrder(payload);
    setOrders((prev) => [order, ...prev]);
    toast.success('Order placed successfully!');
    return order;
  }, []);

  const cancelOrder = useCallback(async (id) => {
    await ordersApi.cancelOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
    toast.success('Order cancelled. Stock restored.');
  }, []);

  return { orders, loading, error, fetchOrders, createOrder, cancelOrder };
};

export default useOrders;
