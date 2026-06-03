/**
 * Format a number as a USD currency string.
 * @param {number|string} value
 */
export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number(value) || 0
  );

/**
 * Format an ISO date string to a readable locale date.
 * @param {string} isoString
 */
export const formatDate = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format an ISO date string to a readable locale date-time.
 * @param {string} isoString
 */
export const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Truncate a UUID to a short display string.
 * @param {string} uuid
 */
export const shortId = (uuid) => (uuid ? `#${uuid.slice(0, 8).toUpperCase()}` : '—');

/**
 * Capitalise the first letter of a string.
 * @param {string} str
 */
export const capitalise = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

/**
 * Return the OrderStatus colour class for badge rendering.
 * @param {'pending'|'confirmed'|'cancelled'} status
 */
export const statusVariant = (status) => {
  const map = {
    pending:   'warning',
    confirmed: 'primary',
    delivered: 'success',
    cancelled: 'danger',
  };
  return map[status?.toLowerCase()] || 'primary';
};
