import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, ChevronLeft, ChevronRight, Flame,
  Sparkles, Package, Star, BadgeCheck,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import useProducts from '@/hooks/useProducts';
import useSlides from '@/hooks/useSlides';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import useToast from '@/hooks/useToast';
import Badge from '@/components/common/Badge';
import { SkeletonHeroSlider, SkeletonProductGrid } from '@/components/common/Skeleton';
import { formatCurrency } from '@/utils/formatters';

const SLIDE_MS = 3800;

/* ── Stock badge ─────────────────────────────────────────────── */
const StockBadge = ({ qty }) => {
  if (qty === 0)  return <Badge variant="danger">Out of stock</Badge>;
  if (qty <= 5)   return <Badge variant="danger">Only {qty} left!</Badge>;
  if (qty <= 15)  return <Badge variant="warning">Low stock</Badge>;
  return <Badge variant="success">In stock</Badge>;
};

/* ── Small product card ──────────────────────────────────────── */
const ProductCard = ({ product, onAddToCart, delay = 0 }) => {
  const [imgErr, setImgErr] = useState(false);
  const [hovered, setHovered] = useState(false);
  const outOfStock = product.quantity === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-secondary)',
        border: `1px solid ${hovered ? 'rgba(46,197,192,0.45)' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: hovered ? '0 8px 28px rgba(46,197,192,0.18)' : 'var(--shadow-sm)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Image */}
      <div style={{ height: 160, position: 'relative', background: 'var(--bg-tertiary)', overflow: 'hidden', flexShrink: 0 }}>
        {product.image_url && !imgErr ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s', transform: hovered ? 'scale(1.07)' : 'scale(1)' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={36} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
          </div>
        )}
        {product.quantity <= 15 && product.quantity > 0 && (
          <div style={{ position: 'absolute', top: 8, left: 8 }}>
            <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 50 }}>
              🔥 Hot
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={product.name}>
          {product.name}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{product.sku}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.35rem' }}>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>{formatCurrency(product.price)}</span>
          <StockBadge qty={product.quantity} />
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0.6rem 0.75rem', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={() => onAddToCart(product)}
          disabled={outOfStock}
          style={{
            width: '100%',
            background: outOfStock ? 'transparent' : 'var(--gradient-primary)',
            border: outOfStock ? '1px solid var(--border-color)' : 'none',
            borderRadius: 'var(--radius-sm)',
            color: outOfStock ? 'var(--text-muted)' : '#fff',
            padding: '0.48rem 0',
            fontSize: '0.8rem', fontWeight: 600,
            cursor: outOfStock ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            transition: 'opacity 0.15s',
          }}
        >
          <ShoppingCart size={13} />
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  );
};

/* ── Section header ──────────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, iconColor, iconBg, title, subtitle }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
    <div style={{ width: 38, height: 38, borderRadius: 11, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} color={iconColor} />
    </div>
    <div>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 3 }}>{subtitle}</p>}
    </div>
  </div>
);

/* ── Product grid ────────────────────────────────────────────── */
const ProductGrid = ({ products, onAddToCart }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem' }}>
    {products.map((p, i) => (
      <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} delay={i * 0.05} />
    ))}
  </div>
);

/* ── Hero Slider ─────────────────────────────────────────────── */
const HeroSlider = ({ slides, onCtaClick }) => {
  // All hooks at top — no hooks after any conditional returns
  const [idx, setIdx]       = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir]       = useState(1);
  const [imgErr, setImgErr] = useState(false);
  const timerRef            = useRef(null);

  // Reset image error when slide changes
  useEffect(() => { setImgErr(false); }, [idx]);

  // Clamp idx if slides list shrinks
  useEffect(() => {
    if (slides.length > 0 && idx >= slides.length) setIdx(0);
  }, [slides.length, idx]);

  const go = useCallback((next) => {
    setDir(next > idx ? 1 : -1);
    setIdx(next);
  }, [idx]);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    timerRef.current = setInterval(() => {
      setDir(1);
      setIdx(i => (i + 1) % slides.length);
    }, SLIDE_MS);
    return () => clearInterval(timerRef.current);
  }, [slides.length, paused]);

  const prev = () => go((idx - 1 + slides.length) % slides.length);
  const next = () => go((idx + 1) % slides.length);

  if (slides.length === 0) {
    return (
      <div style={{
        height: 340, borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, #2ec5c0 0%, #0f8f8a 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12,
        color: '#fff', boxShadow: '0 8px 32px rgba(46,197,192,0.30)',
      }}>
        <Sparkles size={40} style={{ opacity: 0.7 }} />
        <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>New products coming soon!</p>
        <p style={{ fontSize: '0.85rem', opacity: 0.75 }}>Check back for fresh arrivals.</p>
      </div>
    );
  }

  const safeIdx = Math.min(idx, slides.length - 1);
  const slide   = slides[safeIdx];

  return (
    <div
      style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: 340, boxShadow: '0 8px 36px rgba(0,0,0,0.14)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={safeIdx}
          initial={{ opacity: 0, x: dir * 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -dir * 60 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'absolute', inset: 0, display: 'flex' }}
        >
          {/* Image side */}
          <div style={{ flex: '0 0 45%', position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
            {slide.image_url && !imgErr ? (
              <img
                src={slide.image_url}
                alt={slide.title}
                onError={() => setImgErr(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.88 }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={64} style={{ color: 'rgba(255,255,255,0.15)' }} />
              </div>
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, rgba(15,23,42,0.6))' }} />
          </div>

          {/* Content side */}
          <div style={{
            flex: 1,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '2.5rem 2.25rem',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative orbs */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(46,197,192,0.08)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -30, right: 60, width: 100, height: 100, borderRadius: '50%', background: 'rgba(46,197,192,0.05)', pointerEvents: 'none' }} />

            {slide.badge_text && (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2ec5c0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={11} /> {slide.badge_text}
              </span>
            )}
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: slide.subtitle ? '0.3rem' : '0.6rem', letterSpacing: '-0.02em' }}>
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontWeight: 500 }}>
                {slide.subtitle}
              </p>
            )}
            {slide.description && (
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', marginBottom: '1rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {slide.description}
              </p>
            )}
            {slide.price != null && (
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2ec5c0' }}>{formatCurrency(slide.price)}</span>
              </div>
            )}
            <button
              onClick={() => onCtaClick()}
              style={{
                alignSelf: 'flex-start',
                background: 'linear-gradient(135deg, #2ec5c0, #0891b2)',
                border: 'none', borderRadius: 'var(--radius-md)',
                color: '#fff', padding: '0.65rem 1.5rem',
                fontSize: '0.88rem', fontWeight: 700,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 4px 16px rgba(46,197,192,0.40)',
              }}
            >
              <ShoppingCart size={15} />
              {slide.cta_text || 'Shop Now'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide counter badge */}
      <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 50, zIndex: 2 }}>
        {safeIdx + 1} / {slides.length}
      </div>

      {/* Prev / Next */}
      {slides.length > 1 && (
        <>
          <button onClick={prev} style={arrowStyle('left')}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={next} style={arrowStyle('right')}>
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 2 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              style={{
                width: i === safeIdx ? 20 : 7, height: 7, borderRadius: 50,
                background: i === safeIdx ? '#2ec5c0' : 'rgba(255,255,255,0.35)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'width 0.3s, background 0.3s',
              }}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {!paused && slides.length > 1 && (
        <motion.div
          key={`progress-${safeIdx}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: SLIDE_MS / 1000, ease: 'linear' }}
          style={{ position: 'absolute', bottom: 0, left: 0, height: 3, background: '#2ec5c0', transformOrigin: 'left', zIndex: 3, width: '100%' }}
        />
      )}
    </div>
  );
};

const arrowStyle = (side) => ({
  position: 'absolute',
  [side]: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 2,
  background: 'rgba(0,0,0,0.40)',
  backdropFilter: 'blur(6px)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '50%',
  width: 36, height: 36,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#fff', cursor: 'pointer',
  transition: 'background 0.15s',
});

/* ── Page ────────────────────────────────────────────────────── */
const Landing = () => {
  // All hooks must be at top — conditional returns come after
  const { isAdmin }                          = useAuthStore();
  const { products, loading: prodLoading, fetchProducts } = useProducts();
  const { slides, loading: slideLoading, fetchSlides }    = useSlides();
  const addToCart                            = useCartStore((s) => s.addToCart);
  const openCart                             = useCartStore((s) => s.openCart);
  const toast                                = useToast();

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchSlides();   }, [fetchSlides]);

  const handleAddToCart = useCallback((product) => {
    if (product.quantity === 0) return;
    const ok = addToCart(product, 1);
    if (ok) { toast.success(`${product.name} added to cart`); openCart(); }
    else toast.error(`Not enough stock for ${product.name}`);
  }, [addToCart, openCart, toast.success, toast.error]);

  // Admins don't get this page — redirect after all hooks
  if (isAdmin) return <Navigate to="/dashboard" replace />;

  const loading = prodLoading || slideLoading;

  // Derive product sections
  const trending    = products.filter(p => p.quantity > 0 && p.quantity <= 20).slice(0, 8);
  const topPicks    = [...products].sort((a, b) => Number(b.price) - Number(a.price)).slice(0, 8);
  const newArrivals = [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);

  return (
    <div className="page-container">

      {/* ── Welcome strip ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'linear-gradient(135deg, #2ec5c0 0%, #1aa8a3 55%, #0f8f8a 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '0.75rem',
          boxShadow: '0 4px 22px rgba(46,197,192,0.28)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ zIndex: 1 }}>
          <h1 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Welcome to InvenTrack Store 🛍️
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', marginTop: 3 }}>
            Discover top products, trending items, and new arrivals — all in one place.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 50, padding: '0.38rem 0.9rem', color: '#fff', fontSize: '0.78rem', fontWeight: 600, zIndex: 1 }}>
          <BadgeCheck size={14} />
          {products.length} products available
        </div>
      </motion.div>

      {/* ── Hero Slider ────────────────────────────────────────── */}
      {slideLoading ? (
        <SkeletonHeroSlider />
      ) : (
        <HeroSlider slides={slides} onCtaClick={() => { document.getElementById('landing-products')?.scrollIntoView({ behavior: 'smooth' }); }} />
      )}

      {/* ── Trending Now ───────────────────────────────────────── */}
      <motion.div
        id="landing-products"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.4 }}
        className="glass-card"
      >
        <SectionHeader
          icon={Flame}
          iconColor="#ef4444"
          iconBg="#fee2e2"
          title="Trending Now"
          subtitle="High-demand items — selling fast, limited stock remaining"
        />
        {prodLoading ? <SkeletonProductGrid count={8} /> : <ProductGrid products={trending} onAddToCart={handleAddToCart} />}
      </motion.div>

      {/* ── Top Picks ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4 }}
        className="glass-card"
      >
        <SectionHeader
          icon={Star}
          iconColor="#f59e0b"
          iconBg="#fef3c7"
          title="Top Picks"
          subtitle="Our premium selection — highest rated and most valued products"
        />
        {prodLoading ? <SkeletonProductGrid count={8} /> : <ProductGrid products={topPicks} onAddToCart={handleAddToCart} />}
      </motion.div>

      {/* ── New Arrivals ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.4 }}
        className="glass-card"
      >
        <SectionHeader
          icon={Sparkles}
          iconColor="#8b5cf6"
          iconBg="#ede9fe"
          title="New Arrivals"
          subtitle="Fresh additions to our catalog — just landed"
        />
        {prodLoading ? <SkeletonProductGrid count={8} /> : <ProductGrid products={newArrivals} onAddToCart={handleAddToCart} />}
      </motion.div>

      {/* Empty state */}
      {!prodLoading && products.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card"
          style={{ textAlign: 'center', padding: '4rem 2rem' }}
        >
          <Package size={52} style={{ color: 'var(--text-muted)', opacity: 0.25, marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>No products yet</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Check back soon — new arrivals are on the way!</p>
        </motion.div>
      )}
    </div>
  );
};

export default Landing;
