import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, MapPin, Users, HeartHandshake, Eye } from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';

export const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const res = await api.requests.getMyRequests();
        if (res.success) {
          setRequests(res.requests || []);
        }
      } catch (err) {
        console.error('Failed to fetch user requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRequests();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>My Blood Requests</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track donor invitations, real-time responses, and authorized reviewer status
          </p>
        </div>
        <Link to="/requests/create" className="btn btn-primary">
          <PlusCircle size={16} /> Create New Request
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading your requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <HeartHandshake size={48} className="empty-state-icon" />
          <h3>No Blood Requests Found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            You haven't posted any emergency blood requests yet.
          </p>
          <Link to="/requests/create" className="btn btn-primary">
            Create First Request
          </Link>
        </div>
      ) : (
        <div className="grid-2">
          {requests.map((req) => (
            <div key={req._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="blood-group-pill">{req.bloodGroup}</div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem' }}>{req.hospitalName}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <MapPin size={13} color="var(--primary)" />
                        <span>{req.city}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                    <StatusBadge status={req.status} />
                    <UrgencyBadge urgency={req.urgency} />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Units Needed</span>
                    <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{req.unitsRequired}</strong>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', padding: '0 1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Matched / Invited</span>
                    <strong style={{ fontSize: '1.1rem', color: '#38bdf8' }}>{req.matchedDonorCount || 0}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Donors Interested</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--success)' }}>
                      {req.responsesCount?.interested || 0}
                    </strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Expires: {new Date(req.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </span>
                <Link to={`/requests/${req._id}`} className="btn btn-secondary btn-sm">
                  <Eye size={14} /> View Details & Matches
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
