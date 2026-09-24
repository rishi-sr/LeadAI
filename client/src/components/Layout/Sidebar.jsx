import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiZap,
  FiDatabase,
  FiTrello,
  FiLayers,
  FiGlobe,
  FiBarChart2,
  FiSend,
  FiSettings,
  FiFileText,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: FiGrid },
    { to: '/generate', label: 'Generate Leads', icon: FiZap, badge: 'AI' },
    { to: '/leads', label: 'Lead Database', icon: FiDatabase },
    { to: '/pipeline', label: 'Pipeline CRM', icon: FiTrello },
    { to: '/campaigns', label: 'Campaigns', icon: FiLayers },
    { to: '/audit', label: 'Website Audit', icon: FiGlobe },
    { to: '/analytics', label: 'Analytics', icon: FiBarChart2 },
    { to: '/outreach', label: 'Outreach Tracker', icon: FiSend },
    { to: '/settings', label: 'Settings', icon: FiSettings },
    { to: '/logs', label: 'System Logs', icon: FiFileText }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: collapsed ? '72px' : '260px',
      backgroundColor: '#09090C',
      borderRight: '1px solid #1C1C24',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden'
    }}>
      {/* Brand Header */}
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '0' : '0 20px',
        borderBottom: '1px solid #171720'
      }}>
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: '800',
              fontSize: '14px',
              letterSpacing: '1px',
              boxShadow: '0 0 16px rgba(59, 130, 246, 0.35)'
            }}>
              PDC
            </div>
            <div>
              <div style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: '800', letterSpacing: '0.04em', lineHeight: 1.2 }}>
                PIXIE DIGITAL
              </div>
              <div style={{ color: '#60A5FA', fontSize: '10px', fontWeight: '700', letterSpacing: '0.08em' }}>
                LEAD INTELLIGENCE
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: '800',
            fontSize: '12px'
          }}>
            P
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'none',
            border: 'none',
            color: '#6B7280',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: collapsed ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {/* Navigation List */}
      <nav style={{
        flex: 1,
        padding: '16px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        overflowY: 'auto'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? '#FFFFFF' : '#9CA3AF',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid transparent',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.15s ease',
                justifyContent: collapsed ? 'center' : 'flex-start'
              })}
              title={collapsed ? item.label : undefined}
            >
              <Icon style={{ fontSize: '17px', flexShrink: 0, color: 'inherit' }} />
              {!collapsed && (
                <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: '700',
                  background: 'rgba(59, 130, 246, 0.25)',
                  color: '#60A5FA',
                  letterSpacing: '0.04em'
                }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer User Profile & Logout */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid #171720',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: '10px',
        backgroundColor: '#070709'
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#1E1E26',
              border: '1px solid #333342',
              color: '#D1D5DB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '12px',
              flexShrink: 0
            }}>
              {user?.name?.[0]?.toUpperCase() || 'P'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user?.name || 'PDC Agent'}
              </div>
              <div style={{ color: '#3B82F6', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>
                {user?.role || 'Researcher'}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            color: '#EF4444',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Sign Out"
        >
          <FiLogOut style={{ fontSize: '16px' }} />
        </button>
      </div>
    </aside>
  );
};
