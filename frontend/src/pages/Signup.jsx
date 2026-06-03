import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Wand2, HelpCircle, X, LogIn, ShieldCheck, User } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { autoFillSignup } from '@/utils/autoFill';

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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <motion.div
          key="help-card"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1,   y: 0  }}
          exit={{   opacity: 0, scale: 0.9, y: 20  }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '460px',
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
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1a3035' }}>
                  Test Accounts
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#89a8ae', margin: 0 }}>
                No sign-up needed — use an existing account to explore the app
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none',
                color: '#89a8ae', cursor: 'pointer',
                padding: '0.2rem', borderRadius: '6px',
                display: 'flex', alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Account cards */}
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {TEST_ACCOUNTS.map((acc) => {
              const Icon = acc.Icon;
              return (
                <div
                  key={acc.username}
                  style={{
                    padding: '1.1rem 1.25rem',
                    borderRadius: '14px',
                    border: `1.5px solid ${acc.border}`,
                    background: acc.bg,
                  }}
                >
                  {/* Role header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      background: acc.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={16} style={{ color: '#fff' }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1a3035' }}>
                      {acc.role}
                    </span>
                  </div>

                  {/* Credentials grid */}
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

                  {/* Access note */}
                  <p style={{ fontSize: '0.78rem', color: '#4a6a6f', margin: '0 0 0.875rem 0', lineHeight: 1.5 }}>
                    {acc.access}
                  </p>

                  {/* Action button */}
                  <button
                    onClick={() => onUse(acc)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      width: '100%',
                      padding: '0.6rem 1rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: acc.accent,
                      color: '#ffffff',
                      fontSize: '0.85rem', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                      boxShadow: `0 4px 12px ${acc.accent}40`,
                      transition: 'filter 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
                  >
                    <LogIn size={15} />
                    Login as {acc.role}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div style={{
            padding: '0.75rem 1.5rem',
            borderTop: '1px solid #e8f7f6',
            textAlign: 'center',
            fontSize: '0.78rem',
            color: '#89a8ae',
          }}>
            Clicking "Login" takes you to the sign-in page with credentials pre-filled
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );

// ── Signup Page ───────────────────────────────────────────────────────────────
const Signup = () => {
  const navigate = useNavigate();
  const { token, signup } = useAuthStore();

  const [form, setForm]         = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAutoFill = () => {
    setForm(autoFillSignup());
    setError(null);
  };

  // Navigate to login and pre-fill with chosen test account
  const handleUseAccount = (acc) => {
    setShowHelp(false);
    navigate('/login', { state: { prefill: { username: acc.username, password: acc.password } } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = form;
    if (!username.trim() || !email.trim() || !password) { setError('All fields are required.'); return; }
    if (username.trim().length < 3)  { setError('Username must be at least 3 characters.'); return; }
    if (password.length < 8)         { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    setError(null);
    try {
      await signup(username.trim(), email.trim().toLowerCase(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Help icon — top-right of card */}
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          title="View test accounts"
          style={styles.helpBtn}
        >
          <HelpCircle size={18} />
        </button>

        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <Sparkles size={18} style={{ color: '#fff' }} />
          </div>
          <span style={styles.logoText}>InvenTrack</span>
        </div>

        <h2 style={styles.heading}>Create account</h2>
        <p style={styles.subtext}>Start managing your inventory today</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Autofill button */}
          <button type="button" onClick={handleAutoFill} disabled={loading} style={styles.autofillBtn}>
            <Wand2 size={13} />
            Autofill Demo Data
          </button>

          {error && (
            <motion.div style={styles.errorBanner} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
              {error}
            </motion.div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input name="username" value={form.username} onChange={handleChange}
              placeholder="your_username (min 3 chars)" autoComplete="username" autoFocus style={styles.input} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="you@example.com" autoComplete="email" style={styles.input} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                style={{ ...styles.input, paddingRight: '2.75rem' }}
              />
              <button type="button" onClick={() => setShowPass((v) => !v)} style={styles.eyeBtn} tabIndex={-1}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading && <span style={styles.spinner} />}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>

        {/* Hint to open help */}
        <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.78rem', color: '#89a8ae' }}>
          Just exploring?{' '}
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            style={{ background: 'none', border: 'none', color: '#2ec5c0', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px' }}
          >
            Use a test account
          </button>
        </p>
      </motion.div>

      {/* Test accounts popup */}
      {showHelp && (
        <TestAccountsPopup
          onClose={() => setShowHelp(false)}
          onUse={handleUseAccount}
        />
      )}

      <style>{`
        @keyframes orbDrift {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(20px,15px) scale(1.06); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh', width: '100vw',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #d8f5f3 0%, #eaf8f7 50%, #c8f0ed 100%)',
    position: 'relative', overflow: 'hidden',
  },
  orb1: {
    position: 'absolute', top: '-80px', right: '-100px',
    width: '480px', height: '480px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,197,66,0.18) 0%, transparent 70%)',
    filter: 'blur(60px)', animation: 'orbDrift 10s ease-in-out infinite alternate', pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '-100px', left: '-80px',
    width: '440px', height: '440px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(46,197,192,0.20) 0%, transparent 70%)',
    filter: 'blur(60px)', animation: 'orbDrift 12s ease-in-out infinite alternate-reverse', pointerEvents: 'none',
  },
  card: {
    width: '100%', maxWidth: '420px',
    background: '#ffffff',
    border: '1px solid rgba(46,197,192,0.25)',
    borderRadius: '20px',
    padding: '2.5rem',
    boxShadow: '0 20px 60px rgba(46,197,192,0.15), 0 4px 20px rgba(0,0,0,0.06)',
    position: 'relative', zIndex: 1,
  },

  /* Help icon button — absolute top-right of card */
  helpBtn: {
    position: 'absolute', top: '1.25rem', right: '1.25rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '32px', height: '32px',
    borderRadius: '50%',
    border: '1.5px solid rgba(46,197,192,0.35)',
    background: 'rgba(46,197,192,0.08)',
    color: '#2ec5c0',
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  },

  logo: { display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' },
  logoIcon: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #2ec5c0 0%, #1aa8a3 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(46,197,192,0.4)',
  },
  logoText: {
    fontSize: '1.2rem', fontWeight: 800,
    background: 'linear-gradient(135deg, #2ec5c0 0%, #1aa8a3 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text', letterSpacing: '-0.02em',
  },
  heading:  { fontSize: '1.6rem', fontWeight: 700, color: '#1a3035', marginBottom: '0.4rem', letterSpacing: '-0.02em' },
  subtext:  { fontSize: '0.9rem', color: '#89a8ae', marginBottom: '1.75rem' },
  form:     { display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  errorBanner: {
    padding: '0.75rem 1rem',
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)',
    borderRadius: '10px', color: '#ef4444', fontSize: '0.875rem',
  },
  field:  { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label:  { fontSize: '0.8rem', fontWeight: 600, color: '#4a6a6f', textTransform: 'uppercase', letterSpacing: '0.06em' },
  input:  {
    width: '100%', background: '#f4fcfb',
    border: '1px solid #cce9e7', borderRadius: '10px',
    padding: '0.75rem 1rem', color: '#1a3035',
    fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  inputWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: '#89a8ae',
    display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '2px',
  },
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    width: '100%', padding: '0.85rem', marginTop: '0.5rem',
    background: 'linear-gradient(135deg, #2ec5c0 0%, #1aa8a3 100%)',
    color: '#fff', border: 'none', borderRadius: '10px',
    fontSize: '1rem', fontWeight: 600, fontFamily: 'inherit',
    letterSpacing: '0.01em', boxShadow: '0 4px 16px rgba(46,197,192,0.38)',
    transition: 'filter 0.15s',
  },
  spinner: {
    display: 'inline-block', width: '16px', height: '16px',
    border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  },
  autofillBtn: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.38rem 0.9rem', borderRadius: '8px',
    border: '1.5px dashed #2ec5c0', background: 'rgba(46,197,192,0.1)',
    color: '#2ec5c0', fontSize: '0.82rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', width: 'fit-content',
  },
  switchText: { marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#4a6a6f' },
  link:       { color: '#f5c542', fontWeight: 600, textDecoration: 'none' },
};

export default Signup;
