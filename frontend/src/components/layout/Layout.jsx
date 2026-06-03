import React, { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from '../common/Toast';
import CartDrawer from '../common/CartDrawer';
import useTranslation from '@/hooks/useTranslation';

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const location = useLocation();
  const { t } = useTranslation();

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return t('dashboard');
      case '/products':  return t('products');
      case '/customers': return t('customers');
      case '/orders':    return t('orders');
      case '/settings':  return t('settings');
      default:           return 'InvenTrack';
    }
  };

  const handleOrderPlaced = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <div className="app-container">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <Header
          title={getPageTitle()}
          onMenuClick={() => setMobileOpen((o) => !o)}
        />
        <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Outlet context={{ refreshKey }} />
        </main>
      </div>

      <Toast />
      <CartDrawer onOrderPlaced={handleOrderPlaced} />
    </div>
  );
};

export default Layout;
