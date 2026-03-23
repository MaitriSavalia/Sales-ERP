import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Package, DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n || 0);


function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [dashRes, salesRes, prodRes, partRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getSales(),
        adminService.getProducts(),
        adminService.getMyPartners(),
      ]);
      setStats(dashRes.data);
      setSales(salesRes.data.slice(0, 5));
      setProducts(prodRes.data);

      // Build partner performance from sales
      const salesData = salesRes.data;
      const partnerMap = {};
      salesData.forEach(s => {
        if (!partnerMap[s.partnerId]) {
          partnerMap[s.partnerId] = {
            partnerId: s.partnerId,
            partnerName: s.partnerName,
            partnerEmail: '',
            totalSales: 0,
            totalRevenue: 0,
            totalCommission: 0,
          };
        }
        partnerMap[s.partnerId].totalSales++;
        partnerMap[s.partnerId].totalRevenue += s.saleAmount;
        partnerMap[s.partnerId].totalCommission += s.commissionAmount;
      });

      // Merge email from partner list
      const partnerList = partRes.data;
      Object.values(partnerMap).forEach(p => {
        const found = partnerList.find(pl => pl.partnerId === p.partnerId);
        p.partnerEmail = found?.partnerEmail || '';
        p.partnerCompany = found?.partnerCompany || 'N/A';
      });

      setPartners(Object.values(partnerMap).sort((a, b) => b.totalRevenue - a.totalRevenue));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (saleId, newStatus) => {
    try {
      setUpdating(saleId);
      const tabId = sessionStorage.getItem('tabId');
      const token = sessionStorage.getItem(`token_${tabId}`);
      const res = await fetch(`http://localhost:5261/api/admin/sales/${saleId}/commission-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ commissionPaymentStatus: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update');

      setSales(prev => prev.map(s => s.saleId === saleId ? { ...s, commissionPaymentStatus: newStatus } : s));
    } catch (err) {
      console.error('Update status error:', err);
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#64748b' }}>Loading...</div>;

  const statCards = [
    { label: 'Total Products', value: stats?.totalProducts ?? 0, icon: Package, bg: '#dcfce7', color: '#16a34a', num: true },
    { label: 'Total Revenue', value: fmt(stats?.totalRevenue), icon: DollarSign, bg: '#dbeafe', color: '#2563eb' },
    { label: 'Total Sales', value: stats?.totalSales ?? 0, icon: ShoppingCart, bg: '#fef3c7', color: '#d97706', num: true },
    { label: 'Commission Paid', value: fmt(stats?.totalCommissionPaid), icon: TrendingUp, bg: '#fce7f3', color: '#db2777' },
    { label: 'Active Partners', value: stats?.activePartners ?? 0, icon: Users, bg: '#ede9fe', color: '#7c3aed', num: true },
  ];

  return (
    <div style={{ padding: '2rem', background: '#f1f5f9', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>Admin Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Overview of your business performance</p>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {statCards.map(c => (
          <div key={c.label} style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <c.icon size={22} color={c.color} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.25rem', fontWeight: '500' }}>{c.label}</p>
              <p style={{ fontSize: c.num ? '1.75rem' : '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Partners */}
      {partners.length > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>Top Partners</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {['Partner Name', 'Company', 'Total Sales', 'Revenue', 'Commission'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partners.map(p => (
                  <tr key={p.partnerId} style={{ borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{p.partnerName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{p.partnerEmail}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#64748b', fontSize: '0.9rem' }}>{p.partnerCompany}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#1e293b', fontWeight: '600', fontSize: '0.9rem' }}>{p.totalSales}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#2563eb', fontWeight: '600', fontSize: '0.9rem' }}>{fmt(p.totalRevenue)}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#2563eb', fontWeight: '600', fontSize: '0.9rem' }}>{fmt(p.totalCommission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Sales */}
      {sales.length > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>Recent Sales</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {['Date', 'Product', 'Partner', 'Buyer', 'Amount', 'Commission', 'Commission Status', 'Actions'].map(h => (
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
                    <td style={{ padding: '0.875rem 1rem', fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{s.productName}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#64748b', fontSize: '0.9rem' }}>{s.partnerName}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '0.9rem' }}>{s.buyerName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{s.buyerEmail}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#2563eb', fontWeight: '600', fontSize: '0.9rem' }}>{fmt(s.saleAmount)}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#2563eb', fontWeight: '600', fontSize: '0.9rem' }}>{fmt(s.commissionAmount)}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: s.commissionPaymentStatus === 'Completed' ? '#d1fae5' : '#fee2e2',
                        color: s.commissionPaymentStatus === 'Completed' ? '#065f46' : '#991b1b'
                      }}>
                        {s.commissionPaymentStatus === 'Completed' ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <select
                        value={s.commissionPaymentStatus}
                        onChange={e => handleStatusUpdate(s.saleId, e.target.value)}
                        disabled={updating === s.saleId}
                        style={{
                          padding: '0.4rem 0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: '#1e293b',
                          background: updating === s.saleId ? '#f1f5f9' : 'white',
                          cursor: updating === s.saleId ? 'not-allowed' : 'pointer',
                          outline: 'none'
                        }}>
                        {['Pending', 'Completed', 'Cancelled'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Your Products */}
      {products.length > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>Your Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {products.map(p => (
              <div key={p.productId} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>

                {/* Icon + Name + Price */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                  <div style={{
                    width: '40px', height: '40px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Package size={20} color="white" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem', margin: '0 0 0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.productName}
                    </h3>
                    <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
                      {fmt(p.price)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  color: '#64748b', fontSize: '0.8rem', lineHeight: '1.4',
                  margin: 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {p.description || 'No description provided.'}
                </p>

                {/* Commission / You Earn / Status */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                  {[
                    { label: 'Commission:', value: `${p.commissionPercentage}%`, color: '#16a34a' },
                    { label: 'You Earn:', value: fmt(p.price * (p.commissionPercentage / 100)), color: '#16a34a' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{row.label}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: '0.5rem', textAlign: 'center', padding: '0.35rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '600', background: p.isActive ? '#dcfce7' : '#f1f5f9', color: p.isActive ? '#16a34a' : '#94a3b8' }}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;