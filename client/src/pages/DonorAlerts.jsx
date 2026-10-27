import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Heart, CheckCircle2, XCircle, MapPin, Clock, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';

export const DonorAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAlerts = async () => {
    try {
      const res = await api.responses.getMyAlerts();
      if (res.success) {
        setAlerts(res.alerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch donor alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleRespond = async (requestId, status) => {
    setActionLoading(true);
    setMessage('');
    try {
      const res = await api.responses.respond(requestId, {
        status,
        message: status === 'interested' ? 'Confirmed availability through Donor Alerts.' : 'Unable to donate.',
      });
      setMessage(res.message);
      fetchAlerts();
    } catch (err) {
      alert(err.message || 'Failed to update response.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Donor Emergency Alerts</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Hospital blood requests matching your registered blood group and proximity
        </p>
      </div>

      {message && (
        <div
          style={{
            background: 'var(--success-bg)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            color: '#34d399',
            marginBottom: '1.5rem',
          }}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Checking incoming alerts...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="empty-state">
          <Radio size={48} className="empty-state-icon" />
          <h3>No Active Alerts for Your Profile</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            When a hospital request matches your blood group and geographic area, invitations will appear here.
          </p>
          <Link to="/requests" className="btn btn-secondary">
            Browse All Public Requests
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {alerts.map((alert) => {
            const req = alert.request;
            if (!req) return null;
            const isInterested = alert.status === 'interested';
            const isDeclined = alert.status === 'declined';

            return (
              <div key={alert._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="blood-group-pill">{req.bloodGroup}</div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem' }}>{req.hospitalName}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                        <MapPin size={13} color="var(--primary)" />
                        <span>{req.city}</span>
                        <span>•</span>
                        <span>Units Needed: <strong>{req.unitsRequired}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                    <UrgencyBadge urgency={req.urgency} />
                    <StatusBadge status={req.status} />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.825rem', color: '#cbd5e1' }}>
                    Requester Contact: <strong style={{ color: '#38bdf8' }}>{req.contactPhone || 'Available upon acceptance'}</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Your Current Response:{' '}
                    <strong style={{ color: isInterested ? 'var(--success)' : isDeclined ? 'var(--danger)' : '#fbbf24' }}>
                      {alert.status.toUpperCase()}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <Link to={`/requests/${req._id}`} className="btn btn-outline btn-sm">
                    View Full Request <ArrowRight size={13} />
                  </Link>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleRespond(req._id, 'interested')}
                      disabled={actionLoading || isInterested}
                      className="btn btn-primary btn-sm"
                    >
                      <CheckCircle2 size={14} /> I Can Donate
                    </button>
                    <button
                      onClick={() => handleRespond(req._id, 'declined')}
                      disabled={actionLoading || isDeclined}
                      className="btn btn-secondary btn-sm"
                    >
                      <XCircle size={14} /> Decline
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
