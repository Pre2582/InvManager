import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  Search,
  RefreshCw,
} from 'lucide-react';
import useProducts from '@/hooks/useProducts';
import DataTable from '@/components/common/DataTable';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import SearchBar from '@/components/common/SearchBar';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ProductModal from '@/features/products/ProductModal';
import { formatCurrency } from '@/utils/formatters';
import useToast from '@/hooks/useToast';

const Products = () => {
  const {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filtering products based on name or SKU
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

  // CSV Export
  const handleExportCSV = () => {
    if (products.length === 0) {
      toast.info('No products available to export.');
      return;
    }

    const headers = ['Name', 'SKU', 'Price', 'Quantity', 'Description'];
    const rows = products.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku.replace(/"/g, '""')}"`,
      p.price,
      p.quantity,
      `"${(p.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'products_catalog.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Products exported successfully.');
  };

  // CSV Import Parser
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
        const nameIdx = headers.findIndex((h) => h.toLowerCase() === 'name');
        const skuIdx = headers.findIndex((h) => h.toLowerCase() === 'sku');
        const priceIdx = headers.findIndex((h) => h.toLowerCase() === 'price');
        const qtyIdx = headers.findIndex((h) => h.toLowerCase() === 'quantity');
        const descIdx = headers.findIndex((h) => h.toLowerCase() === 'description');

        if (nameIdx === -1 || skuIdx === -1 || priceIdx === -1 || qtyIdx === -1) {
          throw new Error('CSV must contain Name, SKU, Price, and Quantity columns.');
        }

        let successCount = 0;
        let failCount = 0;
        const errors = [];

        // Loop rows (excluding header)
        for (let i = 1; i < lines.length; i++) {
          // Simple regex split to handle quoted fields containing commas
          const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
          if (row.length < 4) continue;

          const getValue = (idx) => {
            if (idx === -1 || !row[idx]) return '';
            return row[idx].trim().replace(/^["']|["']$/g, '');
          };

          const name = getValue(nameIdx);
          const sku = getValue(skuIdx);
          const price = parseFloat(getValue(priceIdx));
          const quantity = parseInt(getValue(qtyIdx), 10);
          const description = descIdx !== -1 ? getValue(descIdx) : '';

          if (!name || !sku || isNaN(price) || isNaN(quantity)) {
            failCount++;
            errors.push(`Row ${i + 1}: Missing or invalid data.`);
            continue;
          }

          try {
            await createProduct({ name, sku, price, quantity, description });
            successCount++;
          } catch (err) {
            failCount++;
            errors.push(`Row ${i + 1} (${sku}): ${err.message || 'Duplicate SKU or Server Error'}`);
          }
        }

        if (successCount > 0) {
          toast.success(`Import complete! Successfully created ${successCount} products.`);
          fetchProducts();
        }
        if (failCount > 0) {
          toast.error(`Failed to import ${failCount} products. Check logs for details.`);
          console.error('CSV Import Errors:', errors);
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

  const getStockBadge = (qty) => {
    if (qty === 0) return <Badge variant="danger">Out of stock</Badge>;
    if (qty <= 10) return <Badge variant="warning">{qty} low stock</Badge>;
    return <Badge variant="success">{qty} in stock</Badge>;
  };

  const columns = [
    {
      header: 'SKU',
      key: 'sku',
      width: '120px',
      render: (row) => <code style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>{row.sku}</code>,
    },
    {
      header: 'Product Name',
      key: 'name',
      render: (row) => <span style={{ fontWeight: 500 }}>{row.name}</span>,
    },
    {
      header: 'Price',
      key: 'price',
      width: '120px',
      render: (row) => formatCurrency(row.price),
    },
    {
      header: 'Stock Level',
      key: 'quantity',
      width: '150px',
      render: (row) => getStockBadge(row.quantity),
    },
    {
      header: 'Description',
      key: 'description',
      render: (row) => (
        <span
          style={{
            display: 'block',
            maxWidth: '240px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
          }}
        >
          {row.description || '—'}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      width: '120px',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-icon" onClick={() => handleEditClick(row)} title="Edit Product">
            <Edit2 size={16} />
          </button>
          <button
            className="btn-icon"
            onClick={() => setDeleteId(row.id)}
            style={{ color: 'var(--danger)' }}
            title="Delete Product"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Action panel */}
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
            placeholder="Search by name or SKU..."
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
              Add Product
            </Button>
          </div>
        </div>
      </div>

      {/* Main product table */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DataTable
          columns={columns}
          data={filteredProducts}
          loading={loading}
          emptyTitle="No Products Available"
          emptyDescription={
            searchTerm
              ? 'No products match your search query.'
              : 'Add products to your catalog to start managing inventory.'
          }
          emptyIcon={Package}
          emptyAction={
            searchTerm ? (
              <Button variant="secondary" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            ) : (
              <Button variant="primary" onClick={handleAddClick} icon={Plus}>
                Add Product
              </Button>
            )
          }
        />
      </motion.div>

      {/* Modals */}
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
    </div>
  );
};

export default Products;
