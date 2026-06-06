import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  ShoppingCart,
  X,
  ZoomIn,
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import useProducts from '@/hooks/useProducts';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import SearchBar from '@/components/common/SearchBar';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ProductModal from '@/features/products/ProductModal';
import { formatCurrency } from '@/utils/formatters';
import useToast from '@/hooks/useToast';

const Products = () => {
  const { refreshKey } = useOutletContext() || {};
  const {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  const { isAdmin } = useAuthStore();
  const { addToCart, openCart } = useCartStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [importing, setImporting] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (refreshKey > 0) fetchProducts();
  }, [refreshKey, fetchProducts]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (formData) => {
    if (selectedProduct) {
      await updateProduct(selectedProduct.id, formData);
    } else {
      await createProduct(formData);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct(deleteId);
      setDeleteId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete product.');
    }
  };

  const handleAddToCart = (product) => {
    if (product.quantity === 0) return;
    const added = addToCart(product, 1);
    if (added) {
      toast.success(`${product.name} added to cart`);
      openCart();
    } else {
      toast.error(`Not enough stock for ${product.name}`);
    }
  };

  const getStockBadge = (qty) => {
    if (qty === 0) return <Badge variant="danger">Out of stock</Badge>;
    if (qty <= 10) return <Badge variant="warning">{qty} low</Badge>;
    return <Badge variant="success">{qty} in stock</Badge>;
  };

  // CSV Export
  const handleExportCSV = () => {
    if (products.length === 0) { toast.info('No products to export.'); return; }
    const headers = ['Name', 'SKU', 'Price', 'Quantity', 'Description'];
    const rows = products.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku.replace(/"/g, '""')}"`,
      p.price,
      p.quantity,
      `"${(p.description || '').replace(/"/g, '""')}"`,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', 'products_catalog.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Products exported.');
  };

  // CSV Import
  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
        if (lines.length <= 1) throw new Error('CSV is empty or missing headers.');
        const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
        const nameIdx = headers.findIndex((h) => h.toLowerCase() === 'name');
        const skuIdx = headers.findIndex((h) => h.toLowerCase() === 'sku');
        const priceIdx = headers.findIndex((h) => h.toLowerCase() === 'price');
        const qtyIdx = headers.findIndex((h) => h.toLowerCase() === 'quantity');
        const descIdx = headers.findIndex((h) => h.toLowerCase() === 'description');
        if (nameIdx === -1 || skuIdx === -1 || priceIdx === -1 || qtyIdx === -1)
          throw new Error('CSV must contain Name, SKU, Price, Quantity columns.');
        let success = 0, fail = 0;
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
          if (row.length < 4) continue;
          const get = (idx) => (idx === -1 || !row[idx] ? '' : row[idx].trim().replace(/^["']|["']$/g, ''));
          const name = get(nameIdx), sku = get(skuIdx);
          const price = parseFloat(get(priceIdx)), quantity = parseInt(get(qtyIdx), 10);
          const description = get(descIdx);
          if (!name || !sku || isNaN(price) || isNaN(quantity)) { fail++; continue; }
          try { await createProduct({ name, sku, price, quantity, description }); success++; }
          catch { fail++; }
        }
        if (success > 0) { toast.success(`Imported ${success} products.`); fetchProducts(); }
        if (fail > 0) toast.error(`Failed to import ${fail} rows.`);
      } catch (err) {
        toast.error(`Import failed: ${err.message}`);
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="page-container">
      {/* Action Bar */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or SKU..."
            style={{ flexGrow: 1 }}
          />
          {isAdmin && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} style={{ display: 'none' }} />
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()} icon={Upload} loading={importing}>
                Import CSV
              </Button>
              <Button variant="secondary" onClick={handleExportCSV} icon={Download}>
                Export
              </Button>
              <Button variant="primary" onClick={handleAddClick} icon={Plus}>
                Add Product
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading products...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>
            {searchTerm ? 'No products match your search' : 'No products yet'}
          </p>
          {!searchTerm && isAdmin && (
            <Button variant="primary" onClick={handleAddClick} icon={Plus} style={{ marginTop: '1rem' }}>
              Add Product
            </Button>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredProducts.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              isAdmin={isAdmin}
              onEdit={handleEditClick}
              onDelete={(id) => setDeleteId(id)}
              onAddToCart={handleAddToCart}
              onImageClick={setLightboxUrl}
              getStockBadge={getStockBadge}
            />
          ))}
        </motion.div>
      )}

      {/* Full-Size Image Lightbox */}
      {createPortal(
        <AnimatePresence>
          {lightboxUrl && (
            <motion.div
              key="lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxUrl(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.92)',
                backdropFilter: 'blur(10px)',
                zIndex: 1100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'zoom-out',
              }}
            >
              <motion.img
                src={lightboxUrl}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{
                  maxWidth: '88vw',
                  maxHeight: '88vh',
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setLightboxUrl(null)}
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {isAdmin && (
        <>
          <ProductModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveProduct}
            product={selectedProduct}
          />
          <ConfirmDialog
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={handleDeleteConfirm}
            title="Delete Product"
            message="Are you sure you want to delete this product? All active order items referencing this product will remain, but the item will be permanently removed from catalog inventory."
          />
        </>
      )}
    </div>
  );
};

const ProductCard = ({ product, index, isAdmin, onEdit, onDelete, onAddToCart, onImageClick, getStockBadge }) => {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        background: 'var(--gradient-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        transition: 'border-color var(--transition-normal), box-shadow var(--transition-normal)',
      }}
      whileHover={{
        borderColor: 'rgba(59,130,246,0.45)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4), 0 0 20px rgba(59,130,246,0.1)',
      }}
    >
      {/* Image Area */}
      <div
        style={{
          height: '190px',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--bg-tertiary)',
          cursor: product.image_url && !imgError ? 'zoom-in' : 'default',
          flexShrink: 0,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
          if (product.image_url && !imgError) onImageClick(product.image_url);
        }}
      >
        {product.image_url && !imgError ? (
          <>
            <img
              src={product.image_url}
              alt={product.name}
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.35s ease',
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
              }}
            />
            {/* Hover overlay with zoom hint */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: hovered ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0)',
                transition: 'background 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {hovered && (
                <div
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '50%',
                    padding: '0.75rem',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <ZoomIn size={24} style={{ color: 'white' }} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: 'var(--text-muted)',
            }}
          >
            <Package size={40} style={{ opacity: 0.4 }} />
            <span style={{ fontSize: '0.75rem' }}>No image</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div>
          <div
            title={product.name}
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: '0.2rem',
            }}
          >
            {product.name}
          </div>
          <code style={{ fontSize: '0.78rem', color: 'var(--accent)', fontFamily: 'monospace' }}>
            {product.sku}
          </code>
        </div>

        {product.description && (
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={product.description}
          >
            {product.description}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>
            {formatCurrency(product.price)}
          </span>
          {getStockBadge(product.quantity)}
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
        }}
      >
        <Button
          variant="primary"
          onClick={() => onAddToCart(product)}
          disabled={product.quantity === 0}
          icon={ShoppingCart}
          style={{ flex: 1, fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
        >
          {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
        {isAdmin && (
          <>
            <button
              className="btn-icon"
              onClick={() => onEdit(product)}
              title="Edit product"
            >
              <Edit2 size={16} />
            </button>
            <button
              className="btn-icon"
              onClick={() => onDelete(product.id)}
              style={{ color: 'var(--danger)' }}
              title="Delete product"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Products;
