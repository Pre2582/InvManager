/**
 * Validate an email address format.
 * @param {string} email
 */
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Validate a phone number (allows +, spaces, dashes, digits).
 * @param {string} phone
 */
export const isValidPhone = (phone) =>
  /^[\+\d\s\-\(\)]{7,20}$/.test(phone);

/**
 * Validate that a number is a positive decimal.
 * @param {string|number} value
 */
export const isPositiveNumber = (value) =>
  !isNaN(value) && Number(value) > 0;

/**
 * Validate that a number is a non-negative integer.
 * @param {string|number} value
 */
export const isNonNegativeInt = (value) =>
  Number.isInteger(Number(value)) && Number(value) >= 0;

/**
 * Return the first validation error message for a product form, or null.
 * @param {{ name, sku, price, quantity }} fields
 */
export const validateProduct = ({ name, sku, price, quantity }) => {
  if (!name?.trim()) return 'Product name is required.';
  if (!sku?.trim()) return 'SKU is required.';
  if (!isPositiveNumber(price)) return 'Price must be a positive number.';
  if (!isNonNegativeInt(quantity)) return 'Quantity must be a non-negative integer.';
  return null;
};

/**
 * Return the first validation error message for a customer form, or null.
 * @param {{ full_name, email, phone }} fields
 */
export const validateCustomer = ({ full_name, email, phone }) => {
  if (!full_name?.trim()) return 'Full name is required.';
  if (!isValidEmail(email)) return 'A valid email address is required.';
  if (!isValidPhone(phone)) return 'A valid phone number is required.';
  return null;
};

/**
 * Return the first validation error for an order form, or null.
 * @param {{ customer_id, items }} fields
 */
export const validateOrder = ({ customer_id, items }) => {
  if (!customer_id) return 'Please select a customer.';
  if (!items || items.length === 0) return 'Add at least one product.';
  for (const item of items) {
    if (!item.product_id) return 'Please select a product for each line item.';
    if (!isNonNegativeInt(item.quantity) || Number(item.quantity) < 1)
      return 'Quantity must be at least 1 for each line item.';
  }
  return null;
};
