import { useMemo } from 'react';
import type { Subnet, SubnetConflict } from '../types/subnet';

interface SubnetVisualizerProps {
  subnets: Subnet[];
  conflicts: SubnetConflict[];
  onSelectSubnet: (subnet: Subnet | null) => void;
  selectedSubnet: Subnet | null;
}

interface VisualizationData {
  subnet: Subnet;
  x: number;
  width: number;
  hasConflict: boolean;
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
      <div className="subnet-visualizer empty">
        <div className="empty-message">
          <p>サブネットを追加すると、ここに可視化表示されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subnet-visualizer">
      <div className="visualizer-header">
        <h3>サブネット可視化</h3>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color normal"></div>
            <span>通常</span>
          </div>
          <div className="legend-item">
            <div className="legend-color conflict"></div>
            <span>競合</span>
          </div>
          <div className="legend-item">
            <div className="legend-color selected"></div>
            <span>選択中</span>
          </div>
        </div>
      </div>

      <div className="visualization-container">
        <div className="subnet-bars">
          {visualizationData.map(({ subnet, x, width, hasConflict }) => (
            <div
              key={subnet.id}
              className={`subnet-bar ${hasConflict ? 'conflict' : ''} ${
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
              <div className="subnet-label">{subnet.cidr}</div>
            </div>
          ))}
        </div>

        <div className="address-scale">
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
        <div className="conflicts-alert">
          <div className="alert-header">⚠️ サブネット競合が検出されました</div>
          <div className="conflicts-list">
            {conflicts.map((conflict, index) => (
              <div key={index} className="conflict-item">
                <span className="conflict-type">
                  {conflict.type === 'identical' ? '完全一致' : '重複'}:
                </span>
                <span className="conflict-subnets">
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
