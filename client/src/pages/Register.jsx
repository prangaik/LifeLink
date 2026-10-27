import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { UserPlus, Shield, MapPin, AlertCircle, CheckCircle2, Heart, ArrowRight } from 'lucide-react';
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
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { register } = useAuth();

  const initialRoleParam = searchParams.get('role');
  const isFromRequestBlood =
    location.state?.intent === 'request_blood' ||
    location.state?.from?.pathname === '/requests/create' ||
    initialRoleParam === 'requester';

  const [role, setRole] = useState(isFromRequestBlood ? 'requester' : 'donor');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: 'Pune',
    // Donor-specific fields
    bloodGroup: 'O+',
    latitude: 18.5308,
    longitude: 73.8743,
    isAvailable: true,
    notificationConsent: true,
    notificationChannel: 'in-app',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialRoleParam === 'requester') {
      setRole('requester');
    } else if (initialRoleParam === 'donor') {
      setRole('donor');
    }
  }, [initialRoleParam]);

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
          console.warn('Geolocation unavailable:', err.message);
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

    if (role === 'donor' && !formData.notificationConsent) {
      return setError('Explicit notification consent is required to register as a donor alert recipient.');
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        role: role,
      };

      if (role === 'donor') {
        payload.bloodGroup = formData.bloodGroup;
        payload.latitude = formData.latitude;
        payload.longitude = formData.longitude;
        payload.isAvailable = formData.isAvailable;
        payload.notificationConsent = formData.notificationConsent;
        payload.notificationChannel = formData.notificationChannel;
      } else {
        // Requester does not need donor settings
        payload.bloodGroup = 'Not Specified';
        payload.notificationConsent = true;
        payload.notificationChannel = 'in-app';
      }

      await register(payload);

      // Preserve destination: if from "Request Blood", redirect to /requests/create
      const destination =
        location.state?.from?.pathname ||
        (role === 'requester' ? '/requests/create' : '/requests');

      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '1.5rem auto' }}>
      {/* Intent Banner if arriving from Request Blood */}
      {isFromRequestBlood && (
        <div
          style={{
            background: 'var(--primary-subtle)',
            border: '1px solid rgba(225, 29, 72, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <strong style={{ color: '#fb7185', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Heart size={15} /> Request Blood Workflow
            </strong>
            <span style={{ fontSize: '0.825rem', color: '#cbd5e1' }}>
              Complete this quick requester registration to immediately publish your hospital blood request.
            </span>
          </div>
          <Link
            to="/login"
            state={location.state}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.8rem' }}
          >
            Already have an account? Log in
          </Link>
        </div>
      )}

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
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Create Your Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {role === 'requester'
              ? 'Register as an emergency requester to coordinate blood requests'
              : 'Register as a volunteer donor to receive emergency alerts'}
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            background: 'var(--bg-surface)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setRole('requester')}
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: role === 'requester' ? 'var(--primary)' : 'transparent',
              color: role === 'requester' ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🏥 Requester Account
          </button>

          <button
            type="button"
            onClick={() => setRole('donor')}
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: role === 'donor' ? 'var(--primary)' : 'transparent',
              color: role === 'donor' ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🩸 Volunteer Donor
          </button>
        </div>

        {role === 'requester' && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: '0.8rem',
              color: '#cbd5e1',
              marginBottom: '1.25rem',
            }}
          >
            💡 <strong>Requester Note:</strong> You only need to provide basic contact info. You do{' '}
            <strong>not</strong> need to provide personal donor eligibility or blood group to request blood.
          </div>
        )}

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
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                required
                className="form-input"
                placeholder={role === 'requester' ? 'Requester Full Name' : 'Donor Full Name'}
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                className="form-input"
                placeholder="+91 98220 XXXXX"
                value={formData.phone}
                onChange={handleChange}
              />
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
                placeholder="name@example.com"
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

          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              name="city"
              required
              className="form-input"
              placeholder="e.g. Pune"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          {/* Donor-Specific Fields */}
          {role === 'donor' && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div className="form-group">
                <label className="form-label">Your Blood Group</label>
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

              {/* Approximate Location for Geospatial 2dsphere Matching */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Approximate Location Coordinates</label>
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
                    any time.
                  </span>
                </label>
              </div>

              <div
                style={{
                  margin: '1rem 0',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  fontSize: '0.775rem',
                  color: '#94a3b8',
                }}
              >
                <Shield size={14} color="#38bdf8" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                <strong>Clinical Notice:</strong> Registering as a donor indicates willingness to be notified. It does
                NOT certify clinical eligibility. Cross-matching is strictly conducted by hospital blood banks.
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', marginTop: '1rem' }}
          >
            {loading ? (
              <span className="loading-spinner" style={{ width: '1.2rem', height: '1.2rem' }}></span>
            ) : (
              <CheckCircle2 size={16} />
            )}
            <span>
              {role === 'requester'
                ? isFromRequestBlood
                  ? 'Create Requester Account & Continue to Blood Request'
                  : 'Create Requester Account'
                : 'Complete Donor Registration'}
            </span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            state={location.state}
            style={{ color: 'var(--primary)', fontWeight: 600 }}
          >
            Log In here
          </Link>
        </div>
      </div>
    </div>
  );
};
