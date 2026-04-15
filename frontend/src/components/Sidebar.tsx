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
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { Button } from './ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useUI();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['ADMIN', 'SUPPORT_AGENT', 'CLIENT'] },
    { label: 'My Tickets', icon: Ticket, path: '/tickets', roles: ['ADMIN', 'SUPPORT_AGENT', 'CLIENT'] },
    { label: 'Assigned', icon: Users, path: '/assigned', roles: ['SUPPORT_AGENT'] },
    { label: 'Agents', icon: Users, path: '/agents', roles: ['ADMIN'] },
    { label: 'Clients', icon: Users, path: '/clients', roles: ['ADMIN'] },
    { label: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['ADMIN'] },
    { label: 'Profile', icon: UserCircle, path: '/profile', roles: ['ADMIN', 'SUPPORT_AGENT', 'CLIENT'] },
  ];

  const filteredItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className={cn(
      "h-screen fixed left-0 top-0 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 z-50 transition-all duration-300 ease-in-out",
      sidebarCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn(
        "flex items-center px-2 mb-10 transition-all duration-300",
        sidebarCollapsed ? "justify-center" : "gap-3"
      )}>
        <div className="w-10 h-10 rounded bg-primary flex items-center justify-center shrink-0">
          <Shield className="text-white w-6 h-6" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="text-xl font-bold tracking-tighter text-slate-950 dark:text-white leading-none">Sentinel Core</h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Enterprise Support</p>
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
                      "flex items-center rounded-lg transition-colors duration-200 text-sm font-medium",
                      sidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                      location.pathname === item.path
                        ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                }
              />
              <TooltipContent side="right">
                {item.label}
              </TooltipContent>
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
                    "w-full justify-center bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
                    sidebarCollapsed ? "p-0 h-10 w-10 mx-auto" : "gap-2"
                  )}
                >
                  <PlusCircle className="w-4 h-4" />
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
                  onClick={logout}
                  className={cn(
                    "w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
                    sidebarCollapsed ? "p-0 h-10 w-10 mx-auto justify-center" : "gap-3"
                  )}
                >
                  <LogOut className="w-5 h-5" />
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
