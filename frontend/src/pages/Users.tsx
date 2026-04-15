import { useState, useEffect } from 'react';
import { UserPlus, MoreHorizontal, Power, PowerOff, Search, Mail, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  getAllUsers,
  createUser,
  deleteUser,
  changeUserStatus,
  UserResponse,
  Role,
  Status,
  CreateUserRequest,
} from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/Pagination';
import { toast } from 'sonner';

export default function Users() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Status>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Form State
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'CLIENT' as Role,
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    const res = await getAllUsers();
    if (res.success && res.data) {
      setUsers(res.data);
    } else {
      toast.error(res.message || 'Failed to fetch user directory');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast.error('Required fields missing');
      return;
    }
    setIsSubmitting(true);
    const res = await createUser(newUser);
    if (res.success) {
      toast.success(res.message);
      await fetchUsers();
      setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'CLIENT' as Role });
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
  };

  const handleToggleStatus = async (userId: number, currentStatus: Status) => {
    const newStatus: Status = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const res = await changeUserStatus(userId, newStatus);
    if (res.success) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const res = await deleteUser(userId);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (isLoading)
    return (
      <div className="p-10 text-center font-bold text-slate-500 italic">
        Decrypting User Directory...
      </div>
    );

  return (
    <div className="space-y-6 px-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-black tracking-tight">User Management</h1>
          <p className="text-slate-500">Manage all system users, roles, and account statuses.</p>
        </div>

        <Dialog>
          <DialogTrigger
            render={
              <Button className="gap-2 font-bold">
                <UserPlus className="h-4 w-4" /> Add User
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account with specific roles.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="First Name"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                />
                <Input
                  placeholder="Last Name"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                />
              </div>
              <Input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <Input
                type="password"
                placeholder="Initial Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              <Select
                value={newUser.role}
                onValueChange={(v: Role) => setNewUser({ ...newUser, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="SUPPORT_AGENT">Support Agent</SelectItem>
                  <SelectItem value="CLIENT">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateUser} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="relative w-full max-w-xs">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <Select
          value={roleFilter}
          onValueChange={(v: any) => {
            setRoleFilter(v);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="SUPPORT_AGENT">Agent</SelectItem>
            <SelectItem value="CLIENT">Client</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v: any) => {
            setStatusFilter(v);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden border-none bg-white shadow-sm dark:bg-slate-900">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead className="px-3 text-[10px] font-black uppercase">User</TableHead>
              <TableHead className="px-3 text-[10px] font-black uppercase">Role</TableHead>
              <TableHead className="px-3 text-[10px] font-black uppercase">Status</TableHead>
              <TableHead className="w-[40px] px-3"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow key={user.id} className="border-slate-100 dark:border-slate-800">
                  <TableCell className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{user.fullName}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Mail className="h-3 w-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        'px-1.5 text-[9px] font-black uppercase',
                        user.role === 'ADMIN'
                          ? 'border-purple-500 text-purple-600'
                          : user.role === 'SUPPORT_AGENT'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-slate-300 text-slate-500'
                      )}
                    >
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-4">
                    <Badge
                      className={cn(
                        'px-1.5 text-[9px] font-black uppercase',
                        user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'
                      )}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.status)}>
                          {user.status === 'ACTIVE' ? (
                            <>
                              <PowerOff className="mr-2 h-4 w-4 text-rose-500" /> Deactivate
                            </>
                          ) : (
                            <>
                              <Power className="mr-2 h-4 w-4 text-emerald-500" /> Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        {user.status === 'INACTIVE' && (
                          <DropdownMenuItem
                            className="font-bold text-rose-600"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500 italic">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="border-t border-slate-100 p-3 dark:border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalEntries={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>
    </div>
  );
}
