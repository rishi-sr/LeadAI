import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignApi } from '../../services/campaignApi';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/Common/Badge';
import {
  FiLayers,
  FiPlus,
  FiRefreshCw,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiDatabase,
  FiTarget
} from 'react-icons/fi';

export const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchCampaigns = async () => {
    try {
      const res = await campaignApi.getCampaigns();
      if (res.data?.success) {
        setCampaigns(res.data.campaigns);
      }
    } catch (err) {
      addToast('Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRerun = async (id, e) => {
    e.stopPropagation();
    try {
      await campaignApi.rerunCampaign(id);
      addToast('Campaign queued for rerun', 'info');
      fetchCampaigns();
    } catch (err) {
      addToast('Failed to rerun campaign', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60A5FA', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
            <FiLayers /> CAMPAIGN MANAGEMENT
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>
            Market Discovery Campaigns
          </h1>
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
            Track lead generation runs, progress stages, and qualification yields.
          </p>
        </div>

        <button
          onClick={() => navigate('/generate')}
          className="btn btn-primary"
        >
          <FiPlus /> New Campaign
        </button>
      </div>

      {/* Campaigns Grid / List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '12px' }} />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <h3 style={{ fontSize: '16px', color: '#FFFFFF', marginBottom: '6px' }}>
            No campaigns launched yet
          </h3>
          <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '16px' }}>
            Initiate your first lead discovery campaign to start researching businesses.
          </p>
          <button onClick={() => navigate('/generate')} className="btn btn-primary">
            <FiPlus /> Start Discovery
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {campaigns.map((camp) => {
            const isRunning = camp.status === 'RUNNING';
            const isCompleted = camp.status === 'COMPLETED';
            const isFailed = camp.status === 'FAILED';

            return (
              <div
                key={camp._id}
                className="card"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  borderColor: isRunning ? 'rgba(59, 130, 246, 0.4)' : '#1E1E28'
                }}
              >
                {/* Top Title & Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      backgroundColor: isRunning ? 'rgba(59, 130, 246, 0.15)' : '#161620',
                      border: '1px solid #232332',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isRunning ? '#60A5FA' : '#9CA3AF',
                      fontSize: '18px'
                    }}>
                      <FiTarget />
                    </div>

                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                        {camp.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                        <span>Industry: <strong style={{ color: '#FFFFFF' }}>{camp.industry}</strong></span>
                        <span>•</span>
                        <span>Location: <strong style={{ color: '#FFFFFF' }}>{camp.location}</strong></span>
                        <span>•</span>
                        <span>Created: {new Date(camp.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge ${isCompleted ? 'badge-success' : (isRunning ? 'badge-blue' : (isFailed ? 'badge-broken' : 'badge-neutral'))}`}>
                      {camp.status}
                    </span>

                    <button
                      onClick={(e) => handleRerun(camp._id, e)}
                      className="btn btn-secondary btn-sm"
                      title="Rerun Campaign"
                    >
                      <FiRefreshCw /> Rerun
                    </button>

                    <button
                      onClick={() => navigate(`/leads?campaignId=${camp._id}`)}
                      className="btn btn-primary btn-sm"
                    >
                      <FiDatabase /> View Leads ({camp.stats?.qualifiedLeads || 0}) <FiArrowRight />
                    </button>
                  </div>
                </div>

                {/* Progress Bar (if Running) */}
                {isRunning && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF', marginBottom: '6px' }}>
                      <span>Stage: {camp.progress?.stage}</span>
                      <span>{camp.progress?.percentage}% ({camp.progress?.current}/{camp.progress?.total})</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#1A1A24', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${camp.progress?.percentage || 0}%`, height: '100%', backgroundColor: '#3B82F6', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                )}

                {/* Stats Summary Bar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px',
                  backgroundColor: '#0A0A0E',
                  border: '1px solid #181822',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '12px'
                }}>
                  <div>
                    <span style={{ color: '#9CA3AF', fontSize: '11px' }}>Target / Discovered</span>
                    <div style={{ color: '#FFFFFF', fontWeight: '700', marginTop: '2px' }}>
                      {camp.stats?.totalDiscovered || 0} / {camp.targetCount}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#9CA3AF', fontSize: '11px' }}>No Website</span>
                    <div style={{ color: '#EF4444', fontWeight: '700', marginTop: '2px' }}>
                      {camp.stats?.noWebsites || 0}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#9CA3AF', fontSize: '11px' }}>Broken Website</span>
                    <div style={{ color: '#F87171', fontWeight: '700', marginTop: '2px' }}>
                      {camp.stats?.brokenWebsites || 0}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#9CA3AF', fontSize: '11px' }}>Hot Leads (80+)</span>
                    <div style={{ color: '#EF4444', fontWeight: '700', marginTop: '2px' }}>
                      {camp.stats?.hotCount || 0}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#9CA3AF', fontSize: '11px' }}>Warm Leads (60-79)</span>
                    <div style={{ color: '#F59E0B', fontWeight: '700', marginTop: '2px' }}>
                      {camp.stats?.warmCount || 0}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
