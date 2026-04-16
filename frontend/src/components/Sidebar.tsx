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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUI } from '@/contexts/UIContext';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getUserRole, logout } from '../auth/authService';

export const Sidebar = () => {
  const role = getUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed } = useUI();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['ADMIN'] },
    {
      label: 'My Tickets',
      icon: Ticket,
      path: '/tickets',
      roles: ['ADMIN', 'SUPPORT_AGENT', 'CLIENT'],
    },
    { label: 'Assigned', icon: Users, path: '/assigned', roles: ['SUPPORT_AGENT'] },
    { label: 'Agents', icon: Users, path: '/agents', roles: ['ADMIN'] },
    { label: 'Users', icon: Users, path: '/users', roles: ['ADMIN'] },
    {
      label: 'Profile',
      icon: UserCircle,
      path: '/profile',
      roles: ['ADMIN', 'SUPPORT_AGENT', 'CLIENT'],
    },
  ];

  const filteredItems = navItems.filter((item) => role && item.roles.includes(role));

  return (
    <aside
      className={cn(
        // Added inset-y-0 and h-full to ensure it physically reaches the bottom
        'fixed inset-y-0 left-0 z-50 flex h-full h-screen flex-col border-r border-slate-200 bg-slate-50 p-4 transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* 1. TOP SECTION: Logo */}
      <div
        className={cn(
          'mb-10 flex shrink-0 items-center px-2',
          sidebarCollapsed ? 'justify-center' : 'gap-3'
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary">
          <Shield className="h-6 w-6 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden font-bold whitespace-nowrap">
            <h1 className="text-xl leading-none tracking-tighter">Sentinel Core</h1>
            <p className="text-[10px] text-slate-500 uppercase">Enterprise Support</p>
          </div>
        )}
      </div>

      {/* 2. MIDDLE SECTION: Navigation (The Stretcher) */}
      {/* flex-1 + min-h-0 is the secret sauce to force expansion */}
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <TooltipProvider delay={0}>
          <nav className="space-y-1">
            {filteredItems.map((item) => (
              <Tooltip key={item.path} disabled={!sidebarCollapsed}>
                <TooltipTrigger
                  render={
                    <Link
                      to={item.path}
                      className={cn(
                        'flex items-center rounded-lg text-sm font-medium transition-all',
                        sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                        location.pathname === item.path
                          ? 'border border-slate-200 bg-white text-slate-950 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'
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
      </div>

      {/* 3. BOTTOM SECTION: Actions */}
      {/* mt-auto and shrink-0 anchor this to the floor */}
      <div className="mt-auto shrink-0 pt-6">
        <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
          <TooltipProvider delay={0}>
            {/* New Ticket Button */}
            <Tooltip disabled={!sidebarCollapsed}>
              <TooltipTrigger
                render={
                  <Button
                    onClick={() => navigate('/tickets/new')}
                    className={cn(
                      'w-full justify-center bg-slate-950 font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]',
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

            {/* Logout Button */}
            <Tooltip disabled={!sidebarCollapsed}>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className={cn(
                      'w-full justify-start font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20',
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
      </div>
    </aside>
  );
};
