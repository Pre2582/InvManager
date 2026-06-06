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
   Helpers
───────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

const btn = {
  primary: {
    background: 'linear-gradient(135deg, #2ec5c0 0%, #0f8f8a 100%)',
    border: 'none',
    color: '#fff',
    padding: '0.8rem 1.9rem',
    borderRadius: 12,
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 6px 28px rgba(46,197,192,0.38)',
    transition: 'transform 0.15s, box-shadow 0.15s',
    fontFamily: 'inherit',
  },
  ghost: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.22)',
    color: '#fff',
    padding: '0.8rem 1.9rem',
    borderRadius: 12,
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    transition: 'background 0.15s',
    fontFamily: 'inherit',
  },
  outline: {
    background: 'transparent',
    border: '1.5px solid rgba(46,197,192,0.5)',
    color: '#2ec5c0',
    padding: '0.48rem 1.25rem',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: '0.88rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s, border-color 0.15s',
  },
  navPrimary: {
    background: 'linear-gradient(135deg, #2ec5c0 0%, #0f8f8a 100%)',
    border: 'none',
    color: '#fff',
    padding: '0.48rem 1.25rem',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: '0.88rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'opacity 0.15s',
  },
};

/* ─────────────────────────────────────────────
   Sticky Header
───────────────────────────────────────────── */
const PublicHeader = ({ onLogin, onSignup }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLink = { color: 'rgba(255,255,255,0.82)', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s' };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      background: scrolled ? 'rgba(8,18,26,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(46,197,192,0.14)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 clamp(1rem, 4vw, 3rem)',
      height: 70,
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

      {/* Desktop nav */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '2.2rem', '@media(max-width:640px)': { display: 'none' } }}>
        <a href="#top" style={navLink}>Home</a>
        <a href="#features" style={navLink} onClick={e => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button style={btn.outline} onClick={onLogin}>Login</button>
          <button style={btn.navPrimary} onClick={onSignup}>Sign Up</button>
        </div>
      </nav>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(o => !o)}
        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'none', padding: 4, '@media(max-width:640px)': { display: 'flex' } }}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 70, left: 0, right: 0,
          background: 'rgba(8,18,26,0.97)',
          borderBottom: '1px solid rgba(46,197,192,0.2)',
          backdropFilter: 'blur(16px)',
          padding: '1.5rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
          zIndex: 199,
        }}>
          <a href="#top" style={{ ...navLink, color: '#fff', fontSize: '1rem' }} onClick={() => setMobileOpen(false)}>Home</a>
          <a href="#features" style={{ ...navLink, color: '#fff', fontSize: '1rem' }} onClick={() => { setMobileOpen(false); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
          <button style={{ ...btn.outline, justifyContent: 'center', width: '100%' }} onClick={() => { setMobileOpen(false); onLogin(); }}>Login</button>
          <button style={{ ...btn.navPrimary, justifyContent: 'center', width: '100%' }} onClick={() => { setMobileOpen(false); onSignup(); }}>Sign Up Free</button>
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
    padding: 'clamp(6rem, 12vw, 9rem) clamp(1rem, 4vw, 3rem) clamp(3rem, 6vw, 5rem)',
    position: 'relative', overflow: 'hidden',
  }}>
    {/* Ambient orbs */}
    <div style={{ position: 'absolute', top: '12%', left: '8%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,197,192,0.11) 0%, transparent 68%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: '8%', right: '6%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,197,192,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', top: '45%', right: '20%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

    {/* Main content */}
    <div style={{ maxWidth: 780, textAlign: 'center', position: 'relative', zIndex: 1 }}>
      {/* Badge */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: '1.5rem' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(46,197,192,0.12)', border: '1px solid rgba(46,197,192,0.32)',
          borderRadius: 50, padding: '0.38rem 1rem',
          color: '#2ec5c0', fontSize: '0.8rem', fontWeight: 700,
          letterSpacing: '0.03em', textTransform: 'uppercase',
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
          fontSize: 'clamp(2.2rem, 6vw, 3.6rem)',
          fontWeight: 900, color: '#fff',
          lineHeight: 1.08, letterSpacing: '-0.035em',
          marginBottom: '1.35rem',
        }}
      >
        Inventory Manager<br />
        <span style={{
          background: 'linear-gradient(135deg, #2ec5c0 20%, #7dd3d0 80%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Built for Businesses
        </span>
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.55 }}
        style={{
          fontSize: 'clamp(1rem, 2vw, 1.15rem)',
          color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.75, maxWidth: 580, margin: '0 auto 2.25rem',
        }}
      >
        Track stock, monitor product levels, and manage your inventory efficiently in one place.
        Stay updated with low-stock alerts, item details, and real-time inventory status.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
      >
        <button style={btn.primary} onClick={onSignup}>
          Get Started Free <ArrowRight size={15} />
        </button>
        <button style={btn.ghost} onClick={onLogin}>
          Sign In
        </button>
      </motion.div>

      {/* Trust row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '2.25rem', flexWrap: 'wrap' }}
      >
        {[
          { icon: Shield, text: 'Secure & Private' },
          { icon: CheckCircle, text: 'No credit card required' },
          { icon: Zap, text: 'Set up in minutes' },
        ].map(({ icon: Icon, text }) => (
          <span key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', fontWeight: 500 }}>
            <Icon size={13} color="rgba(46,197,192,0.7)" />
            {text}
          </span>
        ))}
      </motion.div>
    </div>

    {/* Mock dashboard preview */}
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginTop: '4rem', width: '100%', maxWidth: 900, position: 'relative', zIndex: 1 }}
    >
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        backdropFilter: 'blur(12px)',
        padding: '1.5rem',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(46,197,192,0.1)',
      }}>
        {/* Mock top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1.25rem' }}>
          {['#ef4444','#f59e0b','#22c55e'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
          ))}
          <div style={{ flex: 1, height: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 50, marginLeft: 8 }} />
        </div>

        {/* Mock KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
          {[
            { label: 'Total Products', value: '1,284', color: '#2ec5c0', bg: 'rgba(46,197,192,0.12)', icon: Package },
            { label: 'Low Stock Alerts', value: '23', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: AlertTriangle },
            { label: 'Orders Today', value: '48', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: ClipboardList },
            { label: 'Total Revenue', value: '₹2.4L', color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: TrendingUp },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} style={{
              background: bg, border: `1px solid ${color}22`,
              borderRadius: 12, padding: '0.85rem',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                <Icon size={13} color={color} />
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Mock chart + table row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '0.75rem' }}>
          {/* Chart placeholder */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '0.85rem', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.75rem', fontWeight: 600 }}>STOCK MOVEMENT</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 60 }}>
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95].map((h, i) => (
                <div key={i} style={{
                  flex: 1, height: `${h}%`, borderRadius: '3px 3px 0 0',
                  background: i === 9
                    ? 'linear-gradient(180deg, #2ec5c0, #0f8f8a)'
                    : 'rgba(46,197,192,0.25)',
                  transition: 'height 0.3s',
                }} />
              ))}
            </div>
          </div>
          {/* Table placeholder */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '0.85rem', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.75rem', fontWeight: 600 }}>RECENT ACTIVITY</div>
            {[
              { name: 'Laptop Stand', qty: 12, status: 'Low', sc: '#f59e0b' },
              { name: 'USB-C Hub', qty: 54, status: 'OK', sc: '#22c55e' },
              { name: 'Keyboard', qty: 3, status: 'Critical', sc: '#ef4444' },
              { name: 'Monitor', qty: 28, status: 'OK', sc: '#22c55e' },
            ].map(({ name, qty, status, sc }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{name}</span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{qty} units</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: sc, background: `${sc}18`, padding: '2px 7px', borderRadius: 50 }}>{status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Glow under preview */}
      <div style={{ position: 'absolute', bottom: -30, left: '20%', right: '20%', height: 60, background: 'rgba(46,197,192,0.15)', filter: 'blur(30px)', pointerEvents: 'none' }} />
    </motion.div>
  </section>
);

/* ─────────────────────────────────────────────
   Stats Strip
───────────────────────────────────────────── */
const StatsStrip = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const stats = [
    { value: '10K+', label: 'Products Managed' },
    { value: '500+', label: 'Businesses Trust Us' },
    { value: '99.9%', label: 'Uptime Guarantee' },
    { value: '24/7', label: 'Alert Monitoring' },
  ];
  return (
    <div ref={ref} style={{ background: '#fff', borderTop: '1px solid #e8f5f4', borderBottom: '1px solid #e8f5f4' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem clamp(1rem, 4vw, 3rem)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
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
  );
};

/* ─────────────────────────────────────────────
   Features Section
───────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Activity,
    color: '#2ec5c0', bg: '#e0faf9',
    title: 'Real-time Stock Tracking',
    desc: 'Monitor inventory levels across all products instantly. Get a live view of what\'s in stock, what\'s running low, and what needs reordering.',
  },
  {
    icon: AlertTriangle,
    color: '#f59e0b', bg: '#fef3c7',
    title: 'Low-Stock Alerts',
    desc: 'Set custom thresholds and receive automatic alerts when products fall below safe levels — so you never face an unexpected stockout.',
  },
  {
    icon: ClipboardList,
    color: '#6366f1', bg: '#ede9fe',
    title: 'Order Management',
    desc: 'Create, track, and manage customer orders end-to-end. Automated stock deduction on order confirmation keeps your counts accurate.',
  },
  {
    icon: BarChart3,
    color: '#22c55e', bg: '#dcfce7',
    title: 'Analytics Dashboard',
    desc: 'Visual charts and KPI cards give you instant insights into revenue, stock movement, order trends, and top-performing products.',
  },
  {
    icon: Users,
    color: '#ec4899', bg: '#fce7f3',
    title: 'Role-based Access',
    desc: 'Admin and staff accounts with separate permissions. Admins manage everything; staff can view and order — no accidental changes.',
  },
  {
    icon: Download,
    color: '#0ea5e9', bg: '#e0f2fe',
    title: 'CSV Import & Export',
    desc: 'Bulk-upload your existing product catalogue via CSV. Export reports on demand for spreadsheet analysis or offline backup.',
  },
];

const Features = () => (
  <section id="features" style={{ background: '#f7fffe', padding: 'clamp(3.5rem, 8vw, 6rem) clamp(1rem, 4vw, 3rem)' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Section header */}
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
        <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, color: '#1a3035', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
          Powerful features,<br />simple interface
        </h2>
        <p style={{ fontSize: '1rem', color: '#89a8ae', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Everything a growing business needs to stay on top of their inventory — without the complexity.
        </p>
      </motion.div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {FEATURES.map(({ icon: Icon, color, bg, title, desc }, i) => (
          <motion.div
            key={title}
            {...fadeUp(i * 0.06)}
            style={{
              background: '#fff',
              border: '1px solid #e4f4f2',
              borderRadius: 16,
              padding: '1.5rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
            }}
            whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(46,197,192,0.12)', borderColor: color + '44' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', flexShrink: 0 }}>
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
  <motion.div
    {...fadeUp()}
    style={{
      display: 'flex',
      flexDirection: reverse ? 'row-reverse' : 'row',
      gap: 'clamp(2rem, 5vw, 4rem)',
      alignItems: 'center',
      flexWrap: 'wrap',
      padding: '2.5rem 0',
      borderBottom: '1px solid #eaf5f4',
    }}
  >
    {/* Visual panel */}
    <div style={{ flex: '0 0 clamp(280px, 40%, 400px)' }}>
      <div style={{
        background: bg,
        border: `1px solid ${color}22`,
        borderRadius: 20,
        padding: '2rem',
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
      }}>
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

    {/* Text */}
    <div style={{ flex: 1, minWidth: 260 }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title.split(' ')[0]}</span>
      <h3 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: 800, color: '#1a3035', letterSpacing: '-0.025em', margin: '0.4rem 0 0.75rem', lineHeight: 1.2 }}>{title}</h3>
      <p style={{ fontSize: '0.95rem', color: '#89a8ae', lineHeight: 1.75, maxWidth: 440 }}>{desc}</p>
    </div>
  </motion.div>
);

const Highlights = () => (
  <section style={{ background: '#fff', padding: 'clamp(3rem, 7vw, 5rem) clamp(1rem, 4vw, 3rem)' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <motion.div {...fadeUp()} style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900, color: '#1a3035', letterSpacing: '-0.03em', marginBottom: '0.6rem' }}>
          Inventory control, reimagined
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#89a8ae', maxWidth: 440, margin: '0 auto' }}>
          Core capabilities that keep your business running without gaps.
        </p>
      </motion.div>

      <HighlightRow
        icon={AlertTriangle}
        color="#f59e0b"
        bg="#fffbeb"
        title="Low Stock Alerts That Actually Work"
        desc="Get notified the moment any product crosses your custom threshold. Set per-product minimums and let InvenTrack do the watching — so you can focus on running your business."
        points={[
          'Custom threshold per product',
          'Instant alert on dashboard',
          'Critical stock highlighted in red',
          'Never miss a reorder point',
        ]}
        reverse={false}
      />

      <HighlightRow
        icon={TrendingUp}
        color="#2ec5c0"
        bg="#f0fafa"
        title="Stock Movement & Flow Visibility"
        desc="Track how inventory moves in and out across every order and update. Visualise weekly stock changes with clear charts so trends are obvious at a glance."
        points={[
          'Inbound & outbound tracking',
          'Visual movement charts',
          'Order-linked stock deduction',
          'Historical trend view',
        ]}
        reverse={true}
      />

      <HighlightRow
        icon={Search}
        color="#6366f1"
        bg="#f5f3ff"
        title="Inventory Tracking Across All Products"
        desc="Search, filter, and sort your entire catalogue instantly. SKU-based identification, category grouping, and price management — all from a single, fast interface."
        points={[
          'Full-text search across SKUs & names',
          'Category-based organisation',
          'Bulk CSV import & export',
          'Real-time quantity updates',
        ]}
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
    padding: 'clamp(4rem, 9vw, 7rem) clamp(1rem, 4vw, 3rem)',
    textAlign: 'center', position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: '20%', left: '15%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,197,192,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,197,192,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

    <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
      <motion.div {...fadeUp()}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(46,197,192,0.12)', border: '1px solid rgba(46,197,192,0.28)', borderRadius: 50, padding: '0.32rem 0.9rem', color: '#2ec5c0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
          <CheckCircle size={11} /> Ready to get started?
        </span>
        <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.035em', marginBottom: '1rem', lineHeight: 1.12 }}>
          Start managing your<br />inventory today
        </h2>
        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: '2.25rem', maxWidth: 480, margin: '0 auto 2.25rem' }}>
          Join hundreds of businesses already using InvenTrack to keep their stock accurate, their orders organised, and their teams aligned.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={btn.primary} onClick={onSignup}>
            Create Free Account <ArrowRight size={15} />
          </button>
          <button style={btn.ghost} onClick={onLogin}>
            Sign In Instead
          </button>
        </div>
      </motion.div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   Footer
───────────────────────────────────────────── */
const Footer = () => (
  <footer style={{ background: '#040e17', padding: '2rem clamp(1rem, 4vw, 3rem)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #2ec5c0, #0f8f8a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Package size={14} color="#fff" strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.02em' }}>
          Inven<span style={{ color: '#2ec5c0' }}>Track</span>
        </span>
      </div>
      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.28)' }}>
        © {new Date().getFullYear()} InvenTrack. All rights reserved.
      </span>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {['Features', 'Login', 'Sign Up'].map(l => (
          <span key={l} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.38)', cursor: 'pointer', transition: 'color 0.15s' }}>
            {l}
          </span>
        ))}
      </div>
    </div>
  </footer>
);

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
const PublicLanding = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: '#fff', color: '#1a3035', overflowX: 'hidden' }}>
      <PublicHeader onLogin={() => navigate('/login')} onSignup={() => navigate('/signup')} />
      <Hero onSignup={() => navigate('/signup')} onLogin={() => navigate('/login')} />
      <StatsStrip />
      <Features />
      <Highlights />
      <CTASection onSignup={() => navigate('/signup')} onLogin={() => navigate('/login')} />
      <Footer />
    </div>
  );
};

export default PublicLanding;
