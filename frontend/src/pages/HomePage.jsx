import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import ReportCard from '../components/ReportCard';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'INFRASTRUCTURE', label: '🏗️ Infrastructure' },
  { value: 'SANITATION', label: '🗑️ Sanitation' },
  { value: 'PUBLIC_SAFETY', label: '🚨 Public Safety' },
  { value: 'UTILITIES', label: '💡 Utilities' },
  { value: 'ENVIRONMENT', label: '🌿 Environment' },
  { value: 'OTHER', label: '📌 Other' },
];

const STATUSES = [
  { value: '', label: 'All Status' },
  { value: 'OPEN', label: 'Open' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

export default function HomePage() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const LIMIT = 10;

  useEffect(() => {
    fetchReports();
  }, [page, category, status]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      const res = await api.get(`/reports?${params}`);
      setReports(res.data.reports || res.data);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink mb-1">Home Feed</h1>
          <p className="text-muted text-sm">{total} reports found</p>
        </div>
        <Link
          to="/new-report"
          className="bg-crimson text-white px-4 py-2 rounded-[10px] text-sm font-semibold hover:bg-crimson-dark transition-colors"
        >
          + New Report
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-[10px] border border-line bg-surface text-ink text-sm outline-none focus:border-crimson"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-[10px] border border-line bg-surface text-ink text-sm outline-none focus:border-crimson"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-line rounded-[16px] p-5 animate-pulse">
              <div className="h-4 bg-bg-warm rounded w-1/4 mb-3" />
              <div className="h-4 bg-bg-warm rounded w-3/4 mb-2" />
              <div className="h-3 bg-bg-warm rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-crimson-soft text-crimson text-sm px-4 py-3 rounded-[10px]">
          {error}
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-muted">No reports found.</p>
          <Link to="/new-report" className="text-indigo text-sm font-medium hover:underline mt-2 inline-block">
            Be the first to report an issue
          </Link>
        </div>
      )}

      {!loading && !error && reports.length > 0 && (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-[10px] border border-line text-sm font-medium text-ink hover:bg-bg-warm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-muted">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-[10px] border border-line text-sm font-medium text-ink hover:bg-bg-warm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}