import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUser, useUpdateUser, useAddUserProperty } from '../hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Loader2, User as UserIcon, Mail, Hash, Clock } from 'lucide-react';
import { EventFeedGrouped } from '../components/EventFeedGrouped';
import type { User, Event } from '../types';

const PropertyTableRow: React.FC<{ propKey: string; propValue: unknown; userId: string; }> = ({ propKey, propValue, userId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const originalValue = JSON.stringify(propValue, null, 2);
  const [currentValue, setCurrentValue] = useState(originalValue);
  const { mutate: updateUser } = useUpdateUser('ws_piehands', userId);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue === originalValue) return;
    try {
      const parsedValue = JSON.parse(currentValue);
      updateUser({ userId, properties: { [propKey]: parsedValue } });
    } catch (e) {
      console.error("Invalid JSON value:", currentValue);
      setCurrentValue(originalValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium w-1/3">{propKey}</TableCell>
      <TableCell onDoubleClick={() => setIsEditing(true)}>
        {isEditing ? (
          <textarea
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="font-mono bg-background px-2 py-1 rounded-md text-sm border-primary border w-full h-auto"
          />
        ) : (
          <pre className="font-mono bg-muted px-2 py-1 rounded-md text-xs cursor-pointer hover:bg-muted/80">{originalValue}</pre>
        )}
      </TableCell>
    </TableRow>
  );
};

export const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) return <div>Invalid user ID.</div>;

  const { data: user, isLoading, error } = useUser('ws_piehands', id);
  const { mutate: addProperty, isPending: isAddingProperty } = useAddUserProperty('ws_piehands', id);
  const [isAddPropModalOpen, setAddPropModalOpen] = useState(false);
  const [newPropKey, setNewPropKey] = useState('');
  const [newPropValue, setNewPropValue] = useState('');

  const handleSaveNewProperty = () => {
    if (!newPropKey.trim() || !newPropValue.trim()) return;
    try {
      const parsedValue = JSON.parse(newPropValue);
      addProperty({ userId: user!.id, key: newPropKey, value: parsedValue }, {
        onSuccess: () => {
          setAddPropModalOpen(false);
          setNewPropKey('');
          setNewPropValue('');
        },
      });
    } catch (e) {
      console.error('Invalid JSON in value field.');
      // Add user feedback here, e.g., toast notification
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (error) return <div className="p-8 text-destructive">Error: {error.message}</div>;
  if (!user) return <div className="p-8">User not found.</div>;

  const userName = (user.properties as { name?: string })?.name || 'Anonymous User';
  const userEmail = (user.properties as { email?: string })?.email;
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const getEmailStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'bounced': return 'bg-red-100 text-red-800 border-red-200';
      case 'unsubscribed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      {/* Mixpanel-style Profile Header */}
      <div className="mb-8">
        <Card className="border-0 shadow-none bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              {/* Profile Avatar */}
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarImage src={userEmail ? `https://www.gravatar.com/avatar/${btoa(userEmail).replace(/=/g, '')}?d=mp&s=80` : undefined} alt={userName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              
              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-3">
                  <h1 className="text-2xl font-bold text-gray-900 truncate">{userName}</h1>
                  <Badge 
                    variant="outline" 
                    className={`px-3 py-1 text-xs font-medium border ${getEmailStatusColor(user.emailStatus)}`}
                  >
                    {user.emailStatus}
                  </Badge>
                </div>
                
                {/* Read-only Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {/* Email */}
                  {userEmail && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="font-mono truncate">{userEmail}</span>
                    </div>
                  )}
                  
                  {/* Distinct ID */}
                  {user.distinctId && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Hash className="h-4 w-4 flex-shrink-0" />
                      <span className="font-mono">{user.distinctId}</span>
                    </div>
                  )}
                  
                  {/* Updated At */}
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>Updated {formatDateTime(user.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Properties</CardTitle>
              <Dialog open={isAddPropModalOpen} onOpenChange={setAddPropModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Property</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="key" className="text-right">Key</Label>
                      <Input id="key" value={newPropKey} onChange={(e) => setNewPropKey(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="value" className="text-right">Value (JSON)</Label>
                      <Input id="value" value={newPropValue} onChange={(e) => setNewPropValue(e.target.value)} className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSaveNewProperty} disabled={isAddingProperty}>
                      {isAddingProperty && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(user.properties).map(([key, value]) => (
                    <PropertyTableRow key={key} propKey={key} propValue={value} userId={user.id} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Activity Feed</span>
                <Badge variant="outline" className="text-xs">
                  {user.events?.length || 0} events
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <EventFeedGrouped events={user.events || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
