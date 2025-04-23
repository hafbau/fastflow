/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code (default: USD)
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currencyCode = 'USD') {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency',
    currency: currencyCode
  }).format(amount);
}

/**
 * Calculate tax amount based on percentage
 * @param {number} amount - Base amount
 * @param {number} taxRate - Tax rate as percentage (e.g., 5 for 5%)
 * @returns {number} Tax amount
 */
function calculateTax(amount, taxRate) {
  return (amount * taxRate) / 100;
}

module.exports = {
  formatCurrency,
  calculateTax
}; 