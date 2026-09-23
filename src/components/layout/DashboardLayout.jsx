// src/components/layout/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-50 flex">
      {/* Sidebar - fixed on the left */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area (offset on desktop by fixed sidebar width) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden lg:pl-64">
        {/* Header - fixed at the top */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable Body - only this container scrolls */}
        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
