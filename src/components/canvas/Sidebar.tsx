import React from 'react';

const DraggableNode: React.FC<{ type: string; label: string }> = ({ type, label }) => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="p-3 mb-3 border border-[var(--color-border)] rounded-[var(--border-radius-base)] bg-white cursor-grab shadow-sm hover:shadow-md transition-shadow"
      onDragStart={(event) => onDragStart(event, type)}
      draggable
    >
      {label}
    </div>
  );
};

export const Sidebar = () => {
  return (
    <aside className="w-64 p-4 border-r border-[var(--color-border)] bg-[var(--color-background)]">
      <h3 className="text-lg font-semibold mb-4">Nodes</h3>
      
      <h4 className="text-md font-semibold text-muted-foreground mt-4 mb-2">Triggers</h4>
      <DraggableNode type="IMMEDIATE" label="Immediate Trigger" />

      <h4 className="text-md font-semibold text-muted-foreground mt-4 mb-2">Actions</h4>
      <DraggableNode type="EMAIL_SEND" label="Send Email" />
      
      {/* Future node types will be added here */}
      {/* <h4 className="text-md font-semibold text-muted-foreground mt-4 mb-2">Flow Control</h4>
      <DraggableNode type="WAIT" label="Wait" /> */}
    </aside>
  );
};
