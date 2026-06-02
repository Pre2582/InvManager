import { useState, useCallback } from 'react';
import * as customersApi from '@/api/customers';
import useToast from '@/hooks/useToast';

const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customersApi.getCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomer = useCallback(async (payload) => {
    const customer = await customersApi.createCustomer(payload);
    setCustomers((prev) => [customer, ...prev]);
    toast.success('Customer added successfully!');
    return customer;
  }, []);

  const deleteCustomer = useCallback(async (id) => {
    await customersApi.deleteCustomer(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    toast.success('Customer removed.');
  }, []);

  return { customers, loading, error, fetchCustomers, createCustomer, deleteCustomer };
};

export default useCustomers;
