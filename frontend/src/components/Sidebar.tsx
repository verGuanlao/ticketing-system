import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Users,
  UserCircle,
  LogOut,
  Shield,
  PlusCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getUserRole, logout } from '../auth/authService';

export const Sidebar = () => {
  const role = getUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar } = useUI();

  const handleLogout = async () => {
    const res = await logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/',
      roles: ['ADMIN', 'SUPPORT_AGENT', 'CLIENT'],
    },
    {
      label: 'My Tickets',
      icon: Ticket,
      path: '/tickets',
      roles: ['ADMIN', 'SUPPORT_AGENT', 'CLIENT'],
    },
    { label: 'Assigned', icon: Users, path: '/assigned', roles: ['SUPPORT_AGENT'] },
    { label: 'Agents', icon: Users, path: '/agents', roles: ['ADMIN'] },
    { label: 'Clients', icon: Users, path: '/clients', roles: ['ADMIN'] },
    { label: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['ADMIN'] },
    {
      label: 'Profile',
      icon: UserCircle,
      path: '/profile',
      roles: ['ADMIN', 'SUPPORT_AGENT', 'CLIENT'],
    },
  ];

  const filteredItems = navItems.filter((item) => {
    if (!role) return false;
    return item.roles.includes(role);
  });
  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-slate-50 p-4 transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div
        className={cn(
          'mb-10 flex items-center px-2 transition-all duration-300',
          sidebarCollapsed ? 'justify-center' : 'gap-3'
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary">
          <Shield className="h-6 w-6 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="text-xl leading-none font-bold tracking-tighter text-slate-950 dark:text-white">
              Sentinel Core
            </h1>
            <p className="text-[10px] font-medium tracking-wider text-slate-500 uppercase">
              Enterprise Support
            </p>
          </div>
        )}
      </div>

      <TooltipProvider delay={0}>
        <nav className="flex-1 space-y-1">
          {filteredItems.map((item) => (
            <Tooltip key={item.path} disabled={!sidebarCollapsed}>
              <TooltipTrigger
                render={
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center rounded-lg text-sm font-medium transition-colors duration-200',
                      sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                      location.pathname === item.path
                        ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white'
                        : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                }
              />
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>

      <div className="mt-auto space-y-4">
        <TooltipProvider delay={0}>
          <Tooltip disabled={!sidebarCollapsed}>
            <TooltipTrigger
              render={
                <Button
                  onClick={() => navigate('/tickets/new')}
                  className={cn(
                    'w-full justify-center bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200',
                    sidebarCollapsed ? 'mx-auto h-10 w-10 p-0' : 'gap-2'
                  )}
                >
                  <PlusCircle className="h-4 w-4" />
                  {!sidebarCollapsed && <span>New Ticket</span>}
                </Button>
              }
            />
            <TooltipContent side="right">New Ticket</TooltipContent>
          </Tooltip>

          <Tooltip disabled={!sidebarCollapsed}>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className={cn(
                    'w-full justify-start text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20',
                    sidebarCollapsed ? 'mx-auto h-10 w-10 justify-center p-0' : 'gap-3'
                  )}
                >
                  <LogOut className="h-5 w-5" />
                  {!sidebarCollapsed && <span>Logout</span>}
                </Button>
              }
            />
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
};
