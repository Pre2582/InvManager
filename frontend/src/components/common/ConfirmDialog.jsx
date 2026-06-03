import React from 'react';
import Modal from './Modal';
import Button from './Button';

/**
 * Generic confirmation dialog.
 *
 * Props
 * ─────
 * isOpen       boolean
 * onClose      () => void
 * onConfirm    () => void
 * title        string
 * message      string | ReactNode   – plain text or any JSX body
 * confirmText  string
 * cancelText   string
 * confirmVariant  'primary' | 'danger' | 'secondary'
 * loading      boolean
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
}) => {
  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={loading}>
        {cancelText}
      </Button>
      <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} maxWidth="460px">
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
        {message}
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
