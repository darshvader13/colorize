import React from 'react';

interface SpinnerProps {
  size?: number;
  color?: string;
}

const LoadingSpinner: React.FC<SpinnerProps> = ({ size = 40, color = '#000' }) => {
  return (
    <div style={{
      display: 'inline-block',
      border: `4px solid ${color}`,
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }}>
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;