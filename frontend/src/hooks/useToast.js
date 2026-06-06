import { useCallback } from 'react';
import useToastStore from '@/store/toastStore';

const useToast = () => {
  const addToast = useToastStore((s) => s.addToast);

  const success = useCallback((message) => addToast({ type: 'success', message }), [addToast]);
  const error   = useCallback((message) => addToast({ type: 'error',   message }), [addToast]);
  const info    = useCallback((message) => addToast({ type: 'info',    message }), [addToast]);
  const warning = useCallback((message) => addToast({ type: 'warning', message }), [addToast]);

  return { success, error, info, warning };
};

export default useToast;
