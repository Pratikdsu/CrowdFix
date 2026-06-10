import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="font-display text-3xl font-bold text-crimson">CrowdFix</span>
          <span className="font-np text-3xl text-indigo ml-1">नेपाल</span>
        </div>
        <div className="bg-surface rounded-[16px] shadow-lg border border-line p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}