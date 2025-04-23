const { formatCurrency, calculateTax } = require('./Utility');

describe('Utility functions', () => {
  describe('formatCurrency', () => {
    it('should format amount as USD by default', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
    });

    it('should format amount with specified currency code', () => {
      expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
    });

    it('should handle decimal values', () => {
      expect(formatCurrency(1000.50)).toBe('$1,000.50');
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax correctly', () => {
      expect(calculateTax(100, 10)).toBe(10);
    });

    it('should handle zero tax rate', () => {
      expect(calculateTax(100, 0)).toBe(0);
    });

    it('should handle decimal tax rates', () => {
      expect(calculateTax(100, 7.5)).toBe(7.5);
    });
  });
}); 