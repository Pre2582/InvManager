import useToastStore from '@/store/toastStore';

/**
 * Convenience hook that exposes typed toast helpers.
 */
const useToast = () => {
  const addToast = useToastStore((s) => s.addToast);

  return {
    success: (message) => addToast({ type: 'success', message }),
    error: (message) => addToast({ type: 'error', message }),
    info: (message) => addToast({ type: 'info', message }),
    warning: (message) => addToast({ type: 'warning', message }),
  };
};

export default useToast;
