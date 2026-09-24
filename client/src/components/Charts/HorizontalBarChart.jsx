import React from 'react';

export const HorizontalBarChart = ({ data = [], color = '#3B82F6', maxLimit = 6 }) => {
  const items = data.slice(0, maxLimit);
  const maxCount = Math.max(...items.map(d => d.count), 1);

  if (items.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280', fontSize: '12px' }}>
        No distribution metrics yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map((item) => {
        const pct = Math.round((item.count / maxCount) * 100);
        return (
          <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#D1D5DB', fontWeight: '500', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {item.name}
              </span>
              <span style={{ color: '#FFFFFF', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace' }}>
                {item.count}
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#1A1A24', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                backgroundColor: color,
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
