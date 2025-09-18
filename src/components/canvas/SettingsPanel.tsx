import React, { useEffect, useState } from 'react';
import type { Node } from 'reactflow';
import { useTemplates } from '../../hooks/useTemplates';

interface SettingsPanelProps {
  selectedNode: Node | null;
  onClose: () => void;
  onNodeDataChange: (nodeId: string, newData: any) => void;
}

const EmailSendSettings: React.FC<{ node: Node, onNodeDataChange: (nodeId: string, newData: any) => void }> = ({ node, onNodeDataChange }) => {
  const { data: templates, isLoading } = useTemplates('ws_piehands');
  const [templateId, setTemplateId] = useState(node.data.templateId || '');

  useEffect(() => {
    setTemplateId(node.data.templateId || '');
  }, [node]);

  const handleTemplateChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newTemplateId = evt.target.value;
    const selectedTemplate = templates?.find(t => t.id === newTemplateId);
    setTemplateId(newTemplateId);
    onNodeDataChange(node.id, { 
      ...node.data, 
      templateId: newTemplateId,
      label: selectedTemplate ? `Email: ${selectedTemplate.name}` : 'Send Email'
    });
  };

  return (
    <div>
      <div>
        <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
          Email Template
        </label>
        <select
          id="template"
          name="template"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
          value={templateId}
          onChange={handleTemplateChange}
        >
          {isLoading ? (
            <option>Loading templates...</option>
          ) : (
            <>
              <option value="">Select a template...</option>
              {templates?.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </>
          )}
        </select>
      </div>
    </div>
  );
};


export const SettingsPanel: React.FC<SettingsPanelProps> = ({ selectedNode, onClose, onNodeDataChange }) => {
  if (!selectedNode) {
    return null;
  }

  const renderContent = () => {
    switch (selectedNode.type) {
      case 'EMAIL_SEND':
        return <EmailSendSettings node={selectedNode} onNodeDataChange={onNodeDataChange} />;
      default:
        return <p>No settings available for this node type.</p>;
    }
  };

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-xl z-10 border-l border-gray-200 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-semibold">
          Settings: {selectedNode.type}
        </h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
          &times;
        </button>
      </div>
      <div className="p-4 flex-grow overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};
