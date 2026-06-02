import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import useToastStore from '@/store/toastStore';

const ToastIcon = ({ type }) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />;
    case 'error':
      return <AlertCircle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />;
    case 'warning':
      return <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />;
    default:
      return <Info size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />;
  }
};

const getBorderColor = (type) => {
  switch (type) {
    case 'success':
      return '1px solid var(--success-border)';
    case 'error':
      return '1px solid var(--danger-border)';
    case 'warning':
      return '1px solid var(--warning-border)';
    default:
      return '1px solid var(--border-color)';
  }
};

const Toast = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className="toast"
            style={{ border: getBorderColor(toast.type) }}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            layout
          >
            <ToastIcon type={toast.type} />
            <div style={{ flexGrow: 1, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {toast.message}
            </div>
            <button
              className="btn-icon"
              onClick={() => removeToast(toast.id)}
              style={{ padding: '0.2rem', marginLeft: '0.5rem', display: 'flex', alignItems: 'center' }}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
