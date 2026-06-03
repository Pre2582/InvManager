import React, { useState, useEffect } from 'react';
import { Wand2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { validateCustomer } from '@/utils/validators';
import { autoFillCustomer } from '@/utils/autoFill';

const CustomerModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ full_name: '', email: '', phone: '' });
      setError(null);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutoFill = () => {
    setFormData(autoFillCustomer());
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const validationError = validateCustomer(formData);
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while creating the customer.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
      <Button variant="primary" onClick={handleSubmit} loading={loading}>Create Customer</Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Customer" footer={footer} maxWidth="480px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Autofill button */}
        <button
          type="button"
          onClick={handleAutoFill}
          disabled={loading}
          style={{
            alignSelf: 'flex-start',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.38rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            border: '1.5px dashed var(--primary)',
            background: 'var(--primary-glow)',
            color: 'var(--primary)',
            fontSize: '0.82rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Wand2 size={13} />
          Autofill Demo Data
        </button>

        {error && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--danger-glow)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="customer-name">Full Name *</label>
          <input id="customer-name" name="full_name" type="text" className="form-input"
            placeholder="e.g. Rahul Sharma" value={formData.full_name}
            onChange={handleChange} required disabled={loading} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="customer-email">Email Address *</label>
          <input id="customer-email" name="email" type="email" className="form-input"
            placeholder="e.g. rahul@example.com" value={formData.email}
            onChange={handleChange} required disabled={loading} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="customer-phone">Phone Number *</label>
          <input id="customer-phone" name="phone" type="tel" className="form-input"
            placeholder="e.g. +91 98765 43210" value={formData.phone}
            onChange={handleChange} required disabled={loading} />
        </div>
      </form>
    </Modal>
  );
};

export default CustomerModal;
