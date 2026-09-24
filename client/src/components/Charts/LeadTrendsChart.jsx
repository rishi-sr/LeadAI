import React from 'react';

export const LeadTrendsChart = ({ data = [], height = 180 }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontSize: '12px' }}>
        No lead trend data recorded yet.
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.count), 5);
  const width = 500;
  const paddingX = 40;
  const paddingY = 24;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = data.map((d, idx) => {
    const x = paddingX + (data.length > 1 ? (idx / (data.length - 1)) * chartW : chartW / 2);
    const y = height - paddingY - (d.count / maxVal) * chartH;
    return { x, y, ...d };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = height - paddingY - ratio * chartH;
          return (
            <g key={i}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#1C1C26" strokeDasharray="3 3" />
              <text x={paddingX - 8} y={y + 3} fill="#6B7280" fontSize="9" textAnchor="end" fontFamily="JetBrains Mono, monospace">
                {Math.round(ratio * maxVal)}
              </text>
            </g>
          );
        })}

        {/* Filled Area */}
        {areaD && <path d={areaD} fill="url(#trendGradient)" />}

        {/* Line Stroke */}
        {pathD && <path d={pathD} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
            <text x={p.x} y={height - 6} fill="#9CA3AF" fontSize="9" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif">
              {p.date ? p.date.slice(5) : ''}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
