import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Mail, Lock, User, Phone, Building2, MapPin, UserCog, AlertCircle, UserPlus } from 'lucide-react';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userRole: 'Partner',
    phoneNumber: '',
    companyName: '',
    address: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await authService.register(registerData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem 0.875rem 3rem',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#374151',
    fontSize: '0.875rem',
  };

  const iconStyle = {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    pointerEvents: 'none',
  };

  const fields = [
    { label: 'Full Name *',       name: 'fullName',        type: 'text',     placeholder: 'Enter your full name',        icon: User,      required: true },
    { label: 'Email *',           name: 'email',           type: 'email',    placeholder: 'Enter your email',            icon: Mail,      required: true },
    { label: 'Password *',        name: 'password',        type: 'password', placeholder: 'Enter your password (min 6)', icon: Lock,      required: true },
    { label: 'Confirm Password *',name: 'confirmPassword', type: 'password', placeholder: 'Confirm your password',       icon: Lock,      required: true },
    { label: 'Company Name',      name: 'companyName',     type: 'text',     placeholder: 'Enter your company name',     icon: Building2, required: false },
    { label: 'Phone Number',      name: 'phoneNumber',     type: 'tel',      placeholder: 'Enter your phone number',     icon: Phone,     required: false },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '3rem',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2.5rem', color: 'white', fontWeight: '700',
          }}>
            S
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
            Sales ERP
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Create your account</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
            padding: '1rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc2626',
          }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9rem' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Text / email / password fields */}
          {fields.map(f => (
            <div key={f.name} style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>{f.label}</label>
              <div style={{ position: 'relative' }}>
                <f.icon size={20} style={iconStyle} />
                <input
                  type={f.type}
                  name={f.name}
                  value={formData[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  required={f.required}
                  disabled={loading}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
          ))}

          {/* User Role */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>User Role *</label>
            <div style={{ position: 'relative' }}>
              <UserCog size={20} style={iconStyle} />
              <select
                name="userRole"
                value={formData.userRole}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  ...inputStyle,
                  appearance: 'none',
                  cursor: 'pointer',
                  background: 'white',
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="Admin">Admin</option>
                <option value="Partner">Partner</option>
                
              </select>
            </div>
          </div>

          {/* Address */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={labelStyle}>Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={20} style={{ ...iconStyle, top: '1.25rem', transform: 'none' }} />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                rows={3}
                disabled={loading}
                style={{
                  ...inputStyle,
                  padding: '0.875rem 1rem 0.875rem 3rem',
                  resize: 'vertical',
                  minHeight: '90px',
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'transform 0.2s ease',
              boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <UserPlus size={20} />
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#3b82f6', fontWeight: '600', textDecoration: 'none' }}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;