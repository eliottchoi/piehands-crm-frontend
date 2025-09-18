import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers, useUploadUsersCsv } from '../hooks/useUsers';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/Modal';
import { FileUpload } from '@/components/FileUpload';
import type { User } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2 } from 'lucide-react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const uploadMutation = useUploadUsersCsv();
  const { ref, inView } = useInView();

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
    <div className="space-y-8">
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
            {data.pages.map((page, i) => (
              <Fragment key={i}>
                {page.users.map((user: User) => (
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
                ))}
              </Fragment>
            ))}
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
