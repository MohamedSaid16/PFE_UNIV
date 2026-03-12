import React from 'react';
import ModulePlaceholderPage from '../../components/common/ModulePlaceholderPage';

const MyCourses = () => (
  <ModulePlaceholderPage
    eyebrow="Student Workspace"
    title="My Courses"
    description="The My Courses module now has a polished dashboard layout and is ready for the next implementation step. Connect the backend workflow and operational actions when this feature's business rules are finalized."
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
    accent="success"
  />
);

export default MyCourses;
