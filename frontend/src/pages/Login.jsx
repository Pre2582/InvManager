import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import useAuthStore from '@/store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { token, login } = useAuthStore();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

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
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Teal ambient orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <Sparkles size={18} style={{ color: '#fff' }} />
          </div>
          <span style={styles.logoText}>InvenTrack</span>
        </div>

        <h2 style={styles.heading}>Welcome back</h2>
        <p style={styles.subtext}>Sign in to manage your inventory</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <motion.div
              style={styles.errorBanner}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Username or Email</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="your_username"
              autoComplete="username"
              autoFocus
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ ...styles.input, paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={styles.eyeBtn}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.75 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading && <span style={styles.spinner} />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={styles.switchText}>
          Don&apos;t have an account?{' '}
          <Link to="/signup" style={styles.link}>
            Create one
          </Link>
        </p>
      </motion.div>

      <style>{`
        @keyframes orbDrift {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(20px, 15px) scale(1.06); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .login-input:focus {
          border-color: #2ec5c0 !important;
          box-shadow: 0 0 0 3px rgba(46,197,192,0.18) !important;
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #d8f5f3 0%, #eaf8f7 50%, #c8f0ed 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    top: '-140px',
    left: '-120px',
    width: '520px',
    height: '520px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(46,197,192,0.22) 0%, transparent 70%)',
    filter: 'blur(60px)',
    animation: 'orbDrift 9s ease-in-out infinite alternate',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute',
    bottom: '-100px',
    right: '-100px',
    width: '440px',
    height: '440px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,197,66,0.18) 0%, transparent 70%)',
    filter: 'blur(60px)',
    animation: 'orbDrift 11s ease-in-out infinite alternate-reverse',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#ffffff',
    border: '1px solid rgba(46,197,192,0.25)',
    borderRadius: '20px',
    padding: '2.5rem',
    boxShadow: '0 20px 60px rgba(46,197,192,0.15), 0 4px 20px rgba(0,0,0,0.06)',
    position: 'relative',
    zIndex: 1,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    marginBottom: '2rem',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #2ec5c0 0%, #1aa8a3 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(46,197,192,0.4)',
  },
  logoText: {
    fontSize: '1.2rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #2ec5c0 0%, #1aa8a3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.02em',
  },
  heading: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#1a3035',
    marginBottom: '0.4rem',
    letterSpacing: '-0.02em',
  },
  subtext: {
    fontSize: '0.9rem',
    color: '#89a8ae',
    marginBottom: '1.75rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
  },
  errorBanner: {
    padding: '0.75rem 1rem',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.22)',
    borderRadius: '10px',
    color: '#ef4444',
    fontSize: '0.875rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#4a6a6f',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  input: {
    width: '100%',
    background: '#f4fcfb',
    border: '1px solid #cce9e7',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    color: '#1a3035',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  inputWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute',
    right: '0.875rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#89a8ae',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '2px',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.85rem',
    marginTop: '0.5rem',
    background: 'linear-gradient(135deg, #2ec5c0 0%, #1aa8a3 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 600,
    fontFamily: 'inherit',
    letterSpacing: '0.01em',
    boxShadow: '0 4px 16px rgba(46,197,192,0.38)',
    transition: 'filter 0.15s, box-shadow 0.15s',
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.35)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  switchText: {
    marginTop: '1.75rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#4a6a6f',
  },
  link: {
    color: '#2ec5c0',
    fontWeight: 600,
    textDecoration: 'none',
  },
};

export default Login;
