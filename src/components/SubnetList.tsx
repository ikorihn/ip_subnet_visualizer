import type { Subnet } from '../types/subnet';

interface SubnetListProps {
  subnets: Subnet[];
  onRemoveSubnet: (id: string) => void;
  onSelectSubnet: (subnet: Subnet | null) => void;
  selectedSubnet: Subnet | null;
}

export function SubnetList({
  subnets,
  onRemoveSubnet,
  onSelectSubnet,
  selectedSubnet,
}: SubnetListProps) {
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  if (subnets.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-lg border border-gray-200 text-center text-gray-600">
        <p>No subnets registered</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 h-fit">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl text-gray-800 m-0">
          Subnet List ({subnets.length})
        </h3>
        <button
          className="bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 transition-colors"
          onClick={() => {
            if (confirm('Delete all subnets?')) {
              subnets.forEach((subnet) => onRemoveSubnet(subnet.id));
            }
          }}
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {subnets.map((subnet) => (
          <div
            key={subnet.id}
            className={`border border-gray-200 rounded-lg p-3.5 cursor-pointer transition-all hover:border-blue-500 hover:shadow-md ${
              selectedSubnet?.id === subnet.id
                ? 'border-emerald-500 bg-emerald-50'
                : ''
            }`}
            onClick={() =>
              onSelectSubnet(selectedSubnet?.id === subnet.id ? null : subnet)
            }
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded flex-shrink-0"
                  style={{ backgroundColor: subnet.color }}
                ></div>
                <div>
                  <span className="font-semibold text-gray-800 font-mono text-sm">
                    {subnet.cidr}
                  </span>
                  <span className="block text-xs text-gray-600 mt-0.5 font-mono">
                    {subnet.networkAddress}
                  </span>
                </div>
              </div>
              <button
                className="text-red-500 hover:bg-red-100 p-1 rounded transition-colors text-base"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete ${subnet.cidr}?`)) {
                    onRemoveSubnet(subnet.id);
                  }
                }}
                title="Delete"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-between text-xs text-gray-600">
              <span className="font-medium">
                {formatNumber(subnet.availableHosts)} hosts
              </span>
              <span className="font-mono">
                {subnet.firstHost} - {subnet.lastHost}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
