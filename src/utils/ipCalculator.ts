import type { Subnet, SubnetConflict, ValidationResult } from '../types/subnet';

export function validateCIDR(cidr: string): ValidationResult {
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

export function ipToNumber(ip: string): number {
  return (
    ip
      .split('.')
      .map((octet) => Number.parseInt(octet, 10))
      .reduce((acc, octet) => (acc << 8) + octet, 0) >>> 0
  );
}

export function numberToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join('.');
}

export function calculateSubnet(cidr: string, color: string): Subnet {
  const [ip, prefixStr] = cidr.split('/');
  const prefix = Number.parseInt(prefixStr, 10);

  const ipNum = ipToNumber(ip);
  const subnetMask = (0xffffffff << (32 - prefix)) >>> 0;
  const networkNum = (ipNum & subnetMask) >>> 0;
  const broadcastNum = (networkNum | (0xffffffff >>> prefix)) >>> 0;

  const availableHosts = Math.max(0, Math.pow(2, 32 - prefix) - 2);
  const firstHostNum = networkNum + 1;
  const lastHostNum = broadcastNum - 1;

  return {
    id: crypto.randomUUID(),
    cidr,
    networkAddress: numberToIp(networkNum),
    broadcastAddress: numberToIp(broadcastNum),
    subnetMask: numberToIp(subnetMask),
    availableHosts,
    firstHost:
      availableHosts > 0 ? numberToIp(firstHostNum) : numberToIp(networkNum),
    lastHost:
      availableHosts > 0 ? numberToIp(lastHostNum) : numberToIp(networkNum),
    color,
    startValue: networkNum,
    endValue: broadcastNum,
  };
}

export function detectConflicts(subnets: Subnet[]): SubnetConflict[] {
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

export function isIPInSubnet(ip: string, subnet: Subnet): boolean {
  const ipNum = ipToNumber(ip);
  return ipNum >= subnet.startValue && ipNum <= subnet.endValue;
}

export interface UnusedRange {
  startAddress: string;
  endAddress: string;
  startValue: number;
  endValue: number;
  size: number;
  subnets: string[];
}

export function calculateSubnetsFromRange(
  startValue: number,
  endValue: number
): string[] {
  const subnets: string[] = [];
  let current = startValue;

  while (current <= endValue) {
    const remaining = endValue - current + 1;

    // 最大のブロックサイズを見つける（2の累乗かつ、currentが境界に整列している）
    let blockSize = 1;
    let maxPossibleSize = 1;

    // currentが境界に整列している最大のブロックサイズを見つける
    for (let i = 0; i < 32; i++) {
      const size = 1 << i;
      if (size > remaining) break;
      if ((current & (size - 1)) === 0) {
        maxPossibleSize = size;
      } else {
        break;
      }
    }

    // 残りのサイズに収まる最大のブロックサイズを使用
    blockSize = maxPossibleSize;
    while (blockSize > remaining) {
      blockSize = blockSize >> 1;
    }

    // プレフィックス長を計算
    const prefixLength = 32 - Math.log2(blockSize);

    // サブネットCIDRを生成
    const networkAddress = numberToIp(current);
    subnets.push(`${networkAddress}/${prefixLength}`);

    current += blockSize;
  }

  return subnets;
}

export function calculateUnusedRanges(subnets: Subnet[]): UnusedRange[] {
  if (subnets.length === 0) return [];

  const sortedSubnets = [...subnets].sort(
    (a, b) => a.startValue - b.startValue
  );
  const unusedRanges: UnusedRange[] = [];

  for (let i = 0; i < sortedSubnets.length - 1; i++) {
    const currentSubnet = sortedSubnets[i];
    const nextSubnet = sortedSubnets[i + 1];

    if (currentSubnet.endValue + 1 < nextSubnet.startValue) {
      const startValue = currentSubnet.endValue + 1;
      const endValue = nextSubnet.startValue - 1;
      const size = endValue - startValue + 1;
      const subnets = calculateSubnetsFromRange(startValue, endValue);

      unusedRanges.push({
        startAddress: numberToIp(startValue),
        endAddress: numberToIp(endValue),
        startValue,
        endValue,
        size,
        subnets,
      });
    }
  }

  return unusedRanges;
}

export interface SupernetSuggestion {
  originalSubnets: Subnet[];
  suggestedSupernet: string;
  savedAddresses: number;
  efficiency: number;
}

export function findSupernetOpportunities(
  subnets: Subnet[]
): SupernetSuggestion[] {
  const suggestions: SupernetSuggestion[] = [];

  // すべてのサブネットペアをチェック
  for (let i = 0; i < subnets.length; i++) {
    for (let j = i + 1; j < subnets.length; j++) {
      const subnet1 = subnets[i];
      const subnet2 = subnets[j];

      // 隣接しているかチェック
      if (canBeCombined(subnet1, subnet2)) {
        const supernet = calculateSupernet(subnet1, subnet2);
        if (supernet) {
          const originalSize =
            subnet1.endValue -
            subnet1.startValue +
            1 +
            (subnet2.endValue - subnet2.startValue + 1);
          const supernetSize = Math.pow(2, 32 - supernet.prefixLength);
          const savedAddresses = supernetSize - originalSize;
          const efficiency = (originalSize / supernetSize) * 100;

          suggestions.push({
            originalSubnets: [subnet1, subnet2],
            suggestedSupernet: supernet.cidr,
            savedAddresses,
            efficiency,
          });
        }
      }
    }
  }

  // より大きなグループのスーパーネット化も検討
  const groupSuggestions = findGroupSupernetOpportunities(subnets);
  suggestions.push(...groupSuggestions);

  // 効率性でソート（効率が高い順）
  return suggestions.sort((a, b) => b.efficiency - a.efficiency);
}

function canBeCombined(subnet1: Subnet, subnet2: Subnet): boolean {
  const [, prefix1] = subnet1.cidr.split('/');
  const [, prefix2] = subnet2.cidr.split('/');

  // 同じプレフィックス長である必要がある
  if (prefix1 !== prefix2) return false;

  const prefixLength = Number.parseInt(prefix1, 10);

  // プレフィックス長が1以下の場合は結合不可
  if (prefixLength <= 1) return false;

  const blockSize = Math.pow(2, 32 - prefixLength);

  // 両方のサブネットが同じ上位ブロックに属しているかチェック
  const supernetPrefixLength = prefixLength - 1;
  const supernetMask = (0xffffffff << (32 - supernetPrefixLength)) >>> 0;

  const network1 = (subnet1.startValue & supernetMask) >>> 0;
  const network2 = (subnet2.startValue & supernetMask) >>> 0;

  // 同じスーパーネットに属している場合
  if (network1 === network2) {
    const diff = Math.abs(subnet1.startValue - subnet2.startValue);
    return diff === blockSize;
  }

  // 異なるスーパーネットでも隣接している場合はチェック
  // サブネットが隣接している（一方の終了アドレス+1が他方の開始アドレス）
  const isAdjacent =
    subnet1.endValue + 1 === subnet2.startValue ||
    subnet2.endValue + 1 === subnet1.startValue;

  if (isAdjacent) {
    // より大きなスーパーネットで境界が整列しているかチェック
    const minStart = Math.min(subnet1.startValue, subnet2.startValue);
    const maxEnd = Math.max(subnet1.endValue, subnet2.endValue);
    const totalSize = maxEnd - minStart + 1;

    // 結合後のサイズが2の累乗であり、境界が整列している場合のみ有効
    if (isPowerOfTwo(totalSize) && (minStart & (totalSize - 1)) === 0) {
      return true;
    }
  }

  return false;
}

function calculateSupernet(
  subnet1: Subnet,
  subnet2: Subnet
): { cidr: string; prefixLength: number } | null {
  const [, prefix] = subnet1.cidr.split('/');
  const prefixLength = Number.parseInt(prefix, 10);

  if (prefixLength <= 1) return null; // これ以上集約できない

  const minStart = Math.min(subnet1.startValue, subnet2.startValue);
  const maxEnd = Math.max(subnet1.endValue, subnet2.endValue);
  const totalSize = maxEnd - minStart + 1;

  // 結合後のサイズから適切なプレフィックス長を計算
  const supernetPrefixLength = 32 - Math.log2(totalSize);

  if (supernetPrefixLength < 1) return null;

  const supernetMask = (0xffffffff << (32 - supernetPrefixLength)) >>> 0;
  const networkAddress = (minStart & supernetMask) >>> 0;
  const cidr = `${numberToIp(networkAddress)}/${supernetPrefixLength}`;

  return { cidr, prefixLength: supernetPrefixLength };
}

function findGroupSupernetOpportunities(
  subnets: Subnet[]
): SupernetSuggestion[] {
  const suggestions: SupernetSuggestion[] = [];

  // プレフィックス長でグループ化
  const groupedByPrefix = new Map<number, Subnet[]>();
  for (const subnet of subnets) {
    const [, prefix] = subnet.cidr.split('/');
    const prefixLength = Number.parseInt(prefix, 10);

    if (!groupedByPrefix.has(prefixLength)) {
      groupedByPrefix.set(prefixLength, []);
    }
    groupedByPrefix.get(prefixLength)!.push(subnet);
  }

  // 各プレフィックス長グループで連続するサブネットを探す
  for (const [prefixLength, groupSubnets] of groupedByPrefix) {
    if (groupSubnets.length < 3) continue; // 3つ以上のサブネットがある場合のみ

    const sortedSubnets = groupSubnets.sort(
      (a, b) => a.startValue - b.startValue
    );

    // 連続するサブネットのグループを見つける
    let consecutiveGroup: Subnet[] = [sortedSubnets[0]];

    for (let i = 1; i < sortedSubnets.length; i++) {
      const prevSubnet = sortedSubnets[i - 1];
      const currentSubnet = sortedSubnets[i];

      if (currentSubnet.startValue === prevSubnet.endValue + 1) {
        consecutiveGroup.push(currentSubnet);
      } else {
        // グループが途切れた場合、現在のグループをチェック
        if (
          consecutiveGroup.length >= 3 &&
          isPowerOfTwo(consecutiveGroup.length)
        ) {
          const suggestion = createGroupSupernet(
            consecutiveGroup,
            prefixLength
          );
          if (suggestion) suggestions.push(suggestion);
        }
        consecutiveGroup = [currentSubnet];
      }
    }

    // 最後のグループをチェック
    if (consecutiveGroup.length >= 3 && isPowerOfTwo(consecutiveGroup.length)) {
      const suggestion = createGroupSupernet(consecutiveGroup, prefixLength);
      if (suggestion) suggestions.push(suggestion);
    }
  }

  return suggestions;
}

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

function createGroupSupernet(
  subnets: Subnet[],
  originalPrefixLength: number
): SupernetSuggestion | null {
  if (subnets.length < 2) return null;

  const supernetPrefixLength = originalPrefixLength - Math.log2(subnets.length);
  if (supernetPrefixLength < 1) return null;

  const supernetMask = (0xffffffff << (32 - supernetPrefixLength)) >>> 0;
  const networkAddress = (subnets[0].startValue & supernetMask) >>> 0;
  const cidr = `${numberToIp(networkAddress)}/${supernetPrefixLength}`;

  const originalSize = subnets.reduce(
    (sum, subnet) => sum + (subnet.endValue - subnet.startValue + 1),
    0
  );
  const supernetSize = Math.pow(2, 32 - supernetPrefixLength);
  const savedAddresses = supernetSize - originalSize;
  const efficiency = (originalSize / supernetSize) * 100;

  return {
    originalSubnets: subnets,
    suggestedSupernet: cidr,
    savedAddresses,
    efficiency,
  };
}

export function generateColors(count: number): string[] {
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
