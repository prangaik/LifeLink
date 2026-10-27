import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Users,
  Activity,
  Heart,
  Clock,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Review Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState('approved');
  const [decisionReason, setDecisionReason] = useState('');

  const fetchData = async () => {
    try {
      const [metricsRes, requestsRes, logsRes] = await Promise.all([
        api.admin.getMetrics(),
        api.admin.getRequests(),
        api.admin.getAuditLogs(),
      ]);

      if (metricsRes.success) setMetrics(metricsRes.metrics);
      if (requestsRes.success) setRequests(requestsRes.requests || []);
      if (logsRes.success) setAuditLogs(logsRes.logs || []);
    } catch (err) {
      setError(err.message || 'Failed to load reviewer dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenReview = (req) => {
    setSelectedRequest(req);
    setReviewAction('approved');
    setDecisionReason('');
    setError('');
  };

  const handleCloseReview = () => {
    setSelectedRequest(null);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!decisionReason || decisionReason.trim().length < 5) {
      return setError('Please enter a descriptive decision reason (min 5 characters) for the audit log.');
    }

    setActionLoading(true);
    setError('');
    try {
      const res = await api.admin.reviewRequest(selectedRequest._id, {
        action: reviewAction,
        decisionReason,
      });

      setSuccess(res.message);
      handleCloseReview();
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading Reviewer Control Center...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldCheck size={24} color="#38bdf8" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Authorized Reviewer Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            In-app verification workflow, hospital request auditing, and transparent decision records
          </p>
        </div>
      </div>

      {success && (
        <div
          style={{
            background: 'var(--success-bg)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            color: '#34d399',
            marginBottom: '1.5rem',
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
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Metrics Row */}
      {metrics && (
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block' }}>Pending Review</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', margin: '0.25rem 0' }}>
              {metrics.pendingReviewRequests}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting verification</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block' }}>Verified Requests</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', margin: '0.25rem 0' }}>
              {metrics.verifiedRequests}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Audited & confirmed</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block' }}>Active Donors</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', margin: '0.25rem 0' }}>
              {metrics.availableDonors} / {metrics.totalDonors}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ready for matching</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block' }}>Fulfilled Requests</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a78bfa', margin: '0.25rem 0' }}>
              {metrics.fulfilledRequests}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Successful donations</span>
          </div>
        </div>
      )}

      {/* Review Queue Table */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div className="card-header">
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Blood Request Review Queue</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              Review hospital credentials and mark requests as verified or rejected
            </p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <CheckCircle2 size={36} className="empty-state-icon" color="var(--success)" />
            <h4>Queue Clear</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              No pending blood requests require auditing at this time.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.75rem' }}>Hospital & Patient</th>
                  <th style={{ padding: '0.75rem' }}>Blood Group</th>
                  <th style={{ padding: '0.75rem' }}>Units</th>
                  <th style={{ padding: '0.75rem' }}>Urgency</th>
                  <th style={{ padding: '0.75rem' }}>Current Status</th>
                  <th style={{ padding: '0.75rem' }}>Requester</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <strong style={{ color: '#fff', display: 'block' }}>{req.hospitalName}</strong>
                      <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        Patient: {req.patientName} • {req.city}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
                        {req.bloodGroup}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{req.unitsRequired}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <UrgencyBadge urgency={req.urgency} />
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {req.requester?.name || 'User'}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenReview(req)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.35rem 0.75rem' }}
                      >
                        Audit Request
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Log Trail */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Audit Trail History</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              Immutable system record of reviewer decisions and administrative actions
            </p>
          </div>
        </div>

        {auditLogs.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            No reviewer actions logged yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditLogs.map((log) => (
              <div
                key={log._id}
                style={{
                  background: 'var(--bg-surface)',
                  padding: '0.85rem 1.25rem',
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
                    <span
                      className={`badge ${log.action === 'approved' ? 'badge-verified' : 'badge-cancelled'}`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {log.action.toUpperCase()}
                    </span>
                    <strong style={{ color: '#fff', fontSize: '0.9rem' }}>
                      {log.request?.hospitalName || 'Blood Request'} ({log.request?.bloodGroup})
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#cbd5e1' }}>
                    Reason: "{log.decisionReason}"
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                    Reviewed by: <strong>{log.reviewer?.name}</strong> • IP: {log.ipAddress || '127.0.0.1'}
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
              Audit Blood Request
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Hospital: <strong>{selectedRequest.hospitalName}</strong> • Patient: {selectedRequest.patientName} (
              {selectedRequest.bloodGroup}, {selectedRequest.unitsRequired} units)
            </p>

            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label className="form-label">Review Decision</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      background: reviewAction === 'approved' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
                      border: `1px solid ${reviewAction === 'approved' ? 'var(--success)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="action"
                      value="approved"
                      checked={reviewAction === 'approved'}
                      onChange={(e) => setReviewAction(e.target.value)}
                    />
                    Approve (Verified)
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      background: reviewAction === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-surface)',
                      border: `1px solid ${reviewAction === 'rejected' ? 'var(--danger)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="action"
                      value="rejected"
                      checked={reviewAction === 'rejected'}
                      onChange={(e) => setReviewAction(e.target.value)}
                    />
                    Reject Request
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Audit Decision Reason (Mandatory)</label>
                <textarea
                  required
                  rows={3}
                  className="form-textarea"
                  placeholder="e.g. Cross-verified with Jehangir Hospital emergency desk. Requisition verified."
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                />
                <span className="form-help">
                  This note will be permanently logged in the audit trail and sent to the requester.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={handleCloseReview}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={reviewAction === 'approved' ? 'btn btn-success' : 'btn btn-danger'}
                >
                  {actionLoading ? 'Recording...' : 'Submit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
