import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const NOTIFICATION_ICONS = {
  STATUS_CHANGE: '🔄',
  COMMENT_ADDED: '💬',
  UPVOTE_MILESTONE: '👍',
  ASSIGNMENT: '📋',
};

export default function NotificationsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/reports?limit=20');
      setReports(res.data.reports || res.data);
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  // Generate notification-style entries from reports
  const notifications = reports.map((report) => ({
    id: report.id,
    icon: report.status === 'ASSIGNED' ? NOTIFICATION_ICONS.ASSIGNMENT
        : report.status === 'IN_PROGRESS' ? NOTIFICATION_ICONS.STATUS_CHANGE
        : report.status === 'RESOLVED' ? '✅'
        : '📌',
    title: report.status === 'RESOLVED'
        ? `Report resolved: "${report.title}"`
        : report.status === 'ASSIGNED'
        ? `Report assigned: "${report.title}"`
        : report.status === 'IN_PROGRESS'
        ? `Work started: "${report.title}"`
        : `New report: "${report.title}"`,
    time: new Date(report.updatedAt || report.createdAt).toLocaleDateString(),
    reportId: report.id,
    status: report.status,
  }));

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink mb-1">Notifications</h1>
          <p className="text-muted text-sm">{notifications.length} recent updates</p>
        </div>
        <button className="text-sm text-indigo font-medium hover:underline">
          Mark all as read
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-surface border border-line rounded-[16px] animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-crimson-soft text-crimson text-sm px-4 py-3 rounded-[10px]">
          {error}
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-muted">No notifications yet.</p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="bg-surface border border-line rounded-[16px] overflow-hidden">
          {notifications.map((n, index) => (
            <Link
              key={n.id}
              to={`/report/${n.reportId}`}
              className={`flex items-start gap-4 px-5 py-4 hover:bg-bg-warm transition-colors ${
                index !== notifications.length - 1 ? 'border-b border-line' : ''
              }`}
            >
              <div className="text-2xl flex-shrink-0 mt-0.5">{n.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink mb-0.5 line-clamp-2">
                  {n.title}
                </p>
                <p className="text-xs text-muted">{n.time}</p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-crimson rounded-full mt-2" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}