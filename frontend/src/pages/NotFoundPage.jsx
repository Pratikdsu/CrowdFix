import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center">
      <h1 className="font-display text-5xl font-bold text-crimson mb-2">404</h1>
      <p className="text-muted mb-4">This page doesn't exist.</p>
      <Link to="/home" className="text-indigo font-medium hover:underline">Go home</Link>
    </div>
  );
}