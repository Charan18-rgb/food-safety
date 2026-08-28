import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

export default function AppShell() {
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gray-50 shadow-xl relative">
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
