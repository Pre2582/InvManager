import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Eye,
  XCircle,
  Package,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  X,
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import useOrders from '@/hooks/useOrders';
import useCustomers from '@/hooks/useCustomers';
import useProducts from '@/hooks/useProducts';
import useCartStore from '@/store/cartStore';
import DataTable from '@/components/common/DataTable';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import SearchBar from '@/components/common/SearchBar';
import OrderModal from '@/features/orders/OrderModal';
import OrderDetailModal from '@/features/orders/OrderDetailModal';
import { formatCurrency, formatDateTime, shortId, statusVariant } from '@/utils/formatters';
import useToast from '@/hooks/useToast';

const Orders = () => {
  const { refreshKey } = useOutletContext() || {};
  const { orders, loading: ordersLoading, fetchOrders, createOrder, cancelOrder } = useOrders();
  const { customers, fetchCustomers } = useCustomers();
  const { products, fetchProducts } = useProducts();
  const { addToCart, openCart, syncStockLimits } = useCartStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
  }, [fetchOrders, fetchCustomers, fetchProducts]);

  // Re-fetch after a cart order is placed
  useEffect(() => {
    if (refreshKey > 0) {
      fetchOrders();
      fetchProducts();
    }
  }, [refreshKey]);

  // Keep cart stock limits in sync when products refresh
  useEffect(() => {
    if (products.length > 0) syncStockLimits(products);
  }, [products]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const catalogProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleCreateOrder = async (payload) => {
    await createOrder(payload);
    fetchProducts();
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order.');
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
    if (qty <= 10) return <Badge variant="warning">{qty} left</Badge>;
    return <Badge variant="success">{qty} available</Badge>;
  };

  const orderColumns = [
    {
      header: 'Order Ref',
      key: 'id',
      width: '120px',
      render: (row) => (
        <span
          style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}
          onClick={() => { setSelectedOrder(row); setIsDetailModalOpen(true); }}
        >
          {shortId(row.id)}
        </span>
      ),
    },
    {
      header: 'Customer',
      key: 'customer',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.customer?.full_name || 'Deleted Customer'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.customer?.email || 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Date Placed',
      key: 'created_at',
      render: (row) => formatDateTime(row.created_at),
    },
    {
      header: 'Status',
      key: 'status',
      width: '130px',
      render: (row) => <Badge variant={statusVariant(row.status)}>{row.status}</Badge>,
    },
    {
      header: 'Total Amount',
      key: 'total_amount',
      width: '130px',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {formatCurrency(row.total_amount)}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      width: '100px',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-icon"
            onClick={() => { setSelectedOrder(row); setIsDetailModalOpen(true); }}
            title="View Details"
          >
            <Eye size={16} />
          </button>
          {row.status !== 'cancelled' && (
            <button
              className="btn-icon"
              onClick={() => {
                if (window.confirm('Cancel this order? Stock will be restored.')) handleCancelOrder(row.id);
              }}
              style={{ color: 'var(--danger)' }}
              title="Cancel Order"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Search / Filters / New Order */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order ID or customer name..."
            style={{ flexGrow: 1 }}
          >
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '150px', padding: '0.65rem 1rem' }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </SearchBar>
          <Button variant="secondary" onClick={() => setIsOrderModalOpen(true)} icon={Plus}>
            Quick Order
          </Button>
        </div>
      </div>

      {/* Product Catalog */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Catalog Header */}
        <button
          onClick={() => setCatalogOpen((o) => !o)}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            padding: '1.1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            borderBottom: catalogOpen ? '1px solid var(--border-color)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Package size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Product Catalog</span>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-tertiary)',
                padding: '0.15rem 0.5rem',
                borderRadius: '50px',
              }}
            >
              {products.length} items
            </span>
          </div>
          {catalogOpen ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
        </button>

        <AnimatePresence>
          {catalogOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  style={{ maxWidth: '340px' }}
                />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                  gap: '1rem',
                  padding: '1.25rem 1.5rem',
                  maxHeight: '420px',
                  overflowY: 'auto',
                }}
              >
                {catalogProducts.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No products found.
                  </div>
                ) : (
                  catalogProducts.map((product) => (
                    <CatalogCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onImageClick={setLightboxUrl}
                      getStockBadge={getStockBadge}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Order History */}
      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
          Order History
        </h3>
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DataTable
            columns={orderColumns}
            data={filteredOrders}
            loading={ordersLoading}
            emptyTitle="No Orders Found"
            emptyDescription={
              searchTerm || statusFilter !== 'all'
                ? 'No orders match your filters.'
                : 'Add products to cart and place an order to see history here.'
            }
            emptyIcon={ShoppingCart}
            emptyAction={
              searchTerm || statusFilter !== 'all' ? (
                <Button variant="secondary" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                  Clear Filters
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setCatalogOpen(true)} icon={ShoppingCart}>
                  Browse Catalog
                </Button>
              )
            }
          />
        </motion.div>
      </div>

      {/* Lightbox */}
      {createPortal(
        <AnimatePresence>
          {lightboxUrl && (
            <motion.div
              key="order-lightbox"
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
                style={{ maxWidth: '88vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 'var(--radius-lg)', boxShadow: '0 25px 80px rgba(0,0,0,0.8)' }}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setLightboxUrl(null)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Quick Order Modal (legacy dropdown approach) */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSave={handleCreateOrder}
        customers={customers}
        products={products}
      />

      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedOrder(null); }}
        order={selectedOrder}
        onCancelOrder={handleCancelOrder}
      />
    </div>
  );
};

const CatalogCard = ({ product, onAddToCart, onImageClick, getStockBadge }) => {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
        boxShadow: hovered ? '0 4px 20px rgba(59,130,246,0.15)' : 'none',
        borderColor: hovered ? 'rgba(59,130,246,0.4)' : 'var(--border-color)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div
        style={{
          height: '130px',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--bg-secondary)',
          cursor: product.image_url && !imgError ? 'zoom-in' : 'default',
          flexShrink: 0,
        }}
        onClick={() => { if (product.image_url && !imgError) onImageClick(product.image_url); }}
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
                transition: 'transform 0.3s ease',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: hovered ? 'rgba(0,0,0,0.3)' : 'transparent',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {hovered && (
                <ZoomIn size={20} style={{ color: 'rgba(255,255,255,0.9)' }} />
              )}
            </div>
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0.6rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div
          title={product.name}
          style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {product.name}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
            {formatCurrency(product.price)}
          </span>
          {getStockBadge(product.quantity)}
        </div>
      </div>

      {/* Add to Cart */}
      <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.quantity === 0}
          style={{
            width: '100%',
            background: product.quantity === 0 ? 'transparent' : 'var(--gradient-primary)',
            border: product.quantity === 0 ? '1px solid var(--border-color)' : 'none',
            borderRadius: 'var(--radius-sm)',
            color: product.quantity === 0 ? 'var(--text-muted)' : 'white',
            padding: '0.45rem 0',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: product.quantity === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            transition: 'all var(--transition-fast)',
          }}
        >
          <ShoppingCart size={14} />
          {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default Orders;
