import React from 'react';
import { FiStar, FiPhone, FiGlobe, FiInstagram, FiArrowRight } from 'react-icons/fi';
import { Badge } from '../Common/Badge';

export const KanbanCard = ({ lead, onSelect }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', lead._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect && onSelect(lead)}
      style={{
        backgroundColor: '#111116',
        border: '1px solid #1F1F28',
        borderRadius: '8px',
        padding: '12px 14px',
        marginBottom: '10px',
        cursor: 'grab',
        transition: 'all 0.15s ease',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#2E2E3E';
        e.currentTarget.style.backgroundColor = '#16161E';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1F1F28';
        e.currentTarget.style.backgroundColor = '#111116';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' }}>
          {lead.category}
        </span>
        <Badge value={lead.scoreClassification} size="sm" />
      </div>

      <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px', lineHeight: 1.3 }}>
        {lead.businessName}
      </h4>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#9CA3AF', marginBottom: '10px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#FBBF24', fontWeight: '600' }}>
          <FiStar /> {lead.rating}
        </span>
        <span>({lead.reviewCount})</span>
        <span>•</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {lead.location}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #181822', paddingTop: '8px', fontSize: '11px' }}>
        <div style={{ display: 'flex', gap: '8px', color: '#6B7280' }}>
          {lead.phone && lead.phone !== 'NOT FOUND' && <FiPhone title={lead.phone} />}
          {lead.website && <FiGlobe title={lead.website} />}
          {lead.instagramUsername && lead.instagramUsername !== 'NOT FOUND' && <FiInstagram title={`@${lead.instagramUsername}`} />}
        </div>
        <div style={{ color: '#3B82F6', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace' }}>
          {lead.score}/100
        </div>
      </div>
    </div>
  );
};
