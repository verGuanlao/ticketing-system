import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  MoreHorizontal, 
  Power, 
  PowerOff, 
  Search,
  Mail,
  Calendar
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { MOCK_USERS, MOCK_TICKETS } from '@/mockData';
import { User } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import { Pagination } from '@/components/Pagination';
import { toast } from 'sonner';

export default function Clients() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const clients = users.filter(u => u.role === 'CLIENT');
  
  const filteredClients = clients.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClients.length / pageSize);
  const paginatedClients = filteredClients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getClientStats = (clientId: number) => {
    const clientTickets = MOCK_TICKETS.filter(t => t.createdBy === clientId);
    const total = clientTickets.length;
    const active = clientTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
    const resolved = clientTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    
    const lastTicket = clientTickets.sort((a, b) => 
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    )[0];

    return { total, active, resolved, lastTicketDate: lastTicket?.createdDate };
  };

  const toggleUserStatus = (userId: number) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
    const user = users.find(u => u.id === userId);
    toast.success(`${user?.firstName} ${user?.isActive ? 'deactivated' : 'activated'} successfully`);
  };

  return (
    <div className="space-y-6 px-4">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Client Directory</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage client accounts and monitor their support activity.</p>
        </div>
        
        <Dialog>
          <DialogTrigger
            render={
              <Button className="font-bold gap-2">
                <UserPlus className="w-4 h-4" />
                Add Client
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>Create a new client account for the platform.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input placeholder="Jane" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input placeholder="Smith" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="jane@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input placeholder="Acme Corp" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => toast.success('Client account created successfully')}>Create Client</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Search clients by name or email..." 
          className="pl-10 h-11 bg-white dark:bg-slate-900 border-none shadow-sm"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
            <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
              <TableHead className="font-black text-[10px] uppercase tracking-wider px-3">Client</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-wider px-3">Status</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-wider px-3 text-center">Ticket Activity</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-wider px-3">Last Request</TableHead>
              <TableHead className="w-[40px] px-3"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClients.length > 0 ? (
              paginatedClients.map((client) => {
                const { total, active, resolved, lastTicketDate } = getClientStats(client.id);
                return (
                  <TableRow key={client.id} className="border-slate-100 dark:border-slate-800">
                    <TableCell className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                          {client.firstName[0]}{client.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{client.firstName} {client.lastName}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-4">
                      <Badge className={cn(
                        "font-black text-[9px] uppercase px-1.5",
                        client.isActive ? "bg-emerald-500" : "bg-slate-300"
                      )}>
                        {client.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                          <p className="text-xs font-bold">{total}</p>
                          <p className="text-[8px] text-slate-400 uppercase font-black">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-amber-600">{active}</p>
                          <p className="text-[8px] text-slate-400 uppercase font-black">Active</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-emerald-600">{resolved}</p>
                          <p className="text-[8px] text-slate-400 uppercase font-black">Resolved</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {lastTicketDate ? formatDate(lastTicketDate) : 'No activity'}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => toggleUserStatus(client.id)}>
                            {client.isActive ? (
                              <><PowerOff className="w-4 h-4 mr-2 text-rose-500" /> Deactivate Client</>
                            ) : (
                              <><Power className="w-4 h-4 mr-2 text-emerald-500" /> Activate Client</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" /> Contact Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500 font-medium">
                  No clients found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalEntries={filteredClients.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>
    </div>
  );
}
