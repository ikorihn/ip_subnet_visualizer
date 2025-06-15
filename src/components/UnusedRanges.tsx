import type { UnusedRange } from '../utils/ipCalculator';

interface UnusedRangesProps {
  unusedRanges: UnusedRange[];
}

export function UnusedRanges({ unusedRanges }: UnusedRangesProps) {
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  if (unusedRanges.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
      <div className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span className="text-gray-500">📊</span>
        Unused Address Ranges ({unusedRanges.length})
      </div>
      <div className="space-y-2">
        {unusedRanges.map((range, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded p-3 shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div className="font-mono text-sm text-gray-800">
                  <span className="font-semibold text-gray-600">Range:</span>{' '}
                  {range.startAddress} - {range.endAddress}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-blue-600">
                    {formatNumber(range.size)}
                  </span>{' '}
                  unused addresses
                </div>
              </div>

              {range.subnets.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">
                    Subnet representation{range.subnets.length > 1 ? 's' : ''}:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {range.subnets.map((subnet, subnetIndex) => (
                      <span
                        key={subnetIndex}
                        className="inline-block bg-blue-100 text-blue-800 text-xs font-mono px-2 py-1 rounded"
                      >
                        {subnet}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">Total unused addresses:</span>{' '}
          <span className="font-semibold text-blue-600">
            {formatNumber(
              unusedRanges.reduce((sum, range) => sum + range.size, 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
