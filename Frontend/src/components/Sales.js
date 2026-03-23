import { useState, useEffect } from 'react';


const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const tabId = sessionStorage.getItem('tabId');
  const storedUser = sessionStorage.getItem(`user_${tabId}`);
  const userRole = storedUser ? JSON.parse(storedUser).userRole : null;

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const fetchSales = async () => {
    try {
      const token = sessionStorage.getItem(`token_${sessionStorage.getItem('tabId')}`);
      const endpoint = userRole === 'Admin'
        ? 'http://localhost:5261/api/admin/sales'
        : 'http://localhost:5261/api/partner/sales';
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const mappedData = data.map(sale => ({
        ...sale,
        salePaymentStatus: sale.salePaymentStatus || sale.buyerPaymentStatus || 'Pending',
        commissionPaymentStatus: sale.commissionPaymentStatus || sale.paymentStatus || 'Pending'
      }));
      setSales(mappedData);
      setLoading(false);
    } catch (error) {
      setError(`Failed to load sales: ${error.message}`);
      setLoading(false);
    }
  };

  const updateCommissionPaymentStatus = async (saleId, newStatus) => {
    try {
      const token = sessionStorage.getItem(`token_${sessionStorage.getItem('tabId')}`);
      const response = await fetch(`http://localhost:5261/api/admin/sales/${saleId}/commission-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ commissionPaymentStatus: newStatus })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchSales();
    } catch (error) {
      alert(`Failed to update: ${error.message}`);
    }
  };

  const updateSalePaymentStatus = async (saleId, newStatus) => {
    try {
      const token = sessionStorage.getItem(`token_${sessionStorage.getItem('tabId')}`);
      const endpoint = userRole === 'Admin'
        ? `http://localhost:5261/api/admin/sales/${saleId}/sale-payment-status`
        : `http://localhost:5261/api/partner/sales/${saleId}/sale-payment-status`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ salePaymentStatus: newStatus })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchSales();
    } catch (error) {
      alert(`Failed to update: ${error.message}`);
    }
  };

  const statusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': case 'paid':
        return { background: '#d1fae5', color: '#065f46' };
      case 'pending':
        return { background: '#fef3c7', color: '#92400e' };
      case 'cancelled': case 'failed':
        return { background: '#fee2e2', color: '#991b1b' };
      default:
        return { background: '#f1f5f9', color: '#475569' };
    }
  };

  const totalRevenue = sales.reduce((s, x) => s + (x.saleAmount || 0), 0);
  const totalCommission = sales.reduce((s, x) => s + (x.commissionAmount || 0), 0);
  const paidCommission = sales.filter(x => x.commissionPaymentStatus === 'Completed').reduce((s, x) => s + (x.commissionAmount || 0), 0);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#64748b', fontSize: '1.1rem' }}>
      Loading sales...
    </div>
  );

  return (
    <div style={{ padding: '2rem', background: '#f1f5f9', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>Sales Management</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Track and manage all sales transactions</p>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'TOTAL SALES', value: sales.length, big: true },
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

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        {sales.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>No Sales Yet</p>
            <p style={{ fontSize: '0.9rem' }}>Sales records will appear here.</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    {['SALE ID', 'PRODUCT', 'PARTNER', 'BUYER', 'BUYER EMAIL', 'AMOUNT', 'COMMISSION', 'SALE DATE', 'SALE PAYMENT', 'COMMISSION PAYMENT', 'LICENSE KEY'].map(h => (
                      <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sales.map(sale => (
                    <tr key={sale.saleId} style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#1e293b' }}>#{sale.saleId}</td>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#1e293b' }}>{sale.productName}</td>
                      <td style={{ padding: '1rem', color: '#475569' }}>{sale.partnerName}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500', color: '#1e293b' }}>{sale.buyerName}</div>
                        {sale.buyerCompany && <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{sale.buyerCompany}</div>}
                      </td>
                      <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>{sale.buyerEmail}</td>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#2563eb', whiteSpace: 'nowrap' }}>{fmt(sale.saleAmount || 0)}</td>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#d97706', whiteSpace: 'nowrap' }}>{fmt(sale.commissionAmount || 0)}</td>
                      <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{fmtDate(sale.saleDate)}</td>
                      <td style={{ padding: '1rem' }}>
                        {userRole === 'Admin' ? (
                          <select
                            value={sale.salePaymentStatus}
                            onChange={(e) => updateSalePaymentStatus(sale.saleId, e.target.value)}
                            style={{
                              padding: '0.35rem 0.6rem',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              fontSize: '0.82rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              outline: 'none',
                              ...statusStyle(sale.salePaymentStatus)
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Failed">Failed</option>
                          </select>
                        ) : (
                          <span style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', ...statusStyle(sale.salePaymentStatus) }}>
                            {sale.salePaymentStatus}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {userRole === 'Admin' ? (
                          <select
                            value={sale.commissionPaymentStatus}
                            onChange={(e) => updateCommissionPaymentStatus(sale.saleId, e.target.value)}
                            style={{
                              padding: '0.35rem 0.6rem',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              fontSize: '0.82rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              outline: 'none',
                              ...statusStyle(sale.commissionPaymentStatus)
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <span style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', ...statusStyle(sale.commissionPaymentStatus) }}>
                            {sale.commissionPaymentStatus}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <code style={{ padding: '0.25rem 0.5rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.78rem', color: '#475569', fontFamily: 'monospace' }}>
                          {sale.licenseKey || '-'}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '0.875rem 1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
              Showing {sales.length} sales
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Sales;
