import React, { useState, useEffect } from 'react';
import { dashboardApi, leadApi } from '../../services/serviceIndex';
import { MetricCard } from '../../components/Common/MetricCard';
import { DonutChart } from '../../components/Charts/DonutChart';
import { HorizontalBarChart } from '../../components/Charts/HorizontalBarChart';
import { TableSkeleton } from '../../components/Common/Skeleton';
import {
  FiBarChart2,
  FiTrendingUp,
  FiPercent,
  FiTarget,
  FiAward,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';

export const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await dashboardApi.getStats();
        if (res.data?.success) {
          setStats(res.data.stats);
          setCharts(res.data.charts);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <TableSkeleton rows={6} cols={4} />;
  }

  const s = stats || {};

  // Compute conversion rates
  const qualificationRate = s.totalLeads > 0
    ? Math.round(((s.hotLeads + s.warmLeads) / s.totalLeads) * 100)
    : 0;

  const replyRate = s.leadsContacted > 0
    ? Math.round((s.replies / s.leadsContacted) * 100)
    : 0;

  const winRate = s.proposals > 0
    ? Math.round((s.won / s.proposals) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60A5FA', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
          <FiBarChart2 /> PERFORMANCE & CONVERSION INTELLIGENCE
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>
          Lead Intelligence Analytics
        </h1>
        <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
          Deep-dive analysis into qualification quality, gap prevalence, and pipeline conversion rates.
        </p>
      </div>

      {/* KPI Conversion Rate Tiles */}
      <div className="grid-4">
        <MetricCard
          title="Qualification Rate"
          value={`${qualificationRate}%`}
          icon={FiAward}
          subtitle="Percentage HOT or WARM leads"
          accentColor="#3B82F6"
        />
        <MetricCard
          title="Outreach Reply Rate"
          value={`${replyRate}%`}
          icon={FiPercent}
          subtitle={`${s.replies} replies from ${s.leadsContacted} contacted`}
          accentColor="#10B981"
        />
        <MetricCard
          title="Proposal Close Rate"
          value={`${winRate}%`}
          icon={FiTarget}
          subtitle={`${s.won} won out of ${s.proposals} proposals`}
          accentColor="#F59E0B"
        />
        <MetricCard
          title="High Gap Ratio"
          value={`${s.totalLeads > 0 ? Math.round((s.noWebsite / s.totalLeads) * 100) : 0}%`}
          icon={FiAlertCircle}
          subtitle={`${s.noWebsite} businesses without website`}
          accentColor="#EF4444"
        />
      </div>

      {/* Charts Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {/* Industry Quality Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '14px' }}>
            Leads Discovered by Industry
          </h3>
          <HorizontalBarChart data={charts?.industries || []} color="#3B82F6" maxLimit={8} />
        </div>

        {/* Website Status Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '14px' }}>
            Digital Presence Status
          </h3>
          <DonutChart data={charts?.websiteStatuses || []} size={160} />
        </div>
      </div>

      {/* CRM Funnel Overview */}
      <div className="card">
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '16px' }}>
          FULL CRM CONVERSION FUNNEL
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          {[
            { label: '1. Total Discovered', val: s.totalLeads, color: '#3B82F6' },
            { label: '2. Qualified (Hot/Warm)', val: (s.hotLeads + s.warmLeads), color: '#60A5FA' },
            { label: '3. Contacted', val: s.leadsContacted, color: '#F59E0B' },
            { label: '4. Replies', val: s.replies, color: '#10B981' },
            { label: '5. Calls Scheduled', val: s.calls, color: '#8B5CF6' },
            { label: '6. Proposals Sent', val: s.proposals, color: '#EC4899' },
            { label: '7. Won Deals', val: s.won, color: '#10B981' }
          ].map((stage, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#0E0E14',
                border: '1px solid #1C1C26',
                borderRadius: '8px',
                padding: '14px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600' }}>
                {stage.label}
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: stage.color, marginTop: '6px', fontFamily: 'JetBrains Mono, monospace' }}>
                {stage.val}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
