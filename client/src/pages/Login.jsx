import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, ShieldAlert, Heart, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isRequestBloodIntent =
    location.state?.intent === 'request_blood' ||
    location.state?.from?.pathname === '/requests/create';

  const destination = location.state?.from?.pathname || '/requests';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '2rem auto' }}>
      {/* If coming from "Request Blood" flow, show clear choice options */}
      {isRequestBloodIntent && (
        <div
          style={{
            background: 'var(--primary-subtle)',
            border: '1px solid rgba(225, 29, 72, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#fb7185', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
            <Heart size={16} /> Requesting Blood
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1rem' }}>
            To create and coordinate an emergency blood request, you need an account.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <span
              className="btn btn-primary btn-sm"
              style={{ cursor: 'default', background: 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              1. Log In Below
            </span>
            <Link
              to="/register?role=requester"
              state={{ from: { pathname: '/requests/create' }, intent: 'request_blood' }}
              className="btn btn-secondary btn-sm"
            >
              <UserPlus size={14} /> 2. Or Create Requester Account
            </Link>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--primary-subtle)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <LogIn size={24} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Sign In to LifeLink</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {isRequestBloodIntent
              ? 'Log in to continue submitting your blood request'
              : 'Log in to manage blood requests or donor availability'}
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
          >
            {loading ? <span className="loading-spinner" style={{ width: '1.2rem', height: '1.2rem' }}></span> : <LogIn size={16} />}
            <span>Sign In</span>
          </button>
        </form>

        {/* Clear Registration Options */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            New to LifeLink? Create an account:
          </div>

          <Link
            to="/register?role=requester"
            state={{ from: location.state?.from || { pathname: '/requests/create' }, intent: 'request_blood' }}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'space-between', padding: '0.6rem 1rem' }}
          >
            <span>🏥 <strong>Need Blood?</strong> Register as Requester</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            to="/register?role=donor"
            className="btn btn-outline btn-sm"
            style={{ width: '100%', justifyContent: 'space-between', padding: '0.6rem 1rem' }}
          >
            <span>🩸 <strong>Want to Help?</strong> Register as Volunteer Donor</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
