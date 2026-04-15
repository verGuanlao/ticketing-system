import { Search, Bell, HelpCircle, Menu, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export const TopNav = () => {
  const { user } = useAuth();
  const { toggleSidebar, sidebarCollapsed } = useUI();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950/80',
        sidebarCollapsed ? 'left-20' : 'left-64'
      )}
    >
      <div className="flex flex-1 items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-slate-500 hover:text-slate-950 dark:hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative w-full max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-9 w-full border-none bg-slate-100 pl-10 text-sm dark:bg-slate-900"
            placeholder="Search ticket ID or subject..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 transition-all hover:text-slate-950 dark:hover:text-white">
          <Bell className="h-5 w-5" />
        </button>
        <button className="p-2 text-slate-500 transition-all hover:text-slate-950 dark:hover:text-white">
          <HelpCircle className="h-5 w-5" />
        </button>

        <div className="mx-2 h-8 w-px bg-slate-200 dark:bg-slate-800" />

        <Link to="/profile" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="hidden text-right sm:block">
            <p className="text-xs leading-none font-bold text-slate-950 dark:text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="mt-1 text-[10px] font-medium text-slate-500 uppercase">
              {user?.role.replace('_', ' ')}
            </p>
          </div>
          <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-800">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>
              {user?.firstName[0]}
              {user?.lastName[0]}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
};
