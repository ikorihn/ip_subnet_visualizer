export interface Subnet {
  id: string;
  cidr: string;
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  availableHosts: number;
  firstHost: string;
  lastHost: string;
  color: string;
  startValue: number;
  endValue: number;
}

export interface SubnetConflict {
  subnet1: Subnet;
  subnet2: Subnet;
  type: 'overlap' | 'identical';
}

export interface AddressCoverage {
  totalAddresses: number;
  usedAddresses: number;
  availableAddresses: number;
}

export interface SubnetCalculation {
  subnets: Subnet[];
  conflicts: SubnetConflict[];
  coverage: AddressCoverage;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
