import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

interface CustomNodeProps {
  icon: React.ReactNode;
  label: string;
  type: 'Trigger' | 'Action' | 'Logic';
}

export const CustomNode: React.FC<NodeProps<CustomNodeProps>> = ({ data }) => {
  const typeColors = {
    Trigger: 'bg-green-100 border-green-500',
    Action: 'bg-blue-100 border-blue-500',
    Logic: 'bg-yellow-100 border-yellow-500',
  };

  return (
    <div className={`rounded-[var(--border-radius-base)] border-2 ${typeColors[data.type]} w-60 shadow-md`}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div className="p-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6">{data.icon}</div>
          <p className="text-sm font-bold text-text-primary">{data.label}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
};
