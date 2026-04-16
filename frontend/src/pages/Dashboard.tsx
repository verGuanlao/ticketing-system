import React, { useEffect, useState } from 'react';
import {
  PauseCircle,
  Ticket,
  PlayCircle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { cn, TicketStatus } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getOverallReport, ReportResponse } from '@/lib/utils';
import { getTicketsByStatus, getAllTickets, TicketResponse } from '@/lib/utils';
import { formatDate } from '@/lib/utils'; // Assuming this helper exists

export default function Dashboard() {
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [pendingTickets, setPendingTickets] = useState<TicketResponse[]>([]);
  const [chartData, setChartData] = useState<{ name: string; tickets: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const [reportRes, pendingRes, allTicketsRes] = await Promise.all([
          getOverallReport(),
          getTicketsByStatus(TicketStatus.PENDING),
          getAllTickets(),
        ]);

        if (reportRes.success) setReport(reportRes.data);

        // Sort by date (descending) before slicing the top 5
        if (pendingRes.success) {
          const sortedPending = [...pendingRes.data].sort(
            (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
          );
          setPendingTickets(sortedPending.slice(0, 5));
        }

        // Calculate volume for the chart
        if (allTicketsRes.success) {
          const volume = calculateLast7DaysVolume(allTicketsRes.data);
          setChartData(volume);
        }
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Helper to process the 7-day volume
  const calculateLast7DaysVolume = (tickets: TicketResponse[]) => {
    const days = 7;
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });

      const count = tickets.filter((t) => {
        const ticketDate = new Date(t.createdDate).toISOString().split('T')[0];
        return ticketDate === dateString;
      }).length;

      result.push({ name: label, tickets: count });
    }
    return result;
  };

  if (loading) return <div className="p-8 text-center">Initializing Command Center...</div>;

  const stats = [
    {
      label: 'Pending',
      value: report?.pendingTickets || 0,
      icon: PauseCircle,
      color: 'text-amber-500',
    },
    { label: 'Open', value: report?.openTickets || 0, icon: Ticket, color: 'text-blue-500' },
    {
      label: 'In Progress',
      value: report?.inProgressTickets || 0,
      icon: PlayCircle,
      color: 'text-indigo-500',
    },
    {
      label: 'Resolved',
      value: report?.resolvedTickets || 0,
      icon: CheckCircle,
      color: 'text-emerald-500',
    },
    { label: 'Closed', value: report?.closedTickets || 0, icon: XCircle, color: 'text-slate-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-black tracking-tight">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="relative overflow-hidden border-none bg-white shadow-sm dark:bg-slate-900"
          >
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  {stat.label}
                </p>
                <h3 className="mt-1 text-2xl font-black tracking-tighter">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Volume Chart */}
        <Card className="border-none bg-white shadow-sm lg:col-span-2 dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Ticket Volume</CardTitle>
            <CardDescription>
              Daily incoming ticket distribution for the past 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="tickets"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorTickets)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Pending */}
        <Card className="border-none bg-white shadow-sm dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Recent Pending</CardTitle>
            <CardDescription>Recently made pending tickets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {pendingTickets.map((ticket) => {
              // Priority Logic
              const priorityLabels: Record<number, string> = {
                0: 'LOW',
                1: 'MEDIUM',
                2: 'HIGH',
                3: 'CRITICAL',
              };

              const priorityLabel = priorityLabels[ticket.priority] || 'LOW';

              return (
                <div key={ticket.id} className="group flex cursor-pointer gap-4">
                  {/* Dynamic Indicator Stripe based on Priority */}
                  <div
                    className={cn(
                      'mt-1 h-12 w-1 rounded-full transition-colors',
                      ticket.priority === 3
                        ? 'bg-rose-500'
                        : ticket.priority === 2
                          ? 'bg-orange-500'
                          : ticket.priority === 1
                            ? 'bg-blue-500'
                            : 'bg-slate-300'
                    )}
                  />

                  <div className="flex-1">
                    <div className="mb-1 flex items-start justify-between">
                      <h4 className="line-clamp-1 text-sm font-bold text-slate-950 transition-colors group-hover:text-primary dark:text-white">
                        {ticket.title}
                      </h4>
                      {/* Date Display */}
                      <span className="ml-2 text-[10px] font-medium whitespace-nowrap text-slate-400">
                        {formatDate(ticket.createdDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        #{ticket.id}
                      </Badge>

                      {/* Priority Badge */}
                      <Badge
                        variant="outline"
                        className={cn(
                          'border-none px-1.5 text-[10px] font-black',
                          ticket.priority === 3
                            ? 'bg-rose-50 text-rose-600'
                            : ticket.priority === 2
                              ? 'bg-orange-50 text-orange-600'
                              : 'bg-slate-50 text-slate-600'
                        )}
                      >
                        {priorityLabel}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
