import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { formatCurrency, formatDateTime, shortId, statusVariant } from '@/utils/formatters';
import { User, Mail, Phone, Calendar, FileText, XCircle, ShieldCheck, CheckCircle, Package, AlertTriangle } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import * as ordersApi from '@/api/orders';
import useToast from '@/hooks/useToast';

// All valid status transitions an admin can apply
const STATUS_TRANSITIONS = {
  pending: [
    { to: 'confirmed', label: 'Confirm Order',   icon: CheckCircle, color: 'var(--primary)',  bg: 'var(--primary-glow)' },
    { to: 'delivered', label: 'Mark Delivered',  icon: Package,     color: 'var(--success)',  bg: 'var(--success-glow)' },
    { to: 'cancelled', label: 'Cancel Order',    icon: XCircle,     color: 'var(--danger)',   bg: 'var(--danger-glow)' },
  ],
  confirmed: [
    { to: 'delivered', label: 'Mark Delivered',  icon: Package,     color: 'var(--success)',  bg: 'var(--success-glow)' },
    { to: 'cancelled', label: 'Cancel Order',    icon: XCircle,     color: 'var(--danger)',   bg: 'var(--danger-glow)' },
  ],
  delivered: [],   // final state
  cancelled: [],   // final state
};

const STATUS_LABELS = {
  pending:   'Placed / Pending',
  confirmed: 'Confirmed / Approved',
  delivered: 'Delivered / Success',
  cancelled: 'Cancelled',
};

const OrderDetailModal = ({ isOpen, onClose, order, onCancelOrder, onStatusUpdated }) => {
  const { isAdmin } = useAuthStore();
  const toast = useToast();
  const [updatingStatus, setUpdatingStatus] = useState(null); // which status is being applied

  if (!order) return null;

  const currentStatus = order.status?.toLowerCase?.() ?? order.status;
  const transitions = STATUS_TRANSITIONS[currentStatus] ?? [];

  const handleStatusChange = async (newStatus) => {
    const confirm = window.confirm(
      `Change order ${shortId(order.id)} status to "${STATUS_LABELS[newStatus]}"?`
    );
    if (!confirm) return;

    setUpdatingStatus(newStatus);
    try {
      await ordersApi.updateOrderStatus(order.id, newStatus);
      toast.success(`Order status updated to "${STATUS_LABELS[newStatus]}"`);
      onStatusUpdated?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleCancelClick = () => {
    if (window.confirm('Cancel this order? Stock will be restored for all line items.')) {
      onCancelOrder(order.id);
      onClose();
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>Close</Button>
      {/* User-level cancel (deletes order + restores stock) — hidden from admin who uses the panel */}
      {!isAdmin && currentStatus !== 'cancelled' && currentStatus !== 'delivered' && (
        <Button variant="danger" onClick={handleCancelClick} icon={XCircle}>Cancel Order</Button>
      )}
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Order Details: ${shortId(order.id)}`} footer={footer} maxWidth="720px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Status & Date row ─────────────────────────────── */}
        <div
          className="glass-card"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
            <Badge variant={statusVariant(currentStatus)}>
              {STATUS_LABELS[currentStatus] ?? currentStatus}
            </Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Calendar size={13} style={{ color: 'var(--primary)' }} />
            <span>Placed {formatDateTime(order.created_at)}</span>
          </div>
        </div>

        {/* ── Admin Status Management ───────────────────────── */}
        {isAdmin && (
          <div
            style={{
              padding: '1.1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(46,197,192,0.35)',
              background: 'linear-gradient(135deg, rgba(46,197,192,0.06) 0%, rgba(46,197,192,0.02) 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem' }}>
              <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                Admin · Status Management
              </span>
            </div>

            {transitions.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <AlertTriangle size={14} />
                <span>
                  {currentStatus === 'delivered'
                    ? 'Order is delivered — no further status changes allowed.'
                    : 'Order is cancelled — no further status changes allowed.'}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {transitions.map(({ to, label, icon: Icon, color, bg }) => (
                  <button
                    key={to}
                    onClick={() => handleStatusChange(to)}
                    disabled={!!updatingStatus}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.45rem',
                      padding: '0.5rem 1.1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${color}50`,
                      background: bg,
                      color,
                      fontSize: '0.85rem', fontWeight: 600,
                      cursor: updatingStatus ? 'not-allowed' : 'pointer',
                      opacity: updatingStatus && updatingStatus !== to ? 0.5 : 1,
                      fontFamily: 'inherit',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {updatingStatus === to
                      ? <span style={{ width: '14px', height: '14px', border: `2px solid ${color}40`, borderTopColor: color, borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      : <Icon size={14} />
                    }
                    {label}
                  </button>
                ))}
              </div>
            )}

            <p style={{ marginTop: '0.7rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ℹ Status changes do not affect stock levels. To restore stock, use "Cancel Order" on the Orders page.
            </p>
          </div>
        )}

        {/* ── Customer Information ─────────────────────────── */}
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            <User size={16} style={{ color: 'var(--primary)' }} />
            Customer Information
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Name</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{order.customer?.full_name || '—'}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Email</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Mail size={12} style={{ color: 'var(--text-muted)' }} />
                {order.customer?.email || '—'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Phone</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Phone size={12} style={{ color: 'var(--text-muted)' }} />
                {order.customer?.phone || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Order Items ───────────────────────────────────── */}
        <div>
          <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>Order Items</h4>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.product?.name || 'Deleted Product'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.product?.sku || 'N/A'}</div>
                    </td>
                    <td>{formatCurrency(item.unit_price)}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(item.unit_price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', paddingRight: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Order Total:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>

        {/* ── Notes ────────────────────────────────────────── */}
        {order.notes && (
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              <FileText size={16} style={{ color: 'var(--primary)' }} />
              Order Notes
            </h4>
            <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--primary-glow)', borderLeft: '3px solid var(--primary)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              {order.notes}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
