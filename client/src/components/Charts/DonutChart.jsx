import React from 'react';

const PALETTE = [
  '#3B82F6', // Electric blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F87171'  // Coral
];

export const DonutChart = ({ data = [], size = 160 }) => {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div style={{ height: `${size}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontSize: '12px' }}>
        No breakdown data available.
      </div>
    );
  }

  let accumulated = 0;
  const radius = size / 2 - 14;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'center' }}>
      <div style={{ width: size, height: size, position: 'relative' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {data.map((item, idx) => {
            const ratio = item.count / total;
            const strokeDasharray = `${ratio * circumference} ${circumference}`;
            const strokeDashoffset = -accumulated * circumference;
            accumulated += ratio;
            const color = PALETTE[idx % PALETTE.length];

            return (
              <circle
                key={item.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'all 0.3s ease' }}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1 }}>
            {total}
          </span>
          <span style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', marginTop: '2px' }}>
            Total
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {data.slice(0, 5).map((item, idx) => {
          const color = PALETTE[idx % PALETTE.length];
          const pct = Math.round((item.count / total) * 100);
          return (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
              <span style={{ color: '#D1D5DB', minWidth: '85px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {item.name}
              </span>
              <span style={{ color: '#9CA3AF', fontFamily: 'JetBrains Mono, monospace', fontWeight: '600' }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
