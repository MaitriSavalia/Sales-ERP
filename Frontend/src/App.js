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
import { LayoutDashboard, Package, Users, ShoppingCart, LogOut, Menu, X } from 'lucide-react';
import './App.css';

// ─── Sidebar Nav Link ────────────────────────────────────────────────────────
function NavLink({ to, icon: Icon, label, onClick }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ user, onLogout, isOpen, onClose }) {
  const initials = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.svg" alt="SalesPilot" style={{ width: '38px', height: '38px', borderRadius: '10px' }} />
            <div>
              <h2 className="sidebar-title">SalesPilot</h2>
              <p className="sidebar-subtitle">{user.userRole} Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {user.userRole === 'Admin' && (
            <>
              <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={onClose} />
              <NavLink to="/products"  icon={Package}         label="Products"  onClick={onClose} />
              <NavLink to="/partners"  icon={Users}           label="Partners"  onClick={onClose} />
              <NavLink to="/sales"     icon={ShoppingCart}    label="Sales"     onClick={onClose} />
            </>
          )}
          {user.userRole === 'Partner' && (
            <>
              <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={onClose} />
              <NavLink to="/products"  icon={Package}         label="Products"  onClick={onClose} />
              <NavLink to="/buyers"    icon={Users}           label="My Buyers" onClick={onClose} />
              <NavLink to="/sales"     icon={ShoppingCart}    label="Sales"     onClick={onClose} />
            </>
          )}
          {user.userRole === 'Buyer' && (
            <>
              <NavLink to="/dashboard"  icon={LayoutDashboard} label="Dashboard"    onClick={onClose} />
              <NavLink to="/purchases"  icon={ShoppingCart}    label="My Purchases" onClick={onClose} />
            </>
          )}
        </nav>

        {/* User + Logout */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div className="user-details">
              <p className="user-name">{user.fullName}</p>
              <p className="user-email">{user.email}</p>
            </div>
          </div>
          <button onClick={onLogout} className="logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
    setMenuOpen(false);
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app">
        {user && (
          <>
            <button className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Sidebar user={user} onLogout={handleLogout} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
          </>
        )}
        <div className={user ? 'main-content' : ''} style={{ width: '100%' }}>
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
