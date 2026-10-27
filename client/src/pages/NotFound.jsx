import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 2rem' }}>
        <AlertCircle size={56} color="var(--primary)" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>404 - Page Not Found</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.925rem' }}>
          The page or emergency resource you requested could not be located.
        </p>
        <Link to="/" className="btn btn-primary">
          <Home size={16} /> Return to Homepage
        </Link>
      </div>
    </div>
  );
};
