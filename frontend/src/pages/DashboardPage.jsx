import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const STATUS_STYLES = {
  OPEN: 'bg-crimson-soft text-crimson',
  ASSIGNED: 'bg-saffron-soft text-saffron',
  IN_PROGRESS: 'bg-teal-soft text-teal',
  RESOLVED: 'bg-teal-soft text-teal',
  CLOSED: 'bg-closed-soft text-closed',
};

const STATUSES = [
  { value: '', label: 'All Status' },
  { value: 'OPEN', label: 'Open' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'INFRASTRUCTURE', label: '🏗️ Infrastructure' },
  { value: 'SANITATION', label: '🗑️ Sanitation' },
  { value: 'PUBLIC_SAFETY', label: '🚨 Public Safety' },
  { value: 'UTILITIES', label: '💡 Utilities' },
  { value: 'ENVIRONMENT', label: '🌿 Environment' },
  { value: 'OTHER', label: '📌 Other' },
];

export default function DashboardPage() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  const LIMIT = 15;

  useEffect(() => {
    fetchReports();
  }, [page, status, category]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (status) params.append('status', status);
      if (category) params.append('category', category);
      const res = await api.get(`/reports?${params}`);
      setReports(res.data.reports || res.data);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Authority Dashboard</h1>
        <p className="text-muted text-sm">{total} total reports</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        {['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`p-4 rounded-[16px] border text-left transition-all ${
              status === s ? 'border-crimson bg-crimson-soft' : 'border-line bg-surface hover:border-line-strong'
            }`}
          >
            <div className={`text-xs font-semibold mb-1 ${STATUS_STYLES[s]?.split(' ')[1] || 'text-ink'}`}>
              {s.replace('_', ' ')}
            </div>
            <div className="text-2xl font-bold text-ink">
              {reports.filter((r) => r.status === s).length}
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-[10px] border border-line bg-surface text-ink text-sm outline-none focus:border-crimson"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-[10px] border border-line bg-surface text-ink text-sm outline-none focus:border-crimson"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        {(status || category) && (
          <button
            onClick={() => { setStatus(''); setCategory(''); setPage(1); }}
            className="px-3 py-2 rounded-[10px] border border-line text-sm text-muted hover:bg-bg-warm"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-surface border border-line rounded-[10px] animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-crimson-soft text-crimson text-sm px-4 py-3 rounded-[10px]">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-surface border border-line rounded-[16px] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-bg-warm">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted">
                    No reports found.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="border-b border-line last:border-0 hover:bg-bg-warm transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink truncate max-w-[200px]">{report.title}</div>
                      <div className="text-xs text-muted truncate max-w-[200px]">{report.address}</div>
                    </td>
                    <td className="px-4 py-3 text-muted">{report.category}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[report.status] || 'bg-bg text-muted'}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/report/${report.id}`}
                        className="text-indigo text-xs font-medium hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
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