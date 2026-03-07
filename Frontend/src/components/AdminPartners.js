import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Users, UserPlus, Trash2, Mail, Building2, Phone, Calendar } from 'lucide-react';

function AdminPartners() {
  const [partners, setPartners]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [adding, setAdding]         = useState(false);

  useEffect(() => { loadPartners(); }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      setError('');
      const r = await adminService.getMyPartners();
      setPartners(r.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPartner = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) { alert('Please enter partner email'); return; }
    try {
      setAdding(true);
      setError('');
      const r = await adminService.addPartner({ partnerEmail: searchEmail });
      alert(`✅ ${r.data.message}\nPartner: ${r.data.partnerName}`);
      setSearchEmail('');
      loadPartners();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add partner');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (partnerId, partnerName) => {
    if (!window.confirm(`Remove ${partnerName} from your network?`)) return;
    try {
      await adminService.removePartner(partnerId);
      loadPartners();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove partner');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#64748b' }}>
      Loading partners...
    </div>
  );

  return (
    <div style={{ padding: '2rem', background: '#f1f5f9', minHeight: '100vh' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Users size={28} /> My Partners
        </h1>
        <p style={{ color: '#64748b' }}>Manage partners who can sell your products</p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.875rem 1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Add Partner Card */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '1.75rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={20} /> Add New Partner
        </h2>

        <form onSubmit={handleAddPartner}>
          <label style={{ display: 'block', fontWeight: '600', color: '#374151', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Partner Email Address
          </label>

          {/* Input + Button row */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Enter partner's email address"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 0.875rem 0.75rem 2.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <button
              type="submit"
              disabled={adding}
              style={{
                padding: '0.75rem 1.5rem',
                background: adding ? '#e2e8f0' : 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
                color: adding ? '#94a3b8' : 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: adding ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                boxShadow: adding ? 'none' : '0 4px 12px rgba(249,115,22,0.3)',
                flexShrink: 0
              }}
            >
              <UserPlus size={18} />
              {adding ? 'Adding...' : 'Add Partner'}
            </button>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem' }}>
            Enter the email of a registered partner
          </p>
        </form>
      </div>

      {/* Partner Network */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1.25rem' }}>
          Partner Network ({partners.length})
        </h2>

        {partners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 2rem', color: '#94a3b8' }}>
            <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '1rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>No partners yet</p>
            <p style={{ fontSize: '0.875rem' }}>Add partners using the form above</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {partners.map((p) => (
              <div
                key={p.partnerId}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(249,115,22,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Left: Partner Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                    {p.partnerName}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.875rem' }}>
                      <Mail size={14} /> {p.partnerEmail}
                    </span>
                    {p.partnerCompany && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.875rem' }}>
                        <Building2 size={14} /> {p.partnerCompany}
                      </span>
                    )}
                    {p.partnerPhone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.875rem' }}>
                        <Phone size={14} /> {p.partnerPhone}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                      <Calendar size={13} /> Added {formatDate(p.mappedAt)}
                    </span>
                  </div>
                </div>

                {/* Right: Remove Button */}
                <button
                  onClick={() => handleRemove(p.partnerId, p.partnerName)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    flexShrink: 0,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                >
                  <Trash2 size={15} /> Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPartners;