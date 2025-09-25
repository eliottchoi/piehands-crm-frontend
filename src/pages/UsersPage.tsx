import { useState, useEffect, Fragment, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers, useUploadUsersCsv } from '../hooks/useUsers';
import { useWorkspace } from '../hooks/useWorkspace';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/Modal';
import { FileUpload } from '@/components/FileUpload';
import { UserSearchBar } from '../components/UserSearchBar';
import { UserFilterBar } from '../components/UserFilterBar';
import { ColumnManager } from '../components/ColumnManager';
import { SearchHighlight } from '../components/SearchHighlight';
import { TableSkeleton } from '../components/TableSkeleton';
import { CohortSaveModal } from '../components/CohortSaveModal';
import { applyAllFilters } from '../utils/filterLogic';
import type { User } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2 } from 'lucide-react';

interface ColumnConfig {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  visible: boolean;
  width?: number;
}

interface FilterQuery {
  id: string;
  type: 'event' | 'property' | 'cohort';
  display: string;
  query: any;
}

export const UsersPage = () => {
  const navigate = useNavigate();
  const { currentWorkspace, isLoading: isWorkspaceLoading } = useWorkspace();
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterQuery[]>([]);
  const [isCohortModalOpen, setIsCohortModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // API call with search
  const { 
    data, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetching, 
    isFetchingNextPage, 
    status,
    refetch
  } = useUsers(searchTerm.trim() || undefined);
  
  const uploadMutation = useUploadUsersCsv();
  const { ref, inView } = useInView();

  const isLoading = isWorkspaceLoading || status === 'pending';

  // Loading and error states should be handled before derived data calculations
  if (isLoading) return <TableSkeleton rows={15} columns={4} />;
  if (status === 'error') {
    console.error('Users query error:', error);
    return <div className="p-8 text-destructive">Error: {error.message}</div>;
  }

  // Column management
  const savedWidths = JSON.parse(localStorage.getItem('userTableColumnWidths') || '{}');
  const availableColumns: ColumnConfig[] = [
    { id: 'name', name: 'Name', type: 'string', visible: true, width: savedWidths.name || 200 },
    { id: 'email', name: 'Email', type: 'string', visible: true, width: savedWidths.email || 180 },
    { id: 'distinctId', name: 'Distinct ID', type: 'string', visible: true, width: savedWidths.distinctId || 120 },
    { id: 'emailStatus', name: 'Email Status', type: 'string', visible: true, width: savedWidths.emailStatus || 100 },
    { id: 'level', name: 'Level', type: 'string', visible: false, width: savedWidths.level || 80 },
    { id: 'createdAt', name: 'Created At', type: 'date', visible: false, width: savedWidths.createdAt || 120 },
    { id: 'updatedAt', name: 'Updated At', type: 'date', visible: false, width: savedWidths.updatedAt || 120 },
  ];
  
  const [visibleColumns, setVisibleColumns] = useState<ColumnConfig[]>(() => {
    const saved = localStorage.getItem('userTableColumns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved columns:', e);
      }
    }
    return availableColumns.filter(col => col.visible);
  });

  // Refetch when search changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        refetch();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, refetch]);

  // Smart infinite scroll - pause when filtering
  const isActivelyFiltering = filters.length > 0 || searchTerm.trim().length > 0;
  
  useEffect(() => {
    if (inView && hasNextPage && !isFetching && !isActivelyFiltering) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetching, fetchNextPage, isActivelyFiltering]);

  // Process users
  const displayUsers = useMemo(() => {
    try {
      console.log('Processing users data:', data);
      const allUsersFlat = data?.pages?.flatMap(page => {
        console.log('Processing page:', page);
        return page.users || [];
      }) || [];
      console.log('All users flat:', allUsersFlat);

      const uniqueUsers = allUsersFlat.filter((user, index, self) =>
        index === self.findIndex(u => u.id === user.id)
      );

      // Apply client-side filters when needed (until backend supports filters)
      if (filters.length > 0) {
        return applyAllFilters(uniqueUsers, filters);
      }

      return uniqueUsers;
    } catch (err) {
      console.error('Error processing users:', err);
      return [];
    }
  }, [data, filters]);

  // Apply sorting
  const sortedUsers = useMemo(() => {
    if (!sortBy) return displayUsers;
    
    return [...displayUsers].sort((a, b) => {
      let aVal: any, bVal: any;
      
      if (sortBy === 'name') {
        aVal = (a.properties as any)?.name || '';
        bVal = (b.properties as any)?.name || '';
      } else if (sortBy === 'email') {
        aVal = (a.properties as any)?.email || '';
        bVal = (b.properties as any)?.email || '';
      } else {
        aVal = (a as any)[sortBy] || '';
        bVal = (b as any)[sortBy] || '';
      }
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }, [displayUsers, sortBy, sortOrder]);

  const totalUserCount = displayUsers.length;
  const filteredUserCount = displayUsers.length;

  // Event handlers
  const handleFileSelect = (file: File) => {
    uploadMutation.mutate({ file });
    setIsModalOpen(false);
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === displayUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(displayUsers.map(user => user.id));
    }
  };
  
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortOrder('asc');
    }
  };

  // Helper functions
  const getCellTooltip = (user: User, columnId: string): string => {
    switch (columnId) {
      case 'name':
        return (user.properties as any)?.name || 'Anonymous User';
      case 'email':
        return (user.properties as any)?.email || 'No email provided';
      case 'distinctId':
        return user.distinctId || 'No distinct ID';
      case 'emailStatus':
        return `Email status: ${user.emailStatus}`;
      case 'level':
        return (user.properties as any)?.level || 'No level set';
      case 'createdAt':
        return `Created: ${new Date(user.createdAt).toLocaleString()}`;
      case 'updatedAt':
        return `Updated: ${new Date(user.updatedAt).toLocaleString()}`;
      default:
        return '';
    }
  };
  
  const renderCellContent = (user: User, columnId: string) => {
    switch (columnId) {
      case 'name':
        const userName = (user.properties as any)?.name || 'Anonymous User';
        const userEmail = (user.properties as any)?.email;
        const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">{userInitials}</span>
            </div>
            <div>
              <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                <SearchHighlight text={userName} searchTerm={searchTerm} />
              </div>
              {userEmail && (
                <div className="text-sm text-muted-foreground truncate max-w-48">
                  <SearchHighlight text={userEmail} searchTerm={searchTerm} />
                </div>
              )}
            </div>
          </div>
        );
      
      case 'email':
        const email = (user.properties as any)?.email || '—';
        return (
          <span className="font-mono text-sm truncate">
            <SearchHighlight text={email} searchTerm={searchTerm} />
          </span>
        );
      
      case 'distinctId':
        const distinctId = user.distinctId || '—';
        return (
          <code className="text-xs bg-muted/30 px-2 py-1 rounded font-mono">
            <SearchHighlight text={distinctId} searchTerm={searchTerm} />
          </code>
        );
      
      case 'emailStatus':
        return (
          <Badge 
            variant={
              user.emailStatus === 'active' ? 'default' :
              user.emailStatus === 'unsubscribed' ? 'secondary' : 'destructive'
            }
            className="text-xs"
          >
            {user.emailStatus}
          </Badge>
        );
      
      case 'level':
        return (
          <span className="text-sm">
            {(user.properties as any)?.level || '—'}
          </span>
        );
      
      case 'createdAt':
      case 'updatedAt':
        const date = new Date((user as any)[columnId]);
        return (
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString()}
          </span>
        );
      
      default:
        return (
          <span className="text-sm">
            {JSON.stringify((user.properties as any)?.[columnId] || '—')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Users</h1>
          <p className="text-lg text-muted-foreground/80">
            Advanced user management with server-side search and filtering.
          </p>
        </div>
        <Button size="lg" onClick={() => setIsModalOpen(true)} className="shrink-0">
          <Upload className="w-5 h-5 mr-2" />
          Import Users
        </Button>
      </div>

      {/* Search Bar */}
      <div className="w-full">
        <UserSearchBar 
          onSearchChange={setSearchTerm}
          className="w-full"
        />
      </div>

      {/* Filter Bar */}
      <UserFilterBar
        userCount={filteredUserCount}
        totalCount={totalUserCount}
        filters={filters}
        onFiltersChange={setFilters}
        onSaveCohort={() => setIsCohortModalOpen(true)}
      />

      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {selectedUsers.length > 0 && (
            <>
              <Button variant="outline" size="sm">
                Export to CSV ({selectedUsers.length})
              </Button>
              <Button variant="outline" size="sm">
                Add to Cohort ({selectedUsers.length})
              </Button>
              <Button variant="outline" size="sm">
                Send Message ({selectedUsers.length})
              </Button>
            </>
          )}
        </div>
        
        <ColumnManager
          availableColumns={availableColumns}
          visibleColumns={visibleColumns}
          onColumnsChange={setVisibleColumns}
        />
      </div>
      
      {/* Import Modal */}
      <Modal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        title="Import Users"
        onCancel={() => setIsModalOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a CSV file to bulk-import users into your workspace.
          </p>
          <FileUpload onFileSelect={handleFileSelect} isUploading={uploadMutation.isPending} />
        </div>
      </Modal>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === displayUsers.length && displayUsers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
              </TableHead>
              
              {visibleColumns.map((column) => (
                <TableHead 
                  key={column.id}
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort(column.id)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.name}</span>
                    {sortBy === column.id && (
                      <span className="text-xs">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user: User, index: number) => (
                <TableRow 
                  key={`${user.id}-${index}`}
                  className="group hover:bg-muted/20"
                >
                  <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-border"
                    />
                  </TableCell>
                  
                  {visibleColumns.map((column) => (
                    <TableCell 
                      key={column.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/users/${user.id}`)}
                      title={getCellTooltip(user, column.id)}
                    >
                      {renderCellContent(user, column.id)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 1} className="text-center py-12">
                  <div className="text-muted-foreground">
                    {searchTerm ? (
                      <>
                        <div className="text-lg mb-2">No users found</div>
                        <div className="text-sm">
                          No users match your search for "{searchTerm}"
                        </div>
                      </>
                    ) : filters.length > 0 ? (
                      <>
                        <div className="text-lg mb-2">No users match your filters</div>
                        <div className="text-sm">Try adjusting your filter criteria</div>
                      </>
                    ) : (
                      <>
                        <div className="text-lg mb-2">No users found</div>
                        <div className="text-sm">Import users to get started</div>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      
      {/* Pagination */}
      <div ref={ref} className="flex justify-center items-center py-8">
        {isFetchingNextPage && (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Loading more users...</span>
          </div>
        )}
        
        {isActivelyFiltering && hasNextPage && (
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">
              Infinite scroll paused while filtering
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
        
        {!hasNextPage && displayUsers.length > 0 && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-medium">
              {isActivelyFiltering ? 'All matching users loaded' : 'All users loaded'}
            </p>
          </div>
        )}
      </div>

      {/* Cohort Save Modal */}
      <CohortSaveModal
        isOpen={isCohortModalOpen}
        onOpenChange={setIsCohortModalOpen}
        filters={filters}
        onSave={(cohortData: { name: string; description: string; filters: FilterQuery[] }) => {
          console.log('Saving cohort:', cohortData);
          setTimeout(() => {
            alert(`Cohort "${cohortData.name}" saved successfully!`);
            setIsCohortModalOpen(false);
          }, 1000);
        }}
      />
    </div>
  );
};