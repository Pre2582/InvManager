import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  BarChart3, Package, TrendingUp,
  CheckCircle, Zap, Users, Activity, ArrowRight,
  Shield, AlertTriangle, Menu, X, Search,
  ClipboardList, Download,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Responsive CSS (injected via <style> tag)
───────────────────────────────────────────── */
const RESPONSIVE_CSS = `
  .pl-wrap { overflow-x: hidden; }

  /* Header */
  .pl-nav  { display: flex; align-items: center; gap: 2.2rem; }
  .pl-ham  { display: none; background: transparent; border: none; color: #fff; cursor: pointer; padding: 4px; }

  /* Stats strip */
  .pl-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; text-align: center; }

  /* Mock dashboard KPI / chart grids */
  .pl-kpi   { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1rem; }
  .pl-chart { display: grid; grid-template-columns: 1fr 1.4fr; gap: 0.75rem; }

  /* Highlight rows */
  .pl-hl     { display: flex; gap: clamp(2rem,5vw,4rem); align-items: center; padding: 2.5rem 0; border-bottom: 1px solid #eaf5f4; }
  .pl-hl-rev { flex-direction: row-reverse; }
  .pl-hl-panel { flex: 0 0 clamp(280px, 40%, 400px); }
  .pl-hl-text  { flex: 1; min-width: 0; }

  /* ── Mobile (≤ 640px) ── */
  @media (max-width: 640px) {
    .pl-nav  { display: none; }
    .pl-ham  { display: flex; }

    .pl-stats { grid-template-columns: repeat(2, 1fr); gap: 1.5rem 1rem; }
    .pl-preview { display: none !important; }

    .pl-kpi   { grid-template-columns: repeat(2, 1fr); }
    .pl-chart { grid-template-columns: 1fr; }

    .pl-hl, .pl-hl-rev { flex-direction: column; gap: 1.5rem; }
    .pl-hl-panel { flex: unset; width: 100%; }

    .pl-feat-grid { grid-template-columns: 1fr !important; }
  }

  /* ── Tablet (641px – 900px) ── */
  @media (min-width: 641px) and (max-width: 900px) {
    .pl-stats { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .pl-kpi   { grid-template-columns: repeat(2, 1fr); }
    .pl-chart { grid-template-columns: 1fr; }
    .pl-hl, .pl-hl-rev { flex-direction: column; gap: 1.75rem; }
    .pl-hl-panel { flex: unset; width: 100%; max-width: 500px; }
  }

  /* ── nav link hover ── */
  .pl-nav-link { color: rgba(255,255,255,0.82); font-size: 0.9rem; font-weight: 500; text-decoration: none; transition: color 0.15s; }
  .pl-nav-link:hover { color: #2ec5c0; }

  /* ── feature card hover ── */
  .pl-feat-card { transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; }
  .pl-feat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(46,197,192,0.12); }

  /* ── footer link hover ── */
  .pl-footer-link { font-size: 0.82rem; color: rgba(255,255,255,0.38); cursor: pointer; transition: color 0.15s; }
  .pl-footer-link:hover { color: #2ec5c0; }

  /* ── back link hover ── */
  .pl-back { background: none; border: none; padding: 0; color: #89a8ae; font-size: 0.8rem; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; font-family: inherit; transition: color 0.15s; }
  .pl-back:hover { color: #2ec5c0; }
`;

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

const BTN = {
  primary: {
    background: 'linear-gradient(135deg, #2ec5c0 0%, #0f8f8a 100%)',
    border: 'none', color: '#fff',
    padding: '0.8rem 1.9rem', borderRadius: 12,
    fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    boxShadow: '0 6px 28px rgba(46,197,192,0.38)',
    transition: 'opacity 0.15s', fontFamily: 'inherit',
  },
  ghost: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.22)',
    color: '#fff', padding: '0.8rem 1.9rem', borderRadius: 12,
    fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    transition: 'background 0.15s', fontFamily: 'inherit',
  },
  outline: {
    background: 'transparent',
    border: '1.5px solid rgba(46,197,192,0.5)',
    color: '#2ec5c0', padding: '0.48rem 1.25rem', borderRadius: 8,
    fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
    fontFamily: 'inherit', transition: 'background 0.15s',
  },
  navPrimary: {
    background: 'linear-gradient(135deg, #2ec5c0 0%, #0f8f8a 100%)',
    border: 'none', color: '#fff',
    padding: '0.48rem 1.25rem', borderRadius: 8,
    fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
    fontFamily: 'inherit', transition: 'opacity 0.15s',
  },
};

/* ─────────────────────────────────────────────
   Sticky Header
───────────────────────────────────────────── */
const PublicHeader = ({ onLogin, onSignup }) => {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollFeatures = (e) => {
    e?.preventDefault();
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      background: scrolled ? 'rgba(8,18,26,0.93)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(46,197,192,0.14)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 clamp(1rem, 5vw, 3rem)',
      height: 68,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: 'linear-gradient(135deg, #2ec5c0 0%, #0f8f8a 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(46,197,192,0.4)',
        }}>
          <Package size={18} color="#fff" strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.025em' }}>
          Inven<span style={{ color: '#2ec5c0' }}>Track</span>
        </span>
      </div>

      {/* Desktop nav — hidden on mobile via .pl-nav CSS class */}
      <nav className="pl-nav">
        <a href="#top" className="pl-nav-link">Home</a>
        <a href="#features" className="pl-nav-link" onClick={scrollFeatures}>Features</a>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button style={BTN.outline} onClick={onLogin}>Login</button>
          <button style={BTN.navPrimary} onClick={onSignup}>Sign Up</button>
        </div>
      </nav>

      {/* Hamburger — visible on mobile via .pl-ham CSS class */}
      <button className="pl-ham" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 68, left: 0, right: 0,
          background: 'rgba(8,18,26,0.97)',
          borderBottom: '1px solid rgba(46,197,192,0.2)',
          backdropFilter: 'blur(16px)',
          padding: '1.5rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
          zIndex: 199,
        }}>
          <a href="#top" className="pl-nav-link" style={{ fontSize: '1rem', color: '#fff' }} onClick={() => setMobileOpen(false)}>Home</a>
          <a href="#features" className="pl-nav-link" style={{ fontSize: '1rem', color: '#fff' }} onClick={() => { setMobileOpen(false); scrollFeatures(); }}>Features</a>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)' }} />
          <button style={{ ...BTN.outline, justifyContent: 'center', width: '100%' }} onClick={() => { setMobileOpen(false); onLogin(); }}>Login</button>
          <button style={{ ...BTN.navPrimary, justifyContent: 'center', width: '100%' }} onClick={() => { setMobileOpen(false); onSignup(); }}>Sign Up Free</button>
        </div>
      )}
    </header>
  );
};

/* ─────────────────────────────────────────────
   Hero Section
───────────────────────────────────────────── */
const Hero = ({ onSignup, onLogin }) => (
  <section id="top" style={{
    background: 'linear-gradient(160deg, #040e17 0%, #071c2c 38%, #0a2338 65%, #071824 100%)',
    minHeight: '100vh',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: 'clamp(5.5rem, 12vw, 9rem) clamp(1rem, 5vw, 3rem) clamp(3rem, 6vw, 5rem)',
    position: 'relative', overflow: 'hidden',
  }}>
    {/* Ambient orbs */}
    <div style={{ position: 'absolute', top: '12%', left: '8%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,197,192,0.11) 0%, transparent 68%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: '8%', right: '6%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,197,192,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', top: '45%', right: '20%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

    {/* Main content */}
    <div style={{ maxWidth: 780, textAlign: 'center', position: 'relative', zIndex: 1, width: '100%' }}>
      {/* Badge */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: '1.5rem' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(46,197,192,0.12)', border: '1px solid rgba(46,197,192,0.32)',
          borderRadius: 50, padding: '0.38rem 1rem',
          color: '#2ec5c0', fontSize: '0.78rem', fontWeight: 700,
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          <Zap size={11} /> Smart Inventory Management Platform
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontSize: 'clamp(2rem, 6.5vw, 3.6rem)',
          fontWeight: 900, color: '#fff',
          lineHeight: 1.08, letterSpacing: '-0.035em',
          marginBottom: '1.35rem',
        }}
      >
        Inventory Manager<br />
        <span style={{
          background: 'linear-gradient(135deg, #2ec5c0 20%, #7dd3d0 80%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Built for Businesses
        </span>
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        style={{ fontSize: 'clamp(0.95rem, 2vw, 1.12rem)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 2.25rem' }}
      >
        Track stock, monitor product levels, and manage your inventory efficiently in one place.
        Stay updated with low-stock alerts, item details, and real-time inventory status.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36 }}
        style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
      >
        <button style={BTN.primary} onClick={onSignup}>Get Started Free <ArrowRight size={15} /></button>
        <button style={BTN.ghost}   onClick={onLogin}>Sign In</button>
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.52 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(0.75rem, 3vw, 1.5rem)', marginTop: '2rem', flexWrap: 'wrap' }}
      >
        {[
          { icon: Shield,       text: 'Secure & Private'        },
          { icon: CheckCircle,  text: 'No credit card required' },
          { icon: Zap,          text: 'Set up in minutes'       },
        ].map(({ icon: Icon, text }) => (
          <span key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.42)', fontSize: '0.8rem', fontWeight: 500 }}>
            <Icon size={13} color="rgba(46,197,192,0.7)" />{text}
          </span>
        ))}
      </motion.div>
    </div>

    {/* Mock dashboard preview — hidden on mobile via .pl-preview CSS */}
    <motion.div
      className="pl-preview"
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginTop: '4rem', width: '100%', maxWidth: 900, position: 'relative', zIndex: 1 }}
    >
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, backdropFilter: 'blur(12px)',
        padding: '1.5rem',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(46,197,192,0.1)',
      }}>
        {/* Window dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1.25rem' }}>
          {['#ef4444','#f59e0b','#22c55e'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
          ))}
          <div style={{ flex: 1, height: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 50, marginLeft: 8 }} />
        </div>

        {/* KPI cards — 4 cols → 2 cols on tablet via .pl-kpi */}
        <div className="pl-kpi">
          {[
            { label: 'Total Products',  value: '1,284', color: '#2ec5c0', bg: 'rgba(46,197,192,0.12)',  icon: Package       },
            { label: 'Low Stock Alerts',value: '23',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: AlertTriangle  },
            { label: 'Orders Today',    value: '48',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  icon: ClipboardList  },
            { label: 'Total Revenue',   value: '₹2.4L', color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: TrendingUp     },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${color}22`, borderRadius: 12, padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                <Icon size={13} color={color} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Chart + table — 2 cols → 1 col on tablet via .pl-chart */}
        <div className="pl-chart">
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '0.85rem', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.75rem', fontWeight: 600 }}>STOCK MOVEMENT</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 60 }}>
              {[40,65,45,80,55,90,70,85,60,95].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '3px 3px 0 0', background: i === 9 ? 'linear-gradient(180deg,#2ec5c0,#0f8f8a)' : 'rgba(46,197,192,0.25)' }} />
              ))}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '0.85rem', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.75rem', fontWeight: 600 }}>RECENT ACTIVITY</div>
            {[
              { name: 'Laptop Stand', qty: 12, status: 'Low',      sc: '#f59e0b' },
              { name: 'USB-C Hub',    qty: 54, status: 'OK',       sc: '#22c55e' },
              { name: 'Keyboard',     qty: 3,  status: 'Critical', sc: '#ef4444' },
              { name: 'Monitor',      qty: 28, status: 'OK',       sc: '#22c55e' },
            ].map(({ name, qty, status, sc }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.32rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{name}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)' }}>{qty} units</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: sc, background: `${sc}18`, padding: '2px 8px', borderRadius: 50 }}>{status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: -30, left: '20%', right: '20%', height: 60, background: 'rgba(46,197,192,0.15)', filter: 'blur(30px)', pointerEvents: 'none' }} />
    </motion.div>
  </section>
);

/* ─────────────────────────────────────────────
   Stats Strip
───────────────────────────────────────────── */
const StatsStrip = () => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const stats  = [
    { value: '10K+',  label: 'Products Managed'    },
    { value: '500+',  label: 'Businesses Trust Us'  },
    { value: '99.9%', label: 'Uptime Guarantee'     },
    { value: '24/7',  label: 'Alert Monitoring'     },
  ];
  return (
    <div ref={ref} style={{ background: '#fff', borderTop: '1px solid #e8f5f4', borderBottom: '1px solid #e8f5f4' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem clamp(1rem, 5vw, 3rem)' }}>
        <div className="pl-stats">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 900, color: '#1a3035', letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.85rem', color: '#89a8ae', marginTop: 6, fontWeight: 500 }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Features Section
───────────────────────────────────────────── */
const FEATURES = [
  { icon: Activity,     color: '#2ec5c0', bg: '#e0faf9', title: 'Real-time Stock Tracking',  desc: "Monitor inventory levels across all products instantly. Get a live view of what's in stock, what's running low, and what needs reordering." },
  { icon: AlertTriangle,color: '#f59e0b', bg: '#fef3c7', title: 'Low-Stock Alerts',           desc: 'Set custom thresholds and receive automatic alerts when products fall below safe levels — so you never face an unexpected stockout.' },
  { icon: ClipboardList,color: '#6366f1', bg: '#ede9fe', title: 'Order Management',            desc: 'Create, track, and manage customer orders end-to-end. Automated stock deduction on order confirmation keeps your counts accurate.' },
  { icon: BarChart3,    color: '#22c55e', bg: '#dcfce7', title: 'Analytics Dashboard',         desc: 'Visual charts and KPI cards give you instant insights into revenue, stock movement, order trends, and top-performing products.' },
  { icon: Users,        color: '#ec4899', bg: '#fce7f3', title: 'Role-based Access',           desc: 'Admin and staff accounts with separate permissions. Admins manage everything; staff can view and order — no accidental changes.' },
  { icon: Download,     color: '#0ea5e9', bg: '#e0f2fe', title: 'CSV Import & Export',         desc: 'Bulk-upload your existing product catalogue via CSV. Export reports on demand for spreadsheet analysis or offline backup.' },
];

const Features = () => (
  <section id="features" style={{ background: '#f7fffe', padding: 'clamp(3.5rem, 8vw, 6rem) clamp(1rem, 5vw, 3rem)' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <motion.div {...fadeUp()} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(46,197,192,0.1)', border: '1px solid rgba(46,197,192,0.28)',
          borderRadius: 50, padding: '0.32rem 0.9rem',
          color: '#2ec5c0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: '0.9rem',
        }}>
          <Zap size={11} /> Everything you need
        </span>
        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', fontWeight: 900, color: '#1a3035', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
          Powerful features,<br />simple interface
        </h2>
        <p style={{ fontSize: '1rem', color: '#89a8ae', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Everything a growing business needs to stay on top of their inventory — without the complexity.
        </p>
      </motion.div>

      <div className="pl-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {FEATURES.map(({ icon: Icon, color, bg, title, desc }, i) => (
          <motion.div
            key={title}
            className="pl-feat-card"
            {...fadeUp(i * 0.06)}
            style={{
              background: '#fff', border: '1px solid #e4f4f2',
              borderRadius: 16, padding: '1.5rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Icon size={20} color={color} />
            </div>
            <h3 style={{ fontSize: '0.97rem', fontWeight: 700, color: '#1a3035', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ fontSize: '0.85rem', color: '#89a8ae', lineHeight: 1.7 }}>{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   Highlights Section
───────────────────────────────────────────── */
const HighlightRow = ({ icon: Icon, color, bg, title, desc, points, reverse }) => (
  <motion.div className={`pl-hl${reverse ? ' pl-hl-rev' : ''}`} {...fadeUp()}>
    <div className="pl-hl-panel">
      <div style={{ background: bg, border: `1px solid ${color}22`, borderRadius: 20, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${color}22` }}>
          <Icon size={22} color={color} />
        </div>
        {points.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 10, padding: '0.65rem 0.9rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.83rem', color: '#4a6a6f', fontWeight: 500 }}>{p}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="pl-hl-text">
      <span style={{ fontSize: '0.74rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.09em' }}>{title.split(' ')[0]}</span>
      <h3 style={{ fontSize: 'clamp(1.25rem, 2.8vw, 1.75rem)', fontWeight: 800, color: '#1a3035', letterSpacing: '-0.025em', margin: '0.4rem 0 0.75rem', lineHeight: 1.2 }}>{title}</h3>
      <p style={{ fontSize: '0.95rem', color: '#89a8ae', lineHeight: 1.75 }}>{desc}</p>
    </div>
  </motion.div>
);

const Highlights = () => (
  <section style={{ background: '#fff', padding: 'clamp(3rem, 7vw, 5rem) clamp(1rem, 5vw, 3rem)' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <motion.div {...fadeUp()} style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#1a3035', letterSpacing: '-0.03em', marginBottom: '0.6rem' }}>
          Inventory control, reimagined
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#89a8ae', maxWidth: 440, margin: '0 auto' }}>
          Core capabilities that keep your business running without gaps.
        </p>
      </motion.div>

      <HighlightRow
        icon={AlertTriangle} color="#f59e0b" bg="#fffbeb"
        title="Low Stock Alerts That Actually Work"
        desc="Get notified the moment any product crosses your custom threshold. Set per-product minimums and let InvenTrack do the watching — so you can focus on running your business."
        points={['Custom threshold per product','Instant alert on dashboard','Critical stock highlighted in red','Never miss a reorder point']}
        reverse={false}
      />
      <HighlightRow
        icon={TrendingUp} color="#2ec5c0" bg="#f0fafa"
        title="Stock Movement & Flow Visibility"
        desc="Track how inventory moves in and out across every order and update. Visualise weekly stock changes with clear charts so trends are obvious at a glance."
        points={['Inbound & outbound tracking','Visual movement charts','Order-linked stock deduction','Historical trend view']}
        reverse={true}
      />
      <HighlightRow
        icon={Search} color="#6366f1" bg="#f5f3ff"
        title="Inventory Tracking Across All Products"
        desc="Search, filter, and sort your entire catalogue instantly. SKU-based identification, category grouping, and price management — all from a single, fast interface."
        points={['Full-text search across SKUs & names','Category-based organisation','Bulk CSV import & export','Real-time quantity updates']}
        reverse={false}
      />
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   CTA Section
───────────────────────────────────────────── */
const CTASection = ({ onSignup, onLogin }) => (
  <section style={{
    background: 'linear-gradient(135deg, #071824 0%, #0a2338 50%, #071824 100%)',
    padding: 'clamp(4rem, 9vw, 7rem) clamp(1rem, 5vw, 3rem)',
    textAlign: 'center', position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: '20%', left: '15%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,197,192,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,197,192,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
      <motion.div {...fadeUp()}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(46,197,192,0.12)', border: '1px solid rgba(46,197,192,0.28)', borderRadius: 50, padding: '0.32rem 0.9rem', color: '#2ec5c0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
          <CheckCircle size={11} /> Ready to get started?
        </span>
        <h2 style={{ fontSize: 'clamp(1.6rem, 4.5vw, 2.6rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.035em', marginBottom: '1rem', lineHeight: 1.1 }}>
          Start managing your<br />inventory today
        </h2>
        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 480, margin: '0 auto 2.25rem' }}>
          Join hundreds of businesses already using InvenTrack to keep their stock accurate, their orders organised, and their teams aligned.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={BTN.primary} onClick={onSignup}>Create Free Account <ArrowRight size={15} /></button>
          <button style={BTN.ghost}   onClick={onLogin}>Sign In Instead</button>
        </div>
      </motion.div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   Footer
───────────────────────────────────────────── */
const Footer = ({ onLogin, onSignup }) => (
  <footer style={{ background: '#040e17', padding: 'clamp(1.5rem, 4vw, 2rem) clamp(1rem, 5vw, 3rem)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #2ec5c0, #0f8f8a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Package size={14} color="#fff" strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.02em' }}>
          Inven<span style={{ color: '#2ec5c0' }}>Track</span>
        </span>
      </div>
      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)', order: 3 }}>
        © {new Date().getFullYear()} InvenTrack. All rights reserved.
      </span>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <span className="pl-footer-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</span>
        <span className="pl-footer-link" onClick={onLogin}>Login</span>
        <span className="pl-footer-link" onClick={onSignup}>Sign Up</span>
      </div>
    </div>
  </footer>
);

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
const PublicLanding = () => {
  const navigate = useNavigate();
  const goLogin  = () => navigate('/login');
  const goSignup = () => navigate('/signup');

  return (
    <>
      <style>{RESPONSIVE_CSS}</style>
      <div className="pl-wrap" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: '#fff', color: '#1a3035' }}>
        <PublicHeader onLogin={goLogin} onSignup={goSignup} />
        <Hero         onLogin={goLogin} onSignup={goSignup} />
        <StatsStrip />
        <Features />
        <Highlights />
        <CTASection   onLogin={goLogin} onSignup={goSignup} />
        <Footer       onLogin={goLogin} onSignup={goSignup} />
      </div>
    </>
  );
};

export default PublicLanding;
