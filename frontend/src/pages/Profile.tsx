import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Mail, Shield, BarChart3, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// API Services
import { getCurrentUser, getMaxWorkload } from '@/lib/utils';
import { getAgentPerformanceById } from '@/lib/utils';
import { UserResponse, AgentPerformanceResponse, Status } from '@/lib/utils';

export default function Profile() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [performance, setPerformance] = useState<AgentPerformanceResponse | null>(null);
  const [maxWorkload, setMaxWorkload] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      setIsLoading(true);
      try {
        const userRes = await getCurrentUser();

        if (userRes.success && userRes.data) {
          const currentUser = userRes.data;
          setUser(currentUser);

          // Only fetch performance and workload if the user is an Agent or Admin
          if (currentUser.role === 'SUPPORT_AGENT' || currentUser.role === 'ADMIN') {
            const [perfRes, workloadRes] = await Promise.all([
              getAgentPerformanceById(currentUser.id),
              getMaxWorkload(),
            ]);

            if (perfRes.success) setPerformance(perfRes.data);
            if (workloadRes.success) setMaxWorkload(workloadRes.data);
            console.log(perfRes.data.workload);
          }
        }
      } catch (error) {
        console.error('Failed to load profile context:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfileData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <div className="py-20 text-center">User not found.</div>;

  const isAgent = user.role === 'SUPPORT_AGENT';

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div
        className={cn('flex flex-col items-start gap-8', isAgent ? 'md:flex-row' : 'items-center')}
      >
        {/* Profile Info Card */}
        <Card
          className={cn(
            'overflow-hidden border-none bg-white shadow-sm dark:bg-slate-900',
            isAgent ? 'w-full md:w-1/3' : 'w-full max-w-md'
          )}
        >
          <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5" />
          <CardContent className="relative px-6 pt-0 pb-8">
            <div className="absolute -top-12 left-6">
              <Avatar className="h-24 w-24 border-4 border-white shadow-md dark:border-slate-900">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl font-black">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="mt-14 space-y-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  {user.firstName} {user.lastName}
                </h1>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'px-2 text-[10px] font-black uppercase',
                      user.role === 'ADMIN'
                        ? 'border-purple-500 text-purple-600'
                        : user.role === 'SUPPORT_AGENT'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-slate-300 text-slate-500'
                    )}
                  >
                    {user.role.replace('_', ' ')}
                  </Badge>
                  {user.status === Status.ACTIVE && (
                    <Badge className="bg-emerald-500 px-2 text-[10px] font-black uppercase">
                      Active
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Security Verified</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Stats Section */}
        {isAgent && performance && (
          <div className="w-full flex-1 space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Assigned" value={performance.totalAssigned} />
              <StatCard label="Active" value={performance.activeTickets} color="text-blue-600" />
              <StatCard
                label="Resolved"
                value={performance.resolvedTickets}
                color="text-emerald-600"
              />
              <StatCard label="Closed" value={performance.closedTickets} color="text-slate-500" />
            </div>

            <Card className="border-none bg-white shadow-sm dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-black tracking-wider uppercase">
                  <BarChart3 className="h-4 w-4 text-primary" />
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
                    <p className="text-xl font-black text-primary">
                      {(performance?.averageResolutionTimeHours ?? 0).toFixed(1)}h
                    </p>
                  </div>
                </div>

                <Separator className="bg-slate-100 dark:bg-slate-800" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Current Workload</p>
                    <div className="flex items-center gap-2">
                      {performance.workload > maxWorkload && (
                        <Badge
                          variant="destructive"
                          className="h-4 animate-pulse px-1.5 text-[8px] font-black tracking-wider uppercase"
                        >
                          <AlertTriangle className="mr-1 h-2.5 w-2.5" /> Overload
                        </Badge>
                      )}
                      <p className="text-sm font-black">
                        {performance.workload} / {maxWorkload}
                      </p>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={cn(
                        'h-full transition-all duration-500',
                        performance.workload / maxWorkload >= 0.9
                          ? 'bg-rose-500'
                          : performance.workload / maxWorkload >= 0.7
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      )}
                      style={{
                        width: `${Math.min((performance.workload / maxWorkload) * 100, 100)}%`,
                      }}
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

// Simple internal component for the mini stat cards
const StatCard = ({ label, value, color }: { label: string; value: number; color?: string }) => (
  <Card className="border-none bg-white shadow-sm dark:bg-slate-900">
    <CardContent className="flex flex-col items-center justify-center p-4 text-center">
      <p className="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
        {label}
      </p>
      <p className={cn('text-2xl font-black', color || 'text-slate-900 dark:text-white')}>
        {value}
      </p>
    </CardContent>
  </Card>
);
