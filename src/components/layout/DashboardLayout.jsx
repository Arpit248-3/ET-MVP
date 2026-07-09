import React from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function DashboardLayout({ children, crisisMode = false }) {
  return (
    <div className={`dashboard-layout ${crisisMode ? 'crisis-mode' : ''}`}>
      <Sidebar crisisMode={crisisMode} />
      <div className="main-content">
        <Topbar crisisMode={crisisMode} />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}
