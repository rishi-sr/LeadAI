import React, { useState, useEffect } from 'react';
import { outreachApi, leadApi } from '../../services/serviceIndex';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/Common/Badge';
import { Modal } from '../../components/Common/Modal';
import { TableSkeleton } from '../../components/Common/Skeleton';
import {
  FiSend,
  FiPlus,
  FiPhone,
  FiMail,
  FiInstagram,
  FiCalendar,
  FiMessageSquare,
  FiClock,
  FiCheckCircle
} from 'react-icons/fi';

export const OutreachTracker = () => {
  const [outreaches, setOutreaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // New Outreach Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [leadsList, setLeadsList] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [channel, setChannel] = useState('WhatsApp');
  const [message, setMessage] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [status, setStatus] = useState('Sent');
  const [notes, setNotes] = useState('');

  const { addToast } = useToast();

  const fetchOutreaches = async () => {
    setLoading(true);
    try {
      const params = {
        channel: channelFilter !== 'ALL' ? channelFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      };
      const res = await outreachApi.getOutreaches(params);
      if (res.data?.success) {
        setOutreaches(res.data.outreaches);
      }
    } catch (err) {
      addToast('Failed to load outreach logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutreaches();
  }, [channelFilter, statusFilter]);

  const openNewOutreachModal = async () => {
    try {
      const res = await leadApi.getLeads({ limit: 100 });
      if (res.data?.success) {
        setLeadsList(res.data.leads);
        if (res.data.leads.length > 0) {
          setSelectedLeadId(res.data.leads[0]._id);
          setMessage(res.data.leads[0].whatsappMessage || '');
        }
      }
      setModalOpen(true);
    } catch (err) {
      addToast('Failed to load leads list', 'error');
    }
  };

  const handleLeadSelectChange = (id) => {
    setSelectedLeadId(id);
    const found = leadsList.find(l => l._id === id);
    if (found) {
      if (channel === 'WhatsApp') setMessage(found.whatsappMessage || '');
      else if (channel === 'Instagram') setMessage(found.instagramMessage || '');
      else if (channel === 'Email') setMessage(found.emailMessage || '');
    }
  };

  const handleCreateOutreach = async (e) => {
    e.preventDefault();
    if (!selectedLeadId || !message.trim()) {
      addToast('Please select a lead and enter message', 'error');
      return;
    }

    try {
      await outreachApi.createOutreach({
        leadId: selectedLeadId,
        channel,
        message: message.trim(),
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        status,
        notes
      });
      addToast('Outreach logged successfully', 'success');
      setModalOpen(false);
      setMessage('');
      setNotes('');
      fetchOutreaches();
    } catch (err) {
      addToast('Failed to log outreach', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60A5FA', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
            <FiSend /> CRM OUTREACH COMMUNICATIONS
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>
            Outreach Tracker
          </h1>
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
            Track client messages across WhatsApp, Instagram, Email, and follow-up schedules.
          </p>
        </div>

        <button onClick={openNewOutreachModal} className="btn btn-primary">
          <FiPlus /> Log Communication
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#9CA3AF' }}>Channel:</span>
          <select
            className="select-control"
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            style={{ width: '160px', padding: '6px 28px 6px 10px', fontSize: '12px' }}
          >
            <option value="ALL">All Channels</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Instagram">Instagram</option>
            <option value="Email">Email</option>
            <option value="Phone">Phone</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#9CA3AF' }}>Status:</span>
          <select
            className="select-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '160px', padding: '6px 28px 6px 10px', fontSize: '12px' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Sent">Sent</option>
            <option value="Replied">Replied</option>
            <option value="Call Scheduled">Call Scheduled</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : outreaches.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>
              No communications logged yet
            </div>
            <p style={{ fontSize: '12px' }}>Click "Log Communication" or log directly from any lead detail drawer.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Target Business</th>
                <th>Channel</th>
                <th>Message Content</th>
                <th>Response / Follow-up</th>
                <th>Status</th>
                <th>Logged By</th>
              </tr>
            </thead>
            <tbody>
              {outreaches.map((item) => {
                const lead = item.leadId || {};
                return (
                  <tr key={item._id}>
                    <td style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'JetBrains Mono, monospace' }}>
                      {new Date(item.sentAt).toLocaleString()}
                    </td>
                    <td>
                      <strong style={{ color: '#FFFFFF' }}>{lead.businessName || 'Business Lead'}</strong>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>
                        {lead.category} • {lead.phone}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: item.channel === 'WhatsApp' ? 'rgba(37, 211, 102, 0.12)' : (item.channel === 'Instagram' ? 'rgba(225, 48, 108, 0.12)' : 'rgba(59, 130, 246, 0.12)'),
                        color: item.channel === 'WhatsApp' ? '#25D366' : (item.channel === 'Instagram' ? '#E1306C' : '#60A5FA')
                      }}>
                        {item.channel}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', color: '#D1D5DB', fontSize: '12px' }}>
                      {item.message}
                    </td>
                    <td>
                      {item.followUpDate ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontSize: '11px' }}>
                          <FiCalendar /> Follow-up: {new Date(item.followUpDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span style={{ color: '#6B7280', fontSize: '11px' }}>None scheduled</span>
                      )}
                    </td>
                    <td>
                      <Badge value={item.status} size="sm" />
                    </td>
                    <td style={{ fontSize: '11px', color: '#9CA3AF' }}>
                      {item.handledBy || 'PDC Agent'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Log Outreach Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Direct Outreach Interaction"
      >
        <form onSubmit={handleCreateOutreach}>
          <div className="form-group">
            <label>Select Target Lead</label>
            <select
              className="select-control"
              value={selectedLeadId}
              onChange={(e) => handleLeadSelectChange(e.target.value)}
            >
              {leadsList.map(l => (
                <option key={l._id} value={l._id}>
                  {l.businessName} ({l.category} - {l.scoreClassification} {l.score}pts)
                </option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Communication Channel</label>
              <select
                className="select-control"
                value={channel}
                onChange={(e) => {
                  setChannel(e.target.value);
                  handleLeadSelectChange(selectedLeadId);
                }}
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Instagram">Instagram DM</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone Call</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Initial Status</label>
              <select
                className="select-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Sent">Sent</option>
                <option value="Replied">Replied</option>
                <option value="Call Scheduled">Call Scheduled</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Won">Won</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Message Content Sent</label>
            <textarea
              className="input-control"
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Schedule Follow-up Date (Optional)</label>
            <input
              type="date"
              className="input-control"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Save Interaction
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
