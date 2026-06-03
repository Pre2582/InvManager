import React from 'react';
import { Calendar, ShoppingCart, Menu, Sun, Moon } from 'lucide-react';
import { format } from 'date-fns';
import useCartStore from '@/store/cartStore';
import useSettingsStore from '@/store/settingsStore';

const Header = ({ title, onMenuClick }) => {
  const currentDate = format(new Date(), 'EEEE, MMMM dd, yyyy');
  const { items, toggleCart } = useCartStore();
  const { theme, toggleTheme } = useSettingsStore();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 90,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Hamburger — only shows on mobile via CSS */}
        <button
          className="hamburger-btn"
          onClick={onMenuClick}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '0.35rem' }}
        >
          <Menu size={22} />
        </button>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem' }} className="date-display">
          <Calendar size={14} style={{ color: 'var(--primary)' }} />
          <span>{currentDate}</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Cart button */}
        <button
          onClick={toggleCart}
          title="View Cart"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${totalItems > 0 ? 'rgba(46,197,192,0.45)' : 'var(--border-color)'}`, background: totalItems > 0 ? 'var(--primary-glow)' : 'var(--bg-tertiary)', color: totalItems > 0 ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <ShoppingCart size={17} />
          {totalItems > 0 && (
            <span style={{ background: 'var(--gradient-primary)', color: 'white', borderRadius: '50px', padding: '0.05rem 0.45rem', fontSize: '0.72rem', fontWeight: 700, lineHeight: 1.6 }}>{totalItems}</span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
