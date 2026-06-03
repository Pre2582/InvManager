import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Plus, Minus, Package } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import Button from './Button';
import { formatCurrency } from '@/utils/formatters';
import * as customersApi from '@/api/customers';
import * as ordersApi from '@/api/orders';
import useToast from '@/hooks/useToast';

const CartDrawer = ({ onOrderPlaced }) => {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      customersApi.getCustomers().then(setCustomers).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!customerId) {
      setError('Please select a customer.');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await ordersApi.createOrder({
        customer_id: customerId,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        notes: notes.trim() || undefined,
      });
      clearCart();
      setCustomerId('');
      setNotes('');
      closeCart();
      toast.success('Order placed successfully!');
      onOrderPlaced?.();
    } catch (err) {
      setError(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(3, 4, 7, 0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 500,
            }}
          />

          <motion.div
            key="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '420px',
              maxWidth: '100vw',
              background: 'var(--bg-secondary)',
              borderLeft: '1px solid var(--border-color)',
              zIndex: 501,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-tertiary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShoppingCart size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                  Cart
                  {totalItems > 0 && (
                    <span
                      style={{
                        marginLeft: '0.5rem',
                        background: 'var(--gradient-primary)',
                        color: 'white',
                        borderRadius: '50px',
                        padding: '0.1rem 0.5rem',
                        fontSize: '0.75rem',
                      }}
                    >
                      {totalItems}
                    </span>
                  )}
                </h3>
              </div>
              <button className="btn-icon" onClick={closeCart}>
                <X size={18} />
              </button>
            </div>

            {/* Cart Items */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {items.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <ShoppingCart size={48} style={{ opacity: 0.25 }} />
                  <p style={{ fontWeight: 500 }}>Your cart is empty</p>
                  <p style={{ fontSize: '0.85rem' }}>
                    Add products from the catalog to start an order
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product_id}
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {/* Thumbnail */}
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={{
                          width: '52px',
                          height: '52px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-sm)',
                          flexShrink: 0,
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Package size={20} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: '0.9rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.sku}
                      </div>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          color: 'var(--primary)',
                          fontWeight: 600,
                          marginTop: '0.25rem',
                        }}
                      >
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>

                    {/* Controls */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '0.5rem',
                        flexShrink: 0,
                      }}
                    >
                      <button
                        className="btn-icon"
                        onClick={() => removeFromCart(item.product_id)}
                        style={{ color: 'var(--danger)', padding: '0.25rem' }}
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          className="btn-icon"
                          style={{ padding: '0.25rem' }}
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            minWidth: '22px',
                            textAlign: 'center',
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          className="btn-icon"
                          style={{ padding: '0.25rem' }}
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          disabled={item.quantity >= item.max_stock}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        max {item.max_stock}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Section */}
            {items.length > 0 && (
              <div
                style={{
                  borderTop: '1px solid var(--border-color)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                  background: 'var(--bg-tertiary)',
                }}
              >
                {error && (
                  <div
                    style={{
                      padding: '0.6rem 1rem',
                      background: 'var(--danger-glow)',
                      border: '1px solid var(--danger-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--danger)',
                      fontSize: '0.85rem',
                    }}
                  >
                    {error}
                  </div>
                )}

                <select
                  className="form-select"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  disabled={loading}
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="">— Select Customer —</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.email})
                    </option>
                  ))}
                </select>

                <textarea
                  rows={2}
                  className="form-input"
                  placeholder="Order notes (optional)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={loading}
                  style={{ resize: 'none', fontSize: '0.9rem' }}
                />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Order Total
                    </div>
                    <div
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                      }}
                    >
                      {formatCurrency(totalAmount)}
                    </div>
                  </div>
                  <Button variant="primary" onClick={handlePlaceOrder} loading={loading}>
                    Place Order
                  </Button>
                </div>

                <button
                  onClick={clearCart}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    alignSelf: 'center',
                  }}
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CartDrawer;
