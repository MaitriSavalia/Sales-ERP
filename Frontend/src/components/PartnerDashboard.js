import React, { useState, useEffect } from 'react';
import { partnerService } from '../services/api';
import { ShoppingCart, TrendingUp, DollarSign, Award, Package } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n || 0);

const statusStyle = (s) => ({
  padding: '0.25rem 0.75rem',
  borderRadius: '20px',
  fontSize: '0.8rem',
  fontWeight: '600',
  background: s === 'Completed' ? '#d1fae5' : s === 'Pending' ? '#fef3c7' : '#fee2e2',
  color:      s === 'Completed' ? '#065f46' : s === 'Pending' ? '#92400e' : '#991b1b',
});

function PartnerDashboard() {
  const [stats, setStats]       = useState(null);
  const [sales, setSales]       = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [dashRes, salesRes, prodRes] = await Promise.all([
        partnerService.getDashboard(),
        partnerService.getSales(),
        partnerService.getProducts(),
      ]);
      setStats(dashRes.data);
      setSales(salesRes.data.slice(0, 5));
      setProducts(prodRes.data);
      setError('');
    } catch {
      setError('Failed to load dashboard');
      setStats({ totalSales: 0, totalRevenue: 0, totalCommission: 0, paidCommission: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#64748b' }}>
      Loading dashboard...
    </div>
  );

  const cards = [
    { label: 'Total Sales',      value: stats?.totalSales ?? 0,     icon: ShoppingCart, bg: '#dbeafe', color: '#2563eb', num: true },
    { label: 'Total Revenue',    value: fmt(stats?.totalRevenue),    icon: TrendingUp,   bg: '#dcfce7', color: '#16a34a' },
    { label: 'Total Commission', value: fmt(stats?.totalCommission), icon: DollarSign,   bg: '#fef3c7', color: '#d97706' },
    { label: 'Paid Commission',  value: fmt(stats?.paidCommission),  icon: Award,        bg: '#ede9fe', color: '#7c3aed' },
  ];

  // Group products by admin
  const groupedProducts = products.reduce((acc, p) => {
    const key = p.adminId;
    if (!acc[key]) {
      acc[key] = {
        adminId: p.adminId,
        adminName: p.adminName || 'Unknown Admin',
        products: []
      };
    }
    acc[key].products.push(p);
    return acc;
  }, {});
  const adminGroups = Object.values(groupedProducts);

  return (
    <div style={{ padding: '2rem', background: '#f1f5f9', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>
        Partner Dashboard
      </h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Overview of your sales performance</p>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.875rem 1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', maxWidth: '1100px', marginBottom: '2rem' }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <c.icon size={22} color={c.color} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 0.3rem', fontWeight: '500', whiteSpace: 'nowrap' }}>{c.label}</p>
              <p style={{ fontSize: c.num ? '1.875rem' : '1.2rem', fontWeight: '700', color: '#1e293b', margin: 0, lineHeight: 1 }}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Sales */}
      {sales.length > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>Recent Sales</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {['Date', 'Product', 'Buyer', 'Amount', 'Commission', 'Commission Status'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.saleId} style={{ borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '0.875rem 1rem', color: '#64748b', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {new Date(s.saleDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: '600', color: '#1e293b' }}>{s.productName}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '0.9rem' }}>{s.buyerName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{s.buyerEmail}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#16a34a', fontWeight: '600', whiteSpace: 'nowrap' }}>{fmt(s.saleAmount)}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#d97706', fontWeight: '600', whiteSpace: 'nowrap' }}>{fmt(s.commissionAmount)}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: s.paymentStatus === 'Completed' ? '#d1fae5' : '#fee2e2',
                        color: s.paymentStatus === 'Completed' ? '#065f46' : '#991b1b'
                      }}>
                        {s.paymentStatus === 'Completed' ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Available Products - Grouped by Admin */}
      {adminGroups.map(group => (
        <div key={group.adminId} style={{ marginBottom: '1.5rem' }}>
          <div style={{ background: 'white', borderRadius: '10px 10px 0 0', padding: '0.875rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🏢</span> Available Products by {group.adminName}
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', marginLeft: '0.5rem' }}>
                ({group.products.length})
              </span>
            </h2>
          </div>

          <div style={{ background: 'white', borderRadius: '0 0 10px 10px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {group.products.map(p => (
                <div key={p.productId} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Package size={20} color="white" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.productName}</h3>
                      <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>{fmt(p.price)}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description || 'No description'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', background: '#dcfce7', color: '#16a34a', padding: '0.25rem 0.6rem', borderRadius: '20px' }}>
                      {p.commissionPercentage}% Commission
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: '600', background: p.isActive ? '#dcfce7' : '#f1f5f9', color: p.isActive ? '#16a34a' : '#94a3b8', padding: '0.25rem 0.6rem', borderRadius: '20px' }}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PartnerDashboard;