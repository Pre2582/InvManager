import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Users, ShoppingCart, RefreshCw,
  DollarSign, Activity, TrendingUp, AlertTriangle,
  ArrowUpRight, Zap,
} from 'lucide-react';
import {
  ComposedChart, Bar, Line, ReferenceLine,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Label,
} from 'recharts';
import useDashboard from '@/hooks/useDashboard';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import ProductModal from '@/features/products/ProductModal';
import { updateProduct } from '@/api/products';
import useToast from '@/hooks/useToast';
import useTranslation from '@/hooks/useTranslation';
import useAuthStore from '@/store/authStore';
import { formatCurrency, formatDateTime, statusVariant } from '@/utils/formatters';

/* ── Animated counter hook ───────────────────────────────────── */
const useCountUp = (target, duration = 1100) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const n = Number(target) || 0;
    if (!n) return;
    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(n * eased);
      if (p < 1) requestAnimationFrame(tick);
      else setVal(n);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
};

/* ── Stagger variants ────────────────────────────────────────── */
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Gradient KPI Card ───────────────────────────────────────── */
const KpiCard = ({ title, rawValue, displayFn, icon: Icon, gradient, glow, desc }) => {
  const animated = useCountUp(rawValue);
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -5, boxShadow: `0 20px 48px ${glow}` }}
      transition={{ duration: 0.22 }}
      style={{
        background: gradient,
        borderRadius: 'var(--radius-lg)',
        padding: '1.4rem 1.5rem',
        boxShadow: `0 6px 24px ${glow}`,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: -22, right: -22, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -28, right: 18, width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.9rem' }}>
        <span style={{ fontSize: '0.73rem', fontWeight: 700, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} color="#fff" />
        </div>
      </div>

      <div style={{ fontSize: '1.95rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1 }}>
        {displayFn(animated)}
      </div>
      <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.70)', marginTop: '0.4rem' }}>{desc}</div>

      {/* Subtle shimmer bar at bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.18)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }} />
    </motion.div>
  );
};

/* ── Rounded-top bar shape ───────────────────────────────────── */
const RoundedBar = ({ x, y, width, height, fill }) => {
  if (!height || height <= 0) return null;
  const r = Math.min(6, width / 2, height);
  return (
    <path
      d={`M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} Z`}
      fill={fill}
    />
  );
};

/* ── Bar chart tooltip ───────────────────────────────────────── */
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      style={{
        background: 'linear-gradient(135deg, #fff 0%, #f0fdfa 100%)',
        border: '1px solid rgba(46,197,192,0.30)',
        borderRadius: 12,
        padding: '0.6rem 1rem',
        boxShadow: '0 8px 28px rgba(46,197,192,0.18)',
        minWidth: 110,
      }}
    >
      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2ec5c0', lineHeight: 1 }}>{val}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>orders</span>
      </div>
    </motion.div>
  );
};

/* ── Donut center label ──────────────────────────────────────── */
const DonutCenter = ({ viewBox, total }) => {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text x={cx} y={cy - 7} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: '1.55rem', fontWeight: 800, fill: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: '0.62rem', fill: '#94a3b8', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
        TOTAL
      </text>
    </g>
  );
};

/* ── Status legend item with animated bar ────────────────────── */
const StatusLegendItem = ({ name, value, color, pct, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: 12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.35 }}
    style={{ display: 'flex', flexDirection: 'column', gap: 5 }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}88`, flexShrink: 0 }} />
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{name}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color, minWidth: 34, textAlign: 'right' }}>{pct}%</span>
      </div>
    </div>
    <div style={{ height: 5, background: 'var(--bg-tertiary)', borderRadius: 50, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.85, delay: delay + 0.15, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: '100%', background: color, borderRadius: 50 }}
      />
    </div>
  </motion.div>
);

/* ── Recent order row ────────────────────────────────────────── */
const STATUS_BORDER = {
  pending:   '#f59e0b',
  confirmed: '#2ec5c0',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

const AVATAR_PALETTE = [
  { bg: '#dbeafe', text: '#1d4ed8' }, { bg: '#fce7f3', text: '#be185d' },
  { bg: '#d1fae5', text: '#065f46' }, { bg: '#fef3c7', text: '#92400e' },
  { bg: '#ede9fe', text: '#5b21b6' }, { bg: '#fee2e2', text: '#991b1b' },
];
const avatarColor = (n = '') => {
  let h = 0;
  for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
};
const initials = (n = '') => {
  const p = n.trim().split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : n.slice(0, 2).toUpperCase();
};

const RecentOrderRow = ({ order, index }) => {
  const color = avatarColor(order.customer_name || '');
  const borderColor = STATUS_BORDER[order.status?.toLowerCase()] || 'var(--border-color)';
  return (
    <motion.div
      variants={fadeUp}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.7rem 0.85rem',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        borderLeft: `3px solid ${borderColor}`,
        transition: 'box-shadow 0.18s',
      }}
      whileHover={{ boxShadow: `0 4px 16px ${borderColor}22` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: color.bg, color: color.text,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
        }}>
          {order.customer_name ? initials(order.customer_name) : '?'}
        </div>
        <div>
          <div style={{ fontSize: '0.87rem', fontWeight: 600, color: 'var(--text-primary)' }}>{order.customer_name || 'Unknown'}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDateTime(order.created_at)}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {formatCurrency(order.total_amount)}
        </div>
        <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
      </div>
    </motion.div>
  );
};

/* ── Low stock row ───────────────────────────────────────────── */
const LowStockRow = ({ product, onRestock, index }) => {
  const pct = Math.min((product.quantity / 10) * 100, 100);
  const barColor = product.quantity === 0 ? '#ef4444' : product.quantity <= 3 ? '#f97316' : '#f59e0b';
  return (
    <motion.div
      variants={fadeUp}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.875rem',
        padding: '0.75rem 0.85rem',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${barColor}33`,
      }}
      whileHover={{ borderColor: `${barColor}66`, boxShadow: `0 4px 16px ${barColor}18` }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: `${barColor}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Package size={16} color={barColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
              {product.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{product.sku} · {formatCurrency(product.price)}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: barColor,
              background: `${barColor}18`, padding: '2px 8px', borderRadius: 50, border: `1px solid ${barColor}33` }}>
              {product.quantity} left
            </span>
            <button
              onClick={() => onRestock(product)}
              style={{
                padding: '0.3rem 0.7rem', borderRadius: 'var(--radius-sm)',
                background: 'var(--gradient-primary)', border: 'none',
                color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Restock
            </button>
          </div>
        </div>
        <div style={{ height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 50, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, delay: index * 0.06 + 0.2, ease: 'easeOut' }}
            style={{ height: '100%', background: barColor, borderRadius: 50 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

/* ── Dashboard Page ──────────────────────────────────────────── */
const Dashboard = () => {
  const { summary, loading, fetchSummary } = useDashboard();
  const [editingProduct, setEditingProduct]       = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const toast = useToast();
  const { t } = useTranslation();
  const { username } = useAuthStore();

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('goodMorning');
    if (h < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  const handleRestockClick = (product) => { setEditingProduct(product); setIsProductModalOpen(true); };
  const handleProductSave  = async (fields) => {
    try {
      await updateProduct(editingProduct.id, fields);
      toast.success(`${editingProduct.sku} updated.`);
      fetchSummary();
    } catch (err) {
      toast.error(err.message || 'Failed to update product.');
      throw err;
    }
  };

  /* ── Safe data ─────────────────────────────────────────────── */
  const totalRevenue    = summary?.total_revenue    ?? 0;
  const totalProducts   = summary?.total_products   ?? 0;
  const totalCustomers  = summary?.total_customers  ?? 0;
  const totalOrders     = summary?.total_orders     ?? 0;
  const lowStockCount   = summary?.low_stock_count  ?? 0;
  const lowStockProducts = summary?.low_stock_products ?? [];
  const chartData        = summary?.orders_by_day   ?? [];
  const ordersByStatus   = summary?.orders_by_status ?? {};
  const recentOrders     = summary?.recent_orders   ?? [];

  const allStatusData = [
    { name: 'Confirmed', value: ordersByStatus.confirmed || 0, color: '#22c55e' },
    { name: 'Delivered', value: ordersByStatus.delivered || 0, color: '#2ec5c0' },
    { name: 'Pending',   value: ordersByStatus.pending   || 0, color: '#f59e0b' },
    { name: 'Cancelled', value: ordersByStatus.cancelled || 0, color: '#ef4444' },
  ];
  const statusChartData = allStatusData.filter(d => d.value > 0);

  const totalChart = allStatusData.reduce((s, d) => s + d.value, 0) || totalOrders;
  const dailyAvg   = chartData.length ? Math.round(chartData.reduce((s, d) => s + d.count, 0) / chartData.length) : 0;
  const chartTotal = chartData.reduce((s, d) => s + d.count, 0);
  const maxCount   = chartData.length ? Math.max(...chartData.map(d => d.count)) : 0;

  return (
    <div className="page-container">

      {/* ── Welcome Banner ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'linear-gradient(135deg, #2ec5c0 0%, #1aa8a3 55%, #0f8f8a 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.6rem 2rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '1rem',
          boxShadow: '0 6px 28px rgba(46,197,192,0.30)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Animated background circles */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.18, 0.12] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', pointerEvents: 'none' }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{ position: 'absolute', right: 80, bottom: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }}
        />

        <div style={{ zIndex: 1 }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>
            {getGreeting()}, {username ?? 'Admin'} 👋
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.875rem' }}>
            {t('dashboardSubtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', zIndex: 1 }}>
          {lowStockCount > 0 && (
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0.42rem 0.9rem', borderRadius: 50,
                background: 'rgba(239,68,68,0.18)',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#fca5a5', fontSize: '0.78rem', fontWeight: 700,
              }}
            >
              <AlertTriangle size={13} />
              {lowStockCount} low stock
            </motion.div>
          )}
          <Button
            onClick={fetchSummary}
            icon={RefreshCw}
            loading={loading}
            style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.32)', color: '#fff', backdropFilter: 'blur(8px)' }}
          >
            {t('sync')}
          </Button>
        </div>
      </motion.div>

      {/* ── KPI Grid ─────────────────────────────────────────── */}
      <motion.div
        className="dashboard-grid"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <KpiCard
          title={t('totalRevenue')}
          rawValue={totalRevenue}
          displayFn={v => formatCurrency(v)}
          icon={DollarSign}
          gradient="linear-gradient(135deg, #22c55e 0%, #15803d 100%)"
          glow="rgba(34,197,94,0.32)"
          desc={t('revenueFromOrders')}
        />
        <KpiCard
          title={t('totalProducts')}
          rawValue={totalProducts}
          displayFn={v => Math.round(v).toLocaleString()}
          icon={Package}
          gradient="linear-gradient(135deg, #2ec5c0 0%, #0284c7 100%)"
          glow="rgba(46,197,192,0.32)"
          desc={t('inCatalog')}
        />
        <KpiCard
          title={t('totalCustomers')}
          rawValue={totalCustomers}
          displayFn={v => Math.round(v).toLocaleString()}
          icon={Users}
          gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
          glow="rgba(245,158,11,0.32)"
          desc={t('registered')}
        />
        <KpiCard
          title={t('totalOrders')}
          rawValue={totalOrders}
          displayFn={v => Math.round(v).toLocaleString()}
          icon={ShoppingCart}
          gradient="linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
          glow="rgba(139,92,246,0.32)"
          desc={t('processed')}
        />
      </motion.div>

      {/* ── Charts Row ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', alignItems: 'stretch' }}>

        {/* ── Area Chart — Order Frequency ───────────────────── */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {/* Chart header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 3 }}>{t('orderFrequency')}</h3>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {t('dailyAverage')}: {dailyAvg} orders/day
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'var(--primary-glow)', padding: '4px 10px', borderRadius: 50,
                border: '1px solid rgba(46,197,192,0.25)',
              }}>
                <Zap size={11} color="var(--primary)" />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>{chartTotal} total</span>
              </div>
              <Activity size={16} style={{ color: 'var(--primary)' }} />
            </div>
          </div>

          {chartData.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-muted)' }}>
              <Activity size={36} style={{ opacity: 0.2 }} />
              <p style={{ fontSize: '0.85rem' }}>No order data yet</p>
            </div>
          ) : (
            <div style={{ flex: 1, minHeight: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 12, right: 8, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#2ec5c0" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#0891b2" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="barGradPeak" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#f59e0b" stopOpacity={1} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.55} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 4" stroke="rgba(46,197,192,0.08)" vertical={false} />
                  <XAxis
                    dataKey="date" stroke="transparent"
                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 500 }}
                    tickLine={false} axisLine={false} dy={8}
                  />
                  <YAxis
                    stroke="transparent"
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                    tickLine={false} axisLine={false} allowDecimals={false}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(46,197,192,0.06)', radius: [4, 4, 0, 0] }} />
                  {dailyAvg > 0 && (
                    <ReferenceLine
                      y={dailyAvg}
                      stroke="rgba(245,158,11,0.55)"
                      strokeDasharray="5 4"
                      strokeWidth={1.5}
                      label={{ value: `avg ${dailyAvg}`, position: 'insideTopRight', fontSize: 9, fill: '#f59e0b', fontWeight: 700, dy: -6 }}
                    />
                  )}
                  <Bar
                    dataKey="count"
                    shape={(props) => (
                      <RoundedBar
                        {...props}
                        fill={props.value === maxCount && maxCount > 0 ? 'url(#barGradPeak)' : 'url(#barGrad)'}
                      />
                    )}
                    animationDuration={1200}
                    animationEasing="ease-out"
                    maxBarSize={36}
                  />
                  <Line
                    type="monotone" dataKey="count"
                    stroke="rgba(46,197,192,0.45)" strokeWidth={2}
                    dot={{ r: 3, fill: '#2ec5c0', stroke: '#fff', strokeWidth: 1.5 }}
                    activeDot={{ r: 5, fill: '#2ec5c0', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* ── Donut — Orders by Status ────────────────────────── */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ marginBottom: '1.1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 3 }}>{t('ordersByStatus')}</h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              {totalOrders} {t('totalOrders').toLowerCase()} across all statuses
            </span>
          </div>

          {statusChartData.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-muted)' }}>
              <ShoppingCart size={36} style={{ opacity: 0.2 }} />
              <p style={{ fontSize: '0.85rem' }}>No orders yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
              {/* Donut */}
              <div style={{ width: 190, minHeight: 210, flex: '0 0 190px', alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%" cy="50%"
                      innerRadius={58} outerRadius={85}
                      paddingAngle={3} dataKey="value"
                      animationBegin={200} animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {statusChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                      <Label
                        content={({ viewBox }) => <DonutCenter viewBox={viewBox} total={totalChart} />}
                        position="center"
                      />
                    </Pie>
                    <Tooltip
                      formatter={(v, n) => [`${v} orders`, n]}
                      contentStyle={{
                        background: '#fff', border: '1px solid var(--border-color)',
                        borderRadius: 10, fontSize: '0.8rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend with animated bars — always shows all 4 statuses */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem', justifyContent: 'center' }}>
                {allStatusData.map((item, i) => (
                  <StatusLegendItem
                    key={item.name}
                    name={item.name}
                    value={item.value}
                    color={item.color}
                    pct={totalChart > 0 ? Math.round((item.value / totalChart) * 100) : 0}
                    delay={0.3 + i * 0.08}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Bottom Row ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>

        {/* Recent Orders */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t('recentOrders')}</h3>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
              background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 50,
            }}>Last {recentOrders.length}</span>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              <ShoppingCart size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
              <p style={{ fontSize: '0.85rem' }}>{t('noRecentOrders')}</p>
            </div>
          ) : (
            <motion.div
              style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {recentOrders.map((order, i) => (
                <RecentOrderRow key={order.id} order={order} index={i} />
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Low Stock */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxHeight: 440, display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t('restockRequired')}</h3>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Inventory under 10 units</span>
            </div>
            {lowStockCount > 0 && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Badge variant="danger">⚠ {lowStockCount}</Badge>
              </motion.div>
            )}
          </div>

          {lowStockProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              <Package size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
              <p style={{ fontSize: '0.85rem' }}>All stock levels are healthy</p>
            </div>
          ) : (
            <motion.div
              style={{ overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {lowStockProducts.map((product, i) => (
                <LowStockRow key={product.id} product={product} onRestock={handleRestockClick} index={i} />
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Product edit modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
        onSave={handleProductSave}
        product={editingProduct}
      />
    </div>
  );
};

export default Dashboard;
