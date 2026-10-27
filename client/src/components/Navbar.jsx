import React, { useState, useRef, useEffect } from 'react';
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
  CheckCheck,
  Droplets,
  ShieldAlert,
  XCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  ArrowRight,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

/* ── helpers ─────────────────────────────────────────────── */

/** Return the right icon + accent colour for a notification type */
const typeConfig = {
  emergency_match: { Icon: Droplets,     color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',  label: 'Blood Match'    },
  response_received:{ Icon: CheckCircle2,color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Donor Response' },
  request_verified: { Icon: ShieldCheck, color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', label: 'Verified'        },
  request_rejected: { Icon: XCircle,     color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'Rejected'       },
  request_cancelled:{ Icon: XCircle,     color: '#f97316', bg: 'rgba(249,115,22,0.12)', label: 'Cancelled'      },
  status_update:    { Icon: Info,        color: '#a78bfa', bg: 'rgba(167,139,250,0.12)',label: 'Update'         },
  system:           { Icon: AlertTriangle,color:'#facc15', bg: 'rgba(250,204,21,0.12)', label: 'System'         },
};

/** Smart relative time — "just now", "3m ago", "2h ago", "Yesterday", date */
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)  return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** Build the navigation URL for a notification */
function getDestination(notif) {
  const reqId = notif.request?._id || notif.request;
  if (!reqId) return null;

  switch (notif.type) {
    case 'emergency_match':
    case 'request_verified':
    case 'request_rejected':
    case 'request_cancelled':
    case 'status_update':
      return `/requests/${reqId}`;
    case 'response_received':
      return `/requests/${reqId}`;   // requester sees responses on request detail
    default:
      return reqId ? `/requests/${reqId}` : null;
  }
}

/* ── component ───────────────────────────────────────────── */
export const Navbar = () => {
  const { user, isAuthenticated, isReviewer, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  /* Close panel when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Close panel when route changes */
  useEffect(() => {
    setShowNotifications(false);
  }, [location.pathname]);

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) await markRead(notif._id);
    const dest = getDestination(notif);
    if (dest) {
      setShowNotifications(false);
      navigate(dest);
    }
  };

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
          <Link to="/requests" className={`nav-link ${isActive('/requests') ? 'active' : ''}`}>
            Emergency Feed
          </Link>

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
              <Link to="/my-requests" className={`nav-link ${isActive('/my-requests') ? 'active' : ''}`}>
                <ListOrdered size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                My Requests
              </Link>

              <Link to="/alerts" className={`nav-link ${isActive('/alerts') ? 'active' : ''}`}>
                <Radio size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Donor Alerts
              </Link>

              {isReviewer && (
                <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`} style={{ color: '#38bdf8' }}>
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
                {/* ── Notification Bell ── */}
                <div style={{ position: 'relative' }} ref={panelRef}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{
                      padding: '0.45rem',
                      borderRadius: '50%',
                      position: 'relative',
                      transition: 'transform 0.2s',
                    }}
                    onClick={() => setShowNotifications((v) => !v)}
                    title="Notifications"
                  >
                    <Bell
                      size={18}
                      style={{
                        animation: unreadCount > 0 ? 'bellRing 2s ease-in-out infinite' : 'none',
                      }}
                    />
                    {unreadCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          background: 'var(--primary)',
                          color: '#fff',
                          fontSize: '0.65rem',
                          fontWeight: '800',
                          minWidth: '18px',
                          height: '18px',
                          borderRadius: '9px',
                          padding: '0 3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 10px var(--primary-glow)',
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* ── Notification Dropdown Panel ── */}
                  {showNotifications && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 10px)',
                        width: '360px',
                        background: 'rgba(15, 23, 42, 0.96)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                        zIndex: 200,
                        maxHeight: '480px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        animation: 'slideDown 0.18s ease-out',
                      }}
                    >
                      {/* Panel Header */}
                      <div
                        style={{
                          padding: '1rem 1.1rem 0.75rem',
                          borderBottom: '1px solid rgba(255,255,255,0.07)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexShrink: 0,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Bell size={15} color="var(--primary)" />
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>
                            Notifications
                          </span>
                          {unreadCount > 0 && (
                            <span
                              style={{
                                background: 'var(--primary-subtle)',
                                color: 'var(--primary)',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '1px 7px',
                                borderRadius: '9px',
                                border: '1px solid rgba(225,29,72,0.3)',
                              }}
                            >
                              {unreadCount} new
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllRead}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#38bdf8',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                transition: 'background 0.15s',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56,189,248,0.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                              <CheckCheck size={13} /> Mark all read
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotifications(false)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-dim)',
                              cursor: 'pointer',
                              padding: '2px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Notification List */}
                      <div style={{ overflowY: 'auto', flex: 1 }}>
                        {notifications.length === 0 ? (
                          <div
                            style={{
                              padding: '3rem 1.5rem',
                              textAlign: 'center',
                              color: 'var(--text-dim)',
                            }}
                          >
                            <Bell
                              size={36}
                              style={{ opacity: 0.25, marginBottom: '0.75rem', display: 'block', margin: '0 auto 0.75rem' }}
                            />
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>
                              All caught up!
                            </p>
                            <p style={{ fontSize: '0.775rem', color: '#475569', marginTop: '0.25rem' }}>
                              Emergency alerts will appear here
                            </p>
                          </div>
                        ) : (
                          notifications.map((notif, idx) => {
                            const cfg = typeConfig[notif.type] || typeConfig.system;
                            const { Icon } = cfg;
                            const dest = getDestination(notif);
                            const isClickable = Boolean(dest);

                            return (
                              <div
                                key={notif._id}
                                onClick={() => handleNotifClick(notif)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '0.75rem',
                                  padding: '0.85rem 1.1rem',
                                  borderBottom: idx < notifications.length - 1
                                    ? '1px solid rgba(255,255,255,0.04)'
                                    : 'none',
                                  background: notif.isRead
                                    ? 'transparent'
                                    : 'rgba(225, 29, 72, 0.055)',
                                  cursor: isClickable ? 'pointer' : 'default',
                                  transition: 'background 0.15s',
                                  position: 'relative',
                                }}
                                onMouseEnter={(e) => {
                                  if (isClickable) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = notif.isRead
                                    ? 'transparent'
                                    : 'rgba(225, 29, 72, 0.055)';
                                }}
                              >
                                {/* Unread dot */}
                                {!notif.isRead && (
                                  <span
                                    style={{
                                      position: 'absolute',
                                      left: '0.35rem',
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      width: '5px',
                                      height: '5px',
                                      borderRadius: '50%',
                                      background: cfg.color,
                                      boxShadow: `0 0 6px ${cfg.color}`,
                                    }}
                                  />
                                )}

                                {/* Icon */}
                                <div
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: cfg.bg,
                                    border: `1px solid ${cfg.color}30`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginTop: '1px',
                                  }}
                                >
                                  <Icon size={16} color={cfg.color} />
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '0.5rem',
                                      marginBottom: '2px',
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontWeight: notif.isRead ? 500 : 700,
                                        fontSize: '0.825rem',
                                        color: notif.isRead ? '#94a3b8' : '#f1f5f9',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '200px',
                                      }}
                                    >
                                      {notif.title}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: '0.7rem',
                                        color: '#475569',
                                        flexShrink: 0,
                                      }}
                                    >
                                      {timeAgo(notif.createdAt)}
                                    </span>
                                  </div>

                                  <p
                                    style={{
                                      fontSize: '0.775rem',
                                      color: '#64748b',
                                      lineHeight: 1.45,
                                      marginBottom: '4px',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {notif.message}
                                  </p>

                                  {isClickable && (
                                    <span
                                      style={{
                                        fontSize: '0.7rem',
                                        color: cfg.color,
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '2px',
                                        opacity: 0.85,
                                      }}
                                    >
                                      View Request <ArrowRight size={11} />
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Panel Footer */}
                      {notifications.length > 0 && (
                        <div
                          style={{
                            padding: '0.65rem 1.1rem',
                            borderTop: '1px solid rgba(255,255,255,0.07)',
                            flexShrink: 0,
                          }}
                        >
                          <button
                            onClick={() => { setShowNotifications(false); navigate('/alerts'); }}
                            style={{
                              width: '100%',
                              background: 'none',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '8px',
                              color: '#94a3b8',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: '0.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                              e.currentTarget.style.color = '#f1f5f9';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'none';
                              e.currentTarget.style.color = '#94a3b8';
                            }}
                          >
                            View All Donor Alerts <ArrowRight size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Link */}
                <Link to="/profile" className="btn btn-secondary btn-sm" title="My Profile & Settings">
                  <User size={15} />
                  <span>{user.name.split(' ')[0]}</span>
                </Link>

                {/* Logout */}
                <button onClick={handleLogout} className="btn btn-outline btn-sm" title="Logout">
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
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

      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes bellRing {
          0%,100% { transform: rotate(0deg); }
          10%      { transform: rotate(14deg); }
          20%      { transform: rotate(-12deg); }
          30%      { transform: rotate(10deg); }
          40%      { transform: rotate(-8deg); }
          50%      { transform: rotate(6deg); }
          60%      { transform: rotate(0deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 8px var(--primary-glow); }
          50%      { box-shadow: 0 0 16px var(--primary-glow); }
        }
      `}</style>
    </header>
  );
};
