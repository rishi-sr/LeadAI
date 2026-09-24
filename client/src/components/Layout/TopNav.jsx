import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiGlobe, FiDatabase, FiExternalLink } from 'react-icons/fi';

export const TopNav = ({ title, subtitle }) => {
  const navigate = useNavigate();

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'rgba(9, 9, 12, 0.75)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1C1C24',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Title & Subtitle */}
      <div>
        <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '-0.01em', margin: 0 }}>
          {title || 'PDC Lead Intelligence'}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Action Center */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* System Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 12px',
          backgroundColor: '#121217',
          border: '1px solid #23232F',
          borderRadius: '9999px',
          fontSize: '11px',
          color: '#D1D5DB'
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            boxShadow: '0 0 8px #10B981'
          }} />
          <span style={{ fontWeight: '600' }}>Engine: Active</span>
          <span style={{ color: '#4B5563' }}>|</span>
          <span style={{ color: '#9CA3AF' }}>Places & AI Ready</span>
        </div>

        {/* Quick Launch Button */}
        <button
          onClick={() => navigate('/generate')}
          className="btn btn-primary btn-sm"
          style={{ padding: '7px 14px', fontSize: '12px' }}
        >
          <FiPlus /> New Campaign
        </button>
      </div>
    </header>
  );
};
