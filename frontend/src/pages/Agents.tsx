import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Search,
  UserPlus,
  MoreHorizontal,
  Power,
  PowerOff,
  Trash2,
  TrendingUp,
  Settings2,
} from 'lucide-react';

import {
  getOverallReport,
  createUser,
  deleteUser,
  changeUserStatus,
  ReportResponse,
  AgentPerformanceResponse,
  Role,
  Status,
  CreateUserRequest,
} from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/Pagination';
import { cn } from '@/lib/utils';

export default function Agents() {
  // --- State ---
  const [agents, setAgents] = useState<AgentPerformanceResponse[]>([]);
  const [reportTotals, setReportTotals] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Workload Configuration
  const [maxWorkload, setMaxWorkload] = useState(10);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Status>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // --- Helpers ---
  const getWorkloadColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio >= 0.9) return 'text-rose-600 font-black';
    if (ratio >= 0.7) return 'text-amber-600 font-bold';
    return 'text-emerald-600 font-bold';
  };

  const getProgressBarColor = (ratio: number) => {
    if (ratio >= 0.9) return 'bg-rose-600';
    if (ratio >= 0.7) return 'bg-amber-600';
    return 'bg-emerald-600';
  };

  // --- Data Fetching ---
  const fetchReport = async () => {
    setIsLoading(true);
    const res = await getOverallReport();
    if (res.success && res.data) {
      setReportTotals(res.data);
      setAgents(Object.values(res.data.agentPerformance));
    } else {
      toast.error(res.message || 'Failed to sync with Sentinel Core');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // --- Actions ---
  const handleChangeUserStatus = async (userId: number, newStatus: Status) => {
    const res = await changeUserStatus(userId, newStatus);
    if (res.success) {
      setAgents((prev) =>
        prev.map((item) =>
          item.agent.id === userId ? { ...item, agent: { ...item.agent, status: newStatus } } : item
        )
      );
      toast.success(`Status updated to ${newStatus}`);
    } else {
      toast.error(res.message);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const res = await deleteUser(userId);
    if (res.success) {
      setAgents((prev) => prev.filter((item) => item.agent.id !== userId));
      toast.success('Personnel purged');
    } else {
      toast.error(res.message);
    }
  };

  // --- Filter Logic ---
  const filteredAgents = agents.filter((item) => {
    const a = item.agent;
    const matchesSearch =
      a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAgents.length / pageSize);
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center font-bold text-slate-500 italic">
        Decrypting...
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-900">
            Agent Management
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-500">
              Monitor performance and manage support personnel.
            </p>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1">
              <Settings2 className="h-3.5 w-3.5 text-slate-500" />
              <Label className="text-[10px] font-black text-slate-500 uppercase">Global Cap:</Label>
              <input
                type="number"
                value={maxWorkload}
                onChange={(e) => setMaxWorkload(Number(e.target.value))}
                className="w-10 border-b border-slate-300 bg-transparent text-xs font-bold focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-none bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-slate-400 uppercase">
              Total Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{reportTotals?.totalTickets || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-slate-400 uppercase">
              System Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {(
                (agents.reduce((acc, curr) => acc + curr.activeTickets, 0) /
                  (agents.length * maxWorkload)) *
                100
              ).toFixed(0)}
              %
            </div>
            <p className="mt-1 text-[10px] font-bold text-slate-400">
              RELATIVE TO {maxWorkload} CAP / AGENT
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-slate-400 uppercase">
              Avg Resolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {reportTotals?.averageResolutionTimeHours != null
                ? reportTotals.averageResolutionTimeHours.toFixed(1)
                : '0.0'}
              h
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="space-y-1.5">
          <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Search Agents
          </Label>
          <div className="relative w-full max-w-xs">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search agents..."
              className="h-9 border-none bg-white pl-9 text-sm shadow-sm dark:bg-slate-900"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Account Status
          </Label>
          <Select
            value={statusFilter}
            onValueChange={(v: any) => {
              setStatusFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[130px] border-none bg-white text-xs font-bold shadow-sm dark:bg-slate-900">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-none bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="text-[10px] font-black uppercase">Personnel</TableHead>
              <TableHead className="text-[10px] font-black uppercase">Status</TableHead>
              <TableHead className="text-center text-[10px] font-black uppercase">
                Workload
              </TableHead>
              <TableHead className="text-center text-[10px] font-black uppercase">
                Active/Resolved
              </TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase">Avg Res</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAgents.map((item) => {
              const workloadRatio = item.activeTickets / maxWorkload;
              const workloadPercent = Math.min(Math.round(workloadRatio * 100), 100);

              return (
                <TableRow key={item.agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary">
                        {item.agent.firstName[0]}
                        {item.agent.lastName[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold">{item.agent.fullName}</p>
                        <p className="text-[10px] text-slate-500">{item.agent.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'text-[9px] font-black uppercase',
                        item.agent.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'
                      )}
                    >
                      {item.agent.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      {/* Using your custom color function */}
                      <span
                        className={cn(
                          'text-[10px]',
                          getWorkloadColor(item.activeTickets, maxWorkload)
                        )}
                      >
                        {workloadPercent}%
                      </span>
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn(
                            'h-full transition-all duration-500',
                            getProgressBarColor(workloadRatio)
                          )}
                          style={{ width: `${workloadPercent}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-3 text-xs">
                      <span className="font-bold text-blue-600">{item.activeTickets}</span>
                      <span className="text-slate-300">/</span>
                      <span className="font-bold text-emerald-600">{item.resolvedTickets}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs font-black">
                    {item.averageResolutionTimeHours != null
                      ? item.averageResolutionTimeHours.toFixed(1)
                      : '0.0'}
                    h
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleChangeUserStatus(
                              item.agent.id,
                              item.agent.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE
                            )
                          }
                        >
                          {item.agent.status === 'ACTIVE' ? 'Set Inactive' : 'Set Active'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(item.agent.id)}
                          disabled={item.agent.status === 'ACTIVE'}
                          className="font-bold text-rose-600"
                        >
                          Purge
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="border-t bg-slate-50/50 p-4">
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
