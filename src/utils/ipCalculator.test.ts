import { describe, expect, it } from 'vitest';
import {
  calculateSubnet,
  calculateSubnetsFromRange,
  calculateUnusedRanges,
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

  describe('calculateSubnetsFromRange', () => {
    it('should calculate single /24 subnet for exact range', () => {
      const startValue = ipToNumber('192.168.1.0');
      const endValue = ipToNumber('192.168.1.255');
      const subnets = calculateSubnetsFromRange(startValue, endValue);

      expect(subnets).toEqual(['192.168.1.0/24']);
    });

    it('should calculate single /30 subnet for 4 addresses', () => {
      const startValue = ipToNumber('192.168.1.0');
      const endValue = ipToNumber('192.168.1.3');
      const subnets = calculateSubnetsFromRange(startValue, endValue);

      expect(subnets).toEqual(['192.168.1.0/30']);
    });

    it('should calculate multiple subnets for non-power-of-2 range', () => {
      const startValue = ipToNumber('192.168.1.1');
      const endValue = ipToNumber('192.168.1.10');
      const subnets = calculateSubnetsFromRange(startValue, endValue);

      // 10 addresses starting from 192.168.1.1
      expect(subnets.length).toBeGreaterThan(1);
      expect(subnets).toContain('192.168.1.1/32');
    });

    it('should calculate subnets for range crossing byte boundary', () => {
      const startValue = ipToNumber('192.168.1.250');
      const endValue = ipToNumber('192.168.2.5');
      const subnets = calculateSubnetsFromRange(startValue, endValue);

      expect(subnets.length).toBeGreaterThan(1);
      // Should include addresses across the boundary
      expect(subnets.some((subnet) => subnet.includes('192.168.1.'))).toBe(
        true
      );
      expect(subnets.some((subnet) => subnet.includes('192.168.2.'))).toBe(
        true
      );
    });

    it('should handle single address range', () => {
      const startValue = ipToNumber('192.168.1.100');
      const endValue = ipToNumber('192.168.1.100');
      const subnets = calculateSubnetsFromRange(startValue, endValue);

      expect(subnets).toEqual(['192.168.1.100/32']);
    });
  });

  describe('calculateUnusedRanges', () => {
    it('should return empty array for no subnets', () => {
      const unusedRanges = calculateUnusedRanges([]);
      expect(unusedRanges).toEqual([]);
    });

    it('should return empty array for single subnet', () => {
      const subnet = calculateSubnet('192.168.1.0/24', '#FF0000');
      const unusedRanges = calculateUnusedRanges([subnet]);
      expect(unusedRanges).toEqual([]);
    });

    it('should calculate unused range between two subnets', () => {
      const subnet1 = calculateSubnet('192.168.1.0/24', '#FF0000');
      const subnet2 = calculateSubnet('192.168.3.0/24', '#00FF00');
      const unusedRanges = calculateUnusedRanges([subnet1, subnet2]);

      expect(unusedRanges).toHaveLength(1);
      expect(unusedRanges[0].startAddress).toBe('192.168.2.0');
      expect(unusedRanges[0].endAddress).toBe('192.168.2.255');
      expect(unusedRanges[0].size).toBe(256);
      expect(unusedRanges[0].subnets).toEqual(['192.168.2.0/24']);
    });

    it('should not include range for adjacent subnets', () => {
      const subnet1 = calculateSubnet('192.168.1.0/24', '#FF0000');
      const subnet2 = calculateSubnet('192.168.2.0/24', '#00FF00');
      const unusedRanges = calculateUnusedRanges([subnet1, subnet2]);

      expect(unusedRanges).toEqual([]);
    });

    it('should calculate multiple unused ranges', () => {
      const subnet1 = calculateSubnet('192.168.1.0/24', '#FF0000');
      const subnet2 = calculateSubnet('192.168.3.0/24', '#00FF00');
      const subnet3 = calculateSubnet('192.168.5.0/24', '#0000FF');
      const unusedRanges = calculateUnusedRanges([subnet1, subnet2, subnet3]);

      expect(unusedRanges).toHaveLength(2);
      // First gap: 192.168.2.0-192.168.2.255
      expect(unusedRanges[0].startAddress).toBe('192.168.2.0');
      expect(unusedRanges[0].endAddress).toBe('192.168.2.255');
      // Second gap: 192.168.4.0-192.168.4.255
      expect(unusedRanges[1].startAddress).toBe('192.168.4.0');
      expect(unusedRanges[1].endAddress).toBe('192.168.4.255');
    });
  });
});
