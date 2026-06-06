import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Image, ArrowUp, ArrowDown,
  Layers, Package, CheckCircle, XCircle, Sparkles, Wand2,
} from 'lucide-react';
import useSlides from '@/hooks/useSlides';
import useToast from '@/hooks/useToast';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Badge from '@/components/common/Badge';
import { SkeletonSlideRow } from '@/components/common/Skeleton';
import { formatCurrency } from '@/utils/formatters';
import { autoFillSlide } from '@/utils/autoFill';

const EMPTY_FORM = {
  title:       '',
  subtitle:    '',
  description: '',
  image_url:   '',
  badge_text:  'New Arrival',
  price:       '',
  cta_text:    'Shop Now',
  is_active:   true,
  sort_order:  0,
};

/* ── Slide card (admin view) ─────────────────────────────────── */
const SlideCard = ({ slide, index, total, onEdit, onDelete, onToggle, onMove }) => {
  const [imgErr, setImgErr] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ delay: index * 0.04 }}
      className="glass-card"
      style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
    >
      {/* Sort order badge */}
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>
        {slide.sort_order}
      </div>

      {/* Image */}
      <div style={{ width: 72, height: 52, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--bg-tertiary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {slide.image_url && !imgErr ? (
          <img src={slide.image_url} alt={slide.title} onError={() => setImgErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Image size={20} style={{ color: 'var(--text-muted)', opacity: 0.35 }} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {slide.title}
        </div>
        {slide.subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
            {slide.subtitle}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
          {slide.badge_text && (
            <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'rgba(46,197,192,0.12)', color: 'var(--primary)', padding: '1px 7px', borderRadius: 50 }}>
              {slide.badge_text}
            </span>
          )}
          {slide.price && (
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
              {formatCurrency(slide.price)}
            </span>
          )}
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{slide.cta_text}</span>
        </div>
      </div>

      {/* Status */}
      <div style={{ flexShrink: 0 }}>
        <Badge variant={slide.is_active ? 'success' : 'default'}>
          {slide.is_active ? 'Active' : 'Hidden'}
        </Badge>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
        <ActionBtn title="Move up" disabled={index === 0} onClick={() => onMove(slide.id, 'up')}>
          <ArrowUp size={14} />
        </ActionBtn>
        <ActionBtn title="Move down" disabled={index === total - 1} onClick={() => onMove(slide.id, 'down')}>
          <ArrowDown size={14} />
        </ActionBtn>
        <ActionBtn title={slide.is_active ? 'Hide' : 'Show'} onClick={() => onToggle(slide)}>
          {slide.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
        </ActionBtn>
        <ActionBtn title="Edit" accent onClick={() => onEdit(slide)}>
          <Edit2 size={14} />
        </ActionBtn>
        <ActionBtn title="Delete" danger onClick={() => onDelete(slide)}>
          <Trash2 size={14} />
        </ActionBtn>
      </div>
    </motion.div>
  );
};

const ActionBtn = ({ children, onClick, disabled, title, accent, danger }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{
      width: 30, height: 30, borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border-color)',
      background: accent ? 'rgba(46,197,192,0.12)' : danger ? 'rgba(239,68,68,0.09)' : 'var(--bg-tertiary)',
      color: accent ? 'var(--primary)' : danger ? '#ef4444' : 'var(--text-secondary)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.35 : 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.15s',
    }}
  >
    {children}
  </button>
);

/* ── Slide Form Modal ────────────────────────────────────────── */
const SlideModal = ({ open, onClose, initial, onSave, saving }) => {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setForm(initial
      ? {
          title:       initial.title        ?? '',
          subtitle:    initial.subtitle     ?? '',
          description: initial.description  ?? '',
          image_url:   initial.image_url    ?? '',
          badge_text:  initial.badge_text   ?? '',
          price:       initial.price != null ? String(initial.price) : '',
          cta_text:    initial.cta_text     ?? 'Shop Now',
          is_active:   initial.is_active    ?? true,
          sort_order:  initial.sort_order   ?? 0,
        }
      : EMPTY_FORM
    );
  }, [initial, open]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({
      ...form,
      price:      form.price !== '' ? Number(form.price) : null,
      sort_order: Number(form.sort_order) || 0,
    });
  };

  const inputStyle = {
    width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem',
    color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle = { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' };

  const previewOk = form.image_url && form.image_url.startsWith('http');

  return (
    <Modal isOpen={open} onClose={onClose} title={initial ? 'Edit Slide' : 'Add Slide'} maxWidth={580}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Autofill — only on create */}
        {!initial && (
          <button
            type="button"
            onClick={() => { const d = autoFillSlide(); setForm({ ...d, price: String(d.price) }); }}
            style={{
              alignSelf: 'flex-start',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.38rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px dashed var(--primary)',
              background: 'var(--primary-glow)',
              color: 'var(--primary)',
              fontSize: '0.82rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(46,197,192,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--primary-glow)'}
          >
            <Wand2 size={13} />
            Autofill Demo Data
          </button>
        )}

        {/* Image preview */}
        {previewOk && (
          <div style={{ height: 120, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
            <img src={form.image_url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => {}} />
          </div>
        )}

        {/* Title */}
        <div>
          <label style={labelStyle}>Title *</label>
          <input style={inputStyle} value={form.title} onChange={set('title')} placeholder="e.g. Summer Collection" required />
        </div>

        {/* Subtitle */}
        <div>
          <label style={labelStyle}>Subtitle</label>
          <input style={inputStyle} value={form.subtitle} onChange={set('subtitle')} placeholder="Short tagline (optional)" />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 64 }} value={form.description} onChange={set('description')} placeholder="Brief description shown in the slider…" />
        </div>

        {/* Image URL */}
        <div>
          <label style={labelStyle}>Image URL</label>
          <input style={inputStyle} value={form.image_url} onChange={set('image_url')} placeholder="https://…" type="url" />
        </div>

        {/* Badge + Price row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={labelStyle}>Badge label</label>
            <input style={inputStyle} value={form.badge_text} onChange={set('badge_text')} placeholder="New Arrival" />
          </div>
          <div>
            <label style={labelStyle}>Display price</label>
            <input style={inputStyle} value={form.price} onChange={set('price')} placeholder="0.00" type="number" min="0" step="0.01" />
          </div>
        </div>

        {/* CTA + Sort order row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={labelStyle}>Button text</label>
            <input style={inputStyle} value={form.cta_text} onChange={set('cta_text')} placeholder="Shop Now" />
          </div>
          <div>
            <label style={labelStyle}>Sort order</label>
            <input style={inputStyle} value={form.sort_order} onChange={set('sort_order')} type="number" min="0" />
          </div>
        </div>

        {/* Active toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none' }}>
          <input type="checkbox" checked={form.is_active} onChange={set('is_active')} style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Active (shown on the landing page)
          </span>
        </label>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <button type="button" onClick={onClose} style={{ padding: '0.55rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving || !form.title.trim()} style={{ padding: '0.55rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--gradient-primary)', color: '#fff', cursor: saving ? 'wait' : 'pointer', fontWeight: 700, fontSize: '0.875rem', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Slide'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* ── Page ────────────────────────────────────────────────────── */
const LandingAdmin = () => {
  const { slides, loading, fetchSlides, createSlide, updateSlide, deleteSlide } = useSlides({ adminMode: true });
  const toast = useToast();

  const [modalOpen, setModalOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]           = useState(false);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  const openCreate = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit   = (s)  => { setEditTarget(s);    setModalOpen(true); };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editTarget) await updateSlide(editTarget.id, form);
      else            await createSlide(form);
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save slide.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (slide) => {
    try {
      await updateSlide(slide.id, { is_active: !slide.is_active });
    } catch (err) {
      toast.error(err.message || 'Failed to update slide.');
    }
  };

  const handleMove = useCallback(async (id, direction) => {
    const idx = slides.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= slides.length) return;
    try {
      await Promise.all([
        updateSlide(slides[idx].id,    { sort_order: slides[swapIdx].sort_order }),
        updateSlide(slides[swapIdx].id, { sort_order: slides[idx].sort_order }),
      ]);
    } catch (err) {
      toast.error(err.message || 'Failed to reorder.');
    }
  }, [slides, updateSlide]);

  const handleDelete = async () => {
    try {
      await deleteSlide(deleteTarget.id);
    } catch (err) {
      toast.error(err.message || 'Failed to delete slide.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const activeCount = slides.filter((s) => s.is_active).length;

  return (
    <div className="page-container">

      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #2ec5c0 0%, #1aa8a3 55%, #0f8f8a 100%)',
          borderRadius: 'var(--radius-lg)', padding: '1.1rem 1.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
          boxShadow: '0 4px 22px rgba(46,197,192,0.28)', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: -30, top: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={20} style={{ color: '#fff' }} />
            <h1 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Landing Page — Slider</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', marginTop: 3 }}>
            {slides.length} slides total · {activeCount} active · shown on the user home page
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.35)',
            color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            zIndex: 1,
          }}
        >
          <Plus size={15} /> Add Slide
        </button>
      </motion.div>

      {/* ── Stats row ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Total Slides',  value: slides.length,  color: 'var(--primary)',  Icon: Layers    },
          { label: 'Active',        value: activeCount,     color: '#22c55e',          Icon: CheckCircle },
          { label: 'Hidden',        value: slides.length - activeCount, color: '#94a3b8', Icon: XCircle  },
        ].map(({ label, value, color, Icon }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={17} style={{ color }} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Slide list ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '0.75rem' }}>
        <div style={{ padding: '0 0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={15} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>All Slides</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 2 }}>— drag to reorder via the ↑↓ buttons</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.25rem 0' }}>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonSlideRow key={i} />)}
          </div>
        ) : slides.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Package size={40} style={{ color: 'var(--text-muted)', opacity: 0.2, marginBottom: '0.75rem' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No slides yet. Click <strong>Add Slide</strong> to create the first one.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <AnimatePresence>
              {slides.map((slide, i) => (
                <SlideCard
                  key={slide.id}
                  slide={slide}
                  index={i}
                  total={slides.length}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  onToggle={handleToggle}
                  onMove={handleMove}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* ── Modals ─────────────────────────────────────────────── */}
      <SlideModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editTarget}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Slide"
        message={`Delete slide "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default LandingAdmin;
