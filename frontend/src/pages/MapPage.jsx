import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import api from '../lib/api';

// Fix default marker icon broken by webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLORS = {
  OPEN: '#DC143C',
  ASSIGNED: '#E07B14',
  IN_PROGRESS: '#0F766E',
  RESOLVED: '#0F766E',
  CLOSED: '#78716C',
};

export default function MapPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports?limit=100')
      .then((res) => setReports(res.data.reports || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Center on Kathmandu
  const center = [27.7172, 85.3240];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Map View</h1>
      <p className="text-muted text-sm mb-4">
        {loading ? 'Loading reports...' : `${reports.length} reports on map`}
      </p>

      <div className="rounded-[16px] overflow-hidden border border-line" style={{ height: '600px' }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {reports.map((report) => (
            <Marker
              key={report.id}
              position={[parseFloat(report.latitude), parseFloat(report.longitude)]}
            >
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <div style={{
                    display: 'inline-block',
                    background: STATUS_COLORS[report.status] + '20',
                    color: STATUS_COLORS[report.status],
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    marginBottom: '6px'
                  }}>
                    {report.status.replace('_', ' ')}
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                    {report.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#78716C', marginBottom: '8px' }}>
                    {report.address || `${report.latitude}, ${report.longitude}`}
                  </div>
                  
                   <a href={`/report/${report.id}`}
                    style={{ color: '#003893', fontSize: '12px', fontWeight: '500' }}>
                    View details
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}