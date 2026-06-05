import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Trash2, Download, Upload,
  Mail, Phone, Calendar, Search, UserPlus, UserCheck,
} from 'lucide-react';
import useCustomers from '@/hooks/useCustomers';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import CustomerModal from '@/features/customers/CustomerModal';
import { formatDate } from '@/utils/formatters';
import useToast from '@/hooks/useToast';

/* ── Avatar helpers ──────────────────────────────────────────── */
const PALETTE = [
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#fce7f3', text: '#be185d' },
  { bg: '#d1fae5', text: '#065f46' },
  { bg: '#fef3c7', text: '#92400e' },
  { bg: '#ede9fe', text: '#5b21b6' },
  { bg: '#fee2e2', text: '#991b1b' },
  { bg: '#e0f2fe', text: '#0369a1' },
  { bg: '#ecfccb', text: '#3f6212' },
];

const avatarColor = (name) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
};

const initials = (name) => {
  const p = name.trim().split(/\s+/);
  return p.length >= 2
    ? (p[0][0] + p[p.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

const isThisMonth = (dateStr) => {
  const d = new Date(dateStr);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
};

/* ── Stat card ───────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{
      background: '#fff',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: 'var(--shadow-sm)',
      flex: '1 1 160px',
    }}
  >
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: color.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={20} color={color.icon} />
    </div>
    <div>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  </motion.div>
);

/* ── Customer card ───────────────────────────────────────────── */
const CustomerCard = ({ customer, onDelete, index }) => {
  const color = avatarColor(customer.full_name);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -8 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
      style={{
        background: '#fff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{
        boxShadow: '0 8px 28px rgba(46,197,192,0.13)',
        borderColor: 'rgba(46,197,192,0.40)',
        y: -2,
      }}
    >
      {/* Decorative accent strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${color.text}55, ${color.text}22)`,
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
      }} />

      {/* Header: avatar + name + delete */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: color.bg,
            color: color.text,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 700,
            flexShrink: 0,
            boxShadow: `0 0 0 3px ${color.bg}`,
            border: `2px solid ${color.text}22`,
          }}>
            {initials(customer.full_name)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.97rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {customer.full_name}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4,
              fontSize: '0.7rem', fontWeight: 600, color: color.text,
              background: color.bg, padding: '2px 8px', borderRadius: 50,
            }}>
              <UserCheck size={10} />
              Customer
            </div>
          </div>
        </div>

        <button
          onClick={() => onDelete(customer.id)}
          style={{
            width: 30, height: 30, borderRadius: 8,
            border: '1px solid var(--danger-border)',
            background: 'var(--danger-glow)',
            color: 'var(--danger)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--danger-glow)'; e.currentTarget.style.color = 'var(--danger)'; }}
          title="Remove customer"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border-color)', margin: '0 -1.5rem', padding: '0 1.5rem' }} />

      {/* Contact info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'var(--bg-tertiary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Mail size={13} color="var(--primary)" />
          </div>
          <span style={{
            fontSize: '0.83rem', color: 'var(--text-secondary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {customer.email}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'var(--bg-tertiary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Phone size={13} color="var(--primary)" />
          </div>
          <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
            {customer.phone}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'var(--bg-tertiary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Calendar size={13} color="var(--primary)" />
          </div>
          <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
            Joined {formatDate(customer.created_at)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Page ────────────────────────────────────────────────────── */
const Customers = () => {
  const { customers, loading, fetchCustomers, createCustomer, deleteCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const newThisMonth = customers.filter(c => isThisMonth(c.created_at)).length;

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleSaveCustomer = async (formData) => { await createCustomer(formData); };

  const handleDeleteConfirm = async () => {
    try { await deleteCustomer(deleteId); setDeleteId(null); }
    catch (err) { toast.error(err.message || 'Failed to delete customer.'); }
  };

  const handleExportCSV = () => {
    if (!customers.length) { toast.info('No customers to export.'); return; }
    const rows = [
      ['Full Name', 'Email', 'Phone', 'Created At'],
      ...customers.map(c => [
        `"${c.full_name.replace(/"/g, '""')}"`,
        `"${c.email.replace(/"/g, '""')}"`,
        `"${c.phone.replace(/"/g, '""')}"`,
        c.created_at,
      ]),
    ];
    const uri = 'data:text/csv;charset=utf-8,' + encodeURI(rows.map(r => r.join(',')).join('\n'));
    const a = document.createElement('a');
    a.href = uri; a.download = 'customers.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast.success('Customers exported.');
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const lines = e.target.result.split(/\r?\n/).filter(l => l.trim());
        if (lines.length <= 1) throw new Error('CSV is empty or missing headers.');
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        const nameIdx  = headers.findIndex(h => ['full name','fullname','name'].includes(h.toLowerCase()));
        const emailIdx = headers.findIndex(h => h.toLowerCase() === 'email');
        const phoneIdx = headers.findIndex(h => h.toLowerCase() === 'phone');
        if (nameIdx === -1 || emailIdx === -1 || phoneIdx === -1)
          throw new Error('CSV must have Name, Email, and Phone columns.');
        let ok = 0, fail = 0;
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
          const val = idx => (row[idx] || '').trim().replace(/^["']|["']$/g, '');
          if (!val(nameIdx) || !val(emailIdx) || !val(phoneIdx)) { fail++; continue; }
          try { await createCustomer({ full_name: val(nameIdx), email: val(emailIdx), phone: val(phoneIdx) }); ok++; }
          catch { fail++; }
        }
        if (ok)   { toast.success(`Imported ${ok} customers.`); fetchCustomers(); }
        if (fail) toast.error(`${fail} rows failed.`);
      } catch (err) { toast.error(`Import failed: ${err.message}`); }
      finally { setImporting(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };
    reader.readAsText(file);
  };

  return (
    <div className="page-container">

      {/* ── Page header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #2ec5c0 0%, #1aa8a3 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
          boxShadow: '0 4px 20px rgba(46,197,192,0.30)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* background decoration */}
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: 60, bottom: -60,
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(255,255,255,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}>
            <Users size={26} color="#fff" />
          </div>
          <div>
            <h1 style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Customer Directory
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.83rem', marginTop: 2 }}>
              Manage your customer base — view, add, and organise profiles
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          icon={Plus}
          style={{
            background: 'rgba(255,255,255,0.95)',
            color: 'var(--primary)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
            zIndex: 1,
          }}
        >
          Add Customer
        </Button>
      </motion.div>

      {/* ── Stats row ────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <StatCard
          icon={Users}
          label="Total Customers"
          value={customers.length}
          color={{ bg: '#e0f2fe', icon: '#0369a1' }}
          delay={0.05}
        />
        <StatCard
          icon={UserPlus}
          label="Added This Month"
          value={newThisMonth}
          color={{ bg: '#d1fae5', icon: '#065f46' }}
          delay={0.1}
        />
        <StatCard
          icon={UserCheck}
          label="Showing Results"
          value={filtered.length}
          color={{ bg: '#ede9fe', icon: '#5b21b6' }}
          delay={0.15}
        />
      </div>

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
        style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flexGrow: 1, minWidth: 200 }}>
          <Search size={15} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, email, or phone…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 36, margin: 0 }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} style={{ display: 'none' }} />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} icon={Upload} loading={importing}>
            Import
          </Button>
          <Button variant="secondary" onClick={handleExportCSV} icon={Download}>
            Export
          </Button>
        </div>
      </motion.div>

      {/* ── Customer cards ───────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', gap: '0.75rem' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--primary)',
            animation: 'spin 0.7s linear infinite',
          }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading customers…</span>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card"
          style={{ padding: '4rem 2rem', textAlign: 'center' }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--primary-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <Users size={32} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            {searchTerm ? 'No matches found' : 'No customers yet'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 320, margin: '0 auto 1.25rem' }}>
            {searchTerm
              ? `No customer matches "${searchTerm}". Try a different search term.`
              : 'Add your first customer to start managing orders and accounts.'}
          </p>
          {searchTerm
            ? <Button variant="secondary" onClick={() => setSearchTerm('')}>Clear Search</Button>
            : <Button variant="primary" onClick={() => setIsModalOpen(true)} icon={Plus}>Add Customer</Button>
          }
        </motion.div>
      ) : (
        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.1rem',
          }}
        >
          <AnimatePresence>
            {filtered.map((customer, i) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onDelete={setDeleteId}
                index={i}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Modals ───────────────────────────────────────────── */}
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
        message="Are you sure you want to remove this customer? Their orders will remain in the system but the customer account will be deleted."
      />
    </div>
  );
};

export default Customers;
