import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Activity,
  MapPin,
  ShieldCheck,
  Bell,
  ArrowRight,
  Clock,
  CheckCircle,
  Users,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const Home = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.requests.getAll();
        if (res.success) {
          setRequests(res.requests.slice(0, 6)); // Top 6 requests
        }
      } catch (err) {
        console.error('Failed to load active requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div>
      {/* Medical Disclaimer Banner */}
      <MedicalDisclaimer />

      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '3rem 1rem 4rem',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-subtle)',
            border: '1px solid rgba(225, 29, 72, 0.3)',
            color: '#fb7185',
            fontSize: '0.825rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
          }}
        >
          <Activity size={15} /> Emergency Peer-to-Peer Blood Discovery Network
        </div>

        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
          Connect with Nearby Blood Donors{' '}
          <span className="text-gradient">When Every Minute Counts</span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
          LifeLink pairs urgent hospital blood requests with registered, verified local donors using
          real-time geospatial proximity matching and transparent review auditing.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/requests/create" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            <Heart size={18} /> Request Emergency Blood
          </Link>
          <Link to="/register" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            Register as Volunteer Donor <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Core Workflow Pillars */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '2rem' }}>
          Engineered for Reliability and Clinical Transparency
        </h2>

        <div className="grid-3">
          <div className="card">
            <div style={{ background: 'rgba(225, 29, 72, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <MapPin size={24} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Geospatial 2dsphere Matching</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Real backend MongoDB geospatial queries calculate precise radius distances without exposing private donor GPS coordinates or phone numbers in discovery.
            </p>
          </div>

          <div className="card">
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={24} color="#38bdf8" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Authorized Review Pipeline</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Hospital blood requests are audited by authorized personnel with immutable audit logs. Unreviewed requests are never falsely labelled as verified.
            </p>
          </div>

          <div className="card">
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Bell size={24} color="var(--success)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Simulated WhatsApp & In-App</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Clean notification abstraction with in-app alerts and local simulated WhatsApp provider that clearly identifies simulations without incurring charges.
            </p>
          </div>
        </div>
      </section>

      {/* Live Emergency Feed */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>Active Emergency Requests</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Ongoing hospital blood requirements needing potential volunteers
            </p>
          </div>
          <Link to="/requests" className="btn btn-secondary btn-sm">
            View All Requests ({requests.length})
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading active requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <Heart size={40} className="empty-state-icon" />
            <h3>No Active Blood Requests</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              There are currently no active emergency requests. Seed sample data or create one!
            </p>
          </div>
        ) : (
          <div className="grid-3">
            {requests.map((req) => (
              <div key={req._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div className="blood-group-pill">{req.bloodGroup}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                      <UrgencyBadge urgency={req.urgency} />
                      <StatusBadge status={req.status} />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>{req.hospitalName}</h3>
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
                    View & Respond
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
