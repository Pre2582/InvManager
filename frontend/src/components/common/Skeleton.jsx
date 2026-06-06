/**
 * Skeleton loader shapes — import only what you need.
 * All use the .skeleton CSS class (shimmer animation in globals.css).
 */
import React from 'react';

/* ── Primitive ───────────────────────────────────────────────── */
export const Bone = ({ w = '100%', h = 14, r = 6, style = {} }) => (
  <div
    className="skeleton"
    style={{ width: w, height: h, borderRadius: r, ...style }}
  />
);

/* ── KPI / Stat card (Dashboard & Orders stats row) ─────────── */
export const SkeletonKpiCard = () => (
  <div
    className="glass-card"
    style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', padding: '1.35rem 1.5rem', minHeight: 110 }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Bone w={80} h={11} />
        <Bone w={110} h={30} r={8} />
      </div>
      <Bone w={44} h={44} r={10} />
    </div>
    <Bone w={130} h={11} />
  </div>
);

/* ── Product card (Products page grid) ───────────────────────── */
export const SkeletonProductCard = () => (
  <div
    className="glass-card"
    style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
  >
    <Bone w="100%" h={180} r={0} />
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Bone w="70%" h={14} />
      <Bone w="40%" h={11} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <Bone w={70} h={20} r={8} />
        <Bone w={64} h={22} r={50} />
      </div>
    </div>
    <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8 }}>
      <Bone w="50%" h={32} r={8} />
      <Bone w="50%" h={32} r={8} />
    </div>
  </div>
);

/* ── Customer card ───────────────────────────────────────────── */
export const SkeletonCustomerCard = () => (
  <div
    className="glass-card"
    style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem 1.5rem' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Bone w={48} h={48} r={50} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <Bone w={120} h={14} />
          <Bone w={70} h={18} r={50} />
        </div>
      </div>
      <Bone w={28} h={28} r={8} />
    </div>
    <Bone w="100%" h={1} r={0} style={{ opacity: 0.4 }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[200, 160, 110].map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Bone w={28} h={28} r={8} />
          <Bone w={w} h={12} />
        </div>
      ))}
    </div>
  </div>
);

/* ── Table rows (Orders history, generic tables) ─────────────── */
export const SkeletonTableRows = ({ rows = 5, cols = 5 }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {Array.from({ length: rows }).map((_, r) => (
      <div
        key={r}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '1rem',
          padding: '0.9rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          alignItems: 'center',
        }}
      >
        {Array.from({ length: cols }).map((_, c) => (
          <Bone key={c} h={13} w={c === 0 ? '80%' : c === cols - 1 ? '60%' : '70%'} />
        ))}
      </div>
    ))}
  </div>
);

/* ── Order timeline card ─────────────────────────────────────── */
export const SkeletonOrderCard = () => (
  <div className="glass-card" style={{ padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <Bone w={130} h={14} />
        <Bone w={90} h={11} />
      </div>
      <Bone w={80} h={24} r={50} />
    </div>
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      {[100, 80, 110].map((w, i) => <Bone key={i} w={w} h={12} />)}
    </div>
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
      <Bone w={80} h={30} r={8} />
      <Bone w={80} h={30} r={8} />
    </div>
  </div>
);

/* ── Slide row (LandingAdmin) ────────────────────────────────── */
export const SkeletonSlideRow = () => (
  <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <Bone w={28} h={28} r={50} />
    <Bone w={72} h={52} r={8} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Bone w="55%" h={14} />
      <Bone w="35%" h={11} />
      <div style={{ display: 'flex', gap: 8 }}>
        <Bone w={60} h={18} r={50} />
        <Bone w={50} h={18} r={50} />
      </div>
    </div>
    <Bone w={64} h={22} r={50} />
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((i) => <Bone key={i} w={30} h={30} r={6} />)}
    </div>
  </div>
);

/* ── Hero slider (Landing page) ──────────────────────────────── */
export const SkeletonHeroSlider = () => (
  <div style={{ display: 'flex', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: 340 }}>
    <Bone w="45%" h="100%" r={0} />
    <div
      style={{
        flex: 1, background: 'var(--bg-secondary)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '2.5rem 2.25rem', gap: 14,
        borderLeft: '1px solid var(--border-color)',
      }}
    >
      <Bone w={90} h={11} />
      <Bone w="75%" h={28} r={8} />
      <Bone w="55%" h={14} />
      <Bone w="90%" h={12} />
      <Bone w="70%" h={12} />
      <Bone w={80} h={38} r={10} style={{ marginTop: 8 }} />
    </div>
  </div>
);

/* ── Product grid section skeleton (Landing page sections) ───── */
export const SkeletonProductGrid = ({ count = 4 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <Bone w="100%" h={160} r={0} />
        <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Bone w="65%" h={13} />
          <Bone w="40%" h={10} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <Bone w={60} h={18} r={6} />
            <Bone w={58} h={20} r={50} />
          </div>
        </div>
        <div style={{ padding: '0.6rem 0.75rem', borderTop: '1px solid var(--border-color)' }}>
          <Bone w="100%" h={30} r={6} />
        </div>
      </div>
    ))}
  </div>
);

/* ── Chart card (Dashboard) ──────────────────────────────────── */
export const SkeletonChartCard = ({ height = 220 }) => (
  <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <Bone w={140} h={16} />
        <Bone w={90} h={11} />
      </div>
      <Bone w={70} h={28} r={50} />
    </div>
    <Bone w="100%" h={height} r={10} />
  </div>
);

/* ── Dashboard recent-orders row ─────────────────────────────── */
export const SkeletonRecentOrder = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 0', borderBottom: '1px solid var(--border-color)' }}>
    <Bone w={36} h={36} r={50} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
      <Bone w="60%" h={13} />
      <Bone w="40%" h={11} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'flex-end' }}>
      <Bone w={70} h={13} />
      <Bone w={60} h={20} r={50} />
    </div>
  </div>
);
