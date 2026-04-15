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
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MOCK_TICKETS, 
  MOCK_USERS, 
  MOCK_MESSAGES, 
  MOCK_CATEGORIES 
} from '@/mockData';
import { TicketStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/contexts/TicketContext';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronsUpDown, Sparkles, UserPlus, ChevronDown } from "lucide-react";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tickets, reassignTicket, updateTicketStatus } = useTickets();
  const [message, setMessage] = useState('');
  const [isAssignPopoverOpen, setIsAssignPopoverOpen] = useState(false);
  const [localMessages, setLocalMessages] = useState(MOCK_MESSAGES.filter(m => m.ticketId === Number(id)));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  
  const ticket = tickets.find(t => t.id === Number(id));
  const creator = MOCK_USERS.find(u => u.id === ticket?.createdBy);
  const agent = MOCK_USERS.find(u => u.id === ticket?.assignedAgent);
  const category = MOCK_CATEGORIES.find(c => c.id === ticket?.categoryId);
  const messages = MOCK_MESSAGES.filter(m => m.ticketId === Number(id));

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Ticket Not Found</h2>
        <Button onClick={() => navigate('/tickets')}>Back to Repository</Button>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      text: message,
      timestamp: new Date().toISOString(),
      ticketId: Number(id),
      senderId: user?.id || 0
    };

    setLocalMessages(prev => [...prev, newMessage]);
    toast.success('Comment added to ticket');
    setMessage('');
  };

  const handleDeleteMessage = (messageId: number) => {
    setLocalMessages(prev => prev.filter(m => m.id !== messageId));
    toast.success('Message deleted');
  };

  const handleManualAssign = (agentId: number) => {
    if (!ticket) return;
    reassignTicket(ticket.id, agentId);
    setIsAssignPopoverOpen(false);
    toast.success('Agent assigned successfully');
  };

  const handleAutoAssign = () => {
    if (!ticket) return;
    // Simple auto-assign logic: pick a random agent for demo
    const agents = MOCK_USERS.filter(u => u.role === 'SUPPORT_AGENT');
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    if (randomAgent) {
      reassignTicket(ticket.id, randomAgent.id);
      toast.success(`Auto-assigned to ${randomAgent.firstName} ${randomAgent.lastName}`);
    }
  };

  const handleStatusChange = (status: TicketStatus) => {
    if (!ticket) return;
    updateTicketStatus(ticket.id, status);
    toast.success(`Ticket status updated to ${status.replace('_', ' ')}`);
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN': return <Badge variant="outline" className="border-emerald-500 text-emerald-600 font-black text-[10px] uppercase px-2">Open</Badge>;
      case 'IN_PROGRESS': return <Badge variant="outline" className="border-blue-500 text-blue-600 font-black text-[10px] uppercase px-2">In Progress</Badge>;
      case 'RESOLVED': return <Badge variant="outline" className="border-slate-400 text-slate-500 font-black text-[10px] uppercase px-2">Resolved</Badge>;
      case 'CLOSED': return <Badge variant="outline" className="border-slate-900 text-slate-900 font-black text-[10px] uppercase px-2">Closed</Badge>;
      default: return null;
    }
  };

  const availableTransitions = (() => {
    const transitions: { status: TicketStatus; label: string; icon: any; color: string }[] = [];
    
    if (!user || !ticket) return transitions;

    // Client/Admin transitions
    if (user.role === 'CLIENT' || user.role === 'ADMIN') {
      if (ticket.status === 'OPEN') {
        transitions.push({ status: 'CLOSED', label: 'Close Ticket', icon: Clock, color: 'text-rose-500' });
      }
      if (ticket.status === 'RESOLVED') {
        transitions.push({ status: 'OPEN', label: 'Re-open Ticket', icon: Eye, color: 'text-emerald-500' });
        transitions.push({ status: 'CLOSED', label: 'Close Ticket', icon: Clock, color: 'text-rose-500' });
      }
    }

    // Agent/Admin transitions
    if (user.role === 'SUPPORT_AGENT' || user.role === 'ADMIN') {
      if (ticket.status === 'OPEN') {
        transitions.push({ status: 'IN_PROGRESS', label: 'Mark In Progress', icon: Clock, color: 'text-blue-500' });
      }
      if (ticket.status === 'IN_PROGRESS') {
        transitions.push({ status: 'RESOLVED', label: 'Mark Resolved', icon: CheckCircle2, color: 'text-emerald-500' });
      }
    }

    return transitions;
  })();

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/tickets')} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-mono text-slate-400">TICKET-#{ticket.id}</span>
            <Badge className={cn(
              "text-[10px] font-black uppercase px-2",
              ticket.priority === 'CRITICAL' ? "bg-rose-500" : "bg-blue-500"
            )}>
              {ticket.priority}
            </Badge>
          </div>
          <h1 className="text-2xl font-black tracking-tight">{ticket.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={creator?.avatar} />
                  <AvatarFallback>{creator?.firstName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold">{creator?.firstName} {creator?.lastName}</p>
                  <p className="text-xs text-slate-500">Reported on {formatDate(ticket.createdDate)}</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 px-2">Communication Log</h3>
            
            <div className="space-y-6">
              {localMessages.map((msg) => {
                const sender = MOCK_USERS.find(u => u.id === msg.senderId);
                const isMe = sender?.id === user?.id;
                
                return (
                  <div key={msg.id} className={cn("flex gap-4 group", isMe ? "flex-row-reverse" : "")}>
                    <Avatar className="w-8 h-8 mt-1 shrink-0">
                      <AvatarImage src={sender?.avatar} />
                      <AvatarFallback>{sender?.firstName[0]}</AvatarFallback>
                    </Avatar>
                    <div className={cn("max-w-[80%] flex flex-col", isMe ? "items-end" : "items-start")}>
                      <div className="relative group">
                        <div className={cn(
                          "p-4 rounded-2xl text-sm shadow-sm",
                          isMe 
                            ? "bg-primary text-white rounded-tr-none" 
                            : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-tl-none"
                        )}>
                          {msg.text}
                        </div>
                        {isMe && (
                          <button 
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] font-medium text-slate-400 mt-1 px-1">
                        {sender?.firstName} • {formatDate(msg.timestamp)} {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Card className="border-none shadow-lg bg-white dark:bg-slate-900 mt-8">
              <CardContent className="p-4">
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="relative">
                    <textarea 
                      className="w-full min-h-[100px] bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="Type your message or internal note..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button type="submit" size="sm" className="h-8 gap-2 font-bold">
                        <Send className="w-3.5 h-3.5" />
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
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 py-4">
              <CardTitle className="text-sm font-black uppercase tracking-wider">Ticket Metadata</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-medium">Status</span>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Tag className="w-4 h-4" />
                    <span className="text-xs font-medium">Category</span>
                  </div>
                  <span className="text-xs font-bold">{category?.name}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">SLA Deadline</span>
                  </div>
                  <span className="text-xs font-bold text-rose-500">4h 12m</span>
                </div>
              </div>

              <Separator className="bg-slate-100 dark:bg-slate-800" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Agent</p>
                  {user?.role === 'ADMIN' && (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/5"
                        onClick={handleAutoAssign}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Auto
                      </Button>
                      
                      <Popover open={isAssignPopoverOpen} onOpenChange={setIsAssignPopoverOpen}>
                        <PopoverTrigger
                          render={
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2 text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/5"
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
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
                                {MOCK_USERS.filter(u => u.role === 'SUPPORT_AGENT').map((a) => (
                                  <CommandItem
                                    key={a.id}
                                    onSelect={() => handleManualAssign(a.id)}
                                    className="flex items-center gap-2"
                                  >
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                                      {a.firstName[0]}
                                    </div>
                                    <span className="text-xs font-medium">{a.firstName} {a.lastName}</span>
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        ticket.assignedAgent === a.id ? "opacity-100" : "opacity-0"
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
                
                {agent ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={agent.avatar} />
                        <AvatarFallback>{agent.firstName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold">{agent.firstName} {agent.lastName}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black">Support Agent</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-400 font-medium">No agent assigned yet</p>
                  </div>
                )}
              </div>

              <Separator className="bg-slate-100 dark:bg-slate-800" />

              <div className="space-y-3">
                {availableTransitions.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button className="w-full font-bold h-10 flex items-center justify-between px-4">
                          Change Status
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent className="w-[calc(100%-2rem)] md:w-64" align="center">
                      {availableTransitions.map((t) => (
                        <DropdownMenuItem 
                          key={t.status} 
                          onClick={() => handleStatusChange(t.status)}
                          className="flex items-center gap-2 py-2.5 cursor-pointer"
                        >
                          <t.icon className={cn("w-4 h-4", t.color)} />
                          <span className="font-bold text-sm">{t.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Actions Available</p>
                  </div>
                )}
                
                {user?.role === 'ADMIN' && (
                  <Button variant="outline" className="w-full font-bold h-10 border-slate-200 text-slate-600 hover:bg-slate-50">
                    Transfer Case
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                <CardTitle className="text-sm font-black uppercase tracking-wider">Audit Trail</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {[
                  { action: 'Status changed to In Progress', time: '2h ago', user: 'Mark J.' },
                  { action: 'Agent assigned', time: '2h ago', user: 'System' },
                  { action: 'Ticket created', time: '3h ago', user: 'Elena R.' },
                ].map((log, i) => (
                  <div key={i} className="flex gap-3 relative">
                    {i !== 2 && <div className="absolute left-[7px] top-4 bottom-[-16px] w-[1px] bg-slate-100 dark:bg-slate-800" />}
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{log.action}</p>
                      <p className="text-[10px] text-slate-500">{log.user} • {log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
