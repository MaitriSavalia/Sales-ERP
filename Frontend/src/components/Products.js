import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Package, Plus, Edit2, Trash2, X } from 'lucide-react';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    price: '',
    commissionPercentage: 10
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getProducts();
      setProducts(response.data);
      setError('');
    } catch (err) {
      console.error('Load products error:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        commissionPercentage: parseFloat(formData.commissionPercentage)
      };

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.productId, productData);
      } else {
        await adminService.createProduct(productData);
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        productName: '',
        description: '',
        price: '',
        commissionPercentage: 10
      });
      loadProducts();
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      description: product.description,
      price: product.price,
      commissionPercentage: product.commissionPercentage
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await adminService.deleteProduct(productId);
      loadProducts();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete product');
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your software products</p>
        </div>
        <button className="btn-primary" onClick={() => {
          setEditingProduct(null);
          setFormData({
            productName: '',
            description: '',
            price: '',
            commissionPercentage: 10
          });
          setShowModal(true);
        }}>
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {products.length === 0 ? (
        <div className="empty-state">
          <Package size={64} color="#ccc" />
          <h3>No Products Yet</h3>
          <p>Create your first product to get started</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Add Product
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Description</th>
                <th>Price (INR)</th>
                <th>Commission</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.productId}>
                  <td className="product-name">{product.productName}</td>
                  <td className="product-description">{product.description}</td>
                  <td className="amount">{formatCurrency(product.price)}</td>
                  <td>{product.commissionPercentage}%</td>
                  <td>
                    <span className={`status-badge ${product.isActive ? 'status-active' : 'status-inactive'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(product.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(product)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(product.productId)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (INR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Enter price in ₹"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Commission Percentage *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.commissionPercentage}
                    onChange={(e) => setFormData({ ...formData, commissionPercentage: e.target.value })}
                    placeholder="Enter commission %"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;