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
    if (subnets.length === 0) return { items: [], totalLayers: 1 };

    const minStart = Math.min(...subnets.map((s) => s.startValue));
    const maxEnd = Math.max(...subnets.map((s) => s.endValue));
    const totalRange = maxEnd - minStart;

    const conflictSubnetIds = new Set(
      conflicts.flatMap((c) => [c.subnet1.id, c.subnet2.id])
    );

    // サブネットを開始値でソート
    const sortedSubnets = [...subnets].sort(
      (a, b) => a.startValue - b.startValue
    );

    // 重複検出とレイヤー配置のためのデータ構造
    const layers: Array<
      { subnet: Subnet; x: number; width: number; endValue: number }[]
    > = [];

    const result = sortedSubnets.map((subnet) => {
      const relativeStart = subnet.startValue - minStart;
      const relativeWidth = subnet.endValue - subnet.startValue;
      const x = totalRange > 0 ? (relativeStart / totalRange) * 100 : 0;
      const width = totalRange > 0 ? (relativeWidth / totalRange) * 100 : 100;

      // このサブネットが配置できる最初のレイヤーを見つける
      let layerIndex = 0;
      while (layerIndex < layers.length) {
        const layer = layers[layerIndex];
        const hasOverlap = layer.some(
          (item) =>
            subnet.startValue <= item.endValue &&
            subnet.endValue >= item.subnet.startValue
        );
        if (!hasOverlap) {
          break;
        }
        layerIndex++;
      }

      // 新しいレイヤーが必要な場合は作成
      if (layerIndex >= layers.length) {
        layers.push([]);
      }

      // サブネットをレイヤーに追加
      layers[layerIndex].push({
        subnet,
        x,
        width,
        endValue: subnet.endValue,
      });

      return {
        subnet,
        x,
        width,
        hasConflict: conflictSubnetIds.has(subnet.id),
        layer: layerIndex,
      };
    });

    return {
      items: result,
      totalLayers: Math.max(layers.length, 1),
    };
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
      </div>

      <div
        className="relative"
        style={{
          minHeight: `${Math.max(120, visualizationData.totalLayers * 70)}px`,
        }}
      >
        <div
          className="relative bg-gray-100 rounded-lg mb-4 border border-gray-200"
          style={{ height: `${visualizationData.totalLayers * 60 + 16}px` }}
        >
          {visualizationData.items.map(
            ({ subnet, x, width, hasConflict, layer }) => (
              <div
                key={subnet.id}
                className={`absolute rounded cursor-pointer flex items-center justify-center transition-all border-2 border-transparent min-w-0.5 hover:shadow-lg hover:z-10 ${hasConflict ? 'border-red-500 !important shadow-red-200 shadow-md' : ''} ${
                  selectedSubnet?.id === subnet.id ? 'selected' : ''
                }`}
                style={{
                  left: `${x}%`,
                  width: `${Math.max(width, 0.5)}%`,
                  top: `${layer * 60 + 8}px`,
                  height: '48px',
                  backgroundColor: subnet.color,
                  borderColor: hasConflict
                    ? '#EF4444'
                    : selectedSubnet?.id === subnet.id
                      ? '#1F2937'
                      : 'transparent',
                }}
                onClick={() =>
                  onSelectSubnet(
                    selectedSubnet?.id === subnet.id ? null : subnet
                  )
                }
                title={`${subnet.cidr} (${formatNumber(subnet.endValue - subnet.startValue + 1)} addresses)`}
              >
                <div className="text-white text-xs font-semibold text-shadow-md whitespace-nowrap overflow-hidden text-ellipsis px-2">
                  {subnet.cidr}
                </div>
              </div>
            )
          )}
        </div>

        <div className="flex justify-between text-xs text-gray-600 font-mono">
          {visualizationData.items.length > 0 && (
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
            ! Subnet conflicts detected
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
