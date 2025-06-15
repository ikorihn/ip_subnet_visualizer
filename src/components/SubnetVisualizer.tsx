import { useMemo } from 'react';
import type { Subnet, SubnetConflict } from '../types/subnet';

interface SubnetVisualizerProps {
  subnets: Subnet[];
  conflicts: SubnetConflict[];
  onSelectSubnet: (subnet: Subnet | null) => void;
  selectedSubnet: Subnet | null;
}

export function SubnetVisualizer({
  subnets,
  conflicts,
  onSelectSubnet,
  selectedSubnet,
}: SubnetVisualizerProps) {
  const visualizationData = useMemo(() => {
    if (subnets.length === 0) return [];

    const minStart = Math.min(...subnets.map((s) => s.startValue));
    const maxEnd = Math.max(...subnets.map((s) => s.endValue));
    const totalRange = maxEnd - minStart;

    const conflictSubnetIds = new Set(
      conflicts.flatMap((c) => [c.subnet1.id, c.subnet2.id])
    );

    return subnets.map((subnet) => {
      const relativeStart = subnet.startValue - minStart;
      const relativeWidth = subnet.endValue - subnet.startValue;

      return {
        subnet,
        x: totalRange > 0 ? (relativeStart / totalRange) * 100 : 0,
        width: totalRange > 0 ? (relativeWidth / totalRange) * 100 : 100,
        hasConflict: conflictSubnetIds.has(subnet.id),
      };
    });
  }, [subnets, conflicts]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  if (subnets.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-lg border border-gray-200 text-center">
        <div className="text-gray-600 text-lg">
          <p>Add subnets to see visualization here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
        <h3 className="text-xl text-gray-800 m-0">Subnet Visualization</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-1 text-sm">
            <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <div className="w-3 h-3 rounded-sm bg-red-500 border-2 border-red-600"></div>
            <span>Conflict</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <div className="w-3 h-3 rounded-sm bg-emerald-500 border-2 border-emerald-700"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>

      <div className="relative min-h-[120px]">
        <div className="relative h-16 bg-gray-100 rounded-lg mb-4 border border-gray-200">
          {visualizationData.map(({ subnet, x, width, hasConflict }) => (
            <div
              key={subnet.id}
              className={`absolute h-full rounded cursor-pointer flex items-center justify-center transition-all border-2 border-transparent min-w-0.5 hover:-translate-y-0.5 hover:shadow-lg ${hasConflict ? 'border-red-500 !important shadow-red-200 shadow-md' : ''} ${
                selectedSubnet?.id === subnet.id ? 'selected' : ''
              }`}
              style={{
                left: `${x}%`,
                width: `${Math.max(width, 0.5)}%`,
                backgroundColor: subnet.color,
                borderColor: hasConflict
                  ? '#EF4444'
                  : selectedSubnet?.id === subnet.id
                    ? '#1F2937'
                    : 'transparent',
              }}
              onClick={() =>
                onSelectSubnet(selectedSubnet?.id === subnet.id ? null : subnet)
              }
              title={`${subnet.cidr} (${formatNumber(subnet.endValue - subnet.startValue + 1)} addresses)`}
            >
              <div className="text-white text-xs font-semibold text-shadow-md whitespace-nowrap overflow-hidden text-ellipsis px-2">
                {subnet.cidr}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-xs text-gray-600 font-mono">
          {visualizationData.length > 0 && (
            <>
              <div className="scale-start">
                {
                  subnets.reduce((min, s) =>
                    s.startValue < min.startValue ? s : min
                  ).networkAddress
                }
              </div>
              <div className="scale-end">
                {
                  subnets.reduce((max, s) =>
                    s.endValue > max.endValue ? s : max
                  ).broadcastAddress
                }
              </div>
            </>
          )}
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <div className="font-semibold text-red-600 mb-2">
            ⚠️ Subnet conflicts detected
          </div>
          <div className="flex flex-col gap-1">
            {conflicts.map((conflict, index) => (
              <div key={index} className="text-sm text-red-800">
                <span className="font-semibold mr-2">
                  {conflict.type === 'identical' ? 'Identical' : 'Overlap'}:
                </span>
                <span className="font-mono">
                  {conflict.subnet1.cidr} ↔ {conflict.subnet2.cidr}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
