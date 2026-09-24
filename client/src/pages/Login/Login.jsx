import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FiLock, FiMail, FiArrowRight, FiShield } from 'react-icons/fi';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      addToast('Successfully authenticated to PDC Lead Intelligence', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#050505',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(0,0,0,0) 70%)',
        top: '15%',
        left: '20%',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '440px',
        maxWidth: '100%',
        backgroundColor: '#0D0D11',
        border: '1px solid #1F1F2A',
        borderRadius: '16px',
        padding: '36px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: '800',
            fontSize: '18px',
            marginBottom: '14px',
            boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)'
          }}>
            PDC
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            PIXIE DIGITAL CREATIVES
          </h1>
          <p style={{ fontSize: '12px', color: '#60A5FA', fontWeight: '700', letterSpacing: '0.08em', marginTop: '3px' }}>
            LEAD INTELLIGENCE PLATFORM
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Corporate Email</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: '12px', top: '13px', color: '#6B7280' }} />
              <input
                type="email"
                className="input-control"
                placeholder="agent@pixiedigitalcreatives.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '22px' }}>
            <label>Security Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: '12px', top: '13px', color: '#6B7280' }} />
              <input
                type="password"
                className="input-control"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '14px' }}
            disabled={submitting}
          >
            {submitting ? 'Verifying Credentials...' : 'Sign In to Workspace'} <FiArrowRight />
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div style={{ marginTop: '28px', borderTop: '1px solid #1A1A24', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF', fontSize: '11px', fontWeight: '600', marginBottom: '10px' }}>
            <FiShield style={{ color: '#3B82F6' }} /> QUICK DEMO ACCESS
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDemoFill('admin@pixiedigitalcreatives.com', 'pdc_admin_secure_2026')}
            >
              Admin Role
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDemoFill('researcher@pixiedigitalcreatives.com', 'pdc_researcher_2026')}
            >
              Researcher Role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
