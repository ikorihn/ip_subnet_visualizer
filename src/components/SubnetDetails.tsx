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
      <div className="subnet-details empty">
        <div className="empty-message">
          <p>サブネットを選択すると詳細情報が表示されます</p>
        </div>
      </div>
    );
  }

  const totalAddresses = subnet.endValue - subnet.startValue + 1;

  return (
    <div className="subnet-details">
      <div className="details-header">
        <div className="subnet-title">
          <div
            className="subnet-color"
            style={{ backgroundColor: subnet.color }}
          ></div>
          <h3>{subnet.cidr}</h3>
        </div>
      </div>

      <div className="details-content">
        <div className="info-section">
          <h4>基本情報</h4>
          <div className="info-grid">
            <div className="info-item">
              <label>ネットワークアドレス</label>
              <div className="info-value">
                <span>{subnet.networkAddress}</span>
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(subnet.networkAddress)}
                  title="コピー"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="info-item">
              <label>ブロードキャストアドレス</label>
              <div className="info-value">
                <span>{subnet.broadcastAddress}</span>
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(subnet.broadcastAddress)}
                  title="コピー"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="info-item">
              <label>サブネットマスク</label>
              <div className="info-value">
                <span>{subnet.subnetMask}</span>
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(subnet.subnetMask)}
                  title="コピー"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h4>ホスト範囲</h4>
          <div className="info-grid">
            <div className="info-item">
              <label>最初のホスト</label>
              <div className="info-value">
                <span>{subnet.firstHost}</span>
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(subnet.firstHost)}
                  title="コピー"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="info-item">
              <label>最後のホスト</label>
              <div className="info-value">
                <span>{subnet.lastHost}</span>
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(subnet.lastHost)}
                  title="コピー"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h4>統計情報</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{formatNumber(totalAddresses)}</div>
              <div className="stat-label">総アドレス数</div>
            </div>

            <div className="stat-item">
              <div className="stat-value">
                {formatNumber(subnet.availableHosts)}
              </div>
              <div className="stat-label">使用可能ホスト数</div>
            </div>

            <div className="stat-item">
              <div className="stat-value">/{subnet.cidr.split('/')[1]}</div>
              <div className="stat-label">プレフィックス長</div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h4>アドレス計算</h4>
          <div className="calculation-info">
            <div className="calculation-item">
              <span className="calculation-label">ネットワーク部:</span>
              <span className="calculation-value">
                {subnet.cidr.split('/')[1]} bits
              </span>
            </div>
            <div className="calculation-item">
              <span className="calculation-label">ホスト部:</span>
              <span className="calculation-value">
                {32 - Number.parseInt(subnet.cidr.split('/')[1])} bits
              </span>
            </div>
            <div className="calculation-item">
              <span className="calculation-label">数値範囲:</span>
              <span className="calculation-value">
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
