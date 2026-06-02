import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { validateOrder } from '@/utils/validators';
import { formatCurrency } from '@/utils/formatters';
import { Trash2, Plus } from 'lucide-react';

const OrderModal = ({ isOpen, onClose, onSave, customers = [], products = [] }) => {
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Row input state for adding single item
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');

  useEffect(() => {
    if (isOpen) {
      setCustomerId('');
      setItems([]);
      setNotes('');
      setError(null);
      setSelectedProductId('');
      setItemQuantity('1');
    }
  }, [isOpen]);

  const activeProduct = products.find((p) => p.id === selectedProductId);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const qty = parseInt(itemQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }

    // Check if product is already in items
    const existingIndex = items.findIndex((item) => item.product_id === selectedProductId);

    // Calculate total quantity requested (including existing)
    const existingQty = existingIndex >= 0 ? items[existingIndex].quantity : 0;
    const totalQty = existingQty + qty;

    // Check stock level
    if (totalQty > activeProduct.quantity) {
      setError(`Cannot add. Insufficient stock for ${activeProduct.name} (${activeProduct.quantity} available, requested: ${totalQty}).`);
      return;
    }

    if (existingIndex >= 0) {
      // Update quantity
      const newItems = [...items];
      newItems[existingIndex].quantity = totalQty;
      setItems(newItems);
    } else {
      // Add new row
      setItems([
        ...items,
        {
          product_id: selectedProductId,
          name: activeProduct.name,
          sku: activeProduct.sku,
          price: activeProduct.price,
          quantity: qty,
        },
      ]);
    }

    // Reset row inputs
    setSelectedProductId('');
    setItemQuantity('1');
    setError(null);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
    setError(null);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      customer_id: customerId,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      notes: notes.trim() || undefined,
    };

    const validationError = validateOrder(payload);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while placing the order.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit} loading={loading} disabled={items.length === 0}>
        Place Order
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Order" footer={footer} maxWidth="700px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-glow)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger)',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Customer Select */}
        <div className="form-group">
          <label className="form-label" htmlFor="order-customer">
            Customer *
          </label>
          <select
            id="order-customer"
            className="form-select"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
            disabled={loading}
          >
            <option value="">-- Select Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} ({c.email})
              </option>
            ))}
          </select>
        </div>

        {/* Add Product Form Row */}
        <div
          className="glass-card"
          style={{
            padding: '1rem',
            borderStyle: 'dashed',
            backgroundColor: 'rgba(20, 26, 41, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Add Line Item</span>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <div className="form-group" style={{ flexGrow: 1, margin: 0, minWidth: '200px' }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>
                Select Product
              </label>
              <select
                className="form-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                disabled={loading}
              >
                <option value="">-- Choose Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                    {p.name} {p.quantity <= 0 ? '(Out of Stock)' : `($${p.price} - ${p.quantity} available)`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ width: '100px', margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>
                Qty
              </label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                disabled={loading || !selectedProductId}
              />
            </div>

            <Button
              variant="secondary"
              onClick={handleAddItem}
              disabled={loading || !selectedProductId || (activeProduct && activeProduct.quantity <= 0)}
              style={{ height: '42px', padding: '0 1rem' }}
            >
              <Plus size={16} />
              Add
            </Button>
          </div>
        </div>

        {/* Selected Items List */}
        <div>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
            Order Items
          </span>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                      No products added yet.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.sku}</div>
                      </td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price * item.quantity)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleRemoveItem(idx)}
                          style={{ color: 'var(--danger)' }}
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {items.length > 0 && (
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
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" htmlFor="order-notes">
            Order Notes (Optional)
          </label>
          <textarea
            id="order-notes"
            name="notes"
            rows="2"
            className="form-input"
            placeholder="Add special requests or shipping instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
            style={{ resize: 'vertical' }}
          />
        </div>
      </form>
    </Modal>
  );
};

export default OrderModal;
