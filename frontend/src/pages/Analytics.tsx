import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Download, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const performanceData = [
  { name: 'Mark J.', resolved: 45, avgTime: 1.2 },
  { name: 'Sarah M.', resolved: 38, avgTime: 1.5 },
  { name: 'Alex R.', resolved: 22, avgTime: 0.8 },
  { name: 'Elena R.', resolved: 15, avgTime: 2.1 },
];

const statusData = [
  { name: 'Resolved', value: 65, color: '#10b981' },
  { name: 'In Progress', value: 25, color: '#3b82f6' },
  { name: 'Open', value: 10, color: '#f59e0b' },
];

const volumeData = [
  { date: '10/18/2024', volume: 40 },
  { date: '10/19/2024', volume: 35 },
  { date: '10/20/2024', volume: 55 },
  { date: '10/21/2024', volume: 45 },
  { date: '10/22/2024', volume: 60 },
  { date: '10/23/2024', volume: 50 },
  { date: '10/24/2024', volume: 75 },
];

export default function Analytics() {
  const handleExport = () => {
    toast.info('Generating PDF report...');
    setTimeout(() => {
      toast.success('Report downloaded successfully');
    }, 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Intelligence Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Advanced metrics and performance analytics for Sentinel Core.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-bold gap-2">
            <Calendar className="w-4 h-4" />
            10/2024
          </Button>
          <Button onClick={handleExport} className="font-bold gap-2 shadow-lg">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Avg. Resolution</p>
              <h3 className="text-2xl font-black tracking-tighter">1.4 Hours</h3>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> -12% from last month
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Resolution Rate</p>
              <h3 className="text-2xl font-black tracking-tighter">94.2%</h3>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +2.4% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Active Agents</p>
              <h3 className="text-2xl font-black tracking-tighter">12 Agents</h3>
              <p className="text-[10px] text-slate-500 font-bold mt-1">
                Currently handling 42 tickets
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">Agent Performance</CardTitle>
            <CardDescription>Tickets resolved vs Average resolution time (hrs)</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fontWeight: 'bold', fill: '#475569'}}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="resolved" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">Ticket Volume Trend</CardTitle>
            <CardDescription>Daily incoming support requests</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
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
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="var(--color-primary)" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: 'var(--color-primary)', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">Status Distribution</CardTitle>
            <CardDescription>Current snapshot of all ticket states</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black tracking-tighter">128</span>
              <span className="text-[10px] font-black uppercase text-slate-400">Total</span>
            </div>
          </CardContent>
          <div className="px-8 pb-8 flex justify-center gap-6">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
