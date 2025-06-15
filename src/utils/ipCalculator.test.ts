import { describe, expect, it } from 'vitest';
import {
  calculateSubnet,
  ipToNumber,
  numberToIp,
  validateCIDR,
} from './ipCalculator';

describe('IP Calculator', () => {
  describe('validateCIDR', () => {
    it('should validate correct CIDR notation', () => {
      const result = validateCIDR('192.168.1.0/24');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid CIDR notation', () => {
      const result = validateCIDR('invalid');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject invalid prefix length', () => {
      const result = validateCIDR('192.168.1.0/33');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('between 0 and 32');
    });
  });

  describe('ipToNumber', () => {
    it('should convert IP to number correctly', () => {
      expect(ipToNumber('192.168.1.1')).toBe(3232235777);
      expect(ipToNumber('0.0.0.0')).toBe(0);
      expect(ipToNumber('255.255.255.255')).toBe(4294967295);
    });
  });

  describe('numberToIp', () => {
    it('should convert number to IP correctly', () => {
      expect(numberToIp(3232235777)).toBe('192.168.1.1');
      expect(numberToIp(0)).toBe('0.0.0.0');
      expect(numberToIp(4294967295)).toBe('255.255.255.255');
    });
  });

  describe('calculateSubnet', () => {
    it('should calculate subnet correctly', () => {
      const subnet = calculateSubnet('192.168.1.0/24', '#FF0000');

      expect(subnet.cidr).toBe('192.168.1.0/24');
      expect(subnet.networkAddress).toBe('192.168.1.0');
      expect(subnet.broadcastAddress).toBe('192.168.1.255');
      expect(subnet.subnetMask).toBe('255.255.255.0');
      expect(subnet.availableHosts).toBe(254);
      expect(subnet.firstHost).toBe('192.168.1.1');
      expect(subnet.lastHost).toBe('192.168.1.254');
      expect(subnet.color).toBe('#FF0000');
    });
  });
});
