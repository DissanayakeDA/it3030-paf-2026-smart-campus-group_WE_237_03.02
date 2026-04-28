import { NavLink } from 'react-router-dom';

interface SidebarItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export default function SidebarItem({ to, label, icon, badge }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      end={to === '/dashboard' || to === '/bookings'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg mx-3 text-sm font-medium transition-colors duration-150 ${
          isActive
            ? 'bg-[#B9D6F2] text-[#003559]'
            : 'text-[#B9D6F2] hover:bg-[#0353A4] hover:text-white'
        }`
      }
    >
      <span className="w-5 h-5 flex-shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  );
}
