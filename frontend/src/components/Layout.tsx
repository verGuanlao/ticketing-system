import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useAuth } from '../contexts/AuthContext';
import { UIProvider, useUI } from '../contexts/UIContext';
import { Toaster } from './ui/sonner';
import { cn } from '../lib/utils.ts';

const LayoutContent = () => {
  const { user, isLoading } = useAuth();
  const { sidebarCollapsed } = useUI();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <Sidebar />
      <div
        className={cn(
          'flex min-h-screen flex-col transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'pl-20' : 'pl-64'
        )}
      >
        <TopNav />
        <main className="mx-auto w-full max-w-7xl flex-1 p-8 pt-24">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export const Layout = () => (
  <UIProvider>
    <LayoutContent />
  </UIProvider>
);
