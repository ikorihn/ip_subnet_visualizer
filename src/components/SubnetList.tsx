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
      <div className="subnet-list empty">
        <p>登録されたサブネットはありません</p>
      </div>
    );
  }

  return (
    <div className="subnet-list">
      <div className="list-header">
        <h3>サブネット一覧 ({subnets.length})</h3>
        <button
          className="clear-all-button"
          onClick={() => {
            if (confirm('すべてのサブネットを削除しますか？')) {
              subnets.forEach((subnet) => onRemoveSubnet(subnet.id));
            }
          }}
        >
          すべて削除
        </button>
      </div>

      <div className="subnet-items">
        {subnets.map((subnet) => (
          <div
            key={subnet.id}
            className={`subnet-item ${
              selectedSubnet?.id === subnet.id ? 'selected' : ''
            }`}
            onClick={() =>
              onSelectSubnet(selectedSubnet?.id === subnet.id ? null : subnet)
            }
          >
            <div className="subnet-header">
              <div className="subnet-info">
                <div
                  className="subnet-color"
                  style={{ backgroundColor: subnet.color }}
                ></div>
                <div className="subnet-label">
                  <span className="cidr">{subnet.cidr}</span>
                  <span className="network">{subnet.networkAddress}</span>
                </div>
              </div>
              <button
                className="remove-button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`${subnet.cidr} を削除しますか？`)) {
                    onRemoveSubnet(subnet.id);
                  }
                }}
                title="削除"
              >
                ✕
              </button>
            </div>

            <div className="subnet-summary">
              <span className="hosts-count">
                {formatNumber(subnet.availableHosts)} hosts
              </span>
              <span className="address-range">
                {subnet.firstHost} - {subnet.lastHost}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
