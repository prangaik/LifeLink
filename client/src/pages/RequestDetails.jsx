import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Heart,
  Users,
  CheckCircle2,
  XCircle,
  Radio,
  Send,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const RequestDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [request, setRequest] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [responses, setResponses] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Donor response state
  const [responseStatus, setResponseStatus] = useState('interested');
  const [responseMsg, setResponseMsg] = useState('');

  // Selected donor IDs for manual invite
  const [selectedDonors, setSelectedDonors] = useState([]);

  const fetchRequestDetails = async () => {
    try {
      const res = await api.requests.getById(id);
      if (res.success) {
        setRequest(res.request);
        setIsOwner(res.isOwner);
        setResponses(res.responses || []);

        // If owner or reviewer, fetch geospatial potential matches
        if (res.isOwner || (user && ['reviewer', 'admin'].includes(user.role))) {
          fetchMatches();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load request details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    setMatchingLoading(true);
    try {
      const res = await api.matches.getPotential(id);
      if (res.success) {
        setMatches(res.matches || []);
        // By default select all discovered matches
        setSelectedDonors((res.matches || []).map((m) => m._id));
      }
    } catch (err) {
      console.warn('Could not discover matches:', err.message);
    } finally {
      setMatchingLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id, user]);

  const handleInviteDonors = async () => {
    if (selectedDonors.length === 0) return;
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.matches.inviteDonors(id, selectedDonors);
      setSuccessMsg(res.message);
      fetchRequestDetails();
    } catch (err) {
      setError(err.message || 'Failed to send invitations.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDonorResponse = async (status) => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.responses.respond(id, {
        status,
        message: responseMsg,
      });
      setSuccessMsg(res.message);
      fetchRequestDetails();
    } catch (err) {
      setError(err.message || 'Failed to record response.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!window.confirm('Are you sure you want to cancel this emergency request?')) return;
    setActionLoading(true);
    try {
      await api.requests.cancel(id);
      setSuccessMsg('Request successfully cancelled.');
      fetchRequestDetails();
    } catch (err) {
      setError(err.message || 'Failed to cancel request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFulfillRequest = async () => {
    setActionLoading(true);
    try {
      await api.requests.fulfill(id);
      setSuccessMsg('Request marked as fulfilled. Thank you to all donors!');
      fetchRequestDetails();
    } catch (err) {
      setError(err.message || 'Failed to fulfill request.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading emergency request...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="empty-state">
        <AlertTriangle size={48} className="empty-state-icon" color="var(--danger)" />
        <h3>Request Not Found</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          This blood request does not exist or was removed.
        </p>
        <Link to="/requests" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Feed
        </Link>
      </div>
    );
  }

  const isExpired = new Date() > new Date(request.expiresAt);
  const isActive = ['unverified', 'verified'].includes(request.status) && !isExpired;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <MedicalDisclaimer />

      {error && (
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            marginBottom: '1.25rem',
          }}
        >
          {error}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            background: 'var(--success-bg)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            color: '#34d399',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Request Summary Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="blood-group-pill" style={{ width: '56px', height: '56px', fontSize: '1.4rem' }}>
              {request.bloodGroup}
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>{request.hospitalName}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <MapPin size={15} color="var(--primary)" />
                <span>{request.city}</span>
                <span>•</span>
                <span>Coordinates: [{request.location.coordinates[1].toFixed(4)}, {request.location.coordinates[0].toFixed(4)}]</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
            <UrgencyBadge urgency={request.urgency} />
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Reviewer Note Banner if approved/rejected */}
        {request.reviewedBy && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: request.status === 'verified' ? 'var(--success-bg)' : 'var(--danger-bg)',
              border: `1px solid ${request.status === 'verified' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <ShieldCheck size={20} color={request.status === 'verified' ? 'var(--success)' : 'var(--danger)'} />
            <div>
              <strong style={{ color: '#fff', fontSize: '0.875rem' }}>
                Authorized In-App Review Decision: {request.reviewStatus.toUpperCase()}
              </strong>
              <div style={{ color: '#cbd5e1', fontSize: '0.825rem', marginTop: '2px' }}>
                Reviewed by: {request.reviewedBy.name || 'Medical Review Team'}
              </div>
              {request.reviewNotes && (
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px', fontStyle: 'italic' }}>
                  Audit Note: "{request.reviewNotes}"
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid-3" style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block' }}>Patient Identifier</span>
            <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{request.patientName}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block' }}>Units Needed</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{request.unitsRequired} Pint(s)</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block' }}>Search Radius</span>
            <strong style={{ fontSize: '1.1rem', color: '#38bdf8' }}>{request.searchRadiusKm || 25} km</strong>
          </div>
        </div>

        {request.additionalNotes && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Clinical Notes</h4>
            <p style={{ background: 'var(--bg-dark)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: '#cbd5e1' }}>
              {request.additionalNotes}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Phone size={15} color="var(--primary)" />
            <span>Emergency Contact: <strong style={{ color: '#fff' }}>{request.contactPhone}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            <Clock size={14} />
            <span>Expires: {new Date(request.expiresAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Owner Action Buttons */}
        {isOwner && isActive && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={handleFulfillRequest}
              disabled={actionLoading}
              className="btn btn-success"
            >
              <CheckCircle2 size={16} /> Mark as Fulfilled
            </button>
            <button
              onClick={handleCancelRequest}
              disabled={actionLoading}
              className="btn btn-danger"
            >
              <XCircle size={16} /> Cancel Request
            </button>
          </div>
        )}
      </div>

      {/* Workflow D: Donor Direct Response (if authenticated donor and request is active) */}
      {isAuthenticated && !isOwner && isActive && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid rgba(225, 29, 72, 0.4)' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Volunteer Donor Response</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Are you safely eligible and available to donate for this patient at {request.hospitalName}?
          </p>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Message for Requester (e.g. ETA or hospital arrival time)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. I am in the area and can reach the blood bank within 30 minutes."
              value={responseMsg}
              onChange={(e) => setResponseMsg(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => handleDonorResponse('interested')}
              disabled={actionLoading}
              className="btn btn-primary"
            >
              <Heart size={16} /> I Can Donate (Express Interest)
            </button>
            <button
              onClick={() => handleDonorResponse('declined')}
              disabled={actionLoading}
              className="btn btn-secondary"
            >
              Unavailable (Decline)
            </button>
          </div>
        </div>
      )}

      {/* Workflow C: Geospatial Matched Donors (Owner / Reviewer View) */}
      {(isOwner || (user && ['reviewer', 'admin'].includes(user.role))) && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Geospatial 2dsphere Matched Donors</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                Volunteers with compatible blood types discovered within {request.searchRadiusKm || 25} km
              </p>
            </div>
            {matches.length > 0 && isActive && (
              <button
                onClick={handleInviteDonors}
                disabled={actionLoading || selectedDonors.length === 0}
                className="btn btn-primary btn-sm"
              >
                <Send size={14} /> Invite Selected ({selectedDonors.length})
              </button>
            )}
          </div>

          {matchingLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                Calculating geospatial proximity...
              </p>
            </div>
          ) : matches.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <Users size={32} className="empty-state-icon" />
              <h4>No Potential Donors Discovered in Radius</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.25rem' }}>
                No active donors currently registered within {request.searchRadiusKm} km matching blood group {request.bloodGroup}.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-dim)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Select</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Donor</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Blood Group</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>City</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Proximity</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((donor) => {
                    const isSelected = selectedDonors.includes(donor._id);
                    return (
                      <tr key={donor._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDonors((prev) => [...prev, donor._id]);
                              } else {
                                setSelectedDonors((prev) => prev.filter((id) => id !== donor._id));
                              }
                            }}
                          />
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{donor.name}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{donor.bloodGroup}</span>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{donor.city}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <span className="badge badge-urgency-moderate" style={{ textTransform: 'none' }}>
                            ~{donor.approximateDistanceKm} km away
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Workflow D: Donor Responses Table (Owner View) */}
      {(isOwner || (user && ['reviewer', 'admin'].includes(user.role))) && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Donor Response Tracking</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                Real-time responses received from contacted volunteer donors
              </p>
            </div>
          </div>

          {responses.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <Radio size={32} className="empty-state-icon" />
              <h4>No Responses Received Yet</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.25rem' }}>
                Invited donors will appear here as soon as they confirm availability.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {responses.map((resp) => (
                <div
                  key={resp._id}
                  style={{
                    background: 'var(--bg-surface)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <strong style={{ color: '#fff' }}>{resp.donor.name}</strong>
                      <span className="badge badge-verified" style={{ textTransform: 'none' }}>
                        {resp.donor.bloodGroup}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      Contact: <strong style={{ color: '#38bdf8' }}>{resp.donor.phone}</strong> • {resp.donor.city}
                    </div>
                    {resp.message && (
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.35rem', fontStyle: 'italic' }}>
                        "{resp.message}"
                      </div>
                    )}
                  </div>

                  <div>
                    {resp.status === 'interested' ? (
                      <span className="badge badge-verified">
                        <CheckCircle2 size={13} /> Available to Donate
                      </span>
                    ) : (
                      <span className="badge badge-cancelled">
                        <XCircle size={13} /> Declined
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
