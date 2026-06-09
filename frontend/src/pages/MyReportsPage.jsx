import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import ReportCard from '../components/ReportCard';

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/reports/my');
      setReports(res.data.reports || res.data);
    } catch (err) {
      setError('Failed to load your reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink mb-1">My Reports</h1>
          <p className="text-muted text-sm">{reports.length} reports submitted</p>
        </div>
        <Link
          to="/new-report"
          className="bg-crimson text-white px-4 py-2 rounded-[10px] text-sm font-semibold hover:bg-crimson-dark transition-colors"
        >
          + New Report
        </Link>
      </div>

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
          <p className="text-4xl mb-3">📝</p>
          <p className="text-muted">You haven't submitted any reports yet.</p>
          <Link
            to="/new-report"
            className="text-indigo text-sm font-medium hover:underline mt-2 inline-block"
          >
            Submit your first report
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
    </div>
  );
}