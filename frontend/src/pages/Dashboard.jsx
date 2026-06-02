import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import useDashboard from '@/hooks/useDashboard';
import StatCard from '@/components/common/StatCard';
import DataTable from '@/components/common/DataTable';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import ProductModal from '@/features/products/ProductModal';
import { updateProduct } from '@/api/products';
import useToast from '@/hooks/useToast';

const Dashboard = () => {
  const { summary, loading, fetchSummary } = useDashboard();
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleRestockClick = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleProductSave = async (updatedFields) => {
    try {
      await updateProduct(editingProduct.id, updatedFields);
      toast.success(`Product ${editingProduct.sku} updated successfully.`);
      fetchSummary(); // Refresh stats
    } catch (err) {
      toast.error(err.message || 'Failed to update product.');
      throw err;
    }
  };

  // Safe variables mapping from summary
  const totalProducts = summary?.total_products ?? 0;
  const totalCustomers = summary?.total_customers ?? 0;
  const totalOrders = summary?.total_orders ?? 0;
  const lowStockCount = summary?.low_stock_count ?? 0;
  const lowStockProducts = summary?.low_stock_products ?? [];
  const chartData = summary?.orders_by_day ?? [];

  // Low stock table column configurations
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
      render: (row) => `$${row?.price}`,
    },
    {
      header: 'Action',
      key: 'actions',
      width: '120px',
      render: (row) => (
        <Button variant="secondary" onClick={() => handleRestockClick(row)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
          Restock
        </Button>
      ),
    },
  ];

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</p>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>
            Orders Placed: <span style={{ color: 'var(--text-primary)' }}>{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      {/* Upper Title Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time analytics and inventory alerts.
          </p>
        </div>
        <Button variant="secondary" onClick={fetchSummary} icon={RefreshCw} loading={loading}>
          Sync
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="dashboard-grid">
        <StatCard
          title="Total Products"
          value={loading ? '...' : totalProducts}
          icon={Package}
          color="primary"
          description="In catalog"
        />
        <StatCard
          title="Total Customers"
          value={loading ? '...' : totalCustomers}
          icon={Users}
          color="accent"
          description="Registered profiles"
        />
        <StatCard
          title="Total Orders"
          value={loading ? '...' : totalOrders}
          icon={ShoppingCart}
          color="success"
          description="Processed orders"
        />
        <StatCard
          title="Low Stock Alerts"
          value={loading ? '...' : lowStockCount}
          icon={AlertTriangle}
          color={lowStockCount > 0 ? 'danger' : 'success'}
          description={lowStockCount > 0 ? 'Requires attention' : 'Inventory is healthy'}
        />
      </div>

      {/* Charts & Alerts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Order Trend Chart */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ height: '400px', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Order Frequency</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily volume tracker</span>
            </div>
            <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
          </div>

          <div style={{ flexGrow: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 41, 59, 0.4)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Low Stock Listing */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ maxHeight: '400px', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Restock Required</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Items running out of stock (under 10 units)</span>
            </div>
            {lowStockCount > 0 && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>⚠️ Critical</span>}
          </div>

          <div style={{ overflowY: 'auto', flexGrow: 1 }}>
            <DataTable
              columns={lowStockColumns}
              data={lowStockProducts}
              loading={loading}
              emptyTitle="Catalog Healthy"
              emptyDescription="No products are currently running low on stock."
              emptyIcon={Package}
            />
          </div>
        </motion.div>
      </div>

      {/* Editing product modal */}
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
