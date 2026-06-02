import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  color = 'primary', // 'primary' | 'success' | 'warning' | 'danger' | 'accent'
}) => {
  const getColorVars = () => {
    switch (color) {
      case 'success':
        return {
          bg: 'var(--success-glow)',
          border: 'var(--success-border)',
          text: 'var(--success)',
        };
      case 'warning':
        return {
          bg: 'var(--warning-glow)',
          border: 'var(--warning-border)',
          text: 'var(--warning)',
        };
      case 'danger':
        return {
          bg: 'var(--danger-glow)',
          border: 'var(--danger-border)',
          text: 'var(--danger)',
        };
      case 'accent':
        return {
          bg: 'rgba(139, 92, 246, 0.1)',
          border: 'rgba(139, 92, 246, 0.25)',
          text: 'var(--accent)',
        };
      default:
        return {
          bg: 'var(--primary-glow)',
          border: 'rgba(59, 130, 246, 0.25)',
          text: 'var(--primary)',
        };
    }
  };

  const colors = getColorVars();

  const getTrendStyle = () => {
    if (trendType === 'positive') return { color: 'var(--success)', bg: 'var(--success-glow)' };
    if (trendType === 'negative') return { color: 'var(--danger)', bg: 'var(--danger-glow)' };
    return { color: 'var(--text-muted)', bg: 'var(--bg-tertiary)' };
  };

  const trendStyle = getTrendStyle();

  return (
    <motion.div
      className="glass-card"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: colors.bg,
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem', letterSpacing: '-0.03em' }}>
            {value}
          </h2>
        </div>
        {Icon && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {trend && (
          <span
            className="badge"
            style={{
              backgroundColor: trendStyle.bg,
              color: trendStyle.color,
              padding: '0.15rem 0.5rem',
              fontSize: '0.75rem',
            }}
          >
            {trend}
          </span>
        )}
        {description && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {description}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
