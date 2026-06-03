import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  Settings,
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useTranslation from '@/hooks/useTranslation';

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const { username, logout } = useAuthStore();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
    { key: 'products',  path: '/products',  icon: Package },
    { key: 'customers', path: '/customers', icon: Users },
    { key: 'orders',    path: '/orders',    icon: ShoppingCart },
    { key: 'settings',  path: '/settings',  icon: Settings },
  ];

  return (
    <aside
      className={`sidebar-desktop ${mobileOpen ? 'sidebar-mobile-open' : ''}`}
      style={{
        width: collapsed ? '80px' : 'var(--sidebar-width)',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'var(--sidebar-bg)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-slow)',
        zIndex: 100,
        overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(46,197,192,0.18)',
      }}
    >
      {/* Brand */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: '0 1.25rem',
          borderBottom: '1px solid var(--sidebar-border)',
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '9px',
                background: 'rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} style={{ color: '#fff' }} />
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: '1.05rem',
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              InvManager
            </span>
          </div>
        )}
        {collapsed && (
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'rgba(255,255,255,0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={18} style={{ color: '#fff' }} />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            marginLeft: collapsed ? '0' : 'auto',
            padding: '0.3rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--sidebar-border)',
            background: 'var(--sidebar-hover-bg)',
            color: 'rgba(255,255,255,0.85)',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flexGrow: 1,
          padding: '1.25rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3rem',
          overflowY: 'auto',
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? t(item.key) : ''}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.9rem',
              padding: '0.7rem 1rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontSize: '0.92rem',
              fontWeight: isActive ? 600 : 500,
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'all var(--transition-fast)',
              color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
              backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
              boxShadow: isActive ? '0 2px 12px rgba(0,0,0,0.12)' : 'none',
            })}
          >
            {({ isActive }) => {
              const Icon = item.icon;
              return (
                <>
                  <Icon
                    size={19}
                    style={{
                      color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-icon-muted)',
                      flexShrink: 0,
                      transition: 'color var(--transition-fast)',
                    }}
                  />
                  {!collapsed && <span>{t(item.key)}</span>}
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '0.875rem 1rem',
          borderTop: '1px solid var(--sidebar-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'var(--sidebar-footer-bg)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.88rem',
            color: 'white',
            flexShrink: 0,
            border: '2px solid rgba(255,255,255,0.5)',
          }}
        >
          {username ? username[0].toUpperCase() : 'U'}
        </div>

        {!collapsed && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.92)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {username ?? 'User'}
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title={t('signOut')}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            flexShrink: 0,
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
