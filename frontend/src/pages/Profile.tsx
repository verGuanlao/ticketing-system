import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MOCK_TICKETS, 
  MOCK_WORKLOADS, 
  MOCK_USERS 
} from '@/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Shield, 
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

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

    const workload = MOCK_WORKLOADS.find(w => w.agentId === agentId);
    return { assigned, active, resolved, closed, avgResolutionTime, workload };
  };

  const isAgent = user.role === 'SUPPORT_AGENT';
  const stats = isAgent ? getAgentStats(user.id) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className={cn(
        "flex flex-col gap-8 items-start",
        isAgent ? "md:flex-row" : "items-center"
      )}>
        {/* Profile Info Card */}
        <Card className={cn(
          "border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden",
          isAgent ? "w-full md:w-1/3" : "w-full max-w-md"
        )}>
          <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5" />
          <CardContent className="relative pt-0 px-6 pb-8">
            <div className="absolute -top-12 left-6">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-900 shadow-md">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl font-black">{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="mt-14 space-y-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight">{user.firstName} {user.lastName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={cn(
                    "font-black text-[10px] uppercase px-2",
                    user.role === 'ADMIN' ? "border-purple-500 text-purple-600" : 
                    user.role === 'SUPPORT_AGENT' ? "border-blue-500 text-blue-600" : "border-slate-300 text-slate-500"
                  )}>
                    {user.role.replace('_', ' ')}
                  </Badge>
                  {user.isActive && (
                    <Badge className="bg-emerald-500 font-black text-[10px] uppercase px-2">
                      Active
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Security Verified</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

          {isAgent && stats && (
            <div className="flex-1 w-full space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Assigned</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.assigned}</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Active</p>
                    <p className="text-2xl font-black text-blue-600">{stats.active}</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Resolved</p>
                    <p className="text-2xl font-black text-emerald-600">{stats.resolved}</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Closed</p>
                    <p className="text-2xl font-black text-slate-500">{stats.closed}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-bold">Average Resolution Time</p>
                      <p className="text-xs text-slate-500">Time from creation to resolution</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-primary">{stats.avgResolutionTime.toFixed(1)}h</p>
                    </div>
                  </div>
                  
                  <Separator className="bg-slate-100 dark:bg-slate-800" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">Current Workload</p>
                      <div className="flex items-center gap-2">
                        {stats.workload && stats.workload.currentWorkload > stats.workload.maxCapacity && (
                          <Badge variant="destructive" className="h-4 px-1.5 text-[8px] font-black uppercase tracking-wider animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5 mr-1" /> Overload
                          </Badge>
                        )}
                        <p className="text-sm font-black">{stats.workload?.currentWorkload} / {stats.workload?.maxCapacity}</p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-500",
                          (stats.workload?.currentWorkload || 0) / (stats.workload?.maxCapacity || 1) >= 0.9 ? "bg-rose-500" : 
                          (stats.workload?.currentWorkload || 0) / (stats.workload?.maxCapacity || 1) >= 0.7 ? "bg-amber-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${((stats.workload?.currentWorkload || 0) / (stats.workload?.maxCapacity || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
      </div>
    </div>
  );
}
