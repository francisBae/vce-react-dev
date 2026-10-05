import styled from 'styled-components';

export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: ${props => {
    switch (props.variant) {
      case 'secondary':
        return '#e5e7eb';
      case 'danger':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  }};
  color: ${props => props.variant === 'secondary' ? '#1f2937' : 'white'};

  &:hover {
    background: ${props => {
      switch (props.variant) {
        case 'secondary':
          return '#d1d5db';
        case 'danger':
          return '#dc2626';
        default:
          return '#2563eb';
      }
    }};
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`; 