import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/Layout/Sidebar';
import { TopNav } from './components/Layout/TopNav';

// Pages
import { Login } from './pages/Login/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { GenerateLeads } from './pages/GenerateLeads/GenerateLeads';
import { LeadDatabase } from './pages/LeadDatabase/LeadDatabase';
import { Pipeline } from './pages/Pipeline/Pipeline';
import { Campaigns } from './pages/Campaigns/Campaigns';
import { WebsiteAudit } from './pages/WebsiteAudit/WebsiteAudit';
import { Analytics } from './pages/Analytics/Analytics';
import { OutreachTracker } from './pages/OutreachTracker/OutreachTracker';
import { Settings } from './pages/Settings/Settings';
import { Logs } from './pages/Logs/Logs';

// Protected Layout wrapper
const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        backgroundColor: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#60A5FA',
        fontSize: '16px',
        fontWeight: '700'
      }}>
        Initializing PDC Lead Intelligence...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Determine page title
  const pathTitles = {
    '/': { title: 'Intelligence Dashboard', sub: 'Live overview of leads, digital gaps, and outreach' },
    '/generate': { title: 'Generate Leads', sub: 'Automated multi-stage business discovery & qualification' },
    '/leads': { title: 'Lead Database', sub: 'Qualified leads data grid, filters, and Excel exports' },
    '/pipeline': { title: 'Pipeline Kanban CRM', sub: 'Drag and drop 12-stage outreach flow' },
    '/campaigns': { title: 'Market Campaigns', sub: 'Historical runs, progress metrics, and reruns' },
    '/audit': { title: 'Live Website Audit', sub: 'On-demand technical & conversion audit engine' },
    '/analytics': { title: 'Analytics & Funnels', sub: 'Conversion rates, gap heatmaps, and performance' },
    '/outreach': { title: 'Outreach Tracker', sub: 'Direct messaging logs across WhatsApp, IG, & Email' },
    '/settings': { title: 'System Settings', sub: 'API keys, scoring engine rules, and seed runner' },
    '/logs': { title: 'Activity Logs', sub: 'Internal audit trails and system event monitor' }
  };

  const currentMeta = pathTitles[location.pathname] || { title: 'PDC Lead Intelligence', sub: '' };

  return (
    <div className="app-container">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <TopNav title={currentMeta.title} subtitle={currentMeta.sub} />
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="/generate" element={<ProtectedLayout><GenerateLeads /></ProtectedLayout>} />
            <Route path="/leads" element={<ProtectedLayout><LeadDatabase /></ProtectedLayout>} />
            <Route path="/pipeline" element={<ProtectedLayout><Pipeline /></ProtectedLayout>} />
            <Route path="/campaigns" element={<ProtectedLayout><Campaigns /></ProtectedLayout>} />
            <Route path="/audit" element={<ProtectedLayout><WebsiteAudit /></ProtectedLayout>} />
            <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
            <Route path="/outreach" element={<ProtectedLayout><OutreachTracker /></ProtectedLayout>} />
            <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
            <Route path="/logs" element={<ProtectedLayout><Logs /></ProtectedLayout>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
