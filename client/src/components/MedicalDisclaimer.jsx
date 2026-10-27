import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const MedicalDisclaimer = ({ compact = false }) => {
  return (
    <div className="disclaimer-banner">
      <ShieldAlert size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>
        <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '2px' }}>
          Non-Clinical Coordination Disclaimer
        </strong>
        <span>
          LifeLink is an emergency peer coordination tool to connect requesters with potential registered donors.
          Software matching does NOT establish medical compatibility, clinical eligibility, or confirmed availability.
          All blood cross-matching, testing, and transfusions must be executed by qualified hospital personnel.
        </span>
      </div>
    </div>
  );
};
