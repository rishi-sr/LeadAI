import React from 'react';

export const MetricCard = ({ title, value, icon: Icon, subtitle, accentColor = '#3B82F6', onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#111115',
        border: '1px solid #1F1F27',
        borderRadius: '12px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = '#2F2F3D';
          e.currentTarget.style.backgroundColor = '#16161D';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = '#1F1F27';
          e.currentTarget.style.backgroundColor = '#111115';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {/* Subtle top indicator bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        backgroundColor: accentColor,
        opacity: 0.8
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
            fontSize: '16px'
          }}>
            <Icon />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '26px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {typeof value === 'number' ? value.toLocaleString() : (value ?? 0)}
        </span>
      </div>

      {subtitle && (
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};
