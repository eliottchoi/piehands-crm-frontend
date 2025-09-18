import { useState, useEffect, Fragment, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers, useUploadUsersCsv } from '../hooks/useUsers';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/Modal';
import { FileUpload } from '@/components/FileUpload';
import { UserSearchBar } from '../components/UserSearchBar';
import { UserFilterBar } from '../components/UserFilterBar';
import type { User } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2 } from 'lucide-react';

interface FilterQuery {
  id: string;
  type: 'event' | 'property' | 'cohort';
  display: string;
  query: any;
}

export const UsersPage = () => {
  const navigate = useNavigate();
  const { 
    data, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetching, 
    isFetchingNextPage, 
    status 
  } = useUsers('ws_piehands');
  
  // Modal and upload state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const uploadMutation = useUploadUsersCsv();
  const { ref, inView } = useInView();
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterQuery[]>([]);
  
  // All users from all pages (for client-side filtering)
  const allUsers = useMemo(() => {
    return data?.pages?.flatMap(page => page.users) || [];
  }, [data]);

  // Filtered users based on search and filters
  const filteredUsers = useMemo(() => {
    let result = allUsers;

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(user => {
        const name = (user.properties as { name?: string })?.name?.toLowerCase() || '';
        const email = (user.properties as { email?: string })?.email?.toLowerCase() || '';
        const distinctId = user.distinctId?.toLowerCase() || '';
        
        return name.includes(search) || 
               email.includes(search) || 
               distinctId.includes(search);
      });
    }

    // Apply filters (simplified for Phase 1)
    // TODO: Implement complex filter logic
    
    return result;
  }, [allUsers, searchTerm, filters]);

  const totalUserCount = allUsers.length;
  const filteredUserCount = filteredUsers.length;

  useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetching, fetchNextPage]);

  const handleFileSelect = (file: File) => {
    uploadMutation.mutate({ workspaceId: 'ws_piehands', file });
    setIsModalOpen(false);
  };

  if (status === 'pending') return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (status === 'error') return <div className="p-8 text-destructive">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Users</h1>
          <p className="text-lg text-muted-foreground/80">
            View and manage all users in your workspace with advanced filtering.
          </p>
        </div>
        <Button size="lg" onClick={() => setIsModalOpen(true)} className="shrink-0">
          <Upload className="w-5 h-5 mr-2" />
          Import Users
        </Button>
      </div>

      {/* Search Bar - width:100% */}
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
        onSaveCohort={() => {
          // TODO: Implement save cohort functionality
          console.log('Save as cohort:', filters);
        }}
      />
      
      <Modal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        title="Import Users"
        onCancel={() => setIsModalOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a CSV file to bulk-import users into your workspace. The file should contain columns for user properties like name, email, and other custom fields.
          </p>
          <div className="p-4 bg-muted/20 rounded-lg border-l-4 border-primary">
            <p className="text-xs font-medium text-foreground mb-1">Supported format:</p>
            <code className="text-xs bg-background px-2 py-1 rounded font-mono">.csv files</code>
          </div>
          <FileUpload onFileSelect={handleFileSelect} isUploading={uploadMutation.isPending} />
        </div>
      </Modal>

      <Card variant="default" className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Information</TableHead>
              <TableHead>Distinct ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user: User) => (
                  <TableRow 
                    key={user.id} 
                    className="cursor-pointer group"
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {((user.properties as { name?: string })?.name || 'A')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {(user.properties as { name?: string })?.name || 'Anonymous User'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {(user.properties as { email?: string })?.email || 'No email provided'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted/30 px-2 py-1 rounded font-mono">
                        {user.distinctId || '—'}
                      </code>
                    </TableCell>
                    <TableCell>
                      {user.distinctId ? (
                        <Badge variant="active">Identified</Badge>
                      ) : (
                        <Badge variant="inactive">Unidentified</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.emailStatus === 'active' && (
                        <Badge variant="success">Active</Badge>
                      )}
                      {user.emailStatus === 'unsubscribed' && (
                        <Badge variant="warning">Unsubscribed</Badge>
                      )}
                      {user.emailStatus === 'bounced' && (
                        <Badge variant="error">Bounced</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
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
                        <div className="text-sm">
                          Try adjusting your filter criteria
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-lg mb-2">No users found</div>
                        <div className="text-sm">
                          Import users to get started
                        </div>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      
      <div ref={ref} className="flex justify-center items-center py-8">
        {isFetchingNextPage && (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Loading more users...</span>
          </div>
        )}
        {!hasNextPage && data.pages[0].users.length > 0 && (
          <div className="text-center">
            <div className="w-8 h-8 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-2 h-2 bg-muted-foreground/40 rounded-full"></div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">All users loaded</p>
          </div>
        )}
      </div>
    </div>
  );
};
