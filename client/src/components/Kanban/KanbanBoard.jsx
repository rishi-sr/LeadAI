import React from 'react';
import { KanbanColumn } from './KanbanColumn';

export const PIPELINE_STAGES = [
  'NEW',
  'RESEARCHED',
  'HOT',
  'WARM',
  'CONTACTED',
  'REPLIED',
  'CALL SCHEDULED',
  'PROPOSAL SENT',
  'NEGOTIATION',
  'WON',
  'LOST',
  'NOT INTERESTED'
];

export const KanbanBoard = ({ leads = [], onDropLead, onSelectLead }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '14px',
      overflowX: 'auto',
      paddingBottom: '20px',
      alignItems: 'flex-start'
    }}>
      {PIPELINE_STAGES.map((stage) => {
        const stageLeads = leads.filter(l => l.stage === stage);
        return (
          <KanbanColumn
            key={stage}
            stage={stage}
            leads={stageLeads}
            onDropLead={onDropLead}
            onSelectLead={onSelectLead}
          />
        );
      })}
    </div>
  );
};
