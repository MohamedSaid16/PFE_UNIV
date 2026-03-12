import React from 'react';
import ModulePlaceholderPage from '../../components/common/ModulePlaceholderPage';

const Decisions = () => (
  <ModulePlaceholderPage
    eyebrow="Committee Member Workspace"
    title="Decisions"
    description="The Decisions module now has a polished dashboard layout and is ready for the next implementation step. Connect the backend workflow and operational actions when this feature's business rules are finalized."
    stats={[
      { label: 'Status', value: 'UI Ready' },
      { label: 'Access', value: 'Role Scoped' },
      { label: 'Data', value: 'Pending API' },
    ]}
    checklist={[
      'Connect the backend endpoint for this module.',
      'Add real filters, tables, or workflow actions.',
      'Translate labels and validation messages for all supported languages.',
    ]}
    accent="warning"
  />
);

export default Decisions;
