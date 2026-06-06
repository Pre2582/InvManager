import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import Customers from '@/pages/Customers';
import Orders from '@/pages/Orders';
import Landing from '@/pages/Landing';
import LandingAdmin from '@/pages/LandingAdmin';
import PublicLanding from '@/pages/PublicLanding';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import useAuthStore from '@/store/authStore';
import '@/styles/globals.css';

/* Root: guests see marketing page, authenticated users go to their home */
const SmartRoot = () => {
  const { token, isAdmin } = useAuthStore(s => ({ token: s.token, isAdmin: s.isAdmin }));
  if (token) return <Navigate to={isAdmin ? '/dashboard' : '/home'} replace />;
  return <PublicLanding />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root — public landing for guests, redirect for logged-in users */}
        <Route path="/" element={<SmartRoot />} />

        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes — all rendered inside Layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/home" element={<Landing />} />
          <Route path="/dashboard"     element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/landing-admin" element={<AdminRoute><LandingAdmin /></AdminRoute>} />
          <Route path="/products" element={<Products />} />
          <Route path="/customers" element={<AdminRoute><Customers /></AdminRoute>} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
