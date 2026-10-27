import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HeartHandshake,
  PlusCircle,
  Bell,
  User,
  ShieldCheck,
  LogOut,
  ListOrdered,
  Radio,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const Navbar = () => {
  const { user, isAuthenticated, isReviewer, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <div className="nav-brand-icon">
            <HeartHandshake size={22} color="#fff" />
          </div>
          <span>Life<span style={{ color: 'var(--primary)' }}>Link</span></span>
        </Link>

        {/* Navigation Links */}
        <nav className="nav-links">
          <Link
            to="/requests"
            className={`nav-link ${isActive('/requests') ? 'active' : ''}`}
          >
            Emergency Feed
          </Link>

          {/* "+ Request Blood" is prominently available for all visitors and users */}
          <Link
            to="/requests/create"
            state={!isAuthenticated ? { from: { pathname: '/requests/create' }, intent: 'request_blood' } : undefined}
            className="btn btn-primary btn-sm"
            style={{ padding: '0.4rem 0.85rem' }}
          >
            <PlusCircle size={15} /> Request Blood
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/my-requests"
                className={`nav-link ${isActive('/my-requests') ? 'active' : ''}`}
              >
                <ListOrdered size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                My Requests
              </Link>

              <Link
                to="/alerts"
                className={`nav-link ${isActive('/alerts') ? 'active' : ''}`}
              >
                <Radio size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Donor Alerts
              </Link>

              {isReviewer && (
                <Link
                  to="/admin"
                  className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                  style={{ color: '#38bdf8' }}
                >
                  <ShieldCheck size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Reviewer Portal
                </Link>
              )}
            </>
          )}

          {/* Right Action Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div style={{ position: 'relative' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.45rem', borderRadius: '50%' }}
                    onClick={() => setShowNotifications(!showNotifications)}
                    title="Notifications"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          background: 'var(--primary)',
                          color: '#fff',
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 8px var(--primary-glow)',
                        }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Panel */}
                  {showNotifications && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '120%',
                        width: '320px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 100,
                        maxHeight: '400px',
                        overflowY: 'auto',
                      }}
                    >
                      <div
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--primary)',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.825rem' }}>
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => {
                              if (!notif.isRead) markRead(notif._id);
                            }}
                            style={{
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid rgba(255,255,255,0.05)',
                              background: notif.isRead ? 'transparent' : 'rgba(225, 29, 72, 0.08)',
                              cursor: 'pointer',
                              fontSize: '0.825rem',
                            }}
                          >
                            <div style={{ fontWeight: 600, color: notif.isRead ? '#cbd5e1' : '#fff', marginBottom: '2px' }}>
                              {notif.title}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                              {notif.message}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Link */}
                <Link
                  to="/profile"
                  className="btn btn-secondary btn-sm"
                  title="My Profile & Settings"
                >
                  <User size={15} />
                  <span>{user.name.split(' ')[0]}</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                  title="Logout"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Log In
                </Link>
                <Link
                  to="/register?role=requester"
                  state={{ from: { pathname: '/requests/create' }, intent: 'request_blood' }}
                  className="btn btn-outline btn-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
