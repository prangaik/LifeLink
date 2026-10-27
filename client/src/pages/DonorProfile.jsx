import React, { useState } from 'react';
import { User, Shield, Phone, Bell, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ALL_BLOOD_GROUPS } from '../utils/bloodGroups';

export const DonorProfile = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bloodGroup: user?.bloodGroup || 'O+',
    city: user?.city || 'Pune',
    isAvailable: user?.isAvailable ?? true,
    notificationConsent: user?.notificationConsent ?? true,
    notificationChannel: user?.notificationChannel || 'in-app',
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
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
            <User size={22} color="var(--primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem' }}>Donor Profile & Settings</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Manage your availability status, notification preferences, and contact details
            </p>
          </div>
        </div>

        {success && (
          <div
            style={{
              background: 'var(--success-bg)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: '#34d399',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{success}</span>
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
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Availability Toggle Switch */}
          <div
            style={{
              background: formData.isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${formData.isAvailable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong style={{ color: '#fff', fontSize: '0.95rem', display: 'block' }}>
                Availability for Emergency Alerts
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {formData.isAvailable
                  ? 'You are active and eligible to be matched for nearby emergency blood requests.'
                  : 'You will not appear in donor discovery searches until re-enabled.'}
              </span>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: formData.isAvailable ? 'var(--success)' : 'var(--danger)' }}>
                {formData.isAvailable ? 'AVAILABLE' : 'OFFLINE'}
              </span>
            </label>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                required
                className="form-input"
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
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                required
                className="form-input"
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
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Verification Status Disclaimers */}
          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '1.25rem',
            }}
          >
            <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: '#cbd5e1' }}>
              Verification Status Badges
            </h4>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className={user?.isPhoneVerified ? 'badge badge-verified' : 'badge badge-unverified'}>
                {user?.isPhoneVerified ? 'Phone Verified' : 'Phone Unverified'}
              </span>
              <span className={user?.isMedicallyVerified ? 'badge badge-verified' : 'badge badge-unverified'}>
                {user?.isMedicallyVerified ? 'Hospital Affiliated' : 'Voluntary Self-Reported Blood Group'}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
              * Phone verification is distinct from clinical blood group verification. Clinical screening is always
              performed at the hospital blood bank.
            </p>
          </div>

          {/* Notification Preferences */}
          <div className="form-group">
            <label className="form-label">Notification Dispatch Channel</label>
            <select
              name="notificationChannel"
              className="form-select"
              value={formData.notificationChannel}
              onChange={handleChange}
            >
              <option value="in-app">In-App Alerts Only</option>
              <option value="simulated-whatsapp">Simulated WhatsApp Notifications (Demo)</option>
            </select>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.825rem',
              color: '#cbd5e1',
              margin: '1rem 0 1.5rem',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              name="notificationConsent"
              checked={formData.notificationConsent}
              onChange={handleChange}
            />
            <span>I maintain active consent to receive emergency donor notifications.</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? <span className="loading-spinner" style={{ width: '1.2rem', height: '1.2rem' }}></span> : <Save size={16} />}
            <span>Save Profile Updates</span>
          </button>
        </form>
      </div>
    </div>
  );
};
