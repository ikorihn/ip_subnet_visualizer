import type { Subnet, SubnetConflict, ValidationResult } from '../types/subnet';

export class IPCalculator {
  static validateCIDR(cidr: string): ValidationResult {
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;

    if (!cidrRegex.test(cidr)) {
      return {
        isValid: false,
        error: 'Invalid CIDR notation (e.g., 192.168.1.0/24)',
      };
    }

    const [ip, prefixStr] = cidr.split('/');
    const prefix = Number.parseInt(prefixStr, 10);

    if (prefix < 0 || prefix > 32) {
      return {
        isValid: false,
        error: 'Prefix length must be between 0 and 32',
      };
    }

    const octets = ip.split('.').map((octet) => Number.parseInt(octet, 10));

    if (octets.some((octet) => octet < 0 || octet > 255)) {
      return {
        isValid: false,
        error: 'Each octet must be between 0 and 255',
      };
    }

    return { isValid: true };
  }

  static ipToNumber(ip: string): number {
    return (
      ip
        .split('.')
        .map((octet) => Number.parseInt(octet, 10))
        .reduce((acc, octet) => (acc << 8) + octet, 0) >>> 0
    );
  }

  static numberToIp(num: number): string {
    return [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255,
    ].join('.');
  }

  static calculateSubnet(cidr: string, color: string): Subnet {
    const [ip, prefixStr] = cidr.split('/');
    const prefix = Number.parseInt(prefixStr, 10);

    const ipNum = this.ipToNumber(ip);
    const subnetMask = (0xffffffff << (32 - prefix)) >>> 0;
    const networkNum = (ipNum & subnetMask) >>> 0;
    const broadcastNum = (networkNum | (0xffffffff >>> prefix)) >>> 0;

    const availableHosts = Math.max(0, Math.pow(2, 32 - prefix) - 2);
    const firstHostNum = networkNum + 1;
    const lastHostNum = broadcastNum - 1;

    return {
      id: crypto.randomUUID(),
      cidr,
      networkAddress: this.numberToIp(networkNum),
      broadcastAddress: this.numberToIp(broadcastNum),
      subnetMask: this.numberToIp(subnetMask),
      availableHosts,
      firstHost:
        availableHosts > 0
          ? this.numberToIp(firstHostNum)
          : this.numberToIp(networkNum),
      lastHost:
        availableHosts > 0
          ? this.numberToIp(lastHostNum)
          : this.numberToIp(networkNum),
      color,
      startValue: networkNum,
      endValue: broadcastNum,
    };
  }

  static detectConflicts(subnets: Subnet[]): SubnetConflict[] {
    const conflicts: SubnetConflict[] = [];

    for (let i = 0; i < subnets.length; i++) {
      for (let j = i + 1; j < subnets.length; j++) {
        const subnet1 = subnets[i];
        const subnet2 = subnets[j];

        if (
          subnet1.startValue === subnet2.startValue &&
          subnet1.endValue === subnet2.endValue
        ) {
          conflicts.push({
            subnet1,
            subnet2,
            type: 'identical',
          });
        } else if (
          (subnet1.startValue <= subnet2.startValue &&
            subnet2.startValue <= subnet1.endValue) ||
          (subnet2.startValue <= subnet1.startValue &&
            subnet1.startValue <= subnet2.endValue)
        ) {
          conflicts.push({
            subnet1,
            subnet2,
            type: 'overlap',
          });
        }
      }
    }

    return conflicts;
  }

  static isIPInSubnet(ip: string, subnet: Subnet): boolean {
    const ipNum = this.ipToNumber(ip);
    return ipNum >= subnet.startValue && ipNum <= subnet.endValue;
  }

  static generateColors(count: number): string[] {
    const colors = [
      '#3B82F6',
      '#EF4444',
      '#10B981',
      '#F59E0B',
      '#8B5CF6',
      '#EC4899',
      '#06B6D4',
      '#84CC16',
      '#F97316',
      '#6366F1',
    ];

    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  }
}
