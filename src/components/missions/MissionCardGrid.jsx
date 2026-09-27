import React from 'react';

export default function MissionCardGrid({ children, className = 'mission-heroes' }) {
  return <div className="mission-grid-viewport"><div className={className}>{children}</div></div>;
}