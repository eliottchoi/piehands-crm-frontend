import React, { useEffect, useState } from 'react';
import type { Node } from 'reactflow';
import { useTemplates } from '../../hooks/useTemplates';
import { useUsers } from '../../hooks/useUsers';
import { ChevronDown, Search, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SettingsPanelProps {
  selectedNode: Node | null;
  onClose: () => void;
  onNodeDataChange: (nodeId: string, newData: any) => void;
}

type TargetType = 'ALL_USERS' | 'SPECIFIC_USERS' | 'BY_FILTER';

const EmailSendSettings: React.FC<{ node: Node, onNodeDataChange: (nodeId: string, newData: any) => void }> = ({ node, onNodeDataChange }) => {
  const { data: templates, isLoading: templatesLoading } = useTemplates('ws_piehands');
  const { data: usersData, isLoading: usersLoading } = useUsers('ws_piehands');

  const [templateId, setTemplateId] = useState(node.data.templateId || '');
  const [targetType, setTargetType] = useState<TargetType>(node.data.targetConfig?.type || 'ALL_USERS');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(node.data.targetConfig?.userIds || []);
  const [userSearch, setUserSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const allUsers = usersData?.pages?.flatMap(page => page.users) || [];
  const filteredUsers = allUsers.filter(user =>
    user.properties?.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.properties?.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  useEffect(() => {
    setTemplateId(node.data.templateId || '');
    setTargetType(node.data.targetConfig?.type || 'ALL_USERS');
    setSelectedUserIds(node.data.targetConfig?.userIds || []);
  }, [node]);

  const handleTemplateChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newTemplateId = evt.target.value;
    const selectedTemplate = templates?.find(t => t.id === newTemplateId);
    setTemplateId(newTemplateId);
    updateNodeData({ templateId: newTemplateId });

    if (selectedTemplate) {
      updateNodeData({
        label: `Email: ${selectedTemplate.name.substring(0, 20)}${selectedTemplate.name.length > 20 ? '...' : ''}`
      });
    }
  };

  const handleTargetTypeChange = (newType: TargetType) => {
    setTargetType(newType);
    setSelectedUserIds([]);
    updateNodeData({
      targetConfig: {
        type: newType,
        userIds: newType === 'SPECIFIC_USERS' ? [] : undefined,
      }
    });
  };

  const handleUserToggle = (userId: string) => {
    const newSelectedIds = selectedUserIds.includes(userId)
      ? selectedUserIds.filter(id => id !== userId)
      : [...selectedUserIds, userId];

    setSelectedUserIds(newSelectedIds);
    updateNodeData({
      targetConfig: {
        type: 'SPECIFIC_USERS',
        userIds: newSelectedIds,
      }
    });
  };

  const updateNodeData = (updates: any) => {
    onNodeDataChange(node.id, {
      ...node.data,
      ...updates
    });
  };

  const selectedUsers = allUsers.filter(user => selectedUserIds.includes(user.id));

  return (
    <div className="space-y-6">
      {/* 📧 템플릿 선택 */}
      <div>
        <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
          📧 Email Template
        </label>
        <select
          id="template"
          name="template"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
          value={templateId}
          onChange={handleTemplateChange}
        >
          {templatesLoading ? (
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

      {/* 🎯 수신 대상 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🎯 Target Audience
        </label>

        <div className="space-y-3">
          {/* 모든 사용자 */}
          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="targetType"
              value="ALL_USERS"
              checked={targetType === 'ALL_USERS'}
              onChange={() => handleTargetTypeChange('ALL_USERS')}
              className="text-[var(--color-primary)]"
            />
            <div>
              <div className="font-medium">All Active Users</div>
              <div className="text-sm text-gray-600">Send to all users with active email status</div>
            </div>
          </label>

          {/* 특정 사용자 */}
          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="targetType"
              value="SPECIFIC_USERS"
              checked={targetType === 'SPECIFIC_USERS'}
              onChange={() => handleTargetTypeChange('SPECIFIC_USERS')}
              className="text-[var(--color-primary)]"
            />
            <div>
              <div className="font-medium">Specific Users</div>
              <div className="text-sm text-gray-600">Choose individual users to target</div>
            </div>
          </label>

          {/* 필터 기반 (향후 구현) */}
          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed opacity-60">
            <input
              type="radio"
              name="targetType"
              value="BY_FILTER"
              disabled
              className="text-[var(--color-primary)]"
            />
            <div>
              <div className="font-medium">By Filter (Coming Soon)</div>
              <div className="text-sm text-gray-600">Filter by category, follower count, etc.</div>
            </div>
          </label>
        </div>
      </div>

      {/* 🎯 특정 사용자 선택 UI */}
      {targetType === 'SPECIFIC_USERS' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Users ({selectedUserIds.length} selected)
          </label>

          {/* 선택된 사용자들 */}
          {selectedUsers.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <Badge
                  key={user.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {user.properties?.name || 'Unknown'}
                  <button
                    onClick={() => handleUserToggle(user.id)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* 사용자 검색 및 선택 */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onFocus={() => setShowUserDropdown(true)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              />
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              />
            </div>

            {showUserDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {usersLoading ? (
                  <div className="p-3 text-center text-gray-500">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-3 text-center text-gray-500">No users found</div>
                ) : (
                  <>
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleUserToggle(user.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {user.properties?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{user.properties?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{user.properties?.email}</div>
                          </div>
                        </div>
                        {selectedUserIds.includes(user.id) && (
                          <Check className="h-4 w-4 text-[var(--color-primary)]" />
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={() => setShowUserDropdown(false)}
          >
            Close User List
          </Button>
        </div>
      )}
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
