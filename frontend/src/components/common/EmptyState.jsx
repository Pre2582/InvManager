import React from 'react';
import { Database } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Database,
  title = 'No data found',
  description = 'There are no records to display at this time.',
  action,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'rgba(20, 26, 41, 0.2)',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--border-color)',
        gap: '1rem',
      }}
    >
      <div
        style={{
          padding: '1rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={32} />
      </div>
      <div>
        <h4 style={{ marginBottom: '0.25rem' }}>{title}</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{description}</p>
      </div>
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
};

export default EmptyState;
