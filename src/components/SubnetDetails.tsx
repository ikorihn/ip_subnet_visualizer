import type { Subnet } from '../types/subnet';

interface SubnetDetailsProps {
  subnet: Subnet | null;
}

export function SubnetDetails({ subnet }: SubnetDetailsProps) {
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Simple feedback - could be enhanced with toast notifications
      console.log('Copied to clipboard:', text);
    });
  };

  if (!subnet) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-lg border border-gray-200 text-center text-gray-600">
        <div>
          <p>Select a subnet to view detailed information</p>
        </div>
      </div>
    );
  }

  const totalAddresses = subnet.endValue - subnet.startValue + 1;

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 h-fit">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: subnet.color }}
          ></div>
          <h3 className="text-xl text-gray-800 font-mono m-0">{subnet.cidr}</h3>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h4 className="text-base font-semibold text-gray-700 mb-3 m-0">
            Basic Information
          </h4>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <label className="text-sm text-gray-600 font-medium">
                Network Address
              </label>
              <div className="flex items-center gap-2 font-mono text-sm text-gray-800">
                <span>{subnet.networkAddress}</span>
                <button
                  className="hover:bg-blue-100 p-1 rounded transition-colors text-xs"
                  onClick={() => copyToClipboard(subnet.networkAddress)}
                  title="Copy"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <label className="text-sm text-gray-600 font-medium">
                Broadcast Address
              </label>
              <div className="flex items-center gap-2 font-mono text-sm text-gray-800">
                <span>{subnet.broadcastAddress}</span>
                <button
                  className="hover:bg-blue-100 p-1 rounded transition-colors text-xs"
                  onClick={() => copyToClipboard(subnet.broadcastAddress)}
                  title="Copy"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <label className="text-sm text-gray-600 font-medium">
                Subnet Mask
              </label>
              <div className="flex items-center gap-2 font-mono text-sm text-gray-800">
                <span>{subnet.subnetMask}</span>
                <button
                  className="hover:bg-blue-100 p-1 rounded transition-colors text-xs"
                  onClick={() => copyToClipboard(subnet.subnetMask)}
                  title="Copy"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h4 className="text-base font-semibold text-gray-700 mb-3 m-0">
            Host Range
          </h4>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <label className="text-sm text-gray-600 font-medium">
                First Host
              </label>
              <div className="flex items-center gap-2 font-mono text-sm text-gray-800">
                <span>{subnet.firstHost}</span>
                <button
                  className="hover:bg-blue-100 p-1 rounded transition-colors text-xs"
                  onClick={() => copyToClipboard(subnet.firstHost)}
                  title="Copy"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <label className="text-sm text-gray-600 font-medium">
                Last Host
              </label>
              <div className="flex items-center gap-2 font-mono text-sm text-gray-800">
                <span>{subnet.lastHost}</span>
                <button
                  className="hover:bg-blue-100 p-1 rounded transition-colors text-xs"
                  onClick={() => copyToClipboard(subnet.lastHost)}
                  title="Copy"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold text-gray-700 mb-3 m-0">
            Statistics
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {formatNumber(totalAddresses)}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                Total Addresses
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {formatNumber(subnet.availableHosts)}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                Available Hosts
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800 mb-1">
                /{subnet.cidr.split('/')[1]}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                Prefix Length
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold text-gray-700 mb-3 m-0">
            Address Calculation
          </h4>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-gray-600">Network bits:</span>
              <span className="font-mono text-gray-800 font-medium">
                {subnet.cidr.split('/')[1]} bits
              </span>
            </div>
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-gray-600">Host bits:</span>
              <span className="font-mono text-gray-800 font-medium">
                {32 - Number.parseInt(subnet.cidr.split('/')[1])} bits
              </span>
            </div>
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-gray-600">Numeric range:</span>
              <span className="font-mono text-gray-800 font-medium">
                {formatNumber(subnet.startValue)} -{' '}
                {formatNumber(subnet.endValue)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
