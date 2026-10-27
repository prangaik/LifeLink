import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, MapPin, AlertTriangle, ShieldCheck, Flame, CheckCircle } from 'lucide-react';
import { api } from '../api/client';
import { ALL_BLOOD_GROUPS } from '../utils/bloodGroups';
import { useAuth } from '../context/AuthContext';
import { INDIA_STATES_AND_UTS, INDIA_CITIES_BY_STATE } from '../data/indiaLocations';

export const CreateRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'B+',
    unitsRequired: 2,
    hospitalName: '',
    city: 'Pune',
    latitude: 18.5204,
    longitude: 73.8567,
    urgency: 'high',
    searchRadiusKm: 25,
    contactPhone: user?.phone || '',
    additionalNotes: '',
    expiryHours: 24,
    autoMatch: true,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Derive city list for the selected state
  const citiesForState = useMemo(() => {
    return INDIA_CITIES_BY_STATE[selectedState] || [];
  }, [selectedState]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    const cities = INDIA_CITIES_BY_STATE[newState] || [];
    if (cities.length > 0) {
      setFormData((prev) => ({
        ...prev,
        city: cities[0].name,
        latitude: cities[0].lat,
        longitude: cities[0].lng,
      }));
    }
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    const cityObj = citiesForState.find((c) => c.name === cityName);
    if (cityObj) {
      setFormData((prev) => ({
        ...prev,
        city: cityObj.name,
        latitude: cityObj.lat,
        longitude: cityObj.lng,
      }));
    } else {
      setFormData((prev) => ({ ...prev, city: cityName }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.hospitalName || !formData.patientName) {
      return setError('Please provide patient initials and hospital name.');
    }

    if (!formData.latitude || !formData.longitude) {
      return setError('Please select a valid city to set the hospital location.');
    }

    setLoading(true);
    try {
      const res = await api.requests.create(formData);
      if (res.success && res.request) {
        setSuccess(true);
        setTimeout(() => navigate(`/requests/${res.request._id}`), 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to create blood request.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: '480px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <CheckCircle size={32} color="var(--success)" />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Request Published!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Matching donors are being notified. Redirecting to your request…
          </p>
          <div className="loading-spinner" style={{ margin: '1.5rem auto 0' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '760px', margin: '1rem auto' }}>
      <div className="card">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.75rem',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '1.25rem',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'var(--primary-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <PlusCircle size={22} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>Create Emergency Blood Request</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Geospatial donor matching runs automatically after submission
            </p>
          </div>
        </div>

        {/* Error Message */}
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
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertTriangle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Patient & Blood */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Patient Identifier / Initials</label>
              <input
                type="text"
                name="patientName"
                required
                className="form-input"
                placeholder="e.g. P. Kulkarni"
                value={formData.patientName}
                onChange={handleChange}
              />
              <span className="form-help">Keep minimal for patient privacy</span>
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

          {/* Units & Urgency */}
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
                <option value="critical">🔴 Critical — Immediate surgical requirement</option>
                <option value="high">🟠 High — Needed within 6–12 hours</option>
                <option value="moderate">🟡 Moderate — Scheduled / elective procedure</option>
              </select>
            </div>
          </div>

          {/* Hospital Name */}
          <div className="form-group">
            <label className="form-label">Hospital / Blood Bank Name</label>
            <input
              type="text"
              name="hospitalName"
              required
              className="form-input"
              placeholder="e.g. Jehangir Hospital, Pune"
              value={formData.hospitalName}
              onChange={handleChange}
            />
          </div>

          {/* Location: State + City */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                <MapPin size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                State / Union Territory
              </label>
              <select className="form-select" value={selectedState} onChange={handleStateChange}>
                {INDIA_STATES_AND_UTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              {citiesForState.length > 0 ? (
                <select className="form-select" value={formData.city} onChange={handleCityChange}>
                  {citiesForState.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  placeholder="Enter city name"
                  value={formData.city}
                  onChange={handleChange}
                />
              )}
            </div>
          </div>

          {/* Coordinates (read-only display) */}
          {formData.latitude && formData.longitude && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 0.9rem',
                background: 'rgba(56, 189, 248, 0.06)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                color: '#38bdf8',
                marginBottom: '1.25rem',
              }}
            >
              <ShieldCheck size={14} />
              <span>
                Hospital location set: <strong>{formData.city}</strong> (
                {formData.latitude.toFixed(4)}°N, {formData.longitude.toFixed(4)}°E) — used for
                geospatial 2dsphere donor matching
              </span>
            </div>
          )}

          {/* Search Radius & Expiry */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                Search Radius: <strong>{formData.searchRadiusKm} km</strong>
              </label>
              <input
                type="range"
                name="searchRadiusKm"
                min={5}
                max={100}
                step={5}
                value={formData.searchRadiusKm}
                onChange={handleChange}
                style={{ width: '100%', accentColor: 'var(--primary)', marginTop: '0.4rem' }}
              />
              <span className="form-help">
                Donors within this radius will be invited automatically
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Request Expiry</label>
              <select
                name="expiryHours"
                className="form-select"
                value={formData.expiryHours}
                onChange={handleChange}
              >
                <option value={6}>6 Hours</option>
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours</option>
                <option value={48}>48 Hours</option>
                <option value={72}>72 Hours</option>
              </select>
            </div>
          </div>

          {/* Contact Phone */}
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
            <span className="form-help">
              Shared with matched donors only — not shown in public listing
            </span>
          </div>

          {/* Notes */}
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

          {/* Auto-match toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              fontSize: '0.85rem',
              color: '#cbd5e1',
              margin: '1rem 0 1.5rem',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              name="autoMatch"
              checked={formData.autoMatch}
              onChange={handleChange}
              style={{ marginTop: '2px', accentColor: 'var(--primary)' }}
            />
            <span>
              <strong style={{ color: '#f1f5f9' }}>Auto-Discover &amp; Invite Matched Donors:</strong>{' '}
              Immediately run geospatial 2dsphere discovery and alert matching volunteers within{' '}
              {formData.searchRadiusKm} km upon creation.
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '1rem',
              gap: '0.6rem',
            }}
          >
            {loading ? (
              <span className="loading-spinner" style={{ width: '1.2rem', height: '1.2rem' }} />
            ) : (
              <Flame size={18} />
            )}
            <span>{loading ? 'Publishing Request…' : 'Publish Blood Request & Trigger Matching'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
