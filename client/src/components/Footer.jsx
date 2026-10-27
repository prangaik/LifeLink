import React from 'react';
import { Heart, Shield, Activity, GitFork } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.15rem', color: '#fff', marginBottom: '0.75rem' }}>
            <Activity size={20} color="var(--primary)" />
            <span>Life<span style={{ color: 'var(--primary)' }}>Link</span></span>
          </div>
          <p style={{ maxWidth: '400px', fontSize: '0.85rem', lineHeight: '1.6' }}>
            An emergency blood donor discovery and coordination network built with MongoDB geospatial indexing, Express, React, and Node.js.
          </p>
          <div style={{ marginTop: '1rem', fontSize: '0.785rem', color: 'var(--text-dim)' }}>
            Academic End-Term Submission • Full-Stack MERN Architecture
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#cbd5e1' }}>Clinical Transparency</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield size={14} color="#38bdf8" /> Coordination Platform Only
            </li>
            <li>No clinical diagnostic claim</li>
            <li>Mandatory blood bank testing</li>
            <li>Voluntary donor consent</li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#cbd5e1' }}>Simulated Services</h4>
          <p style={{ fontSize: '0.825rem', lineHeight: '1.5' }}>
            Notification provider operates in safe simulated development mode to prevent telecom charges during evaluation.
          </p>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--success)' }}>
            ● System Status: Operational
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.775rem' }}>
        <span>© {new Date().getFullYear()} LifeLink Emergency Network. Open source college capstone.</span>
        <span>Built with care for emergency readiness.</span>
      </div>
    </footer>
  );
};
