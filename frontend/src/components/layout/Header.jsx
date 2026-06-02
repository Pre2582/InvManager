import React from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Header = ({ title }) => {
  const currentDate = format(new Date(), 'EEEE, MMMM dd, yyyy');

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'rgba(13, 17, 27, 0.4)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 90,
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
          {title}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        <Calendar size={16} style={{ color: 'var(--primary)' }} />
        <span>{currentDate}</span>
      </div>
    </header>
  );
};

export default Header;
