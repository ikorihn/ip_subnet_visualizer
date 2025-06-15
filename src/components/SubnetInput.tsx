import { useState } from 'react';
import type { Subnet } from '../types/subnet';
import {
  calculateSubnet,
  generateColors,
  validateCIDR,
} from '../utils/ipCalculator';

interface SubnetInputProps {
  onAddSubnet: (subnet: Subnet) => void;
  existingSubnets: Subnet[];
}

interface BulkValidationResult {
  isValid: boolean;
  errors?: string[];
  validCount?: number;
  totalCount?: number;
}

export function SubnetInput({
  onAddSubnet,
  existingSubnets,
}: SubnetInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [validation, setValidation] = useState<BulkValidationResult>({
    isValid: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const lines = inputValue
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return;

    const colors = generateColors(existingSubnets.length + lines.length);
    const errors: string[] = [];
    const validSubnets: Subnet[] = [];

    lines.forEach((line, index) => {
      const validationResult = validateCIDR(line);

      if (!validationResult.isValid) {
        errors.push(`Line ${index + 1}: ${validationResult.error}`);
      } else {
        try {
          const colorIndex = existingSubnets.length + validSubnets.length;
          const subnet = calculateSubnet(line, colors[colorIndex]);
          validSubnets.push(subnet);
        } catch (error) {
          errors.push(
            `Line ${index + 1}: Error occurred during subnet calculation`
          );
        }
      }
    });

    if (errors.length > 0) {
      setValidation({
        isValid: false,
        errors,
        validCount: validSubnets.length,
        totalCount: lines.length,
      });
    } else {
      setValidation({ isValid: true });
    }

    for (const subnet of validSubnets) {
      onAddSubnet(subnet);
    }

    if (errors.length === 0) {
      setInputValue('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (!validation.isValid) {
      setValidation({ isValid: true });
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-3 mb-2">
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter CIDR notation(s) - one per line:&#10;192.168.1.0/24&#10;10.0.0.0/8&#10;172.16.0.0/12"
            className={`flex-1 p-3 border-2 rounded-lg font-mono transition-colors resize-y min-h-[100px] ${!validation.isValid ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100 focus:ring-4'} focus:outline-none`}
            rows={4}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
        </div>

        {!validation.isValid && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
            <div className="font-semibold text-red-600 mb-2">
              {validation.validCount} of {validation.totalCount} subnets added
              successfully
            </div>
            <div className="flex flex-col gap-1">
              {validation.errors?.map((error) => (
                <div key={error} className="text-sm text-red-800 font-mono">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}
      </form>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600 font-medium">Examples:</span>
        <button
          type="button"
          className="border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all font-mono"
          onClick={() => setInputValue('192.168.1.0/24')}
        >
          192.168.1.0/24
        </button>
        <button
          type="button"
          className="border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all font-mono"
          onClick={() => setInputValue('10.0.0.0/8')}
        >
          10.0.0.0/8
        </button>
        <button
          type="button"
          className="border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all font-mono"
          onClick={() => setInputValue('172.16.0.0/12')}
        >
          172.16.0.0/12
        </button>
        <button
          type="button"
          className="border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all font-mono"
          onClick={() =>
            setInputValue(
              '192.168.1.0/24\n10.0.0.0/8\n172.16.0.0/12\n192.168.2.0/24'
            )
          }
        >
          Load Multiple Example
        </button>
      </div>
    </div>
  );
}
