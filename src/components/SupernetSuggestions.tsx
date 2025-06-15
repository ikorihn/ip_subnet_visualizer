import type { SupernetSuggestion } from '../utils/ipCalculator';

interface SupernetSuggestionsProps {
  suggestions: SupernetSuggestion[];
  onApplySuggestion?: (suggestion: SupernetSuggestion) => void;
}

export function SupernetSuggestions({
  suggestions,
  onApplySuggestion,
}: SupernetSuggestionsProps) {
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
      <div className="font-semibold text-green-700 mb-3 flex items-center gap-2">
        <span className="text-green-600">🚀</span>
        Supernet Optimization Opportunities ({suggestions.length})
      </div>
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="bg-white border border-green-200 rounded p-4 shadow-sm"
          >
            <div className="space-y-3">
              {/* Header with supernet suggestion */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div>
                  <div className="font-semibold text-green-800 mb-1">
                    Suggested Supernet:
                    <span className="font-mono ml-2 bg-green-100 px-2 py-1 rounded text-sm">
                      {suggestion.suggestedSupernet}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Combines {suggestion.originalSubnets.length} subnet
                    {suggestion.originalSubnets.length > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-sm text-green-700">
                    <span className="font-semibold">
                      {suggestion.efficiency.toFixed(1)}%
                    </span>{' '}
                    efficient
                  </div>
                  {suggestion.savedAddresses > 0 && (
                    <div className="text-xs text-gray-500">
                      +{formatNumber(suggestion.savedAddresses)} addresses
                    </div>
                  )}
                </div>
              </div>

              {/* Original subnets */}
              <div className="border-t border-gray-100 pt-3">
                <div className="text-xs text-gray-500 mb-2">
                  Original subnets:
                </div>
                <div className="flex flex-wrap gap-1">
                  {suggestion.originalSubnets.map((subnet, subnetIndex) => (
                    <span
                      key={subnetIndex}
                      className="inline-block text-xs font-mono px-2 py-1 rounded"
                      style={{
                        backgroundColor: subnet.color,
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      }}
                    >
                      {subnet.cidr}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefits explanation */}
              <div className="border-t border-gray-100 pt-3">
                <div className="text-xs text-gray-600">
                  <span className="font-semibold">Benefits:</span>
                  <ul className="mt-1 space-y-1">
                    <li>• Simpler routing table management</li>
                    <li>• Reduced administrative overhead</li>
                    {suggestion.efficiency === 100 ? (
                      <li>• No address space waste (perfect aggregation)</li>
                    ) : (
                      <li>
                        • {suggestion.efficiency.toFixed(1)}% address space
                        utilization
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Apply button (if callback provided) */}
              {onApplySuggestion && (
                <div className="border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors"
                    onClick={() => onApplySuggestion(suggestion)}
                  >
                    Apply Suggestion
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-green-200">
        <div className="text-sm text-green-700">
          <span className="font-semibold">Total optimization potential:</span>{' '}
          {suggestions.length} supernet{suggestions.length > 1 ? 's' : ''} can
          be formed to simplify network management
        </div>
      </div>
    </div>
  );
}
