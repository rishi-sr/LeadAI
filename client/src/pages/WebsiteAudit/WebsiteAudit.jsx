import React, { useState } from 'react';
import { auditApi } from '../../services/serviceIndex';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/Common/Badge';
import {
  FiGlobe,
  FiSearch,
  FiCheckCircle,
  FiAlertTriangle,
  FiActivity,
  FiShield,
  FiSmartphone,
  FiZap,
  FiExternalLink
} from 'react-icons/fi';

export const WebsiteAudit = () => {
  const [url, setUrl] = useState('');
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const { addToast } = useToast();

  const handleAudit = async (e) => {
    e?.preventDefault();
    if (!url.trim()) {
      addToast('Please enter a website URL', 'error');
      return;
    }

    setAuditing(true);
    try {
      const res = await auditApi.auditUrl(url.trim());
      if (res.data?.success) {
        setAuditResult(res.data);
        addToast(`Audit completed: Classified as ${res.data.status}`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Audit request failed', 'error');
    } finally {
      setAuditing(false);
    }
  };

  const handleQuickUrl = (testUrl) => {
    setUrl(testUrl);
  };

  const audit = auditResult?.audit || {};

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60A5FA', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
          <FiGlobe /> TECHNICAL & CONVERSION AUDITOR
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>
          Live Website Audit
        </h1>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
          Inspect any business URL on demand. Analyzes SSL security, mobile viewport, WhatsApp channels, lead capture gates, pricing tables, and performance response latency.
        </p>
      </div>

      {/* URL Input Form */}
      <form onSubmit={handleAudit} className="card" style={{ padding: '24px' }}>
        <div className="form-group">
          <label>Target Website URL</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FiGlobe style={{ position: 'absolute', left: '12px', top: '13px', color: '#6B7280' }} />
              <input
                type="text"
                className="input-control"
                placeholder="https://examplegym.com or businessdomain.in"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={auditing}
              style={{ minWidth: '150px' }}
            >
              {auditing ? 'Auditing...' : <><FiSearch /> Run Audit</>}
            </button>
          </div>
        </div>

        {/* Quick Test Samples */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Sample Sites:</span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => handleQuickUrl('https://goldsgym.in')}
          >
            Gold's Gym India (Strong)
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => handleQuickUrl('https://broken-preview.test')}
          >
            Simulate Broken Link (502)
          </button>
        </div>
      </form>

      {/* Audit Result Display */}
      {auditResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Classification Header Banner */}
          <div style={{
            backgroundColor: '#0E0E14',
            border: '1px solid #1F1F2C',
            borderRadius: '12px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div>
              <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '700' }}>
                AUDITED TARGET
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', marginTop: '2px', wordBreak: 'break-all' }}>
                {auditResult.url}
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase' }}>Classification</span>
                <div>
                  <Badge value={auditResult.status} />
                </div>
              </div>

              {audit.responseTimeMs !== undefined && (
                <div style={{
                  padding: '8px 14px',
                  backgroundColor: '#14141C',
                  border: '1px solid #232332',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#9CA3AF',
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  <strong style={{ color: '#FFFFFF' }}>{audit.responseTimeMs}ms</strong> latency
                </div>
              )}
            </div>
          </div>

          {/* Detailed Signal Cards */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '16px' }}>
              DISCOVERED AUDIT SIGNALS
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {[
                { label: 'HTTPS Security', status: audit.https, icon: FiShield, desc: audit.https ? 'SSL certificate active' : 'Insecure HTTP' },
                { label: 'Mobile Responsive', status: audit.mobileResponsive, icon: FiSmartphone, desc: audit.mobileResponsive ? 'Viewport meta tag detected' : 'Not optimized for mobile' },
                { label: 'WhatsApp Direct CTA', status: audit.whatsappDetected, icon: FiZap, desc: audit.whatsappDetected ? 'wa.me / WhatsApp widget found' : 'No 1-click WhatsApp button' },
                { label: 'Lead Capture Form', status: audit.leadFormDetected, icon: FiActivity, desc: audit.leadFormDetected ? 'Inquiry web form present' : 'No lead forms identified' },
                { label: 'Booking / Trial Action', status: audit.bookingDetected, icon: FiCheckCircle, desc: audit.bookingDetected ? 'Online booking / free trial CTA' : 'Missing direct conversion CTA' },
                { label: 'Pricing / Membership', status: audit.pricingDetected || audit.membershipPlansDetected, icon: FiActivity, desc: (audit.pricingDetected || audit.membershipPlansDetected) ? 'Transparent rates/plans shown' : 'No pricing breakdown' },
                { label: 'Reviews / Social Proof', status: audit.testimonialsDetected, icon: FiStar, desc: audit.testimonialsDetected ? 'Client testimonials showcased' : 'No social proof featured' },
                { label: 'Social Channels Linked', status: audit.socialLinksDetected, icon: FiGlobe, desc: audit.socialLinksDetected ? 'Instagram/FB profiles linked' : 'No social links detected' }
              ].map((sig, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: sig.status ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                    border: `1px solid ${sig.status ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF' }}>{sig.label}</span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: sig.status ? '#34D399' : '#F87171'
                    }}>
                      {sig.status ? 'DETECTED' : 'MISSING'}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{sig.desc}</span>
                </div>
              ))}
            </div>

            {/* SEO Meta Details */}
            {(audit.pageTitle || audit.metaDescription) && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1E1E28' }}>
                <h4 style={{ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px' }}>
                  SEO METADATA
                </h4>
                {audit.pageTitle && (
                  <div style={{ fontSize: '13px', color: '#FFFFFF', marginBottom: '4px' }}>
                    <strong style={{ color: '#9CA3AF' }}>Title: </strong> {audit.pageTitle}
                  </div>
                )}
                {audit.metaDescription && (
                  <div style={{ fontSize: '12px', color: '#D1D5DB' }}>
                    <strong style={{ color: '#9CA3AF' }}>Description: </strong> {audit.metaDescription}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
