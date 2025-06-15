import { describe, expect, it } from 'vitest';
import {
  calculateSubnet,
  calculateSubnetsFromRange,
  calculateUnusedRanges,
  findSupernetOpportunities,
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

  describe('findSupernetOpportunities', () => {
    it('should return empty array for no subnets', () => {
      const suggestions = findSupernetOpportunities([]);
      expect(suggestions).toEqual([]);
    });

    it('should return empty array for single subnet', () => {
      const subnet = calculateSubnet('192.168.1.0/24', '#FF0000');
      const suggestions = findSupernetOpportunities([subnet]);
      expect(suggestions).toEqual([]);
    });

    it('should suggest supernet for two adjacent /25 subnets', () => {
      const subnet1 = calculateSubnet('192.168.1.0/25', '#FF0000');
      const subnet2 = calculateSubnet('192.168.1.128/25', '#00FF00');
      const suggestions = findSupernetOpportunities([subnet1, subnet2]);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].suggestedSupernet).toBe('192.168.1.0/24');
      expect(suggestions[0].originalSubnets).toHaveLength(2);
      expect(suggestions[0].efficiency).toBe(100); // 完全に効率的
      expect(suggestions[0].savedAddresses).toBe(0); // ギャップなし
    });

    it('should suggest supernet for two adjacent /26 subnets', () => {
      const subnet1 = calculateSubnet('192.168.1.0/26', '#FF0000');
      const subnet2 = calculateSubnet('192.168.1.64/26', '#00FF00');
      const suggestions = findSupernetOpportunities([subnet1, subnet2]);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].suggestedSupernet).toBe('192.168.1.0/25');
      expect(suggestions[0].originalSubnets).toHaveLength(2);
      expect(suggestions[0].efficiency).toBe(100);
    });

    it('should not suggest supernet for non-adjacent subnets', () => {
      const subnet1 = calculateSubnet('192.168.1.0/25', '#FF0000');
      const subnet2 = calculateSubnet('192.168.2.0/25', '#00FF00');
      const suggestions = findSupernetOpportunities([subnet1, subnet2]);

      expect(suggestions).toEqual([]);
    });

    it('should not suggest supernet for different prefix lengths', () => {
      const subnet1 = calculateSubnet('192.168.1.0/24', '#FF0000');
      const subnet2 = calculateSubnet('192.168.2.0/25', '#00FF00');
      const suggestions = findSupernetOpportunities([subnet1, subnet2]);

      expect(suggestions).toEqual([]);
    });

    it('should suggest supernet for four consecutive /26 subnets', () => {
      const subnet1 = calculateSubnet('192.168.1.0/26', '#FF0000');
      const subnet2 = calculateSubnet('192.168.1.64/26', '#00FF00');
      const subnet3 = calculateSubnet('192.168.1.128/26', '#0000FF');
      const subnet4 = calculateSubnet('192.168.1.192/26', '#FFFF00');
      const suggestions = findSupernetOpportunities([
        subnet1,
        subnet2,
        subnet3,
        subnet4,
      ]);

      // 2つずつのペアと4つ全体の提案があるはず
      expect(suggestions.length).toBeGreaterThan(0);

      // 4つ全体を集約した提案を見つける
      const fullGroupSuggestion = suggestions.find(
        (s) => s.originalSubnets.length === 4
      );
      expect(fullGroupSuggestion).toBeDefined();
      expect(fullGroupSuggestion?.suggestedSupernet).toBe('192.168.1.0/24');
    });

    it('should handle mixed scenarios with multiple suggestions', () => {
      const subnet1 = calculateSubnet('192.168.1.0/25', '#FF0000');
      const subnet2 = calculateSubnet('192.168.1.128/25', '#00FF00');
      const subnet3 = calculateSubnet('192.168.2.0/26', '#0000FF');
      const subnet4 = calculateSubnet('192.168.2.64/26', '#FFFF00');
      const suggestions = findSupernetOpportunities([
        subnet1,
        subnet2,
        subnet3,
        subnet4,
      ]);

      expect(suggestions.length).toBeGreaterThanOrEqual(2);

      // /24 の提案
      const suggestion1 = suggestions.find(
        (s) => s.suggestedSupernet === '192.168.1.0/24'
      );
      expect(suggestion1).toBeDefined();

      // /25 の提案
      const suggestion2 = suggestions.find(
        (s) => s.suggestedSupernet === '192.168.2.0/25'
      );
      expect(suggestion2).toBeDefined();
    });

    it('should calculate efficiency correctly for partial coverage', () => {
      // 隣接していないが同じスーパーネット内の2つのサブネット
      const subnet1 = calculateSubnet('192.168.1.0/26', '#FF0000'); // 64 addresses
      const subnet2 = calculateSubnet('192.168.1.128/26', '#00FF00'); // 64 addresses
      // 192.168.1.64/26 が抜けている状態

      const suggestions = findSupernetOpportunities([subnet1, subnet2]);

      // この場合は隣接していないので提案されないはず
      expect(suggestions).toEqual([]);
    });

    it('should sort suggestions by efficiency', () => {
      const subnet1 = calculateSubnet('192.168.1.0/25', '#FF0000');
      const subnet2 = calculateSubnet('192.168.1.128/25', '#00FF00');
      const subnet3 = calculateSubnet('192.168.2.0/26', '#0000FF');
      const subnet4 = calculateSubnet('192.168.2.64/26', '#FFFF00');
      const suggestions = findSupernetOpportunities([
        subnet1,
        subnet2,
        subnet3,
        subnet4,
      ]);

      // 効率性で降順ソートされているかチェック
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i - 1].efficiency).toBeGreaterThanOrEqual(
          suggestions[i].efficiency
        );
      }
    });

    it('should suggest supernet for adjacent /24 networks', () => {
      const subnet1 = calculateSubnet('192.168.0.0/24', '#FF0000');
      const subnet2 = calculateSubnet('192.168.1.0/24', '#00FF00');
      const suggestions = findSupernetOpportunities([subnet1, subnet2]);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].suggestedSupernet).toBe('192.168.0.0/23');
      expect(suggestions[0].originalSubnets).toHaveLength(2);
      expect(suggestions[0].efficiency).toBe(100); // 完全に効率的
      expect(suggestions[0].savedAddresses).toBe(0); // ギャップなし
    });

    it('should suggest supernet for adjacent /23 networks', () => {
      const subnet1 = calculateSubnet('192.168.0.0/23', '#FF0000');
      const subnet2 = calculateSubnet('192.168.2.0/23', '#00FF00');
      const suggestions = findSupernetOpportunities([subnet1, subnet2]);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].suggestedSupernet).toBe('192.168.0.0/22');
      expect(suggestions[0].originalSubnets).toHaveLength(2);
      expect(suggestions[0].efficiency).toBe(100);
    });

    it('should not suggest supernet for non-adjacent /24 networks', () => {
      const subnet1 = calculateSubnet('192.168.1.0/24', '#FF0000');
      const subnet2 = calculateSubnet('192.168.3.0/24', '#00FF00'); // 192.168.2.0/24 is missing
      const suggestions = findSupernetOpportunities([subnet1, subnet2]);

      expect(suggestions).toEqual([]);
    });

    it('should suggest supernet for 10.0.0.0/24 and 10.0.1.0/24', () => {
      const subnet1 = calculateSubnet('10.0.0.0/24', '#FF0000');
      const subnet2 = calculateSubnet('10.0.1.0/24', '#00FF00');
      const suggestions = findSupernetOpportunities([subnet1, subnet2]);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].suggestedSupernet).toBe('10.0.0.0/23');
      expect(suggestions[0].efficiency).toBe(100);
    });

    it('should handle boundary cases correctly', () => {
      const subnet1 = calculateSubnet('192.168.254.0/24', '#FF0000');
      const subnet2 = calculateSubnet('192.168.255.0/24', '#00FF00');
      const suggestions = findSupernetOpportunities([subnet1, subnet2]);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].suggestedSupernet).toBe('192.168.254.0/23');
    });

    // Note: 192.168.1.0/24 と 192.168.2.0/24 の間にはギャップがあります
    // 192.168.1.255 の次は 192.168.2.0 なので実際には隣接しています
  });
});
