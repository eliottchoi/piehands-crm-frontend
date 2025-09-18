import React from 'react';
import type { NodeProps } from 'reactflow';
import { CustomNode } from './CustomNode';
import { PlayIcon } from '@radix-ui/react-icons';

export const ImmediateTriggerNode: React.FC<NodeProps> = (props) => {
  return (
    <CustomNode
      {...props}
      data={{
        ...props.data,
        icon: <PlayIcon className="text-green-700" />,
        label: 'Trigger: Immediately',
        type: 'Trigger',
      }}
    />
  );
};
