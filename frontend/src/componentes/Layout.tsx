import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function Layout() {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar abierto={abierto} onCerrar={() => setAbierto(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenu={() => setAbierto(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
