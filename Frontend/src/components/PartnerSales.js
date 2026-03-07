import React, { useState, useEffect } from 'react';
import { partnerService } from '../services/api';
import { ShoppingCart, Filter, Copy, Check } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

// Map payment status to commission status display
const getCommissionStatus = (paymentStatus) => {
  return paymentStatus === 'Completed' ? 'Paid' : 'Unpaid';
};

const commissionStatusStyle = (paymentStatus) => {
  return paymentStatus === 'Completed' 
    ? { background: '#d1fae5', color: '#065f46' }  // Green for Paid
    : { background: '#fee2e2', color: '#991b1b' }; // Red for Unpaid
};

function PartnerSales() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => { loadSales(); }, []);
  useEffect(() => {
    setFilteredSales(statusFilter === 'All' ? sales : sales.filter(s => getCommissionStatus(s.paymentStatus) === statusFilter));
  }, [sales, statusFilter]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const r = await partnerService.getSales();
      setSales(r.data);
    } catch { setError('Failed to load sales'); }
    finally { setLoading(false); }
  };

  const copyKey = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const totalRevenue = filteredSales.reduce((s, x) => s + x.saleAmount, 0);
  const totalCommission = filteredSales.reduce((s, x) => s + x.commissionAmount, 0);
  const paidCommission = filteredSales.filter(x => x.paymentStatus === 'Completed').reduce((s, x) => s + x.commissionAmount, 0);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#64748b', fontSize: '1.1rem' }}>
      Loading sales...
    </div>
  );

  return (
    <div style={{ padding: '2rem', background: '#f1f5f9', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>Sales</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Track your sales and commissions</p>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'TOTAL SALES', value: filteredSales.length, big: true },
          { label: 'TOTAL REVENUE', value: fmt(totalRevenue), color: '#2563eb' },
          { label: 'TOTAL COMMISSION', value: fmt(totalCommission), color: '#d97706' },
          { label: 'PAID COMMISSION', value: fmt(paidCommission), color: '#16a34a' },
        ].map(c => (
          <div key={c.label} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>{c.label}</p>
            <p style={{ fontSize: c.big ? '2rem' : '1.5rem', fontWeight: '700', color: c.color || '#1e293b', margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ background: 'white', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
        <Filter size={18} color="#94a3b8" />
        <label style={{ fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Commission Status:</label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0.5rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', color: '#1e293b', background: 'white', cursor: 'pointer', outline: 'none' }}>
          {['All', 'Paid', 'Unpaid'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        {filteredSales.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
            <ShoppingCart size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>No Sales Yet</p>
            <p style={{ fontSize: '0.9rem' }}>Your sales will appear here once you create them.</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    {['DATE', 'PRODUCT', 'BUYER', 'AMOUNT', 'COMMISSION', 'COMMISSION STATUS', 'LICENSE KEY'].map(h => (
                      <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map(s => (
                    <tr key={s.saleId} style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{fmtDate(s.saleDate)}</td>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#1e293b' }}>{s.productName}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500', color: '#1e293b' }}>{s.buyerName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{s.buyerEmail}</div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#2563eb', whiteSpace: 'nowrap' }}>{fmt(s.saleAmount)}</td>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#d97706', whiteSpace: 'nowrap' }}>{fmt(s.commissionAmount)}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.3rem 0.75rem', 
                          borderRadius: '20px', 
                          fontSize: '0.8rem', 
                          fontWeight: '600',
                          ...commissionStatusStyle(s.paymentStatus)
                        }}>
                          {getCommissionStatus(s.paymentStatus)}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <code style={{ padding: '0.25rem 0.5rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.78rem', color: '#475569', fontFamily: 'monospace' }}>{s.licenseKey}</code>
                          <button onClick={() => copyKey(s.licenseKey, s.saleId)} style={{ padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: copiedKey === s.saleId ? '#16a34a' : '#94a3b8', display: 'flex', alignItems: 'center' }}>
                            {copiedKey === s.saleId ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '0.875rem 1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
              Showing {filteredSales.length} of {sales.length} sales
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PartnerSales;