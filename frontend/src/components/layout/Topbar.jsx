import { Search, Bell } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="h-16 bg-surface border-b border-line flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2 bg-bg-warm rounded-[10px] px-3 py-2 w-80">
        <Search size={16} className="text-subtle" />
        <input
          type="text"
          placeholder="Search reports..."
          className="bg-transparent outline-none text-sm w-full text-ink placeholder:text-subtle"
        />
      </div>
      <button className="relative p-2 rounded-[10px] hover:bg-bg-warm">
        <Bell size={20} className="text-ink-soft" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-crimson rounded-full" />
      </button>
    </header>
  );
}