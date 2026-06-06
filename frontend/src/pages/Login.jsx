import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Eye, EyeOff, Sparkles, HelpCircle, X, LogIn, ShieldCheck, User, ArrowRight, Lock, AtSign } from 'lucide-react';
import useAuthStore from '@/store/authStore';

// ── Test account definitions ──────────────────────────────────────────────────
const TEST_ACCOUNTS = [
  {
    role:     'Regular User',
    username: 'testUser',
    password: 'Test1234',
    access:   'Place orders, browse catalog, view order history',
    Icon:     User,
    accent:   '#2ec5c0',
    bg:       'rgba(46,197,192,0.07)',
    border:   'rgba(46,197,192,0.25)',
  },
  {
    role:     'Admin',
    username: 'admin',
    password: 'Admin@1234',
    access:   'All of the above + change order status (Pending → Confirmed → Delivered)',
    Icon:     ShieldCheck,
    accent:   '#f59e0b',
    bg:       'rgba(245,158,11,0.07)',
    border:   'rgba(245,158,11,0.28)',
  },
];

// ── Floating particle ─────────────────────────────────────────────────────────
const Particle = ({ style }) => (
  <motion.div
    style={{
      position: 'absolute',
      borderRadius: '50%',
      pointerEvents: 'none',
      ...style,
    }}
    animate={{
      y: [0, -30, 0],
      x: [0, 10, -10, 0],
      opacity: [0.4, 0.9, 0.4],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration: style.duration,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: style.delay,
    }}
  />
);

const PARTICLES = [
  { width: 8, height: 8, top: '15%', left: '8%',  background: 'rgba(46,197,192,0.5)',  duration: 4.5, delay: 0   },
  { width: 5, height: 5, top: '70%', left: '5%',  background: 'rgba(245,197,66,0.5)',  duration: 5.2, delay: 0.8 },
  { width: 6, height: 6, top: '30%', right: '7%', background: 'rgba(46,197,192,0.4)',  duration: 6.1, delay: 1.2 },
  { width: 9, height: 9, top: '80%', right: '10%',background: 'rgba(245,158,11,0.45)', duration: 4.8, delay: 0.4 },
  { width: 4, height: 4, top: '50%', left: '15%', background: 'rgba(46,197,192,0.6)',  duration: 5.7, delay: 1.6 },
  { width: 7, height: 7, top: '20%', right: '20%',background: 'rgba(245,197,66,0.4)',  duration: 4.2, delay: 2.0 },
  { width: 5, height: 5, top: '90%', left: '40%', background: 'rgba(46,197,192,0.35)', duration: 6.5, delay: 0.6 },
  { width: 6, height: 6, top: '10%', left: '55%', background: 'rgba(245,158,11,0.5)',  duration: 5.0, delay: 1.8 },
];

// ── Animated focus input ──────────────────────────────────────────────────────
const AnimatedInput = ({ icon: Icon, label, name, type, value, onChange, placeholder, autoComplete, autoFocus, extra }) => {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <label style={{
        fontSize: '0.78rem', fontWeight: 700, color: focused ? '#2ec5c0' : '#4a6a6f',
        textTransform: 'uppercase', letterSpacing: '0.07em',
        transition: 'color 0.2s',
      }}>
        {label}
      </label>
      <motion.div
        style={{ position: 'relative' }}
        animate={focused ? { scale: 1.01 } : { scale: 1 }}
        transition={{ duration: 0.15 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Left icon */}
        <div style={{
          position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)',
          color: focused ? '#2ec5c0' : '#a8c5c3',
          transition: 'color 0.2s',
          display: 'flex', alignItems: 'center', pointerEvents: 'none',
        }}>
          <Icon size={16} />
        </div>
        <input
          name={name}
          type={type || 'text'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            background: focused ? '#f0fffe' : hovered ? '#f7fdfc' : '#f4fcfb',
            border: `1.5px solid ${focused ? '#2ec5c0' : hovered ? '#a8e6e3' : '#cce9e7'}`,
            borderRadius: '12px',
            padding: '0.78rem 1rem 0.78rem 2.6rem',
            color: '#1a3035',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            outline: 'none',
            boxSizing: 'border-box',
            boxShadow: focused
              ? '0 0 0 3px rgba(46,197,192,0.18), 0 2px 8px rgba(46,197,192,0.12)'
              : '0 1px 4px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease',
          }}
        />
        {extra}
      </motion.div>
    </motion.div>
  );
};

// ── Help popup (portal) ───────────────────────────────────────────────────────
const TestAccountsPopup = ({ onClose, onUse }) =>
  createPortal(
    <AnimatePresence>
      <motion.div
        key="help-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(6px)',
          zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <motion.div
          key="help-card"
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 30 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: '460px',
            background: '#ffffff',
            border: '1px solid rgba(46,197,192,0.25)',
            borderRadius: '20px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 4px 20px rgba(46,197,192,0.12)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e8f7f6',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(46,197,192,0.08) 0%, transparent 100%)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <HelpCircle size={18} style={{ color: '#2ec5c0' }} />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1a3035' }}>Test Accounts</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#89a8ae', margin: 0 }}>
                Choose an account to instantly fill in the credentials below
              </p>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ rotate: 90, scale: 1.1 }}
              transition={{ duration: 0.2 }}
              style={{ background: 'none', border: 'none', color: '#89a8ae', cursor: 'pointer', padding: '0.2rem', borderRadius: '6px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
            >
              <X size={18} />
            </motion.button>
          </div>

          {/* Account cards */}
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {TEST_ACCOUNTS.map((acc, i) => {
              const Icon = acc.Icon;
              return (
                <motion.div
                  key={acc.username}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                  style={{ padding: '1.1rem 1.25rem', borderRadius: '14px', border: `1.5px solid ${acc.border}`, background: acc.bg }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: acc.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} style={{ color: '#fff' }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1a3035' }}>{acc.role}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.875rem' }}>
                    <div style={{ padding: '0.5rem 0.75rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e8f7f6' }}>
                      <div style={{ fontSize: '0.68rem', color: '#89a8ae', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Username</div>
                      <code style={{ fontSize: '0.88rem', fontWeight: 700, color: acc.accent }}>{acc.username}</code>
                    </div>
                    <div style={{ padding: '0.5rem 0.75rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e8f7f6' }}>
                      <div style={{ fontSize: '0.68rem', color: '#89a8ae', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Password</div>
                      <code style={{ fontSize: '0.88rem', fontWeight: 700, color: acc.accent }}>{acc.password}</code>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#4a6a6f', margin: '0 0 0.875rem 0', lineHeight: 1.5 }}>{acc.access}</p>
                  <motion.button
                    onClick={() => onUse(acc)}
                    whileHover={{ scale: 1.02, filter: 'brightness(1.08)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      width: '100%', padding: '0.6rem 1rem', borderRadius: '10px',
                      border: 'none', background: acc.accent, color: '#ffffff',
                      fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                      boxShadow: `0 4px 12px ${acc.accent}40`,
                    }}
                  >
                    <LogIn size={15} />
                    Use {acc.role} Account
                  </motion.button>
                </motion.div>
              );
            })}
          </div>

          <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid #e8f7f6', textAlign: 'center', fontSize: '0.78rem', color: '#89a8ae' }}>
            Credentials will be filled in automatically — just click Sign In
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );

// ── Stagger container variants ────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

// ── Login Page ────────────────────────────────────────────────────────────────
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, login, isAdmin } = useAuthStore();

  const [form, setForm]           = useState({ username: '', password: '' });
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [showHelp, setShowHelp]   = useState(false);
  const [prefilled, setPrefilled] = useState(null);
  const [btnHover, setBtnHover]   = useState(false);

  // Handle prefill state passed from Signup's "Login as..." button
  useEffect(() => {
    if (location.state?.prefill) {
      const { username, password } = location.state.prefill;
      setForm({ username, password });
      const matched = TEST_ACCOUNTS.find((a) => a.username === username);
      setPrefilled(matched || null);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  useEffect(() => {
    if (token) navigate(isAdmin ? '/dashboard' : '/home', { replace: true });
  }, [token, isAdmin, navigate]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setPrefilled(null);
  };

  const handleUseAccount = (acc) => {
    setForm({ username: acc.username, password: acc.password });
    setPrefilled(acc);
    setError(null);
    setShowHelp(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(form.username, form.password);
      const { isAdmin: loggedInAsAdmin } = useAuthStore.getState();
      navigate(loggedInAsAdmin ? '/dashboard' : '/home');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* ── Animated gradient orbs ── */}
      <motion.div
        style={styles.orb1}
        animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={styles.orb2}
        animate={{ scale: [1, 1.2, 1], x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        style={styles.orb3}
        animate={{ scale: [1, 1.1, 1], x: [0, 15, 0], y: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* ── Floating particles ── */}
      {PARTICLES.map((p, i) => <Particle key={i} style={p} />)}

      {/* ── Grid mesh overlay ── */}
      <div style={styles.gridMesh} />

      {/* ── Card ── */}
      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 48, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ boxShadow: '0 28px 80px rgba(46,197,192,0.22), 0 6px 24px rgba(0,0,0,0.08)' }}
      >
        {/* Shimmer sweep on load */}
        <motion.div
          style={styles.shimmer}
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 1.1, delay: 0.7, ease: 'easeInOut' }}
        />

        {/* Help icon */}
        <motion.button
          type="button"
          onClick={() => setShowHelp(true)}
          title="View test accounts"
          style={styles.helpBtn}
          whileHover={{ scale: 1.15, background: 'rgba(46,197,192,0.18)', boxShadow: '0 0 0 6px rgba(46,197,192,0.12)' }}
          whileTap={{ scale: 0.92 }}
          initial={{ opacity: 0, rotate: -20 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <HelpCircle size={18} />
        </motion.button>

        {/* ── Inner stagger wrapper ── */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">

          {/* Logo */}
          <motion.div style={styles.logo} variants={itemVariants}>
            <motion.div
              style={styles.logoIcon}
              animate={{ boxShadow: ['0 4px 14px rgba(46,197,192,0.4)', '0 4px 28px rgba(46,197,192,0.7)', '0 4px 14px rgba(46,197,192,0.4)'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles size={18} style={{ color: '#fff' }} />
              </motion.div>
            </motion.div>
            <span style={styles.logoText}>InvenTrack</span>
          </motion.div>

          {/* Heading */}
          <motion.h2 style={styles.heading} variants={itemVariants}>
            Welcome back
          </motion.h2>
          <motion.p style={styles.subtext} variants={itemVariants}>
            Sign in to manage your inventory
          </motion.p>

          {/* Prefilled badge */}
          <AnimatePresence>
            {prefilled && (
              <motion.div
                key="prefilled-badge"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.65rem 0.9rem',
                  background: prefilled.bg,
                  border: `1.5px solid ${prefilled.border}`,
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                <prefilled.Icon size={15} style={{ color: prefilled.accent, flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: '#4a6a6f', lineHeight: 1.4 }}>
                  Credentials pre-filled for{' '}
                  <strong style={{ color: prefilled.accent }}>{prefilled.role}</strong>
                  {' '}— click Sign In to continue.
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form onSubmit={handleSubmit} style={styles.form} variants={itemVariants}>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  style={styles.errorBanner}
                  initial={{ opacity: 0, y: -10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Username field */}
            <motion.div variants={itemVariants}>
              <AnimatedInput
                icon={AtSign}
                label="Username or Email"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="your_username"
                autoComplete="username"
                autoFocus
              />
            </motion.div>

            {/* Password field */}
            <motion.div variants={itemVariants}>
              <AnimatedInput
                icon={Lock}
                label="Password"
                name="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                extra={
                  <motion.button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    whileHover={{ scale: 1.2, color: '#2ec5c0' }}
                    whileTap={{ scale: 0.9 }}
                    tabIndex={-1}
                    style={styles.eyeBtn}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={showPass ? 'off' : 'on'}
                        initial={{ opacity: 0, rotate: -30 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 30 }}
                        transition={{ duration: 0.15 }}
                        style={{ display: 'flex' }}
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                }
              />
            </motion.div>

            {/* Submit button */}
            <motion.div variants={itemVariants} style={{ marginTop: '0.25rem' }}>
              <motion.button
                type="submit"
                disabled={loading}
                onHoverStart={() => setBtnHover(true)}
                onHoverEnd={() => setBtnHover(false)}
                whileHover={{ scale: 1.025, boxShadow: '0 8px 30px rgba(46,197,192,0.55)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.75 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Button inner shimmer on hover */}
                <AnimatePresence>
                  {btnHover && !loading && (
                    <motion.div
                      key="btn-shimmer"
                      initial={{ x: '-100%', opacity: 0.6 }}
                      animate={{ x: '200%', opacity: 0 }}
                      exit={{}}
                      transition={{ duration: 0.55, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </AnimatePresence>

                {loading ? (
                  <>
                    <motion.span
                      style={styles.spinner}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                    />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <motion.span
                      animate={btnHover ? { x: 4 } : { x: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'flex' }}
                    >
                      <ArrowRight size={17} />
                    </motion.span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <motion.div variants={itemVariants} style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <span style={styles.dividerLine} />
          </motion.div>

          {/* Hint */}
          <motion.p variants={itemVariants} style={{ textAlign: 'center', fontSize: '0.82rem', color: '#89a8ae', margin: 0 }}>
            Just exploring?{' '}
            <motion.button
              type="button"
              onClick={() => setShowHelp(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ background: 'none', border: 'none', color: '#2ec5c0', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              Use a test account →
            </motion.button>
          </motion.p>

          {/* Switch to signup */}
          <motion.p variants={itemVariants} style={styles.switchText}>
            Don&apos;t have an account?{' '}
            <Link to="/signup" style={styles.link}>Create one</Link>
          </motion.p>

        </motion.div>
      </motion.div>

      {/* Test accounts popup */}
      {showHelp && (
        <TestAccountsPopup
          onClose={() => setShowHelp(false)}
          onUse={handleUseAccount}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh', width: '100vw',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #c5f0ee 0%, #e2f8f6 40%, #daf4f2 70%, #c2ede9 100%)',
    position: 'relative', overflow: 'hidden',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  orb1: {
    position: 'absolute', top: '-160px', left: '-130px',
    width: '560px', height: '560px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(46,197,192,0.28) 0%, transparent 68%)',
    filter: 'blur(55px)', pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '-120px', right: '-110px',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,197,66,0.22) 0%, transparent 68%)',
    filter: 'blur(55px)', pointerEvents: 'none',
  },
  orb3: {
    position: 'absolute', top: '40%', left: '60%',
    width: '300px', height: '300px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(46,197,192,0.12) 0%, transparent 70%)',
    filter: 'blur(40px)', pointerEvents: 'none',
  },
  gridMesh: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: `
      linear-gradient(rgba(46,197,192,0.055) 1px, transparent 1px),
      linear-gradient(90deg, rgba(46,197,192,0.055) 1px, transparent 1px)
    `,
    backgroundSize: '44px 44px',
    maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
    WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
  },
  card: {
    width: '100%', maxWidth: '430px',
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(46,197,192,0.22)',
    borderRadius: '24px',
    padding: '2.75rem',
    boxShadow: '0 20px 60px rgba(46,197,192,0.15), 0 4px 20px rgba(0,0,0,0.07)',
    position: 'relative', zIndex: 1,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute', top: 0, left: 0,
    width: '60%', height: '100%',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
    pointerEvents: 'none', zIndex: 2,
    transform: 'skewX(-15deg)',
  },
  helpBtn: {
    position: 'absolute', top: '1.25rem', right: '1.25rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '34px', height: '34px', borderRadius: '50%',
    border: '1.5px solid rgba(46,197,192,0.35)',
    background: 'rgba(46,197,192,0.08)',
    color: '#2ec5c0', cursor: 'pointer', fontFamily: 'inherit',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.75rem' },
  logoIcon: {
    width: '38px', height: '38px', borderRadius: '11px',
    background: 'linear-gradient(135deg, #2ec5c0 0%, #1aa8a3 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(46,197,192,0.4)',
  },
  logoText: {
    fontSize: '1.22rem', fontWeight: 800,
    background: 'linear-gradient(135deg, #2ec5c0 0%, #1aa8a3 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text', letterSpacing: '-0.02em',
  },
  heading: { fontSize: '1.65rem', fontWeight: 800, color: '#1a3035', marginBottom: '0.35rem', letterSpacing: '-0.025em' },
  subtext:  { fontSize: '0.88rem', color: '#89a8ae', marginBottom: '1.4rem' },
  form:     { display: 'flex', flexDirection: 'column', gap: '1rem' },
  errorBanner: {
    padding: '0.75rem 1rem',
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)',
    borderRadius: '10px', color: '#dc2626', fontSize: '0.875rem',
  },
  eyeBtn: {
    position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: '#89a8ae',
    display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '2px',
  },
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    width: '100%', padding: '0.9rem', marginTop: '0.25rem',
    background: 'linear-gradient(135deg, #2ec5c0 0%, #17a8a3 60%, #13918c 100%)',
    color: '#fff', border: 'none', borderRadius: '12px',
    fontSize: '1rem', fontWeight: 700, fontFamily: 'inherit',
    letterSpacing: '0.01em', boxShadow: '0 4px 18px rgba(46,197,192,0.42)',
    transition: 'opacity 0.2s',
  },
  spinner: {
    display: 'inline-block', width: '17px', height: '17px',
    border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
    borderRadius: '50%',
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    margin: '1.25rem 0 1rem',
  },
  dividerLine: { flex: 1, height: '1px', background: 'rgba(46,197,192,0.18)' },
  dividerText: { fontSize: '0.78rem', color: '#a8c5c3', fontWeight: 600, flexShrink: 0 },
  switchText: { marginTop: '1rem', textAlign: 'center', fontSize: '0.88rem', color: '#4a6a6f' },
  link:       { color: '#2ec5c0', fontWeight: 700, textDecoration: 'none' },
};

export default Login;
