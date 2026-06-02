import { useState, useCallback } from 'react';
import * as productsApi from '@/api/products';
import useToast from '@/hooks/useToast';

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (payload) => {
    const product = await productsApi.createProduct(payload);
    setProducts((prev) => [product, ...prev]);
    toast.success('Product created successfully!');
    return product;
  }, []);

  const updateProduct = useCallback(async (id, payload) => {
    const updated = await productsApi.updateProduct(id, payload);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    toast.success('Product updated successfully!');
    return updated;
  }, []);

  const deleteProduct = useCallback(async (id) => {
    await productsApi.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success('Product deleted.');
  }, []);

  return { products, loading, error, fetchProducts, createProduct, updateProduct, deleteProduct };
};

export default useProducts;
