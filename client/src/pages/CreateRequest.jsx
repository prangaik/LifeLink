import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, MapPin, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import { api } from '../api/client';
import { ALL_BLOOD_GROUPS } from '../utils/bloodGroups';
import { useAuth } from '../context/AuthContext';

const HOSPITAL_PRESETS = [
  { name: 'Jehangir Hospital, Pune', city: 'Pune', lat: 18.5305, lng: 73.8778 },
  { name: 'Ruby Hall Clinic, Pune', city: 'Pune', lat: 18.5342, lng: 73.8812 },
  { name: 'Sassoon General Hospital, Pune', city: 'Pune', lat: 18.5308, lng: 73.8743 },
  { name: 'KEM Hospital, Pune', city: 'Pune', lat: 18.5198, lng: 73.8645 },
  { name: 'Sahyadri Super Speciality Hospital, Deccan', city: 'Pune', lat: 18.5144, lng: 73.8412 },
  { name: 'Deenanath Mangeshkar Hospital, Erandwane', city: 'Pune', lat: 18.5024, lng: 73.8276 },
];

export const CreateRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'B+',
    unitsRequired: 2,
    hospitalName: 'Jehangir Hospital, Pune',
    city: 'Pune',
    latitude: 18.5305,
    longitude: 73.8778,
    urgency: 'high',
    searchRadiusKm: 25,
    contactPhone: user?.phone || '',
    additionalNotes: '',
    expiryHours: 24,
    autoMatch: true,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectHospitalPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      hospitalName: preset.name,
      city: preset.city,
      latitude: preset.lat,
      longitude: preset.lng,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.hospitalName || !formData.patientName) {
      return setError('Please provide patient initials and hospital name.');
    }

    setLoading(true);
    try {
      const res = await api.requests.create(formData);
      if (res.success && res.request) {
        navigate(`/requests/${res.request._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create blood request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '1rem auto' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'var(--primary-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlusCircle size={22} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>Create Emergency Blood Request</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Coordinate with registered volunteer donors in your hospital's geographic vicinity
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Quick Hospital Presets for Demonstration */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
              Quick Hospital Presets (Pune Evaluation Area):
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {HOSPITAL_PRESETS.map((hosp) => (
                <button
                  key={hosp.name}
                  type="button"
                  onClick={() => handleSelectHospitalPreset(hosp)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.6rem',
                    background: formData.hospitalName === hosp.name ? 'var(--primary-subtle)' : undefined,
                    borderColor: formData.hospitalName === hosp.name ? 'var(--primary)' : undefined,
                  }}
                >
                  {hosp.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Patient Identifier / Initials</label>
              <input
                type="text"
                name="patientName"
                required
                className="form-input"
                placeholder="e.g. P. Kulkarni (Keep minimal for privacy)"
                value={formData.patientName}
                onChange={handleChange}
              />
              <span className="form-help">Minimal non-sensitive identifier</span>
            </div>

            <div className="form-group">
              <label className="form-label">Required Blood Group</label>
              <select
                name="bloodGroup"
                className="form-select"
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                {ALL_BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Units Required (Pints)</label>
              <input
                type="number"
                name="unitsRequired"
                min={1}
                max={20}
                required
                className="form-input"
                value={formData.unitsRequired}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Urgency Level</label>
              <select
                name="urgency"
                className="form-select"
                value={formData.urgency}
                onChange={handleChange}
              >
                <option value="critical">Critical (Immediate surgical requirement)</option>
                <option value="high">High (Needed within 6-12 hours)</option>
                <option value="moderate">Moderate (Scheduled / elective procedure)</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Hospital / Blood Bank Name</label>
              <input
                type="text"
                name="hospitalName"
                required
                className="form-input"
                placeholder="Hospital Name"
                value={formData.hospitalName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                required
                className="form-input"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Location Coordinates for 2dsphere indexing */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Hospital Latitude</label>
              <input
                type="number"
                step="0.0001"
                required
                className="form-input"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hospital Longitude</label>
              <input
                type="number"
                step="0.0001"
                required
                className="form-input"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Search Radius (Kilometers)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="range"
                  name="searchRadiusKm"
                  min={5}
                  max={50}
                  step={5}
                  value={formData.searchRadiusKm}
                  onChange={handleChange}
                  style={{ flex: 1, accentColor: 'var(--primary)' }}
                />
                <span style={{ fontWeight: 700, width: '55px', textAlign: 'right' }}>
                  {formData.searchRadiusKm} km
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Request Expiry</label>
              <select
                name="expiryHours"
                className="form-select"
                value={formData.expiryHours}
                onChange={handleChange}
              >
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours</option>
                <option value={48}>48 Hours</option>
                <option value={72}>72 Hours</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Direct Emergency Contact Phone</label>
            <input
              type="text"
              name="contactPhone"
              required
              className="form-input"
              placeholder="+91 98220 XXXXX"
              value={formData.contactPhone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Hospital Case Notes (Optional)</label>
            <textarea
              name="additionalNotes"
              className="form-textarea"
              placeholder="e.g. Ward 4, Orthopedic Surgery Desk. Cross-matching slip ready."
              value={formData.additionalNotes}
              onChange={handleChange}
            />
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.85rem',
              color: '#cbd5e1',
              margin: '1.25rem 0',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              name="autoMatch"
              checked={formData.autoMatch}
              onChange={handleChange}
            />
            <span>
              <strong>Auto-Discover & Invite Matched Donors:</strong> Automatically run geospatial 2dsphere
              discovery and alert matching volunteers within {formData.searchRadiusKm} km immediately upon creation.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
          >
            {loading ? <span className="loading-spinner" style={{ width: '1.2rem', height: '1.2rem' }}></span> : <Flame size={18} />}
            <span>Publish Blood Request & Trigger Matching</span>
          </button>
        </form>
      </div>
    </div>
  );
};
