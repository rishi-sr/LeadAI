import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignApi } from '../../services/campaignApi';
import { useToast } from '../../context/ToastContext';
import { ProgressBar } from '../../components/Common/ProgressBar';
import {
  FiZap,
  FiMapPin,
  FiTag,
  FiHash,
  FiStar,
  FiMessageSquare,
  FiArrowRight,
  FiCheckCircle,
  FiRotateCw,
  FiDatabase
} from 'react-icons/fi';

export const GenerateLeads = () => {
  const [formData, setFormData] = useState({
    industry: 'Gym',
    location: 'Greater Noida',
    keywords: 'gym, fitness center, fitness club, fitness studio',
    targetCount: 20,
    minimumRating: 4.0,
    minimumReviews: 20
  });

  const [activeCampaign, setActiveCampaign] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const pollIntervalRef = useRef(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const startPolling = (campaignId) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await campaignApi.getCampaignById(campaignId);
        if (res.data?.success) {
          const c = res.data.campaign;
          setActiveCampaign(c);

          if (c.status === 'COMPLETED' || c.status === 'FAILED') {
            clearInterval(pollIntervalRef.current);
            setIsRunning(false);

            if (c.status === 'COMPLETED') {
              addToast(`Campaign finished! Generated ${c.stats?.qualifiedLeads || 0} leads.`, 'success');
            } else {
              addToast(`Campaign halted: ${c.error || 'Unknown error'}`, 'error');
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 900);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.industry || !formData.location) {
      addToast('Please provide industry and location', 'error');
      return;
    }

    setIsRunning(true);
    try {
      const res = await campaignApi.createCampaign({
        ...formData,
        targetCount: Number(formData.targetCount),
        minimumRating: Number(formData.minimumRating),
        minimumReviews: Number(formData.minimumReviews)
      });

      if (res.data?.success) {
        setActiveCampaign(res.data.campaign);
        addToast('Campaign queued and processing started', 'info');
        startPolling(res.data.campaign._id);
      }
    } catch (err) {
      setIsRunning(false);
      addToast(err.response?.data?.message || 'Failed to start campaign', 'error');
    }
  };

  const handlePreset = (preset) => {
    setFormData(preset);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60A5FA', fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          <FiZap /> AUTOMATED DISCOVERY ENGINE
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', marginTop: '4px' }}>
          Generate New Leads
        </h1>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
          Configure market discovery parameters. The system will legally discover local businesses, verify official websites, audit technical gaps, compute PDC lead scores, and formulate outreach pitches.
        </p>
      </div>

      {/* Preset Suggestions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        padding: '12px 16px',
        backgroundColor: '#0E0E14',
        border: '1px solid #1C1C26',
        borderRadius: '10px'
      }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>
          Quick Presets:
        </span>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => handlePreset({
            industry: 'Gym',
            location: 'Greater Noida',
            keywords: 'gym, fitness center, crossfit, health club',
            targetCount: 15,
            minimumRating: 4.0,
            minimumReviews: 20
          })}
        >
          Gyms in Greater Noida
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => handlePreset({
            industry: 'Restaurant',
            location: 'Noida',
            keywords: 'fine dine, cafe, bistro, multi cuisine restaurant',
            targetCount: 15,
            minimumRating: 4.2,
            minimumReviews: 50
          })}
        >
          Restaurants in Noida
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => handlePreset({
            industry: 'Clinic',
            location: 'Delhi NCR',
            keywords: 'dental clinic, skin clinic, physiotherapy, healthcare',
            targetCount: 15,
            minimumRating: 4.5,
            minimumReviews: 30
          })}
        >
          Clinics in Delhi NCR
        </button>
      </div>

      {/* Campaign Configuration Form */}
      <form onSubmit={handleSubmit} className="card" style={{ padding: '28px' }}>
        <div className="grid-2">
          {/* Industry */}
          <div className="form-group">
            <label>Target Industry / Category</label>
            <div style={{ position: 'relative' }}>
              <select
                className="select-control"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                disabled={isRunning}
              >
                <option value="Gym">Gym / Fitness Center</option>
                <option value="Restaurant">Restaurant / Bistro</option>
                <option value="Clinic">Clinic / Healthcare</option>
                <option value="Real Estate">Real Estate / Developer</option>
                <option value="Salon">Salon & Spa</option>
                <option value="Cafe">Cafe / Bakery</option>
                <option value="School">School / College</option>
                <option value="Coaching Institute">Coaching Institute</option>
                <option value="Hotel">Hotel / Resort</option>
                <option value="Local Services">Local Services / Repair</option>
                <option value="Retail">Retail Store / Boutique</option>
                <option value="Professional Services">Professional Services / Agency</option>
                <option value="Other">Other Category</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label>Geographic Location / City</label>
            <div style={{ position: 'relative' }}>
              <FiMapPin style={{ position: 'absolute', left: '12px', top: '13px', color: '#6B7280' }} />
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Greater Noida, Sector 62, Indirapuram"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{ paddingLeft: '38px' }}
                disabled={isRunning}
                required
              />
            </div>
          </div>
        </div>

        {/* Keywords */}
        <div className="form-group">
          <label>Discovery Search Keywords (Comma separated)</label>
          <div style={{ position: 'relative' }}>
            <FiTag style={{ position: 'absolute', left: '12px', top: '13px', color: '#6B7280' }} />
            <input
              type="text"
              className="input-control"
              placeholder="e.g. gym, fitness club, weights, personal trainer"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              style={{ paddingLeft: '38px' }}
              disabled={isRunning}
            />
          </div>
        </div>

        <div className="grid-3" style={{ marginTop: '10px' }}>
          {/* Target Count */}
          <div className="form-group">
            <label>Target Number of Leads</label>
            <div style={{ position: 'relative' }}>
              <FiHash style={{ position: 'absolute', left: '12px', top: '13px', color: '#6B7280' }} />
              <input
                type="number"
                min="5"
                max="100"
                className="input-control"
                value={formData.targetCount}
                onChange={(e) => setFormData({ ...formData, targetCount: e.target.value })}
                style={{ paddingLeft: '38px' }}
                disabled={isRunning}
              />
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="form-group">
            <label>Minimum Google Rating (★)</label>
            <div style={{ position: 'relative' }}>
              <FiStar style={{ position: 'absolute', left: '12px', top: '13px', color: '#6B7280' }} />
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                className="input-control"
                value={formData.minimumRating}
                onChange={(e) => setFormData({ ...formData, minimumRating: e.target.value })}
                style={{ paddingLeft: '38px' }}
                disabled={isRunning}
              />
            </div>
          </div>

          {/* Minimum Reviews */}
          <div className="form-group">
            <label>Minimum Reviews Count</label>
            <div style={{ position: 'relative' }}>
              <FiMessageSquare style={{ position: 'absolute', left: '12px', top: '13px', color: '#6B7280' }} />
              <input
                type="number"
                min="0"
                className="input-control"
                value={formData.minimumReviews}
                onChange={(e) => setFormData({ ...formData, minimumReviews: e.target.value })}
                style={{ paddingLeft: '38px' }}
                disabled={isRunning}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isRunning}
            style={{ minWidth: '220px' }}
          >
            {isRunning ? (
              <>
                <FiRotateCw style={{ animation: 'spin 1s linear infinite' }} /> Processing Campaign...
              </>
            ) : (
              <>
                <FiZap /> GENERATE LEADS
              </>
            )}
          </button>
        </div>
      </form>

      {/* Real-time Progress Monitor */}
      {activeCampaign && (
        <ProgressBar
          progress={activeCampaign.progress}
          status={activeCampaign.status}
        />
      )}

      {/* Completion Summary Card */}
      {activeCampaign && activeCampaign.status === 'COMPLETED' && (
        <div style={{
          backgroundColor: '#0A2619',
          border: '1px solid #10B981',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              <FiCheckCircle />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                Campaign Finished Successfully!
              </h3>
              <p style={{ fontSize: '12px', color: '#A7F3D0', marginTop: '3px', margin: 0 }}>
                Qualified {activeCampaign.stats?.qualifiedLeads || 0} leads ({activeCampaign.stats?.hotCount || 0} Hot, {activeCampaign.stats?.warmCount || 0} Warm, {activeCampaign.stats?.noWebsites || 0} without website).
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/leads?campaignId=${activeCampaign._id}`)}
            className="btn btn-primary"
            style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}
          >
            <FiDatabase /> View Generated Leads <FiArrowRight />
          </button>
        </div>
      )}
    </div>
  );
};
