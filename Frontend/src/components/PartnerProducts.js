import React, { useState, useEffect } from 'react';
import { partnerService } from '../services/api';
import { Package, Plus, X, Search } from 'lucide-react';
import useIsMobile from '../hooks/useIsMobile';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n || 0);

function PartnerProducts() {
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [selected, setSelected]       = useState(null);
  const [buyerEmail, setBuyerEmail]   = useState('');
  const [notes, setNotes]             = useState('');
  const [creating, setCreating]       = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const r = await partnerService.getProducts();
      setProducts(r.data);
    } catch { console.error('Error loading products'); }
    finally { setLoading(false); }
  };

  const openModal = (product) => {
    setSelected(product);
    setBuyerEmail('');
    setNotes('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
    setBuyerEmail('');
    setNotes('');
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();
    if (!buyerEmail || !buyerEmail.includes('@')) {
      alert('Please enter a valid buyer email');
      return;
    }
    try {
      setCreating(true);
      await partnerService.createSale({
        productID: selected.productID,
        buyerEmail: buyerEmail.trim(),
        notes: notes
      });
      alert('Sale created successfully!');
      closeModal();
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create sale');
    } finally {
      setCreating(false);
    }
  };

  const groupedProducts = products.reduce((acc, p) => {
    const adminKey = p.adminID;
    if (!acc[adminKey]) {
      acc[adminKey] = {
        adminID: p.adminID,
        adminName: p.adminName || 'Unknown Admin',
        products: []
      };
    }
    acc[adminKey].products.push(p);
    return acc;
  }, {});

  const adminGroups = Object.values(groupedProducts);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#64748b' }}>
      Loading products...
    </div>
  );

  return (
    <div style={{ padding: isMobile ? '1rem' : '2rem', background: '#f1f5f9', minHeight: '100vh' }}>
      <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>Available Products</h1>
      <p style={{ color: '#64748b', marginBottom: isMobile ? '1rem' : '2rem' }}>Browse and sell products to earn commission</p>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: isMobile ? '2rem 1rem' : '4rem 2rem', background: 'white', borderRadius: '12px', color: '#94a3b8' }}>
          <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#64748b' }}>No Products Available</p>
          <p style={{ fontSize: '0.9rem' }}>Ask your admin to add you as a partner to see their products.</p>
        </div>
      ) : (
        adminGroups.map(group => (
          <div key={group.adminID} style={{ marginBottom: '2rem' }}>
            <div style={{ background: 'white', borderRadius: '10px 10px 0 0', padding: '0.875rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.25rem' }}>🏢</span> Products by {group.adminName}
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', marginLeft: '0.5rem' }}>
                  ({group.products.length})
                </span>
              </h2>
            </div>

            <div style={{ background: 'white', borderRadius: '0 0 10px 10px', padding: isMobile ? '0.75rem' : '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                {group.products.map(p => (
                  <div key={p.productID} style={{
                    border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                      <div style={{
                        width: '40px', height: '40px', flexShrink: 0,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
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

                    <p style={{
                      color: '#64748b', fontSize: '0.8rem', lineHeight: '1.4', margin: 0,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {p.description || 'No description provided.'}
                    </p>

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
                    </div>

                    <button
                      onClick={() => openModal(p)}
                      style={{
                        width: '100%', padding: '0.6rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white', border: 'none', borderRadius: '8px',
                        fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        marginTop: '0.25rem', minHeight: '44px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <Plus size={16} /> Create Sale
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}

      {showModal && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={closeModal}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: isMobile ? '100%' : '450px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '1rem' : '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Create Sale — {selected.productName}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: '0.5rem' }}><X size={20} /></button>
            </div>

            <div style={{ padding: isMobile ? '1rem' : '1.25rem' }}>
              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.875rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Price:</span>
                  <span style={{ fontWeight: '700', color: '#16a34a', fontSize: '1rem' }}>{fmt(selected.price)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Your Commission ({selected.commissionPercentage}%):</span>
                  <span style={{ fontWeight: '700', color: '#16a34a', fontSize: '1rem' }}>{fmt(selected.price * (selected.commissionPercentage / 100))}</span>
                </div>
              </div>

              <form onSubmit={handleCreateSale}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', color: '#374151', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Buyer Email *</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="email"
                      value={buyerEmail}
                      onChange={e => setBuyerEmail(e.target.value)}
                      placeholder="Enter buyer email..."
                      required
                      style={{
                        width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.5rem',
                        border: '1px solid #e2e8f0', borderRadius: '8px',
                        fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', minHeight: '44px'
                      }}
                      onFocus={e => e.target.style.borderColor = '#667eea'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.3rem' }}>New buyers will be created automatically.</p>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', color: '#374151', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add notes..."
                    rows={3}
                    style={{ width: '100%', padding: '0.7rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#667eea'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
                  <button type="button" onClick={closeModal}
                    style={{ flex: 1, padding: '0.7rem', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', minHeight: '44px' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={creating}
                    style={{ flex: 1, padding: '0.7rem', background: creating ? '#e2e8f0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: creating ? '#94a3b8' : 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: creating ? 'not-allowed' : 'pointer', minHeight: '44px' }}>
                    {creating ? 'Creating...' : 'Create Sale'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PartnerProducts;