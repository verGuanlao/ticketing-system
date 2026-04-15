import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  MessageSquare,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Users,
  Edit2,
  Trash2,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MOCK_USERS, MOCK_CATEGORIES } from '@/mockData';
import { TicketPriority, TicketStatus } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Pagination } from '@/components/Pagination';
import { useTickets } from '@/contexts/TicketContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function TicketList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { tickets, updateTicketStatus, reassignTicket, deleteTicket } = useTickets();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const isAssignedPage = location.pathname === '/assigned';
  const pageTitle = isAssignedPage ? 'Assigned Incidents' : 'My Support Tickets';
  const pageDescription = isAssignedPage
    ? 'Manage technical issues assigned to your queue.'
    : 'View and track your personal support requests.';

  // Filter logic
  const filteredTickets = tickets.filter((t) => {
    // Role based visibility
    if (user?.role === 'CLIENT' && t.createdBy !== user.id) return false;
    if (isAssignedPage && t.assignedAgent !== user?.id) return false;

    // Search term (title or agent name)
    const agent = MOCK_USERS.find((u) => u.id === t.assignedAgent);
    const agentName = agent ? `${agent.firstName} ${agent.lastName}`.toLowerCase() : 'unassigned';
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agentName.includes(searchTerm.toLowerCase()) ||
      t.id.toString().includes(searchTerm);

    // Status filter
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    // Category filter
    const matchesCategory = categoryFilter === 'ALL' || t.categoryId.toString() === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort logic
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const dateA = new Date(a.createdDate).getTime();
    const dateB = new Date(b.createdDate).getTime();
    return sortOrder === 'NEWEST' ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(sortedTickets.length / pageSize);
  const paginatedTickets = sortedTickets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const showCreatedBy =
    user?.role === 'ADMIN' || (user?.role === 'SUPPORT_AGENT' && isAssignedPage);
  const showAssignedTo =
    user?.role === 'ADMIN' ||
    user?.role === 'CLIENT' ||
    (user?.role === 'SUPPORT_AGENT' && !isAssignedPage);

  const handleStatusChange = (ticketId: number, status: TicketStatus) => {
    updateTicketStatus(ticketId, status);
    toast.success(`Ticket #${ticketId} status updated to ${status.replace('_', ' ')}`);
  };

  const handleReassign = (ticketId: number, agentId: number) => {
    reassignTicket(ticketId, agentId);
    const agent = MOCK_USERS.find((u) => u.id === agentId);
    toast.success(`Ticket #${ticketId} reassigned to ${agent?.firstName} ${agent?.lastName}`);
  };

  const handleAutoAssign = (ticketId: number) => {
    const agents = MOCK_USERS.filter((u) => u.role === 'SUPPORT_AGENT');
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    if (randomAgent) {
      reassignTicket(ticketId, randomAgent.id);
      toast.success(
        `Ticket #${ticketId} auto-assigned to ${randomAgent.firstName} ${randomAgent.lastName}`
      );
    }
  };

  const handleDelete = (ticketId: number) => {
    deleteTicket(ticketId);
    toast.success(`Ticket #${ticketId} deleted`);
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <Badge className="bg-rose-500 px-2 text-[10px] font-black text-white uppercase hover:bg-rose-600">
            Critical
          </Badge>
        );
      case 'HIGH':
        return (
          <Badge className="bg-amber-500 px-2 text-[10px] font-black text-white uppercase hover:bg-amber-600">
            High
          </Badge>
        );
      case 'MEDIUM':
        return (
          <Badge className="bg-blue-500 px-2 text-[10px] font-black text-white uppercase hover:bg-blue-600">
            Medium
          </Badge>
        );
      case 'LOW':
        return (
          <Badge className="bg-slate-500 px-2 text-[10px] font-black text-white uppercase hover:bg-slate-600">
            Low
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <Badge
            variant="outline"
            className="border-emerald-500 px-2 text-[10px] font-black text-emerald-600 uppercase"
          >
            Open
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge
            variant="outline"
            className="border-blue-500 px-2 text-[10px] font-black text-blue-600 uppercase"
          >
            In Progress
          </Badge>
        );
      case 'RESOLVED':
        return (
          <Badge
            variant="outline"
            className="border-slate-400 px-2 text-[10px] font-black text-slate-500 uppercase"
          >
            Resolved
          </Badge>
        );
      case 'CLOSED':
        return (
          <Badge
            variant="outline"
            className="border-slate-900 px-2 text-[10px] font-black text-slate-900 uppercase"
          >
            Closed
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 px-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-black tracking-tight">{pageTitle}</h1>
          <p className="text-slate-500 dark:text-slate-400">{pageDescription}</p>
        </div>
        <Button onClick={() => navigate('/tickets/new')} className="font-bold">
          Create Ticket
        </Button>
      </div>

      <Card className="overflow-hidden border-none bg-white shadow-sm dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="relative w-full max-w-sm">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search title, ID, or agent..."
              className="h-10 border-none bg-slate-50 pl-10 dark:bg-slate-800"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-[130px] border-none bg-slate-50 text-xs font-bold dark:bg-slate-800">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-[140px] border-none bg-slate-50 text-xs font-bold dark:bg-slate-800">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {MOCK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
              <SelectTrigger className="h-10 w-[130px] border-none bg-slate-50 text-xs font-bold dark:bg-slate-800">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEWEST">Newest First</SelectItem>
                <SelectItem value="OLDEST">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
            <TableRow className="border-slate-100 hover:bg-transparent dark:border-slate-800">
              <TableHead className="w-[60px] px-3 text-[10px] font-black tracking-wider uppercase">
                ID
              </TableHead>
              <TableHead className="px-3 text-[10px] font-black tracking-wider uppercase">
                Subject
              </TableHead>
              <TableHead className="px-3 text-[10px] font-black tracking-wider uppercase">
                Priority
              </TableHead>
              <TableHead className="px-3 text-[10px] font-black tracking-wider uppercase">
                Status
              </TableHead>
              <TableHead className="px-3 text-[10px] font-black tracking-wider uppercase">
                Category
              </TableHead>
              {showCreatedBy && (
                <TableHead className="px-3 text-[10px] font-black tracking-wider uppercase">
                  Created By
                </TableHead>
              )}
              {showAssignedTo && (
                <TableHead className="px-3 text-[10px] font-black tracking-wider uppercase">
                  Assigned To
                </TableHead>
              )}
              <TableHead className="px-3 text-[10px] font-black tracking-wider uppercase">
                Created
              </TableHead>
              <TableHead className="px-3 text-[10px] font-black tracking-wider uppercase">
                Resolved
              </TableHead>
              <TableHead className="w-[40px] px-3"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTickets.map((ticket) => {
              const agent = MOCK_USERS.find((u) => u.id === ticket.assignedAgent);
              const creator = MOCK_USERS.find((u) => u.id === ticket.createdBy);
              const category = MOCK_CATEGORIES.find((c) => c.id === ticket.categoryId);

              return (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <TableCell className="px-3 py-3 font-mono text-[10px] text-slate-400">
                    #{ticket.id}
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="max-w-[180px]">
                      <p className="truncate text-xs font-bold text-slate-950 dark:text-white">
                        {ticket.title}
                      </p>
                      <p className="truncate text-[10px] text-slate-500">{ticket.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3">{getPriorityBadge(ticket.priority)}</TableCell>
                  <TableCell className="px-3 py-3">{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell className="px-3 py-3">
                    <Badge
                      variant="secondary"
                      className="border-none bg-slate-100 px-1.5 text-[9px] font-bold text-slate-600 uppercase dark:bg-slate-800 dark:text-slate-400"
                    >
                      {category?.name}
                    </Badge>
                  </TableCell>
                  {showCreatedBy && (
                    <TableCell className="px-3 py-3">
                      {creator ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold dark:bg-slate-800">
                            {creator.firstName[0]}
                          </div>
                          <span className="max-w-[80px] truncate text-[11px] font-medium">
                            {creator.firstName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Unknown</span>
                      )}
                    </TableCell>
                  )}
                  {showAssignedTo && (
                    <TableCell className="px-3 py-3">
                      {agent ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold dark:bg-slate-700">
                            {agent.firstName[0]}
                          </div>
                          <span className="max-w-[80px] truncate text-[11px] font-medium">
                            {agent.firstName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="px-3 py-3 text-[10px] font-medium text-slate-500">
                    {formatDate(ticket.createdDate)}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-[10px] font-medium text-slate-500">
                    {formatDate(ticket.resolvedDate)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()} className="px-3 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => navigate(`/tickets/${ticket.id}`)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>

                        {(user?.role === 'ADMIN' ||
                          (user?.role === 'CLIENT' && ticket.createdBy === user.id) ||
                          user?.role === 'SUPPORT_AGENT') && (
                          <DropdownMenuItem onClick={() => navigate(`/tickets/edit/${ticket.id}`)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit Parameters
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        {/* Role Based Actions */}
                        {(user?.role === 'CLIENT' || user?.role === 'ADMIN') && (
                          <>
                            {ticket.status === 'OPEN' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(ticket.id, 'CLOSED')}
                              >
                                <Clock className="mr-2 h-4 w-4 text-rose-500" /> Close Ticket
                              </DropdownMenuItem>
                            )}
                            {ticket.status === 'RESOLVED' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(ticket.id, 'OPEN')}
                                >
                                  <Eye className="mr-2 h-4 w-4 text-emerald-500" /> Re-open Ticket
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(ticket.id, 'CLOSED')}
                                >
                                  <Clock className="mr-2 h-4 w-4 text-rose-500" /> Close Ticket
                                </DropdownMenuItem>
                              </>
                            )}
                          </>
                        )}

                        {(user?.role === 'SUPPORT_AGENT' || user?.role === 'ADMIN') && (
                          <>
                            {ticket.status === 'OPEN' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(ticket.id, 'IN_PROGRESS')}
                              >
                                <Clock className="mr-2 h-4 w-4 text-blue-500" /> Mark In Progress
                              </DropdownMenuItem>
                            )}
                            {ticket.status === 'IN_PROGRESS' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(ticket.id, 'RESOLVED')}
                              >
                                <MessageSquare className="mr-2 h-4 w-4 text-emerald-500" /> Mark
                                Resolved
                              </DropdownMenuItem>
                            )}
                          </>
                        )}

                        {user?.role === 'ADMIN' && (
                          <>
                            {!ticket.assignedAgent && (
                              <DropdownMenuItem onClick={() => handleAutoAssign(ticket.id)}>
                                <Sparkles className="mr-2 h-4 w-4 text-primary" /> Auto Assign
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <UserPlus className="mr-2 h-4 w-4" /> Reassign Agent
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="w-[200px] p-0" align="end">
                                <Command>
                                  <CommandInput placeholder="Search agents..." autoFocus />
                                  <CommandList>
                                    <CommandEmpty>No agents found.</CommandEmpty>
                                    <CommandGroup>
                                      {MOCK_USERS.filter((u) => u.role === 'SUPPORT_AGENT').map(
                                        (agent) => (
                                          <CommandItem
                                            key={agent.id}
                                            onSelect={() => handleReassign(ticket.id, agent.id)}
                                            className="flex items-center gap-2"
                                          >
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold">
                                              {agent.firstName[0]}
                                            </div>
                                            <span className="text-xs font-medium">
                                              {agent.firstName} {agent.lastName}
                                            </span>
                                            <Check
                                              className={cn(
                                                'ml-auto h-4 w-4',
                                                ticket.assignedAgent === agent.id
                                                  ? 'opacity-100'
                                                  : 'opacity-0'
                                              )}
                                            />
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            {ticket.status === 'CLOSED' && (
                              <DropdownMenuItem
                                className="text-rose-600"
                                onClick={() => handleDelete(ticket.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Ticket
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="border-t border-slate-100 p-3 dark:border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalEntries={sortedTickets.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>
    </div>
  );
}
