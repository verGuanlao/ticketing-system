import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { UIProvider, useUI } from '../contexts/UIContext';
import { cn } from '../lib/utils.ts';

const LayoutContent = () => {
  const { sidebarCollapsed } = useUI();

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
    </div>
  );
};

export const Layout = () => (
  <UIProvider>
    <LayoutContent />
  </UIProvider>
);
