import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, PlusCircle, Heart, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import { ALL_BLOOD_GROUPS } from '../utils/bloodGroups';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const RequestsFeed = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState('');
  const [urgency, setUrgency] = useState('');
  const [city, setCity] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (bloodGroup) params.bloodGroup = bloodGroup;
      if (urgency) params.urgency = urgency;
      if (city) params.city = city;

      const res = await api.requests.getAll(params);
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch requests feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [bloodGroup, urgency, city]);

  return (
    <div>
      <MedicalDisclaimer />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Emergency Blood Feed</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Active hospital requests in need of registered volunteer donors
          </p>
        </div>
        <Link to="/requests/create" className="btn btn-primary">
          <PlusCircle size={16} /> Request Blood
        </Link>
      </div>

      {/* Filter Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
          <Filter size={16} />
          <span>Filters:</span>
        </div>

        <select
          value={bloodGroup}
          onChange={(e) => setBloodGroup(e.target.value)}
          className="form-select"
          style={{ width: 'auto', minWidth: '140px', padding: '0.45rem 0.75rem' }}
        >
          <option value="">All Blood Groups</option>
          {ALL_BLOOD_GROUPS.map((bg) => (
            <option key={bg} value={bg}>
              {bg}
            </option>
          ))}
        </select>

        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          className="form-select"
          style={{ width: 'auto', minWidth: '140px', padding: '0.45rem 0.75rem' }}
        >
          <option value="">All Urgencies</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="moderate">Moderate</option>
        </select>

        <input
          type="text"
          placeholder="Filter by city (e.g. Pune)..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="form-input"
          style={{ width: 'auto', minWidth: '200px', padding: '0.45rem 0.75rem' }}
        />

        {(bloodGroup || urgency || city) && (
          <button
            onClick={() => {
              setBloodGroup('');
              setUrgency('');
              setCity('');
            }}
            className="btn btn-secondary btn-sm"
          >
            Reset
          </button>
        )}
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Filtering emergency requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <Heart size={44} className="empty-state-icon" />
          <h3>No Matching Requests Found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1rem' }}>
            No active blood requirements matched your selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {requests.map((req) => (
            <div key={req._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div className="blood-group-pill">{req.bloodGroup}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                    <UrgencyBadge urgency={req.urgency} />
                    <StatusBadge status={req.status} />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>{req.hospitalName}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.825rem', marginBottom: '0.75rem' }}>
                  <MapPin size={14} color="var(--primary)" />
                  <span>{req.city}</span>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                  Units Required: <strong>{req.unitsRequired} unit(s)</strong>
                </p>

                {req.additionalNotes && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic', marginBottom: '1rem' }}>
                    "{req.additionalNotes}"
                  </p>
                )}
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Expires: {new Date(req.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </span>
                <Link to={`/requests/${req._id}`} className="btn btn-outline btn-sm">
                  View Details & Matches <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
