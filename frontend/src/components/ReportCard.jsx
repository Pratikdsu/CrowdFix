import { MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_STYLES = {
  OPEN: 'bg-crimson-soft text-crimson',
  ASSIGNED: 'bg-saffron-soft text-saffron',
  IN_PROGRESS: 'bg-teal-soft text-teal',
  RESOLVED: 'bg-teal-soft text-teal',
  CLOSED: 'bg-closed-soft text-closed',
};

const CATEGORY_LABELS = {
  INFRASTRUCTURE: '🏗️ Infrastructure',
  SANITATION: '🗑️ Sanitation',
  PUBLIC_SAFETY: '🚨 Public Safety',
  UTILITIES: '💡 Utilities',
  ENVIRONMENT: '🌿 Environment',
  OTHER: '📌 Other',
};

export default function ReportCard({ report }) {
  return (
    <Link
      to={`/report/${report.id}`}
      className="block bg-surface border border-line rounded-[16px] p-5 hover:border-line-strong hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[report.status] || 'bg-bg text-muted'}`}>
              {report.status.replace('_', ' ')}
            </span>
            <span className="text-xs text-muted">
              {CATEGORY_LABELS[report.category] || report.category}
            </span>
          </div>
          <h3 className="font-semibold text-ink text-sm mb-1 truncate">{report.title}</h3>
          <p className="text-muted text-xs line-clamp-2 mb-3">{report.description}</p>
          <div className="flex items-center gap-1 text-xs text-subtle">
            <MapPin size={12} />
            <span className="truncate">{report.address || `${report.latitude}, ${report.longitude}`}</span>
          </div>
        </div>
        <ChevronRight size={16} className="text-subtle flex-shrink-0 mt-1" />
      </div>
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-line text-xs text-muted">
        <span>👍 {report.upvoteCount || 0}</span>
        <span>•</span>
        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}