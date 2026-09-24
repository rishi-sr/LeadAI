import React, { useState } from 'react';
import { KanbanCard } from './KanbanCard';

export const KanbanColumn = ({ stage, leads = [], onDropLead, onSelectLead }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId) {
      onDropLead(leadId, stage);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        flex: '0 0 280px',
        backgroundColor: isDragOver ? '#15151F' : '#0D0D11',
        border: isDragOver ? '1px dashed #3B82F6' : '1px solid #1C1C24',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 200px)',
        transition: 'all 0.15s ease'
      }}
    >
      {/* Column Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid #171720',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0A0A0E',
        borderTopLeftRadius: '9px',
        borderTopRightRadius: '9px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '0.02em' }}>
            {stage}
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#9CA3AF',
            backgroundColor: '#161620',
            padding: '1px 6px',
            borderRadius: '4px',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            {leads.length}
          </span>
        </div>
      </div>

      {/* Cards List */}
      <div style={{
        flex: 1,
        padding: '10px',
        overflowY: 'auto',
        minHeight: '160px'
      }}>
        {leads.length === 0 ? (
          <div style={{
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            color: '#4B5563',
            border: '1px dashed #1A1A22',
            borderRadius: '6px'
          }}>
            Drop leads here
          </div>
        ) : (
          leads.map(lead => (
            <KanbanCard key={lead._id} lead={lead} onSelect={onSelectLead} />
          ))
        )}
      </div>
    </div>
  );
};
