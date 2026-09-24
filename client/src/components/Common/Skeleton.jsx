import React from 'react';

export const Skeleton = ({ height = '20px', width = '100%', borderRadius = '6px', style = {} }) => {
  return (
    <div
      className="skeleton"
      style={{
        height,
        width,
        borderRadius,
        ...style
      }}
    />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '12px' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} height="36px" width={`${100 / cols}%`} />
          ))}
        </div>
      ))}
    </div>
  );
};
