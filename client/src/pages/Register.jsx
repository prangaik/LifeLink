import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Shield, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ALL_BLOOD_GROUPS } from '../utils/bloodGroups';

const PUNE_PRESETS = [
  { label: 'Shivajinagar / Sassoon', lat: 18.5308, lng: 73.8743 },
  { label: 'Ruby Hall Clinic Area', lat: 18.5342, lng: 73.8812 },
  { label: 'Deccan / FC Road', lat: 18.5144, lng: 73.8412 },
  { label: 'Kothrud / Karve Road', lat: 18.5074, lng: 73.8077 },
  { label: 'Aundh / Baner', lat: 18.5582, lng: 73.8012 },
  { label: 'Swargate / Hadapsar', lat: 18.5018, lng: 73.8636 },
];

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'donor',
    bloodGroup: 'O+',
    city: 'Pune',
    latitude: 18.5308,
    longitude: 73.8743,
    isAvailable: true,
    notificationConsent: true,
    notificationChannel: 'in-app',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      latitude: preset.lat,
      longitude: preset.lng,
    }));
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            latitude: parseFloat(pos.coords.latitude.toFixed(4)),
            longitude: parseFloat(pos.coords.longitude.toFixed(4)),
          }));
        },
        (err) => {
          console.warn('Geolocation denied or unavailable:', err.message);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    if (!formData.notificationConsent) {
      return setError('Explicit notification consent is required to register as a donor alert recipient.');
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/requests');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '1.5rem auto' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--primary-subtle)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <UserPlus size={24} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Create LifeLink Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Register as a volunteer blood donor or emergency requester
          </p>
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
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">Primary Account Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: formData.role === 'donor' ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                  border: `1px solid ${formData.role === 'donor' ? 'var(--primary)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="donor"
                  checked={formData.role === 'donor'}
                  onChange={handleChange}
                />
                Volunteer Donor
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: formData.role === 'requester' ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                  border: `1px solid ${formData.role === 'requester' ? 'var(--primary)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="requester"
                  checked={formData.role === 'requester'}
                  onChange={handleChange}
                />
                Requester
              </label>
            </div>
            <span className="form-help">
              * Note: Reviewer & Admin roles are strictly provisioned by hospital administrators.
            </span>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                required
                className="form-input"
                placeholder="Dr. / Mr. / Ms. Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group</label>
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
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                required
                className="form-input"
                placeholder="donor@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password (min 6 chars)</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                required
                className="form-input"
                placeholder="+91 98220 12345"
                value={formData.phone}
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
                placeholder="Pune"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Approximate Location for Geospatial 2dsphere Matching */}
          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">
                Approximate Location Coordinates (for radius matching)
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
              >
                <MapPin size={12} /> Detect GPS
              </button>
            </div>

            <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '0.5rem' }}>
              <input
                type="number"
                step="0.0001"
                className="form-input"
                placeholder="Latitude"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
              />
              <input
                type="number"
                step="0.0001"
                className="form-input"
                placeholder="Longitude"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
              />
            </div>

            {/* Quick Presets for Demo */}
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginRight: '0.5rem' }}>
                Quick Pune presets:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                {PUNE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notification Preferences & Consent */}
          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginTop: '1.25rem',
            }}
          >
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#fff' }}>
              Notification Channel & Privacy Consent
            </h4>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Preferred Notification Channel</label>
              <select
                name="notificationChannel"
                className="form-select"
                value={formData.notificationChannel}
                onChange={handleChange}
              >
                <option value="in-app">In-App Notifications Only (Browser Alerts)</option>
                <option value="simulated-whatsapp">Simulated WhatsApp Provider (Safe local demo)</option>
              </select>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                fontSize: '0.825rem',
                color: '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                name="notificationConsent"
                checked={formData.notificationConsent}
                onChange={handleChange}
                style={{ marginTop: '3px' }}
              />
              <span>
                <strong>Explicit Notification Consent:</strong> I voluntarily consent to receiving emergency
                blood requirement notifications within my search radius. I can toggle availability or opt out at
                any time from my profile.
              </span>
            </label>
          </div>

          <div
            style={{
              margin: '1.25rem 0',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: '0.775rem',
              color: '#94a3b8',
              lineHeight: '1.5',
            }}
          >
            <Shield size={14} color="#38bdf8" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            <strong>Clinical Notice:</strong> Registering as a donor indicates willingness to be notified. It does
            NOT certify clinical eligibility or pre-screen blood safety. Transfusion suitability is determined solely by
            the destination hospital blood bank.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
          >
            {loading ? <span className="loading-spinner" style={{ width: '1.2rem', height: '1.2rem' }}></span> : <CheckCircle2 size={16} />}
            <span>Complete Registration</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};
