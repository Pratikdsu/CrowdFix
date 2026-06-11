import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, Map, FileText, Bell, LayoutDashboard } from 'lucide-react';
import useAuthStore from '../../lib/authStore';

const navItems = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/new-report', label: 'New Report', icon: PlusCircle },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/my-reports', label: 'My Reports', icon: FileText },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const initials = user && user.name
    ? user.name.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="w-[240px] h-screen bg-surface border-r border-line flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-line">
        <span className="font-display text-xl font-bold text-crimson">CrowdFix</span>
        <span className="font-np text-xl text-indigo ml-1">नेपाल</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(function(item) {
          var Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={function(ref) {
                return 'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors ' + (ref.isActive ? 'bg-crimson-soft text-crimson' : 'text-ink-soft hover:bg-bg-warm');
              }}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-line">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo text-white flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
          <div className="text-sm">
            <div className="font-medium text-ink">{user ? user.name : 'User'}</div>
            <div className="text-muted text-xs capitalize">{user ? user.role : 'Citizen'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
