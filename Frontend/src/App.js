import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import AdminProducts from './components/AdminProducts';
import AdminPartners from './components/AdminPartners';
import PartnerDashboard from './components/PartnerDashboard';
import PartnerProducts from './components/PartnerProducts';
import PartnerSales from './components/PartnerSales';
import PartnerBuyers from './components/PartnerBuyers';

import Sales from './components/Sales';
import { LayoutDashboard, Package, Users, ShoppingCart, LogOut, UserCircle } from 'lucide-react';

// ─── Sidebar Nav Link ────────────────────────────────────────────────────────
function NavLink({ to, icon: Icon, label }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        color: active ? 'white' : '#94a3b8',
        textDecoration: 'none',
        borderRadius: '8px',
        marginBottom: '0.25rem',
        fontWeight: active ? '600' : '500',
        fontSize: '0.95rem',
        background: active ? 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)' : 'transparent',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon size={20} />
      {label}
    </Link>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ user, onLogout }) {
  const tabId = sessionStorage.getItem('tabId') || '';
  const shortTab = tabId.substring(0, 12) + '...';
  const initials = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{
      width: '260px',
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      left: 0,
      top: 0,
      zIndex: 1000,
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.25rem'
        }}>
          Sales ERP
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
          {user.userRole} Panel
        </p>
        <p style={{ fontSize: '0.7rem', color: '#475569', margin: '0.2rem 0 0' }}>
          Tab: {shortTab}
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem' }}>
        {user.userRole === 'Admin' && (
          <>
            <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavLink to="/products"  icon={Package}         label="Products" />
            <NavLink to="/partners"  icon={Users}           label="Partners" />
            <NavLink to="/sales"     icon={ShoppingCart}    label="Sales" />
          </>
        )}
        {user.userRole === 'Partner' && (
          <>
            <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavLink to="/products"  icon={Package}         label="Products" />
            <NavLink to="/buyers"    icon={Users}           label="My Buyers" />
            <NavLink to="/sales"     icon={ShoppingCart}    label="Sales" />
          </>
        )}
        {user.userRole === 'Buyer' && (
          <>
            <NavLink to="/dashboard"  icon={LayoutDashboard} label="Dashboard" />
            <NavLink to="/purchases"  icon={ShoppingCart}    label="My Purchases" />
          </>
        )}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.05)',
          marginBottom: '0.75rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '1rem',
            flexShrink: 0
          }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, fontWeight: '600', fontSize: '0.875rem', color: 'white' }}>
              {user.fullName}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            background: 'rgba(239,68,68,0.1)',
            color: '#ef4444',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tabId = sessionStorage.getItem('tabId');
    const storedUser = sessionStorage.getItem(`user_${tabId}`);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    const tabId = sessionStorage.getItem('tabId');
    sessionStorage.removeItem(`user_${tabId}`);
    sessionStorage.removeItem(`token_${tabId}`);
    setUser(null);
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
        {user && <Sidebar user={user} onLogout={handleLogout} />}
        <div style={{ flex: 1, marginLeft: user ? '260px' : '0', minHeight: '100vh' }}>
          <Routes>
            <Route path="/login"    element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

            {user?.userRole === 'Admin' && (
              <>
                <Route path="/dashboard" element={<AdminDashboard />} />
                <Route path="/products"  element={<AdminProducts />} />
                <Route path="/partners"  element={<AdminPartners />} />
                <Route path="/sales"     element={<Sales />} />
              </>
            )}

            {user?.userRole === 'Partner' && (
              <>
                <Route path="/dashboard" element={<PartnerDashboard />} />
                <Route path="/products"  element={<PartnerProducts />} />
                <Route path="/buyers"    element={<PartnerBuyers />} />
                <Route path="/sales"     element={<PartnerSales />} />
              </>
            )}

            
            <Route path="/"  element={<Navigate to={user ? '/dashboard' : '/login'} />} />
            <Route path="*"  element={<Navigate to={user ? '/dashboard' : '/login'} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;






