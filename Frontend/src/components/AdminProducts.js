import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Package, Plus, Edit2, Trash2, X } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n || 0);

function AdminProducts() {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [error, setError]           = useState('');
  const [form, setForm]             = useState({ productName: '', description: '', price: '', commissionPercentage: 10 });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const r = await adminService.getProducts();
      setProducts(r.data);
      setError('');
    } catch { setError('Failed to load products'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ productName: '', description: '', price: '', commissionPercentage: 10 });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ productName: p.productName, description: p.description || '', price: p.price, commissionPercentage: p.commissionPercentage });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, price: parseFloat(form.price), commissionPercentage: parseFloat(form.commissionPercentage) };
      if (editing) await adminService.updateProduct(editing.productId, { ...data, isActive: editing.isActive });
      else await adminService.createProduct(data);
      setShowModal(false);
      load();
    } catch { setError('Failed to save product'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await adminService.deleteProduct(id); load(); }
    catch { setError('Failed to delete product'); }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', color:'#64748b' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', background: '#f1f5f9', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>Products</h1>
          <p style={{ color: '#64748b' }}>Manage your software products</p>
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
          color: 'white', border: 'none', borderRadius: '10px',
          fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(249,115,22,0.3)'
        }}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.875rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', color: '#94a3b8', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#64748b' }}>No products yet</p>
          <p style={{ fontSize: '0.9rem' }}>Click "Add Product" to create your first product</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {products.map(p => (
            <div key={p.productId} style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.07)'; }}>

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

              {/* Commission / You Earn */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                {[
                  { label: 'Commission:', value: `${p.commissionPercentage}%`, color: '#16a34a' },
                  
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{row.label}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: row.color }}>{row.value}</span>
                  </div>
                ))}
                
                {/* Status */}
                <div style={{ marginTop: '0.5rem', textAlign: 'center', padding: '0.35rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '600', background: p.isActive ? '#dcfce7' : '#f1f5f9', color: p.isActive ? '#16a34a' : '#94a3b8' }}>
                  {p.isActive ? 'Active' : 'Inactive'}
                </div>

                {/* Edit/Delete Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button onClick={() => openEdit(p)} style={{ flex: 1, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: '600' }}>
                    <Edit2 size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(p.productId)} style={{ flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: '600' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>{editing ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}><X size={22} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              {[
                { label: 'Product Name *', key: 'productName', type: 'text', placeholder: 'Enter product name' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', color: '#374151', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} placeholder={f.placeholder} required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor='#f97316'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
                </div>
              ))}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#374151', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Description *</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Enter product description" rows={4} required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor='#f97316'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#374151', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Price (INR) *</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="Enter price in ₹" required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor='#f97316'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#374151', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Commission % *</label>
                  <input type="number" step="0.01" min="0" max="100" value={form.commissionPercentage} onChange={e => setForm({...form, commissionPercentage: e.target.value})} required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor='#f97316'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  {editing ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;