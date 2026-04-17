import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Clock,
  User,
  Tag,
  AlertTriangle,
  CheckCircle2,
  MoreVertical,
  History,
  Trash2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, ChevronsUpDown, Sparkles, UserPlus, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  getTicketById,
  getTicketMessages,
  getUsersByRole,
  addMessage,
  deleteMessage,
  updateTicketStatus,
  assignTicket,
  autoAssignTicket,
  ApiResponse,
  TicketResponse,
  MessageResponse,
  UserResponse,
  Role,
  TicketStatus,
  cn,
  formatDate,
} from '@/lib/utils';
import { getUserRole } from '../auth/authService';
import { getUsername } from '@/auth/tokenUtils';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = getUserRole();
  const currentEmail = getUsername();

  const [ticket, setTicket] = useState<TicketResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [message, setMessage] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAssignPopoverOpen, setIsAssignPopoverOpen] = useState(false);
  const [agents, setAgents] = useState<UserResponse[]>([]);

  const fetchTicketData = async () => {
    if (!id) return;
    setIsLoading(true);

    try {
      // 1. Define the promises
      const promises: [
        Promise<ApiResponse<TicketResponse>>,
        Promise<ApiResponse<MessageResponse[]>>,
        Promise<ApiResponse<UserResponse[]> | null>,
      ] = [
        getTicketById(Number(id)),
        getTicketMessages(Number(id)),
        // Only fetch agents list if the current user is an ADMIN
        role === 'ADMIN' ? getUsersByRole(Role.SUPPORT_AGENT) : Promise.resolve(null),
      ];

      const [ticketRes, messageRes, agentRes] = await Promise.all(promises);

      // 2. Handle Ticket Data
      if (ticketRes?.success) {
        setTicket(ticketRes.data);
      } else {
        toast.error(ticketRes?.message || 'Ticket not found');
      }

      // 3. Handle Messages
      if (messageRes?.success) {
        setMessages(messageRes.data);
      }

      // 4. Handle Agents (Admin Only)
      if (agentRes && agentRes.success) {
        setAgents(agentRes.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('An error occurred while fetching ticket details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTicketData();
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !id) return;
    const res = await addMessage(Number(id), { text: messageText });

    if (res?.success) {
      setMessages((prev) => [...prev, res.data]); // Optimistic update
      setMessageText('');
    } else {
      toast.error(res?.message || 'Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!id) return;
    const res = await deleteMessage(Number(id), messageId);

    if (res?.success) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success(res.message);
    } else {
      toast.error(res?.message || 'Failed to delete message');
    }
  };

  const handleManualAssign = async (agentId: number) => {
    if (!id) return;
    const res = await assignTicket(Number(id), { agentId });

    if (res?.success) {
      setTicket(res.data);
      setIsAssignPopoverOpen(false);
      toast.success(res.message);
    } else {
      toast.error(res?.message);
    }
  };

  const handleAutoAssign = async () => {
    if (!id) return;
    const res = await autoAssignTicket(Number(id));

    if (res?.success) {
      setTicket(res.data);
      toast.success(res.message);
    } else {
      toast.error(res?.message);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!id) return;
    const res = await updateTicketStatus(Number(id), status);

    if (res?.success) {
      setTicket((prev) => (prev ? { ...prev, status } : null));
      toast.success(res.message);
    } else {
      toast.error(res?.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">Loading Ticket Details...</div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <h2 className="mb-4 text-2xl font-bold">Ticket Not Found</h2>
        <Button
          onClick={() => {
            localStorage.getItem('assigned') ? navigate('/assigned') : navigate('/tickets');
            localStorage.removeItem('assigned');
          }}
        >
          Back to Repository
        </Button>
      </div>
    );
  }

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
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: number) => {
    const priorityMap: Record<number, { label: string; className: string }> = {
      0: { label: 'LOW', className: 'bg-slate-100 text-slate-600 border-slate-200' },
      1: { label: 'MEDIUM', className: 'bg-blue-100 text-blue-600 border-blue-200' },
      2: { label: 'HIGH', className: 'bg-orange-100 text-orange-600 border-orange-200' },
      3: { label: 'CRITICAL', className: 'bg-rose-100 text-rose-600 border-rose-200' },
    };

    const { label, className } = priorityMap[priority] || priorityMap[0];

    return (
      <Badge variant="outline" className={cn('h-5 px-2 py-0 text-[10px] font-black', className)}>
        {label}
      </Badge>
    );
  };

  const availableTransitions = (() => {
    const transitions: { status: TicketStatus; label: string; icon: any; color: string }[] = [];

    if (!role || !ticket) return transitions;

    // Client/Admin transitions
    if (role === 'CLIENT' || role === 'ADMIN') {
      if (ticket.status === 'OPEN') {
        transitions.push({
          status: TicketStatus.CLOSED,
          label: 'Close Ticket',
          icon: Clock,
          color: 'text-rose-500',
        });
      }
      if (ticket.status === 'RESOLVED') {
        transitions.push({
          status: TicketStatus.OPEN,
          label: 'Re-open Ticket',
          icon: Eye,
          color: 'text-emerald-500',
        });
        transitions.push({
          status: TicketStatus.CLOSED,
          label: 'Close Ticket',
          icon: Clock,
          color: 'text-rose-500',
        });
      }
    }

    // Agent/Admin transitions
    if (role === 'SUPPORT_AGENT' || role === 'ADMIN') {
      if (ticket.status === 'OPEN') {
        transitions.push({
          status: TicketStatus.IN_PROGRESS,
          label: 'Mark In Progress',
          icon: Clock,
          color: 'text-blue-500',
        });
      }
      if (ticket.status === 'IN_PROGRESS') {
        transitions.push({
          status: TicketStatus.RESOLVED,
          label: 'Mark Resolved',
          icon: CheckCircle2,
          color: 'text-emerald-500',
        });
      }
    }

    return transitions;
  })();

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div className="mb-2 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            localStorage.getItem('assigned') ? navigate('/assigned') : navigate('/tickets');
            localStorage.removeItem('assigned');
          }}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="mb-1 flex items-center gap-3">
            <span className="font-mono text-xs text-slate-400">TICKET-#{ticket.id}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">{ticket.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-none bg-white shadow-sm dark:bg-slate-900">
            <CardHeader className="pb-4">
              <div className="mb-4 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {/* TO DO: change avatar url */}
                  <AvatarImage src="" />
                  <AvatarFallback>{ticket.createdBy[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold">{ticket.createdBy}</p>
                  <p className="text-xs text-slate-500">
                    Reported on {formatDate(ticket.createdDate)}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/50">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {ticket.description}
                </p>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            <h3 className="px-2 text-sm font-black tracking-widest text-slate-400 uppercase">
              Communication Log
            </h3>

            <div className="space-y-6">
              {messages.map((msg) => {
                const sender = msg.sender;
                const isMe = sender?.email === currentEmail;

                return (
                  <div
                    key={msg.id}
                    className={cn('group flex gap-4', isMe ? 'flex-row-reverse' : '')}
                  >
                    <Avatar className="mt-1 h-8 w-8 shrink-0">
                      <AvatarImage src="" />
                      <AvatarFallback>{sender?.firstName[0]}</AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        'flex max-w-[80%] flex-col',
                        isMe ? 'items-end' : 'items-start'
                      )}
                    >
                      <div className="group relative">
                        <div
                          className={cn(
                            'rounded-2xl p-4 text-sm shadow-sm',
                            isMe
                              ? 'rounded-tr-none bg-primary text-white'
                              : 'rounded-tl-none border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900'
                          )}
                        >
                          {msg.text}
                        </div>
                        {isMe && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="absolute top-1/2 -left-8 -translate-y-1/2 p-1.5 text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:text-rose-500"
                            title="Delete message"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="mt-1 px-1 text-[10px] font-medium text-slate-400">
                        {sender?.firstName} • {formatDate(msg.timestamp)}{' '}
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Card className="mt-8 border-none bg-white shadow-lg dark:bg-slate-900">
              <CardContent className="p-4">
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="relative">
                    <textarea
                      className="min-h-[100px] w-full resize-none rounded-xl border-none bg-slate-50 p-4 text-sm placeholder:text-slate-500/40 placeholder:italic focus:ring-2 focus:ring-primary/20 dark:bg-slate-800"
                      placeholder="Type your message or internal note..."
                      /* Update these to match the state 'messageText' */
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      required
                    />
                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        className="h-8 gap-2 font-bold"
                        disabled={!messageText.trim()}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Send
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-none bg-white shadow-sm dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 bg-slate-50 py-4 dark:border-slate-800 dark:bg-slate-800/50">
              <CardTitle className="text-sm font-black tracking-wider uppercase">
                Ticket Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-4">
                {/* Status Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-medium">Status</span>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>

                {/* Priority Row - NEW */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs font-medium">Priority</span>
                  </div>
                  {getPriorityBadge(ticket.priority)}
                </div>

                {/* Category Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Tag className="h-4 w-4" />
                    <span className="text-xs font-medium">Category</span>
                  </div>
                  <span className="text-xs font-bold">{ticket.category.name}</span>
                </div>

                {/* Resolved Date Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium">Resolved on</span>
                  </div>
                  <span className="text-xs font-bold">{formatDate(ticket.resolvedDate)}</span>
                </div>
              </div>

              <Separator className="bg-slate-100 dark:bg-slate-800" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Assigned Agent
                  </p>
                  {role === 'ADMIN' && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[10px] font-black tracking-wider text-primary uppercase hover:bg-primary/5 hover:text-primary"
                        onClick={handleAutoAssign}
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        Auto
                      </Button>

                      <Popover open={isAssignPopoverOpen} onOpenChange={setIsAssignPopoverOpen}>
                        <PopoverTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[10px] font-black tracking-wider text-primary uppercase hover:bg-primary/5 hover:text-primary"
                            >
                              <UserPlus className="mr-1 h-3 w-3" />
                              Manual
                            </Button>
                          }
                        />
                        <PopoverContent className="w-[200px] p-0" align="end">
                          <Command>
                            <CommandInput placeholder="Search agents..." className="h-9" />
                            <CommandList>
                              <CommandEmpty>No agent found.</CommandEmpty>
                              <CommandGroup>
                                {agents.map((a) => (
                                  <CommandItem
                                    key={a.id}
                                    onSelect={() => handleManualAssign(a.id)}
                                    className="flex items-center gap-2"
                                  >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold">
                                      {a.firstName[0]}
                                    </div>
                                    <span className="text-xs font-medium">
                                      {a.firstName} {a.lastName}
                                    </span>
                                    <Check
                                      className={cn(
                                        'ml-auto h-4 w-4',
                                        ticket.assignedAgent === a.fullName
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>

                {ticket.assignedAgent ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback>{ticket.assignedAgent[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold">{ticket.assignedAgent}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase">
                          Support Agent
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-400">No agent assigned yet</p>
                  </div>
                )}
              </div>

              <Separator className="bg-slate-100 dark:bg-slate-800" />

              <div className="space-y-3">
                {availableTransitions.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button className="flex h-10 w-full items-center justify-between px-4 font-bold">
                          Change Status
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent className="w-[calc(100%-2rem)] md:w-64" align="center">
                      {availableTransitions.map((t) => (
                        <DropdownMenuItem
                          key={t.status}
                          onClick={() => handleStatusChange(t.status)}
                          className="flex cursor-pointer items-center gap-2 py-2.5"
                        >
                          <t.icon className={cn('h-4 w-4', t.color)} />
                          <span className="text-sm font-bold">{t.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-800/50">
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      No Actions Available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
