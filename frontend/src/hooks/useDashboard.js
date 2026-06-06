import { useState, useCallback } from 'react';
import { getDashboardSummary } from '@/api/dashboard';
import useToast from '@/hooks/useToast';

const useDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [toast.error]);

  return { summary, loading, error, fetchSummary };
};

export default useDashboard;
