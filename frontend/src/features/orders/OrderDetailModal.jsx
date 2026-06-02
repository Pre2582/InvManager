import React from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { formatCurrency, formatDateTime, shortId, statusVariant } from '@/utils/formatters';
import { User, Mail, Phone, Calendar, FileText, XCircle } from 'lucide-react';

const OrderDetailModal = ({ isOpen, onClose, order, onCancelOrder }) => {
  if (!order) return null;

  const handleCancelClick = () => {
    if (window.confirm('Are you sure you want to cancel this order? This will restore stock levels for all products in this order.')) {
      onCancelOrder(order.id);
      onClose();
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        Close
      </Button>
      {order.status !== 'cancelled' && (
        <Button variant="danger" onClick={handleCancelClick} icon={XCircle}>
          Cancel Order
        </Button>
      )}
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details: ${shortId(order.id)}`}
      footer={footer}
      maxWidth="700px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Status & Date */}
        <div
          className="glass-card"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(20, 26, 41, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status:</span>
            <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <Calendar size={14} style={{ color: 'var(--primary)' }} />
            <span>Placed on: {formatDateTime(order.created_at)}</span>
          </div>
        </div>

        {/* Customer Information */}
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            <User size={16} style={{ color: 'var(--primary)' }} />
            Customer Information
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Name</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{order.customer?.full_name || '—'}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Email</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={12} style={{ color: 'var(--text-muted)' }} />
                {order.customer?.email || '—'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Phone</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={12} style={{ color: 'var(--text-muted)' }} />
                {order.customer?.phone || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>Order Items</h4>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'center' }}>Quantity</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.product?.name || 'Deleted Product'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.product?.sku || 'N/A'}
                      </div>
                    </td>
                    <td>{formatCurrency(item.unit_price)}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>
                      {formatCurrency(item.unit_price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1rem',
              paddingRight: '1rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total Order Amount:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              <FileText size={16} style={{ color: 'var(--primary)' }} />
              Order Notes
            </h4>
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(59, 130, 246, 0.03)',
                borderLeft: '3px solid var(--primary)',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
              }}
            >
              {order.notes}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
