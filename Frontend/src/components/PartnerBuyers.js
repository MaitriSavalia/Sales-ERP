import React, { useState, useEffect } from 'react';
import { partnerService } from '../services/api';
import { Users } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n || 0);

function PartnerBuyers() {
  const [buyers, setBuyers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      // Get all sales to compute per-buyer stats for this partner
      const salesRes = await partnerService.getSales();
      const sales = salesRes.data;

      // Aggregate buyers from sales
      const buyerMap = {};
      sales.forEach(s => {
        if (!buyerMap[s.buyerId]) {
          buyerMap[s.buyerId] = {
            userId: s.buyerId,
            fullName: s.buyerName,
            email: s.buyerEmail,
            companyName: s.buyerCompany || '-',
            phoneNumber: '-',
            totalPurchases: 0,
            totalSpent: 0,
            lastPurchase: s.saleDate,
          };
        }
        buyerMap[s.buyerId].totalPurchases++;
        buyerMap[s.buyerId].totalSpent += s.saleAmount;
        if (new Date(s.saleDate) > new Date(buyerMap[s.buyerId].lastPurchase)) {
          buyerMap[s.buyerId].lastPurchase = s.saleDate;
        }
      });

      setBuyers(Object.values(buyerMap).sort((a, b) => b.totalSpent - a.totalSpent));
      setError('');
    } catch {
      setError('Failed to load buyers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', color:'#64748b' }}>Loading buyers...</div>;

  return (
    <div style={{ padding: '2rem', background: '#f1f5f9', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>My Buyers</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Customers who have purchased through you</p>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.875rem 1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>
      )}

      {buyers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', color: '#94a3b8', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#64748b' }}>No Buyers Yet</p>
          <p style={{ fontSize: '0.9rem' }}>Buyers will appear here after your first sale.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Buyer Name', 'Email', 'Company', 'Phone', 'Total Purchases', 'Total Spent', 'Last Purchase'].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buyers.map(b => (
                  <tr key={b.userId} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background='white'}>
                    <td style={{ padding: '1rem', fontWeight: '700', color: '#1e293b' }}>{b.fullName}</td>
                    <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>{b.email}</td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>{b.companyName}</td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>{b.phoneNumber}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#1e293b' }}>{b.totalPurchases}</td>
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#2563eb', whiteSpace: 'nowrap' }}>{fmt(b.totalSpent)}</td>
                    <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                      {new Date(b.lastPurchase).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default PartnerBuyers;