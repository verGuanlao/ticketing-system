import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  MoreHorizontal, 
  Power, 
  PowerOff, 
  Shield, 
  ShieldAlert,
  TrendingUp,
  CheckCircle2,
  Clock,
  Search,
  AlertTriangle
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MOCK_USERS, MOCK_WORKLOADS, MOCK_TICKETS } from '@/mockData';
import { User, UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/Pagination';
import { toast } from 'sonner';

export default function Agents() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [workloads, setWorkloads] = useState(MOCK_WORKLOADS);
  const [globalMaxCapacity, setGlobalMaxCapacity] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const agents = users.filter(u => u.role === 'SUPPORT_AGENT' || u.role === 'ADMIN');
  
  const filteredAgents = agents.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAgents.length / pageSize);
  const paginatedAgents = filteredAgents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getAgentStats = (agentId: number) => {
    const agentTickets = MOCK_TICKETS.filter(t => t.assignedAgent === agentId);
    const assigned = agentTickets.length;
    const active = agentTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
    const resolved = agentTickets.filter(t => t.status === 'RESOLVED').length;
    const closed = agentTickets.filter(t => t.status === 'CLOSED').length;
    
    const resolvedTickets = agentTickets.filter(t => t.status === 'RESOLVED' && t.resolvedDate);
    let avgResolutionTime = 0;
    if (resolvedTickets.length > 0) {
      const totalTime = resolvedTickets.reduce((acc, t) => {
        const created = new Date(t.createdDate).getTime();
        const resolved = new Date(t.resolvedDate!).getTime();
        return acc + (resolved - created);
      }, 0);
      avgResolutionTime = totalTime / resolvedTickets.length / (1000 * 60 * 60); // in hours
    }

    const workload = workloads.find(w => w.agentId === agentId);
    return { assigned, active, resolved, closed, avgResolutionTime, workload };
  };

  const toggleUserStatus = (userId: number) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
    const user = users.find(u => u.id === userId);
    toast.success(`${user?.firstName} ${user?.isActive ? 'deactivated' : 'activated'} successfully`);
  };

  const handleUpdateGlobalMax = () => {
    setWorkloads(prev => prev.map(w => ({ ...w, maxCapacity: globalMaxCapacity })));
    toast.success(`Global max workload updated to ${globalMaxCapacity}`);
  };

  const getWorkloadColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio >= 0.9) return 'text-rose-600 font-black';
    if (ratio >= 0.7) return 'text-amber-600 font-bold';
    return 'text-emerald-600 font-bold';
  };

  return (
    <div className="space-y-6 px-4">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Agent Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Monitor performance and manage support personnel.</p>
        </div>
        
        <Dialog>
          <DialogTrigger
            render={
              <Button className="font-bold gap-2">
                <UserPlus className="w-4 h-4" />
                Add Personnel
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Personnel</DialogTitle>
              <DialogDescription>Create a new agent or administrator account.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="john@sentinel.com" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select defaultValue="SUPPORT_AGENT">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPPORT_AGENT">Support Agent</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => toast.success('Personnel added successfully')}>Create Account</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Search agents by name or email..." 
          className="pl-10 h-11 bg-white dark:bg-slate-900 border-none shadow-sm"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Global Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input 
                type="number" 
                value={globalMaxCapacity} 
                onChange={(e) => setGlobalMaxCapacity(parseInt(e.target.value))}
                className="w-24 font-bold text-lg h-11"
              />
              <Button variant="outline" onClick={handleUpdateGlobalMax} className="font-bold h-11">Update All</Button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Sets the maximum ticket threshold for all agents.</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{users.filter(u => u.role === 'SUPPORT_AGENT' && u.isActive).length}</div>
            <p className="text-[10px] text-emerald-500 mt-1 font-bold uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> System Healthy
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {(workloads.reduce((acc, curr) => acc + curr.currentWorkload, 0) / workloads.length).toFixed(1)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium italic">Tickets per active agent</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
            <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
              <TableHead className="font-black text-[10px] uppercase tracking-wider px-3">Agent</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-wider px-3">Role</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-wider px-3">Status</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-wider px-3">Workload</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-wider px-3 text-center">Performance Stats</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-wider px-3">Avg Res</TableHead>
              <TableHead className="w-[40px] px-3"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAgents.map((agent) => {
              const { assigned, active, resolved, closed, avgResolutionTime, workload } = getAgentStats(agent.id);
              return (
                <TableRow key={agent.id} className="border-slate-100 dark:border-slate-800">
                  <TableCell className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {agent.firstName[0]}{agent.lastName[0]}
                      </div>
                      <div className="max-w-[120px]">
                        <p className="font-bold text-xs truncate">{agent.firstName} {agent.lastName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{agent.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <Badge variant="outline" className={cn(
                      "font-black text-[9px] uppercase px-1.5",
                      agent.role === 'ADMIN' ? "border-purple-500 text-purple-600" : "border-slate-300 text-slate-500"
                    )}>
                      {agent.role === 'SUPPORT_AGENT' ? 'Agent' : agent.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <Badge className={cn(
                      "font-black text-[9px] uppercase px-1.5",
                      agent.isActive ? "bg-emerald-500" : "bg-slate-300"
                    )}>
                      {agent.isActive ? 'Active' : 'Off'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    {workload ? (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          <span className={cn("text-[11px]", getWorkloadColor(workload.currentWorkload, workload.maxCapacity))}>
                            {workload.currentWorkload}/{workload.maxCapacity}
                          </span>
                          {workload.currentWorkload > workload.maxCapacity && (
                            <Badge variant="destructive" className="h-3.5 px-1 text-[7px] font-black uppercase tracking-tighter animate-pulse">
                              <AlertTriangle className="w-2 h-2 mr-0.5" /> Overload
                            </Badge>
                          )}
                        </div>
                        <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-500",
                              (workload.currentWorkload / workload.maxCapacity) >= 0.9 ? "bg-rose-500" : 
                              (workload.currentWorkload / workload.maxCapacity) >= 0.7 ? "bg-amber-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${(workload.currentWorkload / workload.maxCapacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-600">{assigned}</p>
                        <p className="text-[8px] text-slate-400 uppercase font-black">Asgn</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-blue-600">{active}</p>
                        <p className="text-[8px] text-slate-400 uppercase font-black">Actv</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-emerald-600">{resolved}</p>
                        <p className="text-[8px] text-slate-400 uppercase font-black">Res</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-500">{closed}</p>
                        <p className="text-[8px] text-slate-400 uppercase font-black">Clsd</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold">{avgResolutionTime.toFixed(1)}h</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => toggleUserStatus(agent.id)}>
                          {agent.isActive ? (
                            <><PowerOff className="w-4 h-4 mr-2 text-rose-500" /> Deactivate Account</>
                          ) : (
                            <><Power className="w-4 h-4 mr-2 text-emerald-500" /> Activate Account</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="w-4 h-4 mr-2" /> Change Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600">
                          <ShieldAlert className="w-4 h-4 mr-2" /> Reset Credentials
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalEntries={filteredAgents.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>
    </div>
  );
}
