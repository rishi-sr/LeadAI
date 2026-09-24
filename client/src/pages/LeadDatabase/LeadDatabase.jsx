import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { leadApi } from '../../services/leadApi';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/Common/Badge';
import { Drawer } from '../../components/Common/Drawer';
import { Modal } from '../../components/Common/Modal';
import { LeadDetails } from '../LeadDetails/LeadDetails';
import { TableSkeleton } from '../../components/Common/Skeleton';
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiStar,
  FiExternalLink,
  FiRefreshCw,
  FiLayers,
  FiCheckSquare,
  FiSquare,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

export const LeadDatabase = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalLeads, setTotalLeads] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [location, setLocation] = useState(searchParams.get('location') || 'ALL');
  const [websiteStatus, setWebsiteStatus] = useState(searchParams.get('websiteStatus') || 'ALL');
  const [scoreClassification, setScoreClassification] = useState(searchParams.get('scoreClassification') || 'ALL');
  const [stage, setStage] = useState(searchParams.get('stage') || 'ALL');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('score_desc');

  // Selection & Details
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedLead, setSelectedLead] = useState(null);
  const [bulkStageModalOpen, setBulkStageModalOpen] = useState(false);
  const [bulkStageValue, setBulkStageValue] = useState('CONTACTED');
  const [exporting, setExporting] = useState(false);

  const { addToast } = useToast();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 25,
        search: search.trim() || undefined,
        category: category !== 'ALL' ? category : undefined,
        location: location !== 'ALL' ? location : undefined,
        websiteStatus: websiteStatus !== 'ALL' ? websiteStatus : undefined,
        scoreClassification: scoreClassification !== 'ALL' ? scoreClassification : undefined,
        stage: stage !== 'ALL' ? stage : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        campaignId: searchParams.get('campaignId') || undefined,
        sortBy
      };

      const res = await leadApi.getLeads(params);
      if (res.data?.success) {
        setLeads(res.data.leads);
        setTotalLeads(res.data.total);
        setTotalPages(res.data.pages);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
      addToast('Failed to load leads', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, category, location, websiteStatus, scoreClassification, stage, minRating, sortBy, searchParams, addToast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Handle Export Excel
  const handleExport = async (type = 'all') => {
    setExporting(true);
    try {
      const params = {};
      if (type === 'selected') {
        if (selectedIds.size === 0) {
          addToast('No leads selected', 'info');
          setExporting(false);
          return;
        }
        params.ids = Array.from(selectedIds).join(',');
      } else if (type === 'filtered') {
        if (search) params.search = search;
        if (category !== 'ALL') params.category = category;
        if (location !== 'ALL') params.location = location;
        if (websiteStatus !== 'ALL') params.websiteStatus = websiteStatus;
        if (scoreClassification !== 'ALL') params.scoreClassification = scoreClassification;
        if (stage !== 'ALL') params.stage = stage;
      }

      const res = await leadApi.exportLeads(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `PDC_Leads_${type}_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('Excel export generated successfully!', 'success');
    } catch (err) {
      addToast('Failed to export leads', 'error');
    } finally {
      setExporting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map(l => l._id)));
    }
  };

  const toggleSelectOne = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkStageUpdate = async () => {
    if (selectedIds.size === 0) return;
    try {
      await leadApi.bulkUpdateStage(Array.from(selectedIds), bulkStageValue);
      addToast(`Updated ${selectedIds.size} leads to stage '${bulkStageValue}'`, 'success');
      setBulkStageModalOpen(false);
      setSelectedIds(new Set());
      fetchLeads();
    } catch (err) {
      addToast('Failed to bulk update stages', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Export Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
            Lead Intelligence Database
          </h1>
          <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px', margin: 0 }}>
            {totalLeads} total leads qualified and enriched across campaigns.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {selectedIds.size > 0 && (
            <>
              <button
                onClick={() => setBulkStageModalOpen(true)}
                className="btn btn-secondary btn-sm"
              >
                <FiLayers /> Change Stage ({selectedIds.size})
              </button>
              <button
                onClick={() => handleExport('selected')}
                className="btn btn-primary btn-sm"
                disabled={exporting}
              >
                <FiDownload /> Export Selected ({selectedIds.size})
              </button>
            </>
          )}

          <button
            onClick={() => handleExport('filtered')}
            className="btn btn-secondary btn-sm"
            disabled={exporting}
          >
            <FiDownload /> Export Filtered
          </button>

          <button
            onClick={() => handleExport('all')}
            className="btn btn-outline btn-sm"
            disabled={exporting}
          >
            <FiDownload /> Export All
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#6B7280' }} />
            <input
              type="text"
              className="input-control"
              placeholder="Search business, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Industry Filter */}
          <select
            className="select-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="ALL">All Industries</option>
            <option value="Gym">Gym</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Clinic">Clinic</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Salon">Salon</option>
            <option value="Other">Other</option>
          </select>

          {/* Website Status Filter */}
          <select
            className="select-control"
            value={websiteStatus}
            onChange={(e) => setWebsiteStatus(e.target.value)}
          >
            <option value="ALL">All Website Statuses</option>
            <option value="NO WEBSITE">No Website</option>
            <option value="BROKEN">Broken Website</option>
            <option value="BASIC">Basic Website</option>
            <option value="OUTDATED">Outdated Website</option>
            <option value="GOOD">Good Website</option>
            <option value="STRONG">Strong Website</option>
          </select>

          {/* Score Classification */}
          <select
            className="select-control"
            value={scoreClassification}
            onChange={(e) => setScoreClassification(e.target.value)}
          >
            <option value="ALL">All Scores</option>
            <option value="HOT">Hot Leads (80+)</option>
            <option value="WARM">Warm Leads (60-79)</option>
            <option value="LOW">Low Priority (&lt;60)</option>
          </select>

          {/* Pipeline Stage */}
          <select
            className="select-control"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          >
            <option value="ALL">All Stages</option>
            <option value="NEW">NEW</option>
            <option value="RESEARCHED">RESEARCHED</option>
            <option value="HOT">HOT</option>
            <option value="WARM">WARM</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="REPLIED">REPLIED</option>
            <option value="CALL SCHEDULED">CALL SCHEDULED</option>
            <option value="PROPOSAL SENT">PROPOSAL SENT</option>
            <option value="WON">WON</option>
            <option value="LOST">LOST</option>
          </select>

          {/* Sort By */}
          <select
            className="select-control"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="score_desc">Highest PDC Score</option>
            <option value="reviews_desc">Highest Reviews</option>
            <option value="rating_desc">Highest Rating</option>
            <option value="newest">Newest Discovered</option>
            <option value="oldest">Oldest Discovered</option>
            <option value="name_asc">Business Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="table-container">
        {loading ? (
          <TableSkeleton rows={8} cols={9} />
        ) : leads.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>
              No leads found matching criteria
            </div>
            <p style={{ fontSize: '12px' }}>Try clearing filters or launch a new discovery campaign.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <button
                    onClick={toggleSelectAll}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    {selectedIds.size === leads.length ? <FiCheckSquare style={{ color: '#3B82F6', fontSize: '16px' }} /> : <FiSquare style={{ fontSize: '16px' }} />}
                  </button>
                </th>
                <th>Business Name</th>
                <th>Category</th>
                <th>Location</th>
                <th>Website Status</th>
                <th>Google Rating</th>
                <th>Phone</th>
                <th>Instagram</th>
                <th>PDC Score</th>
                <th>Stage</th>
                <th>Recommended Service</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const isSelected = selectedIds.has(lead._id);
                const primaryService = lead.recommendedServices?.[0] || 'Custom Web';

                return (
                  <tr
                    key={lead._id}
                    className={isSelected ? 'selected' : ''}
                    onClick={() => setSelectedLead(lead)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Checkbox */}
                    <td style={{ textAlign: 'center' }} onClick={(e) => toggleSelectOne(lead._id, e)}>
                      <button
                        style={{ background: 'none', border: 'none', color: isSelected ? '#3B82F6' : '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        {isSelected ? <FiCheckSquare style={{ fontSize: '16px' }} /> : <FiSquare style={{ fontSize: '16px' }} />}
                      </button>
                    </td>

                    {/* Business Name */}
                    <td>
                      <div style={{ fontWeight: '700', color: '#FFFFFF' }}>
                        {lead.businessName}
                      </div>
                      {lead.placeId && (
                        <div style={{ fontSize: '10px', color: '#6B7280', fontFamily: 'JetBrains Mono, monospace' }}>
                          {lead.placeId.substring(0, 16)}...
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td>
                      <span style={{ fontSize: '11px', color: '#D1D5DB', textTransform: 'uppercase' }}>
                        {lead.category}
                      </span>
                    </td>

                    {/* Location */}
                    <td style={{ color: '#9CA3AF' }}>
                      {lead.location}
                    </td>

                    {/* Website Status */}
                    <td>
                      <Badge value={lead.websiteStatus} size="sm" />
                      {lead.website && (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ marginLeft: '6px', color: '#60A5FA', verticalAlign: 'middle' }}
                        >
                          <FiExternalLink />
                        </a>
                      )}
                    </td>

                    {/* Rating & Reviews */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: '#FFFFFF' }}>
                        <FiStar style={{ color: '#FBBF24' }} /> {lead.rating}
                        <span style={{ color: '#6B7280', fontWeight: '500', fontSize: '11px' }}>({lead.reviewCount})</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: lead.phone !== 'NOT FOUND' ? '#D1D5DB' : '#EF4444' }}>
                      {lead.phone}
                    </td>

                    {/* Instagram */}
                    <td>
                      {lead.instagramUsername && lead.instagramUsername !== 'NOT FOUND' && lead.instagramUrl ? (
                        <a
                          href={lead.instagramUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: '#E1306C', fontWeight: '600', fontSize: '11px', textDecoration: 'none' }}
                        >
                          @{lead.instagramUsername}
                        </a>
                      ) : (
                        <span style={{ color: '#6B7280', fontSize: '11px' }}>None</span>
                      )}
                    </td>

                    {/* PDC Score */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontWeight: '800',
                          fontFamily: 'JetBrains Mono, monospace',
                          color: lead.scoreClassification === 'HOT' ? '#F87171' : (lead.scoreClassification === 'WARM' ? '#FBBF24' : '#9CA3AF')
                        }}>
                          {lead.score}
                        </span>
                        <Badge value={lead.scoreClassification} size="sm" />
                      </div>
                    </td>

                    {/* Stage */}
                    <td>
                      <Badge value={lead.stage} size="sm" />
                    </td>

                    {/* Recommended Service */}
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', color: '#9CA3AF', fontSize: '12px' }}>
                      {primaryService}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 4px' }}>
        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
          Showing page {page} of {totalPages} ({totalLeads} leads)
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary btn-sm"
          >
            <FiChevronLeft /> Previous
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-secondary btn-sm"
          >
            Next <FiChevronRight />
          </button>
        </div>
      </div>

      {/* Lead Details Drawer */}
      <Drawer
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        title={selectedLead?.businessName || 'Lead Details'}
        subtitle={`PDC Lead Intelligence Profile | Stage: ${selectedLead?.stage || 'NEW'}`}
        width="740px"
      >
        {selectedLead && (
          <LeadDetails
            lead={selectedLead}
            onUpdate={(updated) => {
              setLeads(prev => prev.map(l => l._id === updated._id ? updated : l));
            }}
            onClose={() => setSelectedLead(null)}
          />
        )}
      </Drawer>

      {/* Bulk Stage Modal */}
      <Modal
        isOpen={bulkStageModalOpen}
        onClose={() => setBulkStageModalOpen(false)}
        title={`Bulk Update Stage for ${selectedIds.size} Leads`}
      >
        <div>
          <div className="form-group">
            <label>Select New Pipeline Stage</label>
            <select
              className="select-control"
              value={bulkStageValue}
              onChange={(e) => setBulkStageValue(e.target.value)}
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setBulkStageModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleBulkStageUpdate}
            >
              Apply to {selectedIds.size} Leads
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
