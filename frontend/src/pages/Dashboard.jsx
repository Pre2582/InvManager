import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Users,
  ShoppingCart,
  RefreshCw,
  DollarSign,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import useDashboard from '@/hooks/useDashboard';
import DataTable from '@/components/common/DataTable';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import ProductModal from '@/features/products/ProductModal';
import { updateProduct } from '@/api/products';
import useToast from '@/hooks/useToast';
import useTranslation from '@/hooks/useTranslation';
import useAuthStore from '@/store/authStore';
import { formatCurrency, formatDateTime, statusVariant } from '@/utils/formatters';

// ── KPI Card sub-component ────────────────────────────────────
const KpiCard = ({ title, value, icon: Icon, color, glow, desc, loading }) => (
  <motion.div
    className="glass-card"
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
    style={{ position: 'relative', overflow: 'hidden' }}
  >
    <div style={{
      position: 'absolute', top: '-15px', right: '-15px',
      width: '80px', height: '80px', borderRadius: '50%',
      background: glow, filter: 'blur(25px)', pointerEvents: 'none',
    }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
      <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: glow, border: `1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    <div style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
      {loading ? '—' : value}
    </div>
    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{desc}</div>
  </motion.div>
);

// ── Custom Area Chart Tooltip ─────────────────────────────────
const CustomAreaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: '0.6rem 0.9rem',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{label}</p>
      <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)' }}>{payload[0].value} orders</p>
    </div>
  );
};

// ── Dashboard Page ────────────────────────────────────────────
const Dashboard = () => {
  const { summary, loading, fetchSummary } = useDashboard();
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const toast = useToast();
  const { t } = useTranslation();
  const { username } = useAuthStore();

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Time-based greeting
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('goodMorning');
    if (h < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  const handleRestockClick = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleProductSave = async (updatedFields) => {
    try {
      await updateProduct(editingProduct.id, updatedFields);
      toast.success(`Product ${editingProduct.sku} updated successfully.`);
      fetchSummary();
    } catch (err) {
      toast.error(err.message || 'Failed to update product.');
      throw err;
    }
  };

  // Safe data extraction
  const totalRevenue   = summary?.total_revenue    ?? 0;
  const totalProducts  = summary?.total_products   ?? 0;
  const totalCustomers = summary?.total_customers  ?? 0;
  const totalOrders    = summary?.total_orders     ?? 0;
  const lowStockCount  = summary?.low_stock_count  ?? 0;
  const lowStockProducts = summary?.low_stock_products ?? [];
  const chartData        = summary?.orders_by_day  ?? [];
  const ordersByStatus   = summary?.orders_by_status ?? { pending: 0, confirmed: 0, cancelled: 0 };
  const recentOrders     = summary?.recent_orders  ?? [];

  // Donut chart data
  const statusChartData = [
    { name: t('confirmed'), value: ordersByStatus.confirmed, color: '#22c55e' },
    { name: t('pending'),   value: ordersByStatus.pending,   color: '#f59e0b' },
    { name: t('cancelled'), value: ordersByStatus.cancelled, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  // Low stock table columns
  const lowStockColumns = [
    {
      header: 'Product Name',
      key: 'name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.sku}</div>
        </div>
      ),
    },
    {
      header: 'Stock Status',
      key: 'quantity',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant="danger">{row.quantity} left</Badge>
        </div>
      ),
    },
    {
      header: 'Price',
      key: 'price',
      render: (row) => formatCurrency(row?.price),
    },
    {
      header: 'Action',
      key: 'actions',
      width: '120px',
      render: (row) => (
        <Button
          variant="secondary"
          onClick={() => handleRestockClick(row)}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
        >
          Restock
        </Button>
      ),
    },
  ];

  return (
    <div className="page-container">

      {/* ── Welcome Banner ─────────────────────────────────── */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--gradient-primary)',
          border: 'none',
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          color: 'white',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>
            {getGreeting()}, {username ?? 'Admin'} 👋
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
            {t('dashboardSubtitle')}
          </p>
        </div>
        <Button
          onClick={fetchSummary}
          icon={RefreshCw}
          loading={loading}
          style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', color: 'white' }}
        >
          {t('sync')}
        </Button>
      </motion.div>

      {/* ── KPI Cards ─────────────────────────────────────── */}
      <div className="dashboard-grid">
        <KpiCard
          title={t('totalRevenue')}
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          color="#22c55e"
          glow="rgba(34,197,94,0.12)"
          desc={t('revenueFromOrders')}
          loading={loading}
        />
        <KpiCard
          title={t('totalProducts')}
          value={totalProducts}
          icon={Package}
          color="var(--primary)"
          glow="var(--primary-glow)"
          desc={t('inCatalog')}
          loading={loading}
        />
        <KpiCard
          title={t('totalCustomers')}
          value={totalCustomers}
          icon={Users}
          color="#f59e0b"
          glow="rgba(245,158,11,0.12)"
          desc={t('registered')}
          loading={loading}
        />
        <KpiCard
          title={t('totalOrders')}
          value={totalOrders}
          icon={ShoppingCart}
          color="#8b5cf6"
          glow="rgba(139,92,246,0.12)"
          desc={t('processed')}
          loading={loading}
        />
      </div>

      {/* ── Charts Row ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>

        {/* Area Chart — Order Frequency */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ height: '320px', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t('orderFrequency')}</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {t('dailyAverage')}: {chartData.length ? Math.round(chartData.reduce((s, d) => s + d.count, 0) / chartData.length) : 0} orders
              </span>
            </div>
            <Activity size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ flexGrow: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2ec5c0" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2ec5c0" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,197,192,0.15)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2ec5c0"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                  dot={{ fill: '#2ec5c0', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#2ec5c0' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Donut Chart — Orders by Status */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ height: '320px', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t('ordersByStatus')}</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {totalOrders} {t('totalOrders').toLowerCase()}
            </span>
          </div>
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {statusChartData.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <ShoppingCart size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem' }}>No orders yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend
                    iconType="circle"
                    iconSize={9}
                    formatter={(value) => (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Row: Recent Orders + Low Stock ──────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>

        {/* Recent Orders */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t('recentOrders')}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last 5</span>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <ShoppingCart size={32} style={{ opacity: 0.25, marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.85rem' }}>{t('noRecentOrders')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      background: 'var(--primary-glow)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', flexShrink: 0,
                    }}>
                      {order.customer_name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{order.customer_name}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{formatDateTime(order.created_at)}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {formatCurrency(order.total_amount)}
                    </div>
                    <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Low Stock */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ maxHeight: '420px', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t('restockRequired')}</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Under 10 units</span>
            </div>
            {lowStockCount > 0 && <Badge variant="danger">⚠ {lowStockCount}</Badge>}
          </div>
          <div style={{ overflowY: 'auto', flexGrow: 1 }}>
            <DataTable
              columns={lowStockColumns}
              data={lowStockProducts}
              loading={loading}
              emptyTitle="Catalog Healthy"
              emptyDescription="No products running low on stock."
              emptyIcon={Package}
            />
          </div>
        </motion.div>
      </div>

      {/* Product edit modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleProductSave}
        product={editingProduct}
      />
    </div>
  );
};

export default Dashboard;
