import React, { useState, useEffect } from 'react';
import { leadApi } from '../../services/leadApi';
import { useToast } from '../../context/ToastContext';
import { KanbanBoard } from '../../components/Kanban/KanbanBoard';
import { Drawer } from '../../components/Common/Drawer';
import { LeadDetails } from '../LeadDetails/LeadDetails';
import { FiTrello, FiFilter, FiSearch } from 'react-icons/fi';

export const Pipeline = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);

  const { addToast } = useToast();

  const fetchLeads = async () => {
    try {
      const res = await leadApi.getLeads({ limit: 200 });
      if (res.data?.success) {
        setLeads(res.data.leads);
      }
    } catch (err) {
      addToast('Failed to load pipeline leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDropLead = async (leadId, newStage) => {
    // Optimistic UI update
    setLeads(prev => prev.map(l => l._id === leadId ? { ...l, stage: newStage } : l));

    try {
      await leadApi.updateLead(leadId, { stage: newStage });
      addToast(`Moved lead to '${newStage}'`, 'success');
    } catch (err) {
      addToast('Failed to update stage on server', 'error');
      fetchLeads(); // rollback
    }
  };

  const filteredLeads = leads.filter(l => {
    if (category !== 'ALL' && l.category !== category) return false;
    if (search && !l.businessName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60A5FA', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
            <FiTrello /> PDC OUTREACH PIPELINE
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>
            Pipeline Kanban CRM
          </h1>
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
            Drag and drop leads between the 12 stages to track outreach progress.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <FiSearch style={{ position: 'absolute', left: '10px', top: '11px', color: '#6B7280' }} />
            <input
              type="text"
              className="input-control"
              placeholder="Search in pipeline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '32px', height: '36px' }}
            />
          </div>

          <select
            className="select-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '160px', height: '36px' }}
          >
            <option value="ALL">All Industries</option>
            <option value="Gym">Gyms</option>
            <option value="Restaurant">Restaurants</option>
            <option value="Clinic">Clinics</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Salon">Salons</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ flex: 1, minHeight: 'calc(100vh - 240px)' }}>
        <KanbanBoard
          leads={filteredLeads}
          onDropLead={handleDropLead}
          onSelectLead={(lead) => setSelectedLead(lead)}
        />
      </div>

      {/* Lead Details Drawer */}
      <Drawer
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        title={selectedLead?.businessName || 'Lead Details'}
        subtitle={`Stage: ${selectedLead?.stage}`}
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
    </div>
  );
};
