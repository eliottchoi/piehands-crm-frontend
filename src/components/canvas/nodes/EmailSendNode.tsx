import React from 'react';
import type { NodeProps } from 'reactflow';
import { CustomNode } from './CustomNode';
import { EnvelopeClosedIcon } from '@radix-ui/react-icons';

export const EmailSendNode: React.FC<NodeProps> = (props) => {
  return (
    <CustomNode
      {...props}
      data={{
        ...props.data,
        icon: <EnvelopeClosedIcon className="text-blue-700" />,
        label: props.data.label || 'Action: Send Email',
        type: 'Action',
      }}
    />
  );
};
