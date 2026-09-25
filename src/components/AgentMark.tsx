import React from 'react';
import { AgentStatus } from '../types';

interface AgentMarkProps {
  status: AgentStatus;
  size?: 'sm' | 'md' | 'lg';
  accentColor?: string;
  className?: string;
}

export const AgentMark: React.FC<AgentMarkProps> = ({
  status,
  size = 'md',
  accentColor = '#B8FF3D',
  className = '',
}) => {
  const pixelSize = size === 'sm' ? 14 : size === 'lg' ? 24 : 18;

  switch (status) {
    case 'idle':
      return (
        <span
          className={`inline-flex items-center justify-center font-mono select-none text-[#8A9099] ${className}`}
          style={{ width: pixelSize, height: pixelSize, fontSize: pixelSize }}
          title="Idle"
        >
          ○
        </span>
      );

    case 'thinking':
    case 'planning':
      return (
        <span
          className={`inline-flex items-center justify-center font-mono select-none animate-pulse ${className}`}
          style={{
            width: pixelSize,
            height: pixelSize,
            fontSize: pixelSize,
            color: accentColor,
          }}
          title="Thinking / Planning"
        >
          ◌
        </span>
      );

    case 'executing':
      return (
        <span
          className={`inline-flex items-center justify-center font-mono select-none animate-pulse ${className}`}
          style={{
            width: pixelSize,
            height: pixelSize,
            fontSize: pixelSize,
            color: accentColor,
          }}
          title="Executing"
        >
          ◉
        </span>
      );

    case 'waiting':
      return (
        <span
          className={`inline-flex items-center justify-center font-mono select-none ${className}`}
          style={{
            width: pixelSize,
            height: pixelSize,
            fontSize: pixelSize,
            color: '#F59E0B',
          }}
          title="Waiting for input/approval"
        >
          ◎
        </span>
      );

    case 'blocked':
      return (
        <span
          className={`inline-flex items-center justify-center font-mono select-none ${className}`}
          style={{
            width: pixelSize,
            height: pixelSize,
            fontSize: pixelSize,
            color: '#EF4444',
          }}
          title="Blocked"
        >
          ×
        </span>
      );

    case 'complete':
      return (
        <span
          className={`inline-flex items-center justify-center font-mono select-none ${className}`}
          style={{
            width: pixelSize,
            height: pixelSize,
            fontSize: pixelSize,
            color: accentColor,
          }}
          title="Completed"
        >
          ✓
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center justify-center font-mono ${className}`}
          style={{ width: pixelSize, height: pixelSize, fontSize: pixelSize }}
        >
          ○
        </span>
      );
  }
};
