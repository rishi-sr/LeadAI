import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export const Modal = ({ isOpen, onClose, title, children, width = '560px' }) => {
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
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          borderBottom: '1px solid #1E1E28',
          paddingBottom: '14px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-icon"
            style={{ color: '#9CA3AF' }}
            aria-label="Close modal"
          >
            <FiX style={{ fontSize: '18px' }} />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};
