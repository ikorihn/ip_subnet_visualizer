import { useState } from 'react';
import type { Subnet } from '../types/subnet';
import { IPCalculator } from '../utils/ipCalculator';

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

    const colors = IPCalculator.generateColors(
      existingSubnets.length + lines.length
    );
    const errors: string[] = [];
    const validSubnets: Subnet[] = [];

    lines.forEach((line, index) => {
      const validationResult = IPCalculator.validateCIDR(line);

      if (!validationResult.isValid) {
        errors.push(`Line ${index + 1}: ${validationResult.error}`);
      } else {
        try {
          const colorIndex = existingSubnets.length + validSubnets.length;
          const subnet = IPCalculator.calculateSubnet(line, colors[colorIndex]);
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
    <div className="subnet-input">
      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-group">
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter CIDR notation(s) - one per line:&#10;192.168.1.0/24&#10;10.0.0.0/8&#10;172.16.0.0/12"
            className={`bulk-input ${!validation.isValid ? 'error' : ''}`}
            rows={4}
          />
          <button type="submit" className="add-button">
            Add
          </button>
        </div>

        {!validation.isValid && (
          <div className="bulk-error-message">
            <div className="bulk-error-summary">
              {validation.validCount} of {validation.totalCount} subnets added
              successfully
            </div>
            <div className="bulk-error-details">
              {validation.errors?.map((error) => (
                <div key={error} className="error-item">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}
      </form>

      <div className="input-examples">
        <span className="examples-label">Examples:</span>
        <button
          type="button"
          className="example-button"
          onClick={() => setInputValue('192.168.1.0/24')}
        >
          192.168.1.0/24
        </button>
        <button
          type="button"
          className="example-button"
          onClick={() => setInputValue('10.0.0.0/8')}
        >
          10.0.0.0/8
        </button>
        <button
          type="button"
          className="example-button"
          onClick={() => setInputValue('172.16.0.0/12')}
        >
          172.16.0.0/12
        </button>
        <button
          type="button"
          className="example-button"
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
