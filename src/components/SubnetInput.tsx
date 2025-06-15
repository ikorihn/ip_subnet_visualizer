import { useState } from 'react';
import type { Subnet, ValidationResult } from '../types/subnet';
import { IPCalculator } from '../utils/ipCalculator';

interface SubnetInputProps {
  onAddSubnet: (subnet: Subnet) => void;
  existingSubnets: Subnet[];
}

export function SubnetInput({
  onAddSubnet,
  existingSubnets,
}: SubnetInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const validationResult = IPCalculator.validateCIDR(inputValue.trim());

    if (!validationResult.isValid) {
      setValidation(validationResult);
      return;
    }

    const colors = IPCalculator.generateColors(existingSubnets.length + 1);
    const newColor = colors[existingSubnets.length];

    try {
      const subnet = IPCalculator.calculateSubnet(inputValue.trim(), newColor);
      onAddSubnet(subnet);
      setInputValue('');
      setValidation({ isValid: true });
    } catch (error) {
      setValidation({
        isValid: false,
        error: 'Error occurred during subnet calculation',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!validation.isValid) {
      setValidation({ isValid: true });
    }
  };

  return (
    <div className="subnet-input">
      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-group">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter CIDR notation (e.g., 192.168.1.0/24)"
            className={`cidr-input ${!validation.isValid ? 'error' : ''}`}
          />
          <button type="submit" className="add-button">
            Add
          </button>
        </div>
        {!validation.isValid && (
          <div className="error-message">{validation.error}</div>
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
      </div>
    </div>
  );
}
