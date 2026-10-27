import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requireReviewer = false }) => {
  const { user, loading, isAuthenticated, isReviewer } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Validating session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const isRequestBlood = location.pathname === '/requests/create';
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          intent: isRequestBlood ? 'request_blood' : undefined,
        }}
        replace
      />
    );
  }

  if (requireReviewer && !isReviewer) {
    return <Navigate to="/requests" replace />;
  }

  return children;
};
