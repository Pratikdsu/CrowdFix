import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';
import api from '../lib/api';

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

export default function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/reports/${id}`);
      setReport(res.data);
    } catch (err) {
      setError('Report not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl animate-pulse space-y-4">
        <div className="h-6 bg-bg-warm rounded w-1/2" />
        <div className="h-4 bg-bg-warm rounded w-1/4" />
        <div className="h-32 bg-bg-warm rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl">
        <div className="bg-crimson-soft text-crimson text-sm px-4 py-3 rounded-[10px] mb-4">
          {error}
        </div>
        <Link to="/home" className="text-indigo text-sm font-medium hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Back button */}
      <Link
        to="/home"
        className="flex items-center gap-2 text-muted text-sm mb-6 hover:text-ink transition-colors"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>

      {/* Report card */}
      <div className="bg-surface border border-line rounded-[16px] p-6 mb-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[report.status] || 'bg-bg text-muted'}`}>
            {report.status.replace('_', ' ')}
          </span>
          <span className="text-xs text-muted">
            {CATEGORY_LABELS[report.category] || report.category}
          </span>
        </div>

        <h1 className="font-display text-2xl font-bold text-ink mb-3">
          {report.title}
        </h1>

        <p className="text-ink-soft text-sm leading-relaxed mb-4">
          {report.description}
        </p>

        <div className="flex items-center gap-2 text-sm text-muted mb-4">
          <MapPin size={14} />
          <span>{report.address || `${report.latitude}, ${report.longitude}`}</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted pt-4 border-t border-line">
          <span>👍 {report.upvoteCount || 0} upvotes</span>
          <span>•</span>
          <span>Reported on {new Date(report.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Resolution note */}
      {report.resolutionNote && (
        <div className="bg-teal-soft border border-teal rounded-[16px] p-5 mb-4">
          <h3 className="text-sm font-semibold text-teal mb-2">✅ Resolution Note</h3>
          <p className="text-sm text-ink-soft">{report.resolutionNote}</p>
        </div>
      )}

      {/* Comments */}
      {report.comments && report.comments.length > 0 && (
        <div className="bg-surface border border-line rounded-[16px] p-5">
          <h3 className="font-semibold text-ink text-sm mb-4">
            Comments ({report.comments.length})
          </h3>
          <div className="space-y-4">
            {report.comments.map((comment) => (
              <div key={comment.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-indigo text-white flex items-center justify-center text-xs font-semibold">
                    {comment.user?.name?.charAt(0) || '?'}
                  </div>
                  <span className="text-sm font-medium text-ink">{comment.user?.name || 'Unknown'}</span>
                  <span className="text-xs text-muted">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-ink-soft ml-9">{comment.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}