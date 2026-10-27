import React from 'react';
import { CheckCircle2, AlertCircle, Clock, XCircle, CheckCheck, Flame } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'verified':
      return (
        <span className="badge badge-verified">
          <CheckCircle2 size={13} /> Verified Request
        </span>
      );
    case 'unverified':
    case 'pending_review':
      return (
        <span className="badge badge-unverified">
          <Clock size={13} /> Pending Review
        </span>
      );
    case 'fulfilled':
      return (
        <span className="badge badge-fulfilled">
          <CheckCheck size={13} /> Fulfilled
        </span>
      );
    case 'cancelled':
      return (
        <span className="badge badge-cancelled">
          <XCircle size={13} /> Cancelled
        </span>
      );
    case 'expired':
      return (
        <span className="badge badge-expired">
          <Clock size={13} /> Expired
        </span>
      );
    case 'rejected':
      return (
        <span className="badge badge-rejected">
          <XCircle size={13} /> Rejected
        </span>
      );
    default:
      return <span className="badge badge-unverified">{status}</span>;
  }
};

export const UrgencyBadge = ({ urgency }) => {
  switch (urgency) {
    case 'critical':
      return (
        <span className="badge badge-urgency-critical">
          <Flame size={13} /> Critical
        </span>
      );
    case 'high':
      return (
        <span className="badge badge-urgency-high">
          <AlertCircle size={13} /> High Urgency
        </span>
      );
    case 'moderate':
      return (
        <span className="badge badge-urgency-moderate">
          <Clock size={13} /> Moderate
        </span>
      );
    default:
      return <span className="badge badge-urgency-moderate">{urgency}</span>;
  }
};
