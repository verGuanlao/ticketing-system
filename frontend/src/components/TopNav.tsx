import React, { useEffect, useState } from 'react';
import { Bell, HelpCircle, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUI } from '@/contexts/UIContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
// Import your service and types
import { getCurrentUser } from '@/lib/utils';
import { UserResponse } from '@/lib/utils';

export const TopNav = () => {
  const { toggleSidebar, sidebarCollapsed } = useUI();
  const [userData, setUserData] = useState<UserResponse | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await getCurrentUser();
      if (res.success) {
        setUserData(res.data);
      }
    };
    fetchUser();
  }, []);

  // Helper to get initials for fallback
  const getInitials = () => {
    if (!userData) return '??';
    return `${userData.firstName?.[0] || ''}${userData.lastName?.[0] || ''}`;
  };

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
      </div>

      <div className="flex items-center gap-4">
        <div className="mx-2 h-8 w-px bg-slate-200 dark:bg-slate-800" />
        <Link to="/profile" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="hidden text-right sm:block">
            <p className="text-xs leading-none font-bold text-slate-950 dark:text-white">
              {userData ? `${userData.firstName} ${userData.lastName}` : 'Loading...'}
            </p>
            <p className="mt-1 text-[10px] font-medium text-slate-500 uppercase">
              {userData?.role?.replace('_', ' ') || 'User'}
            </p>
          </div>
          <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-800">
            {/* Using optional chaining for safety */}
            <AvatarImage src={userData?.avatar} alt="User Avatar" />
            <AvatarFallback className="bg-primary text-[10px] font-bold text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
};
