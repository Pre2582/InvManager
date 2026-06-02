import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Eye,
  Search,
  XCircle,
} from 'lucide-react';
import useOrders from '@/hooks/useOrders';
import useCustomers from '@/hooks/useCustomers';
import useProducts from '@/hooks/useProducts';
import DataTable from '@/components/common/DataTable';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import SearchBar from '@/components/common/SearchBar';
import OrderModal from '@/features/orders/OrderModal';
import OrderDetailModal from '@/features/orders/OrderDetailModal';
import { formatCurrency, formatDateTime, shortId, statusVariant } from '@/utils/formatters';
import useToast from '@/hooks/useToast';

const Orders = () => {
  const {
    orders,
    loading: ordersLoading,
    fetchOrders,
    createOrder,
    cancelOrder,
  } = useOrders();

  const { customers, fetchCustomers } = useCustomers();
  const { products, fetchProducts } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
  }, [fetchOrders, fetchCustomers, fetchProducts]);

  // Filter orders by customer name, order ID, or status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = async (payload) => {
    await createOrder(payload);
    // Refresh products to ensure stock quantities are synchronized
    fetchProducts();
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId);
      // Refresh products to restore stock quantities
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order.');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const columns = [
    {
      header: 'Order Ref',
      key: 'id',
      width: '120px',
      render: (row) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 600,
            color: 'var(--primary)',
            cursor: 'pointer',
          }}
          onClick={() => handleViewDetails(row)}
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
      width: '120px',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-icon"
            onClick={() => handleViewDetails(row)}
            title="View Details"
          >
            <Eye size={16} />
          </button>
          {row.status !== 'cancelled' && (
            <button
              className="btn-icon"
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) {
                  handleCancelOrder(row.id);
                }
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
      {/* Search / Filters Bar */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order ID reference or customer name..."
            style={{ flexGrow: 1 }}
          >
            {/* Status Filter */}
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

          <Button variant="primary" onClick={() => setIsOrderModalOpen(true)} icon={Plus}>
            New Order
          </Button>
        </div>
      </div>

      {/* Orders Data Table */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DataTable
          columns={columns}
          data={filteredOrders}
          loading={ordersLoading}
          emptyTitle="No Orders Found"
          emptyDescription={
            searchTerm || statusFilter !== 'all'
              ? 'No order logs match your filter options.'
              : 'Place an order using the catalog products to populate logs.'
          }
          emptyIcon={ShoppingCart}
          emptyAction={
            searchTerm || statusFilter !== 'all' ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setIsOrderModalOpen(true)} icon={Plus}>
                New Order
              </Button>
            )
          }
        />
      </motion.div>

      {/* Place Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSave={handleCreateOrder}
        customers={customers}
        products={products}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onCancelOrder={handleCancelOrder}
      />
    </div>
  );
};

export default Orders;
