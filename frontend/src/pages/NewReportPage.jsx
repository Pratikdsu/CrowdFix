import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const CATEGORIES = [
  { value: 'INFRASTRUCTURE', label: '🏗️ Infrastructure' },
  { value: 'SANITATION', label: '🗑️ Sanitation' },
  { value: 'PUBLIC_SAFETY', label: '🚨 Public Safety' },
  { value: 'UTILITIES', label: '💡 Utilities' },
  { value: 'ENVIRONMENT', label: '🌿 Environment' },
  { value: 'OTHER', label: '📌 Other' },
];

export default function NewReportPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      () => {
        setError('Could not get your location. Please enter coordinates manually.');
        setLocating(false);
      }
    );
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.title || !form.description || !form.category || !form.latitude || !form.longitude) {
      setError('Please fill in all required fields and set your location.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/reports', {
        title: form.title,
        description: form.description,
        category: form.category,
        address: form.address,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      });
      navigate('/my-reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink mb-1">New Report</h1>
      <p className="text-muted mb-6">Report a civic issue in your area.</p>

      {error && (
        <div className="bg-crimson-soft text-crimson text-sm px-4 py-3 rounded-[10px] mb-4">
          {error}
        </div>
      )}

      <div className="space-y-5">

        {/* Title */}
        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">
            Title <span className="text-crimson">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Large pothole on main road"
            className="w-full px-3 py-2.5 rounded-[10px] border border-line bg-bg text-ink text-sm outline-none focus:border-crimson transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">
            Category <span className="text-crimson">*</span>
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-[10px] border border-line bg-bg text-ink text-sm outline-none focus:border-crimson transition-colors"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">
            Description <span className="text-crimson">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the issue in detail..."
            rows={4}
            className="w-full px-3 py-2.5 rounded-[10px] border border-line bg-bg text-ink text-sm outline-none focus:border-crimson transition-colors resize-none"
          />
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">
            Location <span className="text-crimson">*</span>
          </label>
          <button
            onClick={handleLocate}
            disabled={locating}
            className="mb-3 px-4 py-2 rounded-[10px] border border-indigo text-indigo text-sm font-medium hover:bg-indigo hover:text-white transition-colors disabled:opacity-60"
          >
            {locating ? 'Getting location...' : '📍 Use my current location'}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted mb-1 block">Latitude</label>
              <input
                type="text"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="27.7172"
                className="w-full px-3 py-2.5 rounded-[10px] border border-line bg-bg text-ink text-sm outline-none focus:border-crimson transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Longitude</label>
              <input
                type="text"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="85.3240"
                className="w-full px-3 py-2.5 rounded-[10px] border border-line bg-bg text-ink text-sm outline-none focus:border-crimson transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">
            Address <span className="text-muted text-xs">(optional)</span>
          </label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="e.g. New Road, Kathmandu"
            className="w-full px-3 py-2.5 rounded-[10px] border border-line bg-bg text-ink text-sm outline-none focus:border-crimson transition-colors"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-crimson text-white py-2.5 rounded-[10px] text-sm font-semibold hover:bg-crimson-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>

      </div>
    </div>
  );
}