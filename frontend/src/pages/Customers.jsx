import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Trash2,
  Download,
  Upload,
} from 'lucide-react';
import useCustomers from '@/hooks/useCustomers';
import DataTable from '@/components/common/DataTable';
import Button from '@/components/common/Button';
import SearchBar from '@/components/common/SearchBar';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import CustomerModal from '@/features/customers/CustomerModal';
import { formatDate } from '@/utils/formatters';
import useToast from '@/hooks/useToast';

const Customers = () => {
  const {
    customers,
    loading,
    fetchCustomers,
    createCustomer,
    deleteCustomer,
  } = useCustomers();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Filtering customers by name or email
  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (formData) => {
    await createCustomer(formData);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCustomer(deleteId);
      setDeleteId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete customer.');
    }
  };

  // CSV Export for Customers
  const handleExportCSV = () => {
    if (customers.length === 0) {
      toast.info('No customers available to export.');
      return;
    }

    const headers = ['Full Name', 'Email', 'Phone', 'Created At'];
    const rows = customers.map((c) => [
      `"${c.full_name.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.phone.replace(/"/g, '""')}"`,
      c.created_at,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'customers_database.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Customers exported successfully.');
  };

  // CSV Import for Customers
  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');

        if (lines.length <= 1) {
          throw new Error('CSV file is empty or missing headers.');
        }

        const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
        const nameIdx = headers.findIndex(
          (h) => h.toLowerCase() === 'full name' || h.toLowerCase() === 'fullname' || h.toLowerCase() === 'name'
        );
        const emailIdx = headers.findIndex((h) => h.toLowerCase() === 'email');
        const phoneIdx = headers.findIndex((h) => h.toLowerCase() === 'phone');

        if (nameIdx === -1 || emailIdx === -1 || phoneIdx === -1) {
          throw new Error('CSV must contain Name, Email, and Phone columns.');
        }

        let successCount = 0;
        let failCount = 0;
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
          if (row.length < 3) continue;

          const getValue = (idx) => {
            if (idx === -1 || !row[idx]) return '';
            return row[idx].trim().replace(/^["']|["']$/g, '');
          };

          const full_name = getValue(nameIdx);
          const email = getValue(emailIdx);
          const phone = getValue(phoneIdx);

          if (!full_name || !email || !phone) {
            failCount++;
            errors.push(`Row ${i + 1}: Missing customer name, email, or phone.`);
            continue;
          }

          try {
            await createCustomer({ full_name, email, phone });
            successCount++;
          } catch (err) {
            failCount++;
            errors.push(`Row ${i + 1} (${email}): ${err.message || 'Duplicate email or Server Error'}`);
          }
        }

        if (successCount > 0) {
          toast.success(`Import complete! Created ${successCount} customers.`);
          fetchCustomers();
        }
        if (failCount > 0) {
          toast.error(`Failed to import ${failCount} customers. Check console for logs.`);
          console.error('Customer CSV Import Errors:', errors);
        }
      } catch (err) {
        toast.error(`Import failed: ${err.message}`);
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const columns = [
    {
      header: 'Full Name',
      key: 'full_name',
      render: (row) => (
        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
          {row.full_name}
        </span>
      ),
    },
    {
      header: 'Email Address',
      key: 'email',
      render: (row) => row.email,
    },
    {
      header: 'Phone',
      key: 'phone',
      render: (row) => row.phone,
    },
    {
      header: 'Date Registered',
      key: 'created_at',
      width: '150px',
      render: (row) => formatDate(row.created_at),
    },
    {
      header: 'Actions',
      key: 'actions',
      width: '100px',
      render: (row) => (
        <button
          className="btn-icon"
          onClick={() => setDeleteId(row.id)}
          style={{ color: 'var(--danger)' }}
          title="Remove Customer"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Search and Action Header */}
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
            placeholder="Search customers by name or email..."
            style={{ flexGrow: 1 }}
          />

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleImportCSV}
              style={{ display: 'none' }}
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              icon={Upload}
              loading={importing}
            >
              Import CSV
            </Button>
            <Button variant="secondary" onClick={handleExportCSV} icon={Download}>
              Export
            </Button>
            <Button variant="primary" onClick={handleAddClick} icon={Plus}>
              Add Customer
            </Button>
          </div>
        </div>
      </div>

      {/* Customers Data Table */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DataTable
          columns={columns}
          data={filteredCustomers}
          loading={loading}
          emptyTitle="No Customers Found"
          emptyDescription={
            searchTerm
              ? 'No customer records match your filter criteria.'
              : 'Add customer profiles to start placing orders.'
          }
          emptyIcon={Users}
          emptyAction={
            searchTerm ? (
              <Button variant="secondary" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            ) : (
              <Button variant="primary" onClick={handleAddClick} icon={Plus}>
                Add Customer
              </Button>
            )
          }
        />
      </motion.div>

      {/* Forms and Dialogs */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Customer"
        message="Are you sure you want to remove this customer? This profile will be deleted. Any past orders placed by this customer will remain in the database under their name, but the customer account will be inactive."
      />
    </div>
  );
};

export default Customers;
