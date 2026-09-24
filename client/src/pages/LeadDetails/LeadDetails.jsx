import React, { useState } from 'react';
import { leadApi } from '../../services/leadApi';
import { outreachApi } from '../../services/serviceIndex';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/Common/Badge';
import {
  FiStar,
  FiPhone,
  FiMail,
  FiGlobe,
  FiInstagram,
  FiMapPin,
  FiCopy,
  FiCheck,
  FiRotateCw,
  FiPlus,
  FiSend,
  FiExternalLink,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiShield,
  FiEdit2,
  FiSearch
} from 'react-icons/fi';

export const LeadDetails = ({ lead: initialLead, onUpdate, onClose }) => {
  const [lead, setLead] = useState(initialLead);
  const [activeTab, setActiveTab] = useState('intelligence');
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [generatingPitch, setGeneratingPitch] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Website Inline Edit & Audit state
  const [editingWebsite, setEditingWebsite] = useState(false);
  const [customWebsiteInput, setCustomWebsiteInput] = useState('');
  const [savingWebsite, setSavingWebsite] = useState(false);

  // Outreach Modal state
  const [outreachModalOpen, setOutreachModalOpen] = useState(false);
  const [outreachChannel, setOutreachChannel] = useState('WhatsApp');
  const [outreachMessage, setOutreachMessage] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const { addToast } = useToast();

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      const res = await leadApi.addNote(lead._id, newNote.trim());
      if (res.data?.success) {
        setLead(prev => ({
          ...prev,
          notes: res.data.notes,
          timeline: [
            ...prev.timeline,
            { action: 'Note Added', details: newNote.trim(), timestamp: new Date() }
          ]
        }));
        setNewNote('');
        addToast('Note saved successfully', 'success');
        if (onUpdate) onUpdate(lead);
      }
    } catch (err) {
      addToast('Failed to save note', 'error');
    } finally {
      setAddingNote(false);
    }
  };

  const handleStageChange = async (newStage) => {
    try {
      const res = await leadApi.updateLead(lead._id, { stage: newStage });
      if (res.data?.success) {
        setLead(res.data.lead);
        addToast(`Lead stage updated to ${newStage}`, 'success');
        if (onUpdate) onUpdate(res.data.lead);
      }
    } catch (err) {
      addToast('Failed to update stage', 'error');
    }
  };

  const handleRegeneratePitch = async () => {
    setGeneratingPitch(true);
    try {
      const res = await leadApi.generatePitch(lead._id);
      if (res.data?.success) {
        setLead(prev => ({
          ...prev,
          pitch: res.data.pitch,
          whatsappMessage: res.data.whatsappMessage,
          instagramMessage: res.data.instagramMessage,
          emailMessage: res.data.emailMessage
        }));
        addToast('AI Pitch and outreach messages refreshed', 'success');
      }
    } catch (err) {
      addToast('Failed to regenerate pitch', 'error');
    } finally {
      setGeneratingPitch(false);
    }
  };

  const handleReanalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await leadApi.analyzeLead(lead._id);
      if (res.data?.success) {
        setLead(res.data.lead);
        addToast('Lead re-audited and score updated', 'success');
        if (onUpdate) onUpdate(res.data.lead);
      }
    } catch (err) {
      addToast('Failed to re-analyze lead', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveAndAuditWebsite = async () => {
    if (!customWebsiteInput.trim()) {
      addToast('Please enter a valid website URL', 'error');
      return;
    }
    setSavingWebsite(true);
    try {
      const res = await leadApi.analyzeLead(lead._id, { website: customWebsiteInput.trim() });
      if (res.data?.success) {
        setLead(res.data.lead);
        setEditingWebsite(false);
        setCustomWebsiteInput('');
        addToast('Website updated and deep technical audit completed!', 'success');
        if (onUpdate) onUpdate(res.data.lead);
      }
    } catch (err) {
      addToast('Failed to audit specified website', 'error');
    } finally {
      setSavingWebsite(false);
    }
  };

  const handleRecordOutreach = async (status = 'Sent') => {
    try {
      const msg = outreachMessage || lead.whatsappMessage || lead.pitch?.shortPitch || 'Contacted client';
      await outreachApi.createOutreach({
        leadId: lead._id,
        channel: outreachChannel,
        message: msg,
        status,
        followUpDate: followUpDate ? new Date(followUpDate) : null
      });

      addToast(`Logged outreach via ${outreachChannel}`, 'success');
      setOutreachModalOpen(false);

      // Refresh lead details
      const fresh = await leadApi.getLeadById(lead._id);
      if (fresh.data?.success) {
        setLead(fresh.data.lead);
        if (onUpdate) onUpdate(fresh.data.lead);
      }
    } catch (err) {
      addToast('Failed to record outreach', 'error');
    }
  };

  if (!lead) return null;
  const audit = lead.websiteAudit || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Profile Card */}
      <div style={{
        backgroundColor: '#111116',
        border: '1px solid #1E1E28',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' }}>
                {lead.category}
              </span>
              <Badge value={lead.scoreClassification} />
              <Badge value={lead.websiteStatus} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
              {lead.businessName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>
              <FiMapPin style={{ color: '#6B7280' }} /> {lead.address || lead.location}
            </div>
          </div>

          {/* Quick Score Tile */}
          <div style={{
            backgroundColor: '#0A0A0E',
            border: '1px solid #232332',
            borderRadius: '10px',
            padding: '10px 16px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' }}>
              PDC LEAD SCORE
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#3B82F6', fontFamily: 'JetBrains Mono, monospace' }}>
              {lead.score}<span style={{ fontSize: '14px', color: '#6B7280' }}>/100</span>
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #191924',
          flexWrap: 'wrap'
        }}>
          {/* Stage Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF' }}>STAGE:</span>
            <select
              className="select-control"
              style={{ padding: '6px 28px 6px 10px', fontSize: '12px', width: 'auto' }}
              value={lead.stage}
              onChange={(e) => handleStageChange(e.target.value)}
            >
              <option value="NEW">NEW</option>
              <option value="RESEARCHED">RESEARCHED</option>
              <option value="HOT">HOT</option>
              <option value="WARM">WARM</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="REPLIED">REPLIED</option>
              <option value="CALL SCHEDULED">CALL SCHEDULED</option>
              <option value="PROPOSAL SENT">PROPOSAL SENT</option>
              <option value="NEGOTIATION">NEGOTIATION</option>
              <option value="WON">WON</option>
              <option value="LOST">LOST</option>
              <option value="NOT INTERESTED">NOT INTERESTED</option>
            </select>
          </div>

          <button
            onClick={() => {
              setOutreachMessage(lead.whatsappMessage);
              setOutreachChannel('WhatsApp');
              setOutreachModalOpen(true);
            }}
            className="btn btn-primary btn-sm"
          >
            <FiSend /> Log Outreach
          </button>

          <button
            onClick={() => handleStageChange('CONTACTED')}
            className="btn btn-secondary btn-sm"
          >
            <FiCheckCircle /> Mark Contacted
          </button>

          <button
            onClick={handleReanalyze}
            className="btn btn-outline btn-sm"
            disabled={analyzing}
          >
            <FiRotateCw style={{ animation: analyzing ? 'spin 1s linear infinite' : 'none' }} /> Re-Audit
          </button>

          <button
            onClick={handleRegeneratePitch}
            className="btn btn-outline btn-sm"
            disabled={generatingPitch}
          >
            <FiRotateCw style={{ animation: generatingPitch ? 'spin 1s linear infinite' : 'none' }} /> Regen Pitch
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #1F1F2A',
        gap: '8px'
      }}>
        {[
          { id: 'intelligence', label: 'Gap & Score Analysis' },
          { id: 'pitches', label: 'AI Pitches & Outreach' },
          { id: 'audit', label: 'Technical Audit & Assets' },
          { id: 'crm', label: `CRM & Notes (${lead.notes?.length || 0})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #3B82F6' : '2px solid transparent',
              color: activeTab === tab.id ? '#FFFFFF' : '#9CA3AF',
              fontWeight: activeTab === tab.id ? '700' : '500',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: GAP & SCORE ANALYSIS */}
      {activeTab === 'intelligence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Reason To Contact Banner */}
          {lead.reasonToContact && (
            <div style={{
              backgroundColor: '#0F1626',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              borderRadius: '10px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <FiShield style={{ color: '#3B82F6', fontSize: '20px', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  CORE SALES HOOK / REASON TO CONTACT
                </div>
                <div style={{ fontSize: '13px', color: '#E2E8F0', marginTop: '4px', lineHeight: 1.4 }}>
                  {lead.reasonToContact}
                </div>
              </div>
            </div>
          )}

          {/* Strengths & Gaps Grid */}
          <div className="grid-2">
            {/* Strengths */}
            <div className="card">
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#34D399', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiCheckCircle /> DIGITAL STRENGTHS ({lead.digitalStrengths?.length || 0})
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lead.digitalStrengths?.map((st, i) => (
                  <li key={i} style={{ fontSize: '12px', color: '#D1D5DB', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#34D399' }}>✓</span> {st}
                  </li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div className="card">
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#F87171', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiAlertCircle /> DISCOVERED GAPS ({lead.digitalGaps?.length || 0})
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lead.digitalGaps?.map((gap, i) => (
                  <li key={i} style={{ fontSize: '12px', color: '#D1D5DB', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#F87171' }}>✕</span> {gap}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Services & Opportunities */}
          <div className="card">
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', marginBottom: '12px' }}>
              RECOMMENDED PDC SERVICES TO PITCH
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {lead.recommendedServices?.map((service, i) => (
                <span
                  key={i}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#60A5FA',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  {service}
                </span>
              ))}
            </div>
          </div>

          {/* Transparent Score Breakdown Table */}
          <div className="card">
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', marginBottom: '12px' }}>
              PDC QUALIFICATION SCORE BREAKDOWN
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #232332', color: '#9CA3AF', textAlign: 'left' }}>
                  <th style={{ padding: '8px 0' }}>Rule</th>
                  <th style={{ padding: '8px' }}>Points</th>
                  <th style={{ padding: '8px 0' }}>Internal PDC Rationale</th>
                </tr>
              </thead>
              <tbody>
                {lead.scoreBreakdown?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #161622' }}>
                    <td style={{ padding: '8px 0', color: '#FFFFFF', fontWeight: '600' }}>{item.rule}</td>
                    <td style={{ padding: '8px', color: item.points >= 0 ? '#34D399' : '#F87171', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace' }}>
                      {item.points > 0 ? `+${item.points}` : item.points}
                    </td>
                    <td style={{ padding: '8px 0', color: '#9CA3AF' }}>{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AI PITCHES & OUTREACH MESSAGES */}
      {activeTab === 'pitches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Executive Observations & Pitch Angles */}
          <div className="card">
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', marginBottom: '12px' }}>
              PITCH ANGLE & ANATOMY
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div>
                <span style={{ fontWeight: '700', color: '#9CA3AF' }}>Observation: </span>
                <span style={{ color: '#E5E7EB' }}>{lead.pitch?.observation}</span>
              </div>
              <div>
                <span style={{ fontWeight: '700', color: '#9CA3AF' }}>Problem Identified: </span>
                <span style={{ color: '#E5E7EB' }}>{lead.pitch?.problem}</span>
              </div>
              <div>
                <span style={{ fontWeight: '700', color: '#9CA3AF' }}>Opportunity Created: </span>
                <span style={{ color: '#E5E7EB' }}>{lead.pitch?.opportunity}</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Message */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#25D366' }}>
                WhatsApp Direct Outreach Template
              </div>
              <button
                onClick={() => handleCopy(lead.whatsappMessage, 'wa')}
                className="btn btn-secondary btn-sm"
              >
                {copiedKey === 'wa' ? <FiCheck /> : <FiCopy />} Copy
              </button>
            </div>
            <div style={{
              backgroundColor: '#0A120D',
              border: '1px solid #153320',
              borderRadius: '8px',
              padding: '14px',
              fontSize: '12px',
              color: '#D1D5DB',
              whiteSpace: 'pre-line',
              fontFamily: 'Segoe UI, sans-serif'
            }}>
              {lead.whatsappMessage}
            </div>
          </div>

          {/* Instagram DM */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#E1306C' }}>
                Instagram Direct Message (DM)
              </div>
              <button
                onClick={() => handleCopy(lead.instagramMessage, 'ig')}
                className="btn btn-secondary btn-sm"
              >
                {copiedKey === 'ig' ? <FiCheck /> : <FiCopy />} Copy
              </button>
            </div>
            <div style={{
              backgroundColor: '#140D12',
              border: '1px solid #331A28',
              borderRadius: '8px',
              padding: '14px',
              fontSize: '12px',
              color: '#D1D5DB',
              whiteSpace: 'pre-line'
            }}>
              {lead.instagramMessage}
            </div>
          </div>

          {/* Cold Email */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#60A5FA' }}>
                Cold Email Pitch
              </div>
              <button
                onClick={() => handleCopy(lead.emailMessage, 'email')}
                className="btn btn-secondary btn-sm"
              >
                {copiedKey === 'email' ? <FiCheck /> : <FiCopy />} Copy
              </button>
            </div>
            <div style={{
              backgroundColor: '#090E16',
              border: '1px solid #162438',
              borderRadius: '8px',
              padding: '14px',
              fontSize: '12px',
              color: '#D1D5DB',
              whiteSpace: 'pre-line'
            }}>
              {lead.emailMessage}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TECHNICAL AUDIT & ASSETS */}
      {activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Contact Details */}
          <div className="card">
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', marginBottom: '12px' }}>
              CONTACT & ASSET INFORMATION
            </h3>
            <div className="grid-2">
              <div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>PHONE NUMBER</div>
                <div style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: '600', marginTop: '2px' }}>
                  {lead.phone || 'NOT FOUND'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>EMAIL ADDRESS</div>
                <div style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: '600', marginTop: '2px' }}>
                  {lead.email || 'NOT FOUND'}
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>OFFICIAL WEBSITE</div>
                  {!editingWebsite && (
                    <button
                      onClick={() => {
                        setEditingWebsite(true);
                        setCustomWebsiteInput(lead.website || '');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#60A5FA',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '0',
                        fontWeight: '600'
                      }}
                    >
                      <FiEdit2 size={11} /> {lead.website ? 'Edit' : 'Add Website'}
                    </button>
                  )}
                </div>

                {editingWebsite ? (
                  <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={customWebsiteInput}
                      onChange={(e) => setCustomWebsiteInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveAndAuditWebsite(); }}
                      style={{
                        flex: 1,
                        fontSize: '12px',
                        padding: '5px 8px',
                        background: '#1F2937',
                        border: '1px solid #3B82F6',
                        borderRadius: '4px',
                        color: '#FFFFFF',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={handleSaveAndAuditWebsite}
                      disabled={savingWebsite}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: '#3B82F6',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {savingWebsite ? 'Auditing...' : 'Save & Audit'}
                    </button>
                    <button
                      onClick={() => setEditingWebsite(false)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        background: 'transparent',
                        color: '#9CA3AF',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: '#3B82F6', marginTop: '2px', wordBreak: 'break-all' }}>
                    {lead.website ? (
                      <a href={lead.website} target="_blank" rel="noreferrer" style={{ color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                        {lead.website} <FiExternalLink />
                      </a>
                    ) : (
                      <span style={{ color: '#6B7280' }}>NO WEBSITE REGISTERED</span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>INSTAGRAM HANDLE</div>
                <div style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: '600', marginTop: '2px' }}>
                  {lead.instagramUsername && lead.instagramUsername !== 'NOT FOUND' && lead.instagramUrl ? (
                    <a href={lead.instagramUrl} target="_blank" rel="noreferrer" style={{ color: '#E1306C' }}>
                      @{lead.instagramUsername} {lead.instagramFollowers > 0 ? `(${lead.instagramFollowers?.toLocaleString()} followers)` : ''}
                    </a>
                  ) : (
                    <span style={{ color: '#6B7280', fontWeight: '400' }}>NOT FOUND</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Website Audit Breakdown */}
          <div className="card">
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', marginBottom: '14px' }}>
              TECHNICAL AUDIT SIGNALS
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {[
                { label: 'HTTPS Protocol', detected: audit.https },
                { label: 'Mobile Responsive', detected: audit.mobileResponsive },
                { label: 'WhatsApp CTA', detected: audit.whatsappDetected },
                { label: 'Lead Capture Form', detected: audit.leadFormDetected },
                { label: 'Booking / Trial CTA', detected: audit.bookingDetected },
                { label: 'Customer Reviews', detected: audit.testimonialsDetected },
                { label: 'Pricing / Plans', detected: audit.pricingDetected || audit.membershipPlansDetected },
                { label: 'Social Media Links', detected: audit.socialLinksDetected }
              ].map((sig, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: sig.detected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${sig.detected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px'
                  }}
                >
                  <span style={{ color: '#D1D5DB' }}>{sig.label}</span>
                  <span style={{ fontWeight: '700', color: sig.detected ? '#34D399' : '#F87171' }}>
                    {sig.detected ? 'YES' : 'NO'}
                  </span>
                </div>
              ))}
            </div>

            {audit.pageTitle && (
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #1E1E28', fontSize: '12px' }}>
                <span style={{ color: '#9CA3AF' }}>Page Title: </span>
                <span style={{ color: '#FFFFFF' }}>{audit.pageTitle}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CRM & NOTES & TIMELINE */}
      {activeTab === 'crm' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="card">
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', marginBottom: '10px' }}>
              ADD INTERNAL NOTE
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Spoke to owner on WhatsApp, requested website demo this Friday..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={addingNote}>
                <FiPlus /> Add Note
              </button>
            </div>
          </form>

          {/* Notes List */}
          <div className="card">
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', marginBottom: '12px' }}>
              NOTES HISTORY ({lead.notes?.length || 0})
            </h3>
            {lead.notes?.length === 0 ? (
              <div style={{ color: '#6B7280', fontSize: '12px' }}>No notes logged yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {lead.notes?.map((n, i) => (
                  <div key={i} style={{ padding: '10px 12px', backgroundColor: '#0B0B0E', border: '1px solid #181822', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#E2E8F0' }}>{n.text}</div>
                    <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px', display: 'flex', gap: '10px' }}>
                      <span>By {n.author || 'Agent'}</span>
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="card">
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', marginBottom: '12px' }}>
              AUDIT TIMELINE
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lead.timeline?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6', marginTop: '5px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#FFFFFF' }}>{item.action}</div>
                    {item.details && <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{item.details}</div>}
                    <div style={{ fontSize: '10px', color: '#6B7280' }}>{new Date(item.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Log Outreach Modal */}
      {outreachModalOpen && (
        <div className="modal-backdrop" onClick={() => setOutreachModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '16px' }}>
              Log Outreach Interaction
            </h3>

            <div className="form-group">
              <label>Communication Channel</label>
              <select
                className="select-control"
                value={outreachChannel}
                onChange={(e) => setOutreachChannel(e.target.value)}
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Instagram">Instagram DM</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone Call</option>
                <option value="Other">Other Channel</option>
              </select>
            </div>

            <div className="form-group">
              <label>Outreach Message Sent</label>
              <textarea
                className="input-control"
                rows="4"
                value={outreachMessage}
                onChange={(e) => setOutreachMessage(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Follow-up Date</label>
              <input
                type="date"
                className="input-control"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setOutreachModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleRecordOutreach('Sent')}
              >
                Save & Update Stage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
