import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../services/serviceIndex';
import { MetricCard } from '../../components/Common/MetricCard';
import { LeadTrendsChart } from '../../components/Charts/LeadTrendsChart';
import { DonutChart } from '../../components/Charts/DonutChart';
import { HorizontalBarChart } from '../../components/Charts/HorizontalBarChart';
import { Skeleton } from '../../components/Common/Skeleton';
import {
  FiUsers,
  FiAward,
  FiSun,
  FiArrowDownRight,
  FiAlertTriangle,
  FiGlobe,
  FiStar,
  FiMessageSquare,
  FiPhoneCall,
  FiCheckCircle,
  FiXCircle,
  FiPlus,
  FiFileText,
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardApi.getStats();
        if (res.data?.success) {
          setStats(res.data.stats);
          setCharts(res.data.charts);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height="110px" borderRadius="12px" />
          ))}
        </div>
      </div>
    );
  }

  const s = stats || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner / Quick Action Bar */}
      <div style={{
        backgroundColor: '#0E0E14',
        border: '1px solid #1E1E28',
        borderRadius: '14px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
            PDC Lead Intelligence Dashboard
          </h1>
          <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px', margin: 0 }}>
            Real-time digital gap analysis, qualification scores, and outreach tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/generate')}
            className="btn btn-primary"
          >
            <FiPlus /> Generate New Leads
          </button>
          <button
            onClick={() => navigate('/leads')}
            className="btn btn-secondary"
          >
            <FiUsers /> Explore Database
          </button>
        </div>
      </div>

      {/* SECTION 1: PRIMARY LEAD INTELLIGENCE COUNTERS */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
          LEAD QUALIFICATION OVERVIEW
        </div>

        <div className="grid-4" style={{ gap: '16px' }}>
          <MetricCard
            title="Total Leads"
            value={s.totalLeads}
            icon={FiUsers}
            subtitle={`${s.leadsGeneratedToday || 0} discovered today`}
            accentColor="#3B82F6"
            onClick={() => navigate('/leads')}
          />
          <MetricCard
            title="Hot Leads"
            value={s.hotLeads}
            icon={FiAward}
            subtitle="Score 80+ (High Opportunity)"
            accentColor="#EF4444"
            onClick={() => navigate('/leads?scoreClassification=HOT')}
          />
          <MetricCard
            title="Warm Leads"
            value={s.warmLeads}
            icon={FiSun}
            subtitle="Score 60 - 79"
            accentColor="#F59E0B"
            onClick={() => navigate('/leads?scoreClassification=WARM')}
          />
          <MetricCard
            title="Low Priority"
            value={s.lowPriorityLeads}
            icon={FiArrowDownRight}
            subtitle="Score < 60 (Existing Assets)"
            accentColor="#6B7280"
            onClick={() => navigate('/leads?scoreClassification=LOW')}
          />
        </div>
      </div>

      {/* SECTION 2: DIGITAL GAP INDICATORS */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
          DIGITAL PRESENCE AUDIT SIGNALS
        </div>

        <div className="grid-5">
          <MetricCard
            title="No Website"
            value={s.noWebsite}
            icon={FiAlertTriangle}
            subtitle="Prime Website Dev Targets"
            accentColor="#EF4444"
            onClick={() => navigate('/leads?websiteStatus=NO+WEBSITE')}
          />
          <MetricCard
            title="Broken Website"
            value={s.brokenWebsite}
            icon={FiXCircle}
            subtitle="Error / Unreachable Link"
            accentColor="#F87171"
            onClick={() => navigate('/leads?websiteStatus=BROKEN')}
          />
          <MetricCard
            title="Weak Digital"
            value={s.weakDigitalPresence}
            icon={FiActivity}
            subtitle="No SSL, Broken, or Missing IG"
            accentColor="#F59E0B"
            onClick={() => navigate('/leads')}
          />
          <MetricCard
            title="Avg Google Rating"
            value={`${s.avgRating || 0}★`}
            icon={FiStar}
            subtitle="Local Trust Benchmark"
            accentColor="#10B981"
          />
          <MetricCard
            title="Avg Reviews"
            value={s.avgReviewCount}
            icon={FiTrendingUp}
            subtitle="Reviews per business"
            accentColor="#3B82F6"
          />
        </div>
      </div>

      {/* SECTION 3: CRM PIPELINE METRICS */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
          OUTREACH & CRM CONVERSIONS
        </div>

        <div className="grid-5">
          <MetricCard
            title="Contacted"
            value={s.leadsContacted}
            icon={FiMessageSquare}
            subtitle="WhatsApp / DM / Email"
            accentColor="#3B82F6"
            onClick={() => navigate('/outreach')}
          />
          <MetricCard
            title="Replies"
            value={s.replies}
            icon={FiMessageSquare}
            subtitle="Positive Engagement"
            accentColor="#10B981"
            onClick={() => navigate('/pipeline')}
          />
          <MetricCard
            title="Calls Booked"
            value={s.calls}
            icon={FiPhoneCall}
            subtitle="Scheduled Pitch Calls"
            accentColor="#8B5CF6"
            onClick={() => navigate('/pipeline')}
          />
          <MetricCard
            title="Proposals"
            value={s.proposals}
            icon={FiFileText}
            subtitle="Quotes / Pitches Sent"
            accentColor="#EC4899"
            onClick={() => navigate('/pipeline')}
          />
          <MetricCard
            title="Won Deals"
            value={s.won}
            icon={FiCheckCircle}
            subtitle="Closed Clients"
            accentColor="#10B981"
            onClick={() => navigate('/pipeline')}
          />
        </div>
      </div>

      {/* SECTION 4: CHARTS GRID */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
          INTELLIGENCE ANALYTICS & DISTRIBUTIONS
        </div>

        {/* Row 1 Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '14px' }}>
              Lead Generation Volume (Last 14 Days)
            </h3>
            <LeadTrendsChart data={charts?.leadsByDate || []} height={190} />
          </div>

          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '14px' }}>
              Website Status Breakdown
            </h3>
            <DonutChart data={charts?.websiteStatuses || []} size={150} />
          </div>
        </div>

        {/* Row 2 Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '14px' }}>
              Top Industries Discovered
            </h3>
            <HorizontalBarChart data={charts?.industries || []} color="#3B82F6" />
          </div>

          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '14px' }}>
              Location Distribution
            </h3>
            <HorizontalBarChart data={charts?.locations || []} color="#10B981" />
          </div>

          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '14px' }}>
              Lead Pipeline Stage Flow
            </h3>
            <HorizontalBarChart data={charts?.stages || []} color="#F59E0B" />
          </div>
        </div>
      </div>
    </div>
  );
};
