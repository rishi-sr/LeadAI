import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export const Drawer = ({ isOpen, onClose, title, subtitle, children, width = '720px' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer-content"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #1C1C24',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0E0E12',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px', margin: 0 }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn btn-icon"
            style={{ color: '#9CA3AF' }}
            aria-label="Close drawer"
          >
            <FiX style={{ fontSize: '20px' }} />
          </button>
        </div>

        <div style={{ padding: '24px', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};
