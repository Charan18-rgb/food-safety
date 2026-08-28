import { NavLink } from 'react-router-dom';
import { Home, ScanLine, Clock, Star } from 'lucide-react';
import clsx from 'clsx';

export default function BottomNavigation() {
  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/scan', icon: ScanLine, label: 'Scan' },
    { to: '/history', icon: Clock, label: 'History' },
    { to: '/saved', icon: Star, label: 'Saved' },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around p-2 z-50 pb-safe">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center w-16 h-12 text-xs transition-colors',
              isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
            )
          }
        >
          <Icon className="w-6 h-6 mb-1" strokeWidth={2} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
