import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Filter } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n || 0);

const statusColor = (s) => ({
  background: s === 'Completed' ? '#d1fae5' : s === 'Pending' ? '#fef3c7' : '#fee2e2',
  color:      s === 'Completed' ? '#065f46' : s === 'Pending' ? '#92400e' : '#991b1b',
  padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
});

// Direct API calls
const updateStatusDirect = async (saleId, newStatus) => {
  const tabId = sessionStorage.getItem('tabId');
  const token = sessionStorage.getItem(`token_${tabId}`);
  const res = await fetch(`http://localhost:5261/api/admin/sales/${saleId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ paymentStatus: newStatus }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`);
  return res.json();
};

const updateBuyerPaymentDirect = async (saleId, newStatus) => {
  const tabId = sessionStorage.getItem('tabId');
  const token = sessionStorage.getItem(`token_${tabId}`);
  const res = await fetch(`http://localhost:5261/api/admin/sales/${saleId}/buyer-payment-status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ buyerPaymentStatus: newStatus }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`);
  return res.json();
};

function Sales() {
  const [sales, setSales]         = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setFilter] = useState('All');
  const [updating, setUpdating]   = useState(null);

  useEffect(() => { load(); }, []);
  useEffect(() => {
    setFiltered(statusFilter === 'All' ? sales : sales.filter(s => s.paymentStatus === statusFilter));
  }, [sales, statusFilter]);

  const load = async () => {
    try {
      setLoading(true);
      const r = await adminService.getSales();
      setSales(r.data);
    } catch { alert('Failed to load sales'); }
    finally { setLoading(false); }
  };

  const handleStatus = async (saleId, newStatus) => {
    try {
      setUpdating(`status-${saleId}`);
      await updateStatusDirect(saleId, newStatus);
      setSales(prev => prev.map(s => s.saleId === saleId ? { ...s, paymentStatus: newStatus } : s));
    } catch (err) {
      console.error('Update status error:', err);
      alert(err.message || 'Failed to update status');
    } finally { setUpdating(null); }
  };

  const handleBuyerPayment = async (saleId, newStatus) => {
    try {
      setUpdating(`buyer-${saleId}`);
      await updateBuyerPaymentDirect(saleId, newStatus);
      setSales(prev => prev.map(s => s.saleId === saleId ? { ...s, buyerPaymentStatus: newStatus } : s));
    } catch (err) {
      console.error('Update buyer payment error:', err);
      alert(err.message || 'Failed to update buyer payment');
    } finally { setUpdating(null); }
  };

  const total = filtered.reduce((a, s) => a + s.saleAmount, 0);
  const comm  = filtered.reduce((a, s) => a + s.commissionAmount, 0);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', color:'#64748b' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', background: '#f1f5f9', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>Sales</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Track and manage all sales transactions</p>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'TOTAL SALES',      value: filtered.length,  big: true },
          { label: 'TOTAL REVENUE',    value: fmt(total),       color: '#16a34a' },
          { label: 'TOTAL COMMISSION', value: fmt(comm),        color: '#d97706' },
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
        <label style={{ fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Status:</label>
        <select value={statusFilter} onChange={e => setFilter(e.target.value)} style={{ padding: '0.5rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', color: '#1e293b', background: 'white', cursor: 'pointer', outline: 'none' }}>
          {['All','Pending','Completed','Cancelled'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['DATE','PRODUCT','PARTNER','BUYER','AMOUNT','COMMISSION','LICENSE KEY','BUYER PAYMENT','COMMISSION STATUS','UPDATE'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="10" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No sales found</td></tr>
              ) : filtered.map(s => (
                <tr key={s.saleId} style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background='white'}>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {new Date(s.saleDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#1e293b' }}>{s.productName}</td>
                  <td style={{ padding: '1rem', color: '#475569' }}>{s.partnerName}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '500', color: '#1e293b' }}>{s.buyerName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{s.buyerEmail}</div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#16a34a', whiteSpace: 'nowrap' }}>{fmt(s.saleAmount)}</td>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#d97706', whiteSpace: 'nowrap' }}>{fmt(s.commissionAmount)}</td>
                  <td style={{ padding: '1rem' }}>
                    <code style={{ padding: '0.25rem 0.5rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.78rem', color: '#475569', fontFamily: 'monospace' }}>{s.licenseKey}</code>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <select
                      value={s.buyerPaymentStatus || 'Pending'}
                      onChange={e => handleBuyerPayment(s.saleId, e.target.value)}
                      disabled={updating === `buyer-${s.saleId}`}
                      style={{
                        padding: '0.4rem 0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: '#1e293b',
                        background: updating === `buyer-${s.saleId}` ? '#f1f5f9' : 'white',
                        cursor: updating === `buyer-${s.saleId}` ? 'not-allowed' : 'pointer',
                        outline: 'none'
                      }}>
                      {['Pending','Paid','Failed'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}><span style={statusColor(s.paymentStatus)}>{s.paymentStatus}</span></td>
                  <td style={{ padding: '1rem' }}>
                    <select
                      value={s.paymentStatus}
                      onChange={e => handleStatus(s.saleId, e.target.value)}
                      disabled={updating === `status-${s.saleId}`}
                      style={{ padding: '0.4rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', color: '#1e293b', background: updating === `status-${s.saleId}` ? '#f1f5f9' : 'white', cursor: updating === `status-${s.saleId}` ? 'not-allowed' : 'pointer', outline: 'none' }}>
                      {['Pending','Completed','Cancelled'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div style={{ padding: '0.875rem 1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
            Showing {filtered.length} of {sales.length} sales
          </div>
        )}
      </div>
    </div>
  );
}

export default Sales;