import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Plus, Eye, XCircle, Package,
  ChevronDown, ChevronUp, ZoomIn, X, Search,
  TrendingUp, Clock, CheckCircle, Ban, DollarSign,
  Calendar, User, Hash,
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import useOrders from '@/hooks/useOrders';
import useCustomers from '@/hooks/useCustomers';
import useProducts from '@/hooks/useProducts';
import useCartStore from '@/store/cartStore';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import OrderModal from '@/features/orders/OrderModal';
import OrderDetailModal from '@/features/orders/OrderDetailModal';
import { formatCurrency, formatDateTime, shortId, statusVariant } from '@/utils/formatters';
import useToast from '@/hooks/useToast';
import useAuthStore from '@/store/authStore';
import ConfirmDialog from '@/components/common/ConfirmDialog';

/* ── Helpers ─────────────────────────────────────────────────── */
const STATUS_META = {
  pending:   { color: '#f59e0b', bg: '#fef3c7', border: '#fde68a', icon: Clock,        label: 'Pending'   },
  confirmed: { color: '#2ec5c0', bg: '#e0fafa', border: '#99e6e4', icon: TrendingUp,   label: 'Confirmed' },
  delivered: { color: '#22c55e', bg: '#dcfce7', border: '#86efac', icon: CheckCircle,  label: 'Delivered' },
  cancelled: { color: '#ef4444', bg: '#fee2e2', border: '#fca5a5', icon: Ban,          label: 'Cancelled' },
};

const AVATAR_PALETTE = [
  { bg: '#dbeafe', text: '#1d4ed8' }, { bg: '#fce7f3', text: '#be185d' },
  { bg: '#d1fae5', text: '#065f46' }, { bg: '#fef3c7', text: '#92400e' },
  { bg: '#ede9fe', text: '#5b21b6' }, { bg: '#fee2e2', text: '#991b1b' },
  { bg: '#e0f2fe', text: '#0369a1' }, { bg: '#ecfccb', text: '#3f6212' },
];
const avatarColor = (name = '') => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
};
const initials = (name = '') => {
  const p = name.trim().split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
};

/* ── Stat card ───────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, bg, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{
      background: '#fff', border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)', padding: '1.1rem 1.4rem',
      display: 'flex', alignItems: 'center', gap: '0.9rem',
      boxShadow: 'var(--shadow-sm)', flex: '1 1 140px',
    }}
  >
    <div style={{
      width: 42, height: 42, borderRadius: 11, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={18} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>{label}</div>
    </div>
  </motion.div>
);

/* ── Order row card ──────────────────────────────────────────── */
const OrderCard = ({ order, onView, onCancel, index }) => {
  const meta  = STATUS_META[order.status?.toLowerCase()] || STATUS_META.pending;
  const color = avatarColor(order.customer?.full_name || '');
  const StatusIcon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      style={{
        background: '#fff',
        border: '1px solid var(--border-color)',
        borderLeft: `4px solid ${meta.color}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        display: 'grid',
        gridTemplateColumns: '2fr 2fr 1.4fr 1.1fr auto',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.18s, border-color 0.18s',
        cursor: 'default',
      }}
      whileHover={{ boxShadow: `0 6px 24px ${meta.color}22`, borderColor: `${meta.color}88` }}
    >
      {/* Order ref + date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div
          style={{ fontFamily: 'monospace', fontWeight: 700, color: meta.color, fontSize: '0.92rem', cursor: 'pointer' }}
          onClick={() => onView(order)}
          title="View order details"
        >
          {shortId(order.id)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          <Calendar size={11} />
          {formatDateTime(order.created_at)}
        </div>
      </div>

      {/* Customer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: color.bg, color: color.text,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
          border: `1.5px solid ${color.text}22`,
        }}>
          {order.customer?.full_name ? initials(order.customer.full_name) : <User size={13} />}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {order.customer?.full_name || 'Deleted Customer'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {order.customer?.email || '—'}
          </div>
        </div>
      </div>

      {/* Status */}
      <div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '0.3rem 0.75rem', borderRadius: 50,
          background: meta.bg, border: `1px solid ${meta.border}`,
          color: meta.color, fontSize: '0.75rem', fontWeight: 700,
          textTransform: 'capitalize',
        }}>
          <StatusIcon size={11} />
          {order.status}
        </div>
      </div>

      {/* Amount */}
      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', textAlign: 'right' }}>
        {formatCurrency(order.total_amount)}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onView(order)}
          title="View Details"
          style={{
            width: 32, height: 32, borderRadius: 8,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-glow)'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          <Eye size={14} />
        </button>
        {order.status !== 'cancelled' && (
          <button
            onClick={() => onCancel(order.id)}
            title="Cancel Order"
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid var(--danger-border)',
              background: 'var(--danger-glow)',
              color: 'var(--danger)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--danger-glow)'; e.currentTarget.style.color = 'var(--danger)'; }}
          >
            <XCircle size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

/* ── Status filter pill ──────────────────────────────────────── */
const FilterPill = ({ value, label, count, active, color, bg, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '0.38rem 0.85rem',
      borderRadius: 50,
      border: active ? `1.5px solid ${color}` : '1.5px solid var(--border-color)',
      background: active ? bg : 'transparent',
      color: active ? color : 'var(--text-muted)',
      fontSize: '0.8rem', fontWeight: 600,
      cursor: 'pointer', transition: 'all 0.15s',
      fontFamily: 'inherit',
    }}
  >
    {label}
    {count !== undefined && (
      <span style={{
        background: active ? color : 'var(--bg-tertiary)',
        color: active ? '#fff' : 'var(--text-muted)',
        borderRadius: 50, padding: '0 5px',
        fontSize: '0.7rem', fontWeight: 700, minWidth: 18, textAlign: 'center',
      }}>{count}</span>
    )}
  </button>
);

/* ── Page ────────────────────────────────────────────────────── */
const Orders = () => {
  const { refreshKey } = useOutletContext() || {};
  const { isAdmin } = useAuthStore();
  const { orders, loading: ordersLoading, fetchOrders, createOrder, cancelOrder } = useOrders();
  const { customers, fetchCustomers } = useCustomers();
  const { products, fetchProducts } = useProducts();
  const { addToCart, openCart, syncStockLimits } = useCartStore();

  const [searchTerm, setSearchTerm]         = useState('');
  const [statusFilter, setStatusFilter]     = useState('all');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder]   = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [catalogOpen, setCatalogOpen]       = useState(true);
  const [lightboxUrl, setLightboxUrl]       = useState(null);
  const [productSearch, setProductSearch]   = useState('');
  const [cancelTarget, setCancelTarget]     = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    if (isAdmin) fetchCustomers();
  }, [fetchOrders, fetchProducts, fetchCustomers, isAdmin]);

  useEffect(() => {
    if (refreshKey > 0) { fetchOrders(); fetchProducts(); }
  }, [refreshKey, fetchOrders, fetchProducts]);

  useEffect(() => {
    if (products.length > 0) syncStockLimits(products);
  }, [products, syncStockLimits]);

  /* ── Derived stats ─────────────────────────────────────────── */
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + Number(o.total_amount || 0), 0);
  const countBy = (s) => orders.filter(o => o.status === s).length;

  /* ── Filter ────────────────────────────────────────────────── */
  const filteredOrders = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      o.id.toLowerCase().includes(q) ||
      (o.customer?.full_name || '').toLowerCase().includes(q) ||
      (o.customer?.email || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const catalogProducts = products.filter(
    p => p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
         p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleCreateOrder = async (payload) => { await createOrder(payload); fetchProducts(); };

  const handleCancelOrder = async () => {
    if (!cancelTarget) return;
    try {
      await cancelOrder(cancelTarget);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order.');
    } finally {
      setCancelTarget(null);
    }
  };

  const handleCancelOrderDirect = async (orderId) => {
    try { await cancelOrder(orderId); fetchProducts(); }
    catch (err) { toast.error(err.message || 'Failed to cancel order.'); }
  };
  const handleAddToCart = (product) => {
    if (product.quantity === 0) return;
    const ok = addToCart(product, 1);
    if (ok) { toast.success(`${product.name} added to cart`); openCart(); }
    else toast.error(`Not enough stock for ${product.name}`);
  };
  const getStockBadge = (qty) => {
    if (qty === 0) return <Badge variant="danger">Out of stock</Badge>;
    if (qty <= 10) return <Badge variant="warning">{qty} left</Badge>;
    return <Badge variant="success">{qty} in stock</Badge>;
  };

  return (
    <div className="page-container">

      {/* ── Page header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #2ec5c0 0%, #1aa8a3 55%, #0f8f8a 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
          boxShadow: '0 4px 22px rgba(46,197,192,0.30)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: -50, top: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 80, bottom: -70, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}>
            <ShoppingCart size={26} color="#fff" />
          </div>
          <div>
            <h1 style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Orders &amp; History
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: '0.83rem', marginTop: 2 }}>
              Browse products, place orders, and track every transaction
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', zIndex: 1 }}>
          {isAdmin && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0.4rem 0.9rem', borderRadius: 50,
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.9)', fontSize: '0.78rem', fontWeight: 600,
              }}>
                🛡️ Admin
              </div>
              <Button
                variant="primary"
                onClick={() => setIsOrderModalOpen(true)}
                icon={Plus}
                style={{ background: 'rgba(255,255,255,0.95)', color: '#0f8f8a', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}
              >
                Quick Order
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* ── Stats row (admin only) ───────────────────────────── */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <StatCard icon={ShoppingCart} label="Total Orders"  value={orders.length}                color="#2ec5c0" bg="#e0fafa" delay={0.05} />
          <StatCard icon={Clock}        label="Pending"        value={countBy('pending')}            color="#f59e0b" bg="#fef3c7" delay={0.08} />
          <StatCard icon={CheckCircle}  label="Delivered"      value={countBy('delivered')}          color="#22c55e" bg="#dcfce7" delay={0.11} />
          <StatCard icon={DollarSign}   label="Total Revenue"  value={formatCurrency(totalRevenue)}  color="#6366f1" bg="#ede9fe" delay={0.14} />
        </div>
      )}

      {/* ── Order History ─────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

        {/* History header + toolbar */}
        <div style={{
          background: '#fff', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem',
          display: 'flex', flexDirection: 'column', gap: '0.875rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h3 style={{ fontSize: '0.97rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Order History
              </h3>
              <span style={{
                fontSize: '0.72rem', fontWeight: 700,
                color: 'var(--text-muted)',
                background: 'var(--bg-tertiary)',
                padding: '2px 8px', borderRadius: 50,
              }}>
                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
              </span>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 340 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text" className="form-input"
                placeholder="Search by ID or customer…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: 32, margin: 0 }}
              />
            </div>
          </div>

          {/* Status pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <FilterPill value="all"       label="All"       count={orders.length}           active={statusFilter === 'all'}       color="var(--primary)" bg="var(--primary-glow)" onClick={() => setStatusFilter('all')} />
            <FilterPill value="pending"   label="Pending"   count={countBy('pending')}       active={statusFilter === 'pending'}   color="#f59e0b" bg="#fef3c7" onClick={() => setStatusFilter('pending')} />
            <FilterPill value="confirmed" label="Confirmed" count={countBy('confirmed')}     active={statusFilter === 'confirmed'} color="#2ec5c0" bg="#e0fafa" onClick={() => setStatusFilter('confirmed')} />
            <FilterPill value="delivered" label="Delivered" count={countBy('delivered')}     active={statusFilter === 'delivered'} color="#22c55e" bg="#dcfce7" onClick={() => setStatusFilter('delivered')} />
            <FilterPill value="cancelled" label="Cancelled" count={countBy('cancelled')}     active={statusFilter === 'cancelled'} color="#ef4444" bg="#fee2e2" onClick={() => setStatusFilter('cancelled')} />
          </div>
        </div>

        {/* Order cards */}
        {ordersLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', gap: '0.75rem' }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)',
              animation: 'spin 0.7s linear infinite',
            }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading orders…</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: '#fff', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)', padding: '3.5rem 2rem',
              textAlign: 'center', boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--primary-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <ShoppingCart size={28} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>
              {searchTerm || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders yet'}
            </h3>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', maxWidth: 300, margin: '0 auto 1.25rem' }}>
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or clearing the status filter.'
                : 'Browse the product catalog below to add items to your cart and place an order.'}
            </p>
            {(searchTerm || statusFilter !== 'all') ? (
              <Button variant="secondary" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                Clear Filters
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setCatalogOpen(true)} icon={ShoppingCart}>
                Browse Catalog
              </Button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Table-style header row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1.4fr 1.1fr auto',
              gap: '1rem',
              padding: '0.4rem 1.25rem',
              paddingLeft: 'calc(1.25rem + 4px)',
            }}>
              {['Order Ref / Date', 'Customer', 'Status', 'Amount', ''].map((h, i) => (
                <div key={i} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i === 3 ? 'right' : 'left' }}>
                  {h}
                </div>
              ))}
            </div>

            <AnimatePresence>
              {filteredOrders.map((order, i) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  index={i}
                  onView={(o) => { setSelectedOrder(o); setIsDetailModalOpen(true); }}
                  onCancel={setCancelTarget}
                />
              ))}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* ── Product Catalog ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
        style={{ padding: 0, overflow: 'hidden' }}
      >
        <button
          onClick={() => setCatalogOpen(o => !o)}
          style={{
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            padding: '1rem 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: catalogOpen ? '1px solid var(--border-color)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'var(--primary-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Package size={16} color="var(--primary)" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.93rem', color: 'var(--text-primary)' }}>
              Product Catalog
            </span>
            <span style={{
              fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700,
              background: 'var(--primary-glow)', padding: '2px 8px', borderRadius: 50,
              border: '1px solid rgba(46,197,192,0.25)',
            }}>
              {products.length} items
            </span>
          </div>
          {catalogOpen
            ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />
            : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
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
              <div style={{ padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ position: 'relative', maxWidth: 320 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input
                    type="text" className="form-input"
                    placeholder="Search products by name or SKU…"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    style={{ paddingLeft: 32, margin: 0 }}
                  />
                </div>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                gap: '1rem', padding: '1.25rem 1.5rem',
                maxHeight: '400px', overflowY: 'auto',
              }}>
                {catalogProducts.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No products match your search.
                  </div>
                ) : catalogProducts.map(p => (
                  <CatalogCard key={p.id} product={p} onAddToCart={handleAddToCart} onImageClick={setLightboxUrl} getStockBadge={getStockBadge} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      {createPortal(
        <AnimatePresence>
          {lightboxUrl && (
            <motion.div
              key="lightbox"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setLightboxUrl(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
            >
              <motion.img
                src={lightboxUrl}
                initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{ maxWidth: '88vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 'var(--radius-lg)', boxShadow: '0 25px 80px rgba(0,0,0,0.8)' }}
                onClick={e => e.stopPropagation()}
              />
              <button
                onClick={() => setLightboxUrl(null)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Modals ───────────────────────────────────────────── */}
      {isAdmin && (
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          onSave={handleCreateOrder}
          customers={customers}
          products={products}
        />
      )}
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedOrder(null); }}
        order={selectedOrder}
        onCancelOrder={handleCancelOrderDirect}
        onStatusUpdated={() => { fetchOrders(); fetchProducts(); }}
      />

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelOrder}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? Stock will be restored."
        confirmText="Yes, Cancel Order"
        cancelText="Keep Order"
        confirmVariant="danger"
      />
    </div>
  );
};

/* ── Catalog Card ────────────────────────────────────────────── */
const CatalogCard = ({ product, onAddToCart, onImageClick, getStockBadge }) => {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered]   = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-tertiary)',
        border: `1px solid ${hovered ? 'rgba(46,197,192,0.45)' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: hovered ? '0 4px 20px rgba(46,197,192,0.15)' : 'none',
        transition: 'border-color 0.18s, box-shadow 0.18s',
      }}
    >
      {/* Image */}
      <div
        style={{
          height: 130, position: 'relative', overflow: 'hidden',
          background: 'var(--bg-secondary)', flexShrink: 0,
          cursor: product.image_url && !imgError ? 'zoom-in' : 'default',
        }}
        onClick={() => { if (product.image_url && !imgError) onImageClick(product.image_url); }}
      >
        {product.image_url && !imgError ? (
          <>
            <img
              src={product.image_url} alt={product.name} onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: hovered ? 'rgba(0,0,0,0.28)' : 'transparent', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {hovered && <ZoomIn size={20} style={{ color: 'rgba(255,255,255,0.9)' }} />}
            </div>
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={30} style={{ color: 'var(--text-muted)', opacity: 0.35 }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0.6rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div title={product.name} style={{ fontWeight: 600, fontSize: '0.84rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
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
            padding: '0.45rem 0', fontSize: '0.8rem', fontWeight: 600,
            cursor: product.quantity === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            transition: 'all var(--transition-fast)',
          }}
        >
          <ShoppingCart size={13} />
          {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default Orders;
