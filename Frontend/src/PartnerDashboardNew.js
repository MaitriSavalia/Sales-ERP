import React, { useState, useEffect } from 'react';
import { partnerService } from '../services/api';

function PartnerDashboardNew() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalCommission: 0,
    paidCommission: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await partnerService.getDashboard();
      if (response.data && response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Partner Dashboard</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '1rem',
        marginTop: '2rem'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total Sales</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{stats.totalSales}</p>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total Revenue</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#2196f3' }}>
            ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}
          </p>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total Commission</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#4caf50' }}>
            ₹{(stats.totalCommission || 0).toLocaleString('en-IN')}
          </p>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Paid Commission</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#e91e63' }}>
            ₹{(stats.paidCommission || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div style={{ 
        marginTop: '3rem', 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        textAlign: 'center',
        color: '#999'
      }}>
        <h3>No Sales Yet</h3>
        <p>Start selling products to see your performance!</p>
      </div>
    </div>
  );
}

export default PartnerDashboardNew;