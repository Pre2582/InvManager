import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { formatCurrency, formatDateTime, shortId, statusVariant } from '@/utils/formatters';
import {
  User, Mail, Phone, Calendar, FileText, XCircle,
  ShieldCheck, CheckCircle, Package, AlertTriangle, ArrowRight, X,
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import * as ordersApi from '@/api/orders';
import useToast from '@/hooks/useToast';

// ── Status configuration ──────────────────────────────────────────────────────

const STATUS_TRANSITIONS = {
  pending: [
    {
      to: 'confirmed',
      label: 'Confirm Order',
      icon: CheckCircle,
      color: 'var(--primary)',
      bg: 'var(--primary-glow)',
      border: 'rgba(46,197,192,0.4)',
      confirmVariant: 'primary',
    },
    {
      to: 'delivered',
      label: 'Mark Delivered',
      icon: Package,
      color: 'var(--success)',
      bg: 'var(--success-glow)',
      border: 'var(--success-border)',
      confirmVariant: 'primary',
    },
    {
      to: 'cancelled',
      label: 'Cancel Order',
      icon: XCircle,
      color: 'var(--danger)',
      bg: 'var(--danger-glow)',
      border: 'var(--danger-border)',
      confirmVariant: 'danger',
    },
  ],
  confirmed: [
    {
      to: 'delivered',
      label: 'Mark Delivered',
      icon: Package,
      color: 'var(--success)',
      bg: 'var(--success-glow)',
      border: 'var(--success-border)',
      confirmVariant: 'primary',
    },
    {
      to: 'cancelled',
      label: 'Cancel Order',
      icon: XCircle,
      color: 'var(--danger)',
      bg: 'var(--danger-glow)',
      border: 'var(--danger-border)',
      confirmVariant: 'danger',
    },
  ],
  delivered: [],
  cancelled: [],
};

const STATUS_LABELS = {
  pending:   'Placed / Pending',
  confirmed: 'Confirmed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_DESCRIPTIONS = {
  confirmed: 'The order will be marked as Confirmed. The customer\'s order is approved and being processed.',
  delivered: 'The order will be marked as Delivered. This is the final success state — the order is complete.',
  cancelled: 'The order status will be set to Cancelled. Note: stock levels are NOT automatically restored; use "Cancel Order" on the orders list if you need stock restored.',
};

// ── Status Confirmation Popup ─────────────────────────────────────────────────

const StatusConfirmPopup = ({ transition, currentStatus, orderId, onConfirm, onClose, loading }) => {
  if (!transition) return null;

  const Icon = transition.icon;
  const fromLabel = STATUS_LABELS[currentStatus] ?? currentStatus;
  const toLabel   = STATUS_LABELS[transition.to]  ?? transition.to;

  return createPortal(
    <AnimatePresence>
      {transition && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sc-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={loading ? undefined : onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              zIndex: 1200,
            }}
          />

          {/* Centering wrapper — flex handles position; Framer Motion handles only scale/y */}
          <div
            key="sc-center"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1201,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              pointerEvents: 'none',   /* let backdrop layer receive clicks */
            }}
          >
          <motion.div
            key="sc-card"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.92, y: 16  }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            style={{
              pointerEvents: 'auto',   /* re-enable clicks on the card itself */
              width: '100%',
              maxWidth: '460px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.1rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={17} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.97rem', color: 'var(--text-primary)' }}>
                  Change Order Status
                </span>
              </div>
              {!loading && (
                <button onClick={onClose} className="btn-icon" style={{ padding: '0.3rem' }}>
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem' }}>
              {/* Order ref */}
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Order&nbsp;
                <code style={{ color: 'var(--primary)', fontWeight: 700, background: 'var(--primary-glow)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  {shortId(orderId)}
                </code>
              </p>

              {/* From → To visual */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '1rem', marginBottom: '1.25rem',
                padding: '1rem',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current</div>
                  <Badge variant={statusVariant(currentStatus)}>{fromLabel}</Badge>
                </div>

                <ArrowRight size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Status</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '50px',
                    border: `1px solid ${transition.border}`,
                    background: transition.bg,
                    color: transition.color,
                    fontSize: '0.78rem', fontWeight: 700,
                  }}>
                    <Icon size={13} />
                    {toLabel}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                padding: '0.75rem 1rem',
                borderLeft: `3px solid ${transition.color}`,
                background: transition.bg,
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
              }}>
                {STATUS_DESCRIPTIONS[transition.to]}
              </p>
            </div>

            {/* Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
            }}>
              <Button variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                loading={loading}
                icon={Icon}
                style={{
                  background: transition.confirmVariant === 'danger'
                    ? 'var(--danger)'
                    : 'var(--gradient-primary)',
                  color: 'white',
                  border: 'none',
                  boxShadow: transition.confirmVariant === 'danger'
                    ? '0 4px 14px rgba(239,68,68,0.35)'
                    : '0 4px 14px rgba(46,197,192,0.35)',
                }}
              >
                Yes, {transition.label}
              </Button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const OrderDetailModal = ({ isOpen, onClose, order, onCancelOrder, onStatusUpdated }) => {
  const { isAdmin } = useAuthStore();
  const toast = useToast();
  const [pendingTransition, setPendingTransition] = useState(null);
  const [applyingStatus, setApplyingStatus] = useState(false);

  if (!order) return null;

  const currentStatus = order.status?.toLowerCase?.() ?? order.status;
  const transitions = STATUS_TRANSITIONS[currentStatus] ?? [];

  const handleTransitionClick = (transition) => {
    setPendingTransition(transition);
  };

  const handleConfirmStatus = async () => {
    if (!pendingTransition) return;
    setApplyingStatus(true);
    try {
      await ordersApi.updateOrderStatus(order.id, pendingTransition.to);
      toast.success(`Order marked as "${STATUS_LABELS[pendingTransition.to]}"`);
      setPendingTransition(null);
      onStatusUpdated?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update status.');
    } finally {
      setApplyingStatus(false);
    }
  };

  const handleCancelOrder = () => {
    setPendingTransition(null); // close confirm popup first if open
    if (window.confirm('Cancel this order? Stock will be restored for all line items.')) {
      onCancelOrder(order.id);
      onClose();
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>Close</Button>
      {!isAdmin && currentStatus !== 'cancelled' && currentStatus !== 'delivered' && (
        <Button variant="danger" onClick={handleCancelOrder} icon={XCircle}>Cancel Order</Button>
      )}
    </>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Order Details — ${shortId(order.id)}`}
        footer={footer}
        maxWidth="720px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Status & Date */}
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

          {/* Admin Status Management */}
          {isAdmin && (
            <div style={{
              padding: '1.1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(46,197,192,0.3)',
              background: 'linear-gradient(135deg, rgba(46,197,192,0.07) 0%, rgba(46,197,192,0.02) 100%)',
            }}>
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
                      ? 'Order is delivered — no further status changes.'
                      : 'Order is cancelled — no further status changes.'}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {transitions.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.to}
                        onClick={() => handleTransitionClick(t)}
                        disabled={applyingStatus}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.45rem',
                          padding: '0.5rem 1.1rem',
                          borderRadius: 'var(--radius-md)',
                          border: `1.5px solid ${t.border}`,
                          background: t.bg,
                          color: t.color,
                          fontSize: '0.85rem', fontWeight: 600,
                          cursor: applyingStatus ? 'not-allowed' : 'pointer',
                          opacity: applyingStatus ? 0.5 : 1,
                          fontFamily: 'inherit',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <Icon size={14} />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              )}

              <p style={{ marginTop: '0.7rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ℹ Status changes do not affect stock. Use "Cancel Order" on the orders list to restore stock.
              </p>
            </div>
          )}

          {/* Customer */}
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

          {/* Order Items */}
          <div>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>Order Items</h4>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
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

          {/* Notes */}
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

      {/* Status Change Confirmation Popup — renders above the detail modal */}
      <StatusConfirmPopup
        transition={pendingTransition}
        currentStatus={currentStatus}
        orderId={order.id}
        onConfirm={handleConfirmStatus}
        onClose={() => !applyingStatus && setPendingTransition(null)}
        loading={applyingStatus}
      />
    </>
  );
};

export default OrderDetailModal;
