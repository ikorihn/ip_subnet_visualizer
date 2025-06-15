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
          <p>Select a subnet to view detailed information</p>
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
          <h4>Basic Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <label>Network Address</label>
              <div className="info-value">
                <span>{subnet.networkAddress}</span>
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(subnet.networkAddress)}
                  title="Copy"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="info-item">
              <label>Broadcast Address</label>
              <div className="info-value">
                <span>{subnet.broadcastAddress}</span>
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(subnet.broadcastAddress)}
                  title="Copy"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="info-item">
              <label>Subnet Mask</label>
              <div className="info-value">
                <span>{subnet.subnetMask}</span>
                <button
                  className="copy-button"
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
          <h4>Host Range</h4>
          <div className="info-grid">
            <div className="info-item">
              <label>First Host</label>
              <div className="info-value">
                <span>{subnet.firstHost}</span>
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(subnet.firstHost)}
                  title="Copy"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="info-item">
              <label>Last Host</label>
              <div className="info-value">
                <span>{subnet.lastHost}</span>
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(subnet.lastHost)}
                  title="Copy"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h4>Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{formatNumber(totalAddresses)}</div>
              <div className="stat-label">Total Addresses</div>
            </div>

            <div className="stat-item">
              <div className="stat-value">
                {formatNumber(subnet.availableHosts)}
              </div>
              <div className="stat-label">Available Hosts</div>
            </div>

            <div className="stat-item">
              <div className="stat-value">/{subnet.cidr.split('/')[1]}</div>
              <div className="stat-label">Prefix Length</div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h4>Address Calculation</h4>
          <div className="calculation-info">
            <div className="calculation-item">
              <span className="calculation-label">Network bits:</span>
              <span className="calculation-value">
                {subnet.cidr.split('/')[1]} bits
              </span>
            </div>
            <div className="calculation-item">
              <span className="calculation-label">Host bits:</span>
              <span className="calculation-value">
                {32 - Number.parseInt(subnet.cidr.split('/')[1])} bits
              </span>
            </div>
            <div className="calculation-item">
              <span className="calculation-label">Numeric range:</span>
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
