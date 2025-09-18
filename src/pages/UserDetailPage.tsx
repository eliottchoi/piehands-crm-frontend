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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PlusCircle, Loader2 } from 'lucide-react';
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

  const userName = (user.properties as { name?: string })?.name;
  const userEmail = (user.properties as { email?: string })?.email;
  const userTitle = userName ? `${userName} (${userEmail || 'No Email'})` : userEmail || 'Anonymous User';

  return (
    <>
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold">{userTitle}</h1>
          <Badge variant={user.distinctId ? 'secondary' : 'outline'}>
            {user.distinctId ? `Identified (${user.distinctId})` : 'Unidentified'}
          </Badge>
        </div>
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
              <CardTitle>Event Feed</CardTitle>
            </CardHeader>
            <CardContent>
              {user.events && user.events.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {user.events.map((event: Event) => (
                    <AccordionItem value={event.id} key={event.id}>
                      <AccordionTrigger>
                        <div className="flex justify-between w-full pr-4">
                          <span>{event.name}</span>
                          <span className="text-sm text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <pre className="text-xs font-mono bg-muted p-4 rounded-md overflow-x-auto">
                          {JSON.stringify(event.properties, null, 2)}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground">No events found for this user.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
