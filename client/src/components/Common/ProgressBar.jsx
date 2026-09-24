import React from 'react';
import { FiCheck, FiLoader } from 'react-icons/fi';

export const ProgressBar = ({ progress, status }) => {
  const steps = [
    'Finding businesses...',
    'Collecting business information...',
    'Checking websites...',
    'Finding social profiles...',
    'Analyzing digital presence...',
    'Generating lead scores...',
    'Generating recommendations...'
  ];

  const currentStepIndex = progress?.stepIndex || 0;
  const isCompleted = status === 'COMPLETED';
  const isFailed = status === 'FAILED';
  const percentage = progress?.percentage || 0;

  return (
    <div style={{
      backgroundColor: '#111116',
      border: '1px solid #1F1F28',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '20px'
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {isCompleted ? 'CAMPAIGN COMPLETED' : (isFailed ? 'EXECUTION FAILED' : 'LEAD INTELLIGENCE ENGINE RUNNING')}
          </span>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginTop: '3px' }}>
            {progress?.stage || 'Processing Pipeline...'}
          </h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}>
            {percentage}%
          </span>
          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
            {progress?.current || 0} / {progress?.total || 0} targets
          </div>
        </div>
      </div>

      {/* Main Gradient Progress Bar */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#1E1E28',
        borderRadius: '9999px',
        overflow: 'hidden',
        marginBottom: '20px',
        position: 'relative'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: isFailed
            ? '#EF4444'
            : 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 50%, #10B981 100%)',
          borderRadius: '9999px',
          transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }} />
      </div>

      {/* Real-time Status Message */}
      {progress?.message && (
        <div style={{
          padding: '10px 14px',
          backgroundColor: '#0B0B0E',
          border: '1px solid #1A1A22',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#D1D5DB',
          fontFamily: 'JetBrains Mono, monospace',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {!isCompleted && !isFailed && (
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#3B82F6',
              display: 'inline-block',
              animation: 'pulse 1s infinite'
            }} />
          )}
          {progress.message}
        </div>
      )}

      {/* Step-by-Step Progress Pipeline List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {steps.map((stepText, idx) => {
          const stepNum = idx + 1;
          const isDone = isCompleted || currentStepIndex > stepNum;
          const isCurrent = !isCompleted && currentStepIndex === stepNum;

          let color = '#4B5563';
          let border = '#1B1B24';
          let bg = 'transparent';

          if (isDone) {
            color = '#10B981';
            border = 'rgba(16, 185, 129, 0.3)';
            bg = 'rgba(16, 185, 129, 0.05)';
          } else if (isCurrent) {
            color = '#60A5FA';
            border = 'rgba(59, 130, 246, 0.4)';
            bg = 'rgba(59, 130, 246, 0.08)';
          }

          return (
            <div
              key={stepText}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: bg,
                border: `1px solid ${border}`,
                fontSize: '11px',
                fontWeight: isCurrent ? '700' : '500',
                color: isDone ? '#D1D5DB' : (isCurrent ? '#FFFFFF' : '#6B7280')
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                backgroundColor: isDone ? '#10B981' : (isCurrent ? '#3B82F6' : '#1C1C26'),
                color: '#FFFFFF',
                flexShrink: 0
              }}>
                {isDone ? <FiCheck /> : (isCurrent ? <FiLoader style={{ animation: 'spin 1s linear infinite' }} /> : stepNum)}
              </div>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {stepText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
