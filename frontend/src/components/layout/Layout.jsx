import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from '../common/Toast';

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Determine page title based on path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard Summary';
      case '/products':
        return 'Products Inventory';
      case '/customers':
        return 'Customers Database';
      case '/orders':
        return 'Order Management';
      default:
        return 'Inventory System';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Panel */}
      <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <Header title={getPageTitle()} />
        <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </main>
      </div>

      {/* Global Toast Notifications */}
      <Toast />
    </div>
  );
};

export default Layout;
