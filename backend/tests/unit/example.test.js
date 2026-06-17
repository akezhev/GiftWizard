const { isValidEmail, isValidAge, validatePassword } = require('../../src/utils/validators');

describe('Validators', () => {
  describe('isValidEmail', () => {
    test('should return true for valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });
    
    test('should return false for invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });
  
  describe('isValidAge', () => {
    test('should return true for valid age', () => {
      expect(isValidAge(25)).toBe(true);
      expect(isValidAge(1)).toBe(true);
      expect(isValidAge(120)).toBe(true);
    });
    
    test('should return false for invalid age', () => {
      expect(isValidAge(0)).toBe(false);
      expect(isValidAge(121)).toBe(false);
      expect(isValidAge(-5)).toBe(false);
    });
  });
  
  describe('validatePassword', () => {
    test('should validate strong password', () => {
      const result = validatePassword('StrongP@ssw0rd');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('should reject weak password', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});