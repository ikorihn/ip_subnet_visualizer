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

  const ipToBinary = (ip: string): string => {
    return ip
      .split('.')
      .map((octet) => Number.parseInt(octet, 10).toString(2).padStart(8, '0'))
      .join('');
  };

  const renderBinaryVisualization = (ip: string, prefixLength: number) => {
    const binary = ipToBinary(ip);

    const getBitColor = (bit: string, index: number) => {
      if (index < prefixLength) {
        // ネットワーク部分
        if (bit === '1') {
          return 'bg-blue-500 text-white'; // ネットワークビット1: 青
        } else {
          return 'bg-blue-100 text-blue-700'; // ネットワークビット0: 薄い青
        }
      } else {
        // ホスト部分
        if (bit === '1') {
          return 'bg-gray-400 text-white'; // ホストビット1: グレー
        } else {
          return 'bg-gray-100 text-gray-600'; // ホストビット0: 薄いグレー
        }
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 min-w-[80px]">{ip}</span>
          <div className="flex font-mono text-xs">
            {binary.split('').map((bit, index) => (
              <span
                key={index}
                className={`
                  w-6 h-6 flex items-center justify-center rounded text-xs font-bold
                  ${getBitColor(bit, index)}
                  ${(index + 1) % 8 === 0 ? 'mr-1' : ''}
                `}
              >
                {bit}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className="min-w-[80px]"></span>
          <div className="flex gap-2">
            <span className="text-blue-600 font-medium">
              Network ({prefixLength} bits)
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600 font-medium">
              Host ({32 - prefixLength} bits)
            </span>
          </div>
        </div>
      </div>
    );
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
            Binary Visualization
          </h4>
          <div className="bg-gray-50 p-4 rounded-lg space-y-4 overflow-x-auto">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-600 mb-2 font-medium">Network Address</div>
                {renderBinaryVisualization(subnet.networkAddress, Number.parseInt(subnet.cidr.split('/')[1]))}
              </div>
              
              <div>
                <div className="text-xs text-gray-600 mb-2 font-medium">Subnet Mask</div>
                {renderBinaryVisualization(subnet.subnetMask, Number.parseInt(subnet.cidr.split('/')[1]))}
              </div>
              
              <div>
                <div className="text-xs text-gray-600 mb-2 font-medium">Broadcast Address</div>
                {renderBinaryVisualization(subnet.broadcastAddress, Number.parseInt(subnet.cidr.split('/')[1]))}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="font-medium text-blue-600 mb-1">Network bits:</div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">1</div>
                    <span className="text-gray-700">Network bit = 1</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center text-blue-700 text-xs font-bold">0</div>
                    <span className="text-gray-700">Network bit = 0</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-gray-600 mb-1">Host bits:</div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-400 rounded flex items-center justify-center text-white text-xs font-bold">1</div>
                    <span className="text-gray-700">Host bit = 1</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center text-gray-600 text-xs font-bold">0</div>
                    <span className="text-gray-700">Host bit = 0</span>
                  </div>
                </div>
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
