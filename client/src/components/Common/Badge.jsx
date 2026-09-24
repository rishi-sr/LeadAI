import React from 'react';

export const Badge = ({ type, value, label, size = 'md' }) => {
  const text = label || value || '';
  let className = 'badge badge-neutral';

  // Lead Score Classification
  if (value === 'HOT' || type === 'hot') className = 'badge badge-hot';
  else if (value === 'WARM' || type === 'warm') className = 'badge badge-warm';
  else if (value === 'LOW' || type === 'low') className = 'badge badge-low';
  
  // Website Status
  else if (value === 'STRONG' || value === 'GOOD') className = 'badge badge-success';
  else if (value === 'NO WEBSITE' || value === 'BROKEN') className = 'badge badge-broken';
  else if (value === 'BASIC' || value === 'OUTDATED') className = 'badge badge-warm';

  // Active Social
  else if (value === 'ACTIVE') className = 'badge badge-blue';
  else if (value === 'NOT FOUND' || value === 'INACTIVE') className = 'badge badge-low';

  // Pipeline Stages
  else if (value === 'WON') className = 'badge badge-success';
  else if (value === 'LOST' || value === 'NOT INTERESTED') className = 'badge badge-broken';
  else if (value === 'CONTACTED' || value === 'REPLIED' || value === 'CALL SCHEDULED' || value === 'PROPOSAL SENT') {
    className = 'badge badge-blue';
  }

  const fontSize = size === 'sm' ? '10px' : '11px';
  const padding = size === 'sm' ? '2px 6px' : '3px 8px';

  return (
    <span className={className} style={{ fontSize, padding }}>
      {text}
    </span>
  );
};
