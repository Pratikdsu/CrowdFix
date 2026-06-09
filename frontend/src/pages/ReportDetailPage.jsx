import { useParams } from 'react-router-dom';

export default function ReportDetailPage() {
  const { id } = useParams();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Report Detail</h1>
      <p className="text-muted">Showing report ID: {id} (Built in Phase 8)</p>
    </div>
  );
}