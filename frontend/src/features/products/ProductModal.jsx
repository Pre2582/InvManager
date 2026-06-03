import React, { useState, useEffect } from 'react';
import { Wand2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { validateProduct } from '@/utils/validators';
import { autoFillProduct } from '@/utils/autoFill';

const ProductModal = ({ isOpen, onClose, onSave, product = null }) => {
  const [formData, setFormData] = useState({
    name: '', sku: '', price: '', quantity: '', description: '', image_url: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name:        product.name        || '',
        sku:         product.sku         || '',
        price:       product.price       || '',
        quantity:    product.quantity    || '',
        description: product.description || '',
        image_url:   product.image_url   || '',
      });
    } else {
      setFormData({ name: '', sku: '', price: '', quantity: '', description: '', image_url: '' });
    }
    setError(null);
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutoFill = () => {
    setFormData(autoFillProduct());
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const validationError = validateProduct(formData);
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      await onSave({
        ...formData,
        price:     parseFloat(formData.price),
        quantity:  parseInt(formData.quantity, 10),
        image_url: formData.image_url.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while saving the product.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
      <Button variant="primary" onClick={handleSubmit} loading={loading}>
        {product ? 'Save Changes' : 'Create Product'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add New Product'}
      footer={footer}
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Autofill — only on create */}
        {!product && (
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
        )}

        {error && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--danger-glow)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="product-name">Product Name *</label>
          <input id="product-name" name="name" type="text" className="form-input"
            placeholder="e.g. Mechanical Keyboard" value={formData.name}
            onChange={handleChange} required disabled={loading} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="product-sku">SKU *</label>
            <input id="product-sku" name="sku" type="text" className="form-input"
              placeholder="e.g. KB-MECH-01" value={formData.sku}
              onChange={handleChange} required disabled={loading || !!product} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="product-price">Price (USD) *</label>
            <input id="product-price" name="price" type="number" step="0.01" min="0.01"
              className="form-input" placeholder="e.g. 99.99" value={formData.price}
              onChange={handleChange} required disabled={loading} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="product-quantity">Stock Quantity *</label>
          <input id="product-quantity" name="quantity" type="number" min="0"
            className="form-input" placeholder="e.g. 50" value={formData.quantity}
            onChange={handleChange} required disabled={loading} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="product-image-url">Image URL</label>
          <input id="product-image-url" name="image_url" type="url" className="form-input"
            placeholder="https://example.com/image.jpg" value={formData.image_url}
            onChange={handleChange} disabled={loading} />
          {formData.image_url && (
            <div style={{ marginTop: '0.5rem', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '80px', background: 'var(--bg-tertiary)' }}>
              <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="product-description">Description</label>
          <textarea id="product-description" name="description" rows="3" className="form-input"
            placeholder="Describe the product..." value={formData.description}
            onChange={handleChange} disabled={loading} style={{ resize: 'vertical', minHeight: '80px' }} />
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
