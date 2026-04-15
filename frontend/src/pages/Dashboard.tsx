import React from 'react';
import { 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MOCK_TICKETS, MOCK_USERS } from '@/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { cn, formatDate } from '@/lib/utils';

const data = [
  { name: 'Mon', tickets: 12 },
  { name: 'Tue', tickets: 19 },
  { name: 'Wed', tickets: 15 },
  { name: 'Thu', tickets: 22 },
  { name: 'Fri', tickets: 30 },
  { name: 'Sat', tickets: 10 },
  { name: 'Sun', tickets: 8 },
];

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Tickets', value: '128', icon: Ticket, trend: '+12%', trendUp: true },
    { label: 'Avg. Response', value: '1.2h', icon: Clock, trend: '-8%', trendUp: false },
    { label: 'Resolved', value: '94', icon: CheckCircle2, trend: '+5%', trendUp: true },
    { label: 'Critical', value: '3', icon: AlertCircle, trend: '0%', trendUp: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Command Center</h1>
        <p className="text-slate-500 dark:text-slate-400">Real-time operational overview for {user?.firstName}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden relative">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <stat.icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                  stat.trendUp ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "bg-rose-50 text-rose-600 dark:bg-rose-900/20"
                )}>
                  {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.trend}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <h3 className="text-3xl font-black tracking-tighter mt-1">{stat.value}</h3>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">Ticket Volume</CardTitle>
                <CardDescription>Daily incoming ticket distribution</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="text-xs font-bold">Last 7 Days</Button>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#94a3b8'}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#94a3b8'}}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="tickets" 
                  stroke="var(--color-primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTickets)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">Recent Activity</CardTitle>
            <CardDescription>Latest updates across the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {MOCK_TICKETS.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="flex gap-4 group cursor-pointer">
                <div className={cn(
                  "w-1 h-12 rounded-full mt-1",
                  ticket.priority === 'CRITICAL' ? "bg-rose-500" : 
                  ticket.priority === 'HIGH' ? "bg-amber-500" : "bg-blue-500"
                )} />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-slate-950 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                      {ticket.title}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap ml-2">{formatDate(ticket.createdDate)}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                    {ticket.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] font-black px-1.5 py-0 h-4 uppercase">
                      #{ticket.id}
                    </Badge>
                    <Badge className={cn(
                      "text-[10px] font-black px-1.5 py-0 h-4 uppercase",
                      ticket.status === 'IN_PROGRESS' ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                    )}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-xs font-bold text-slate-500 hover:text-primary">
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
