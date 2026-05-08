import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Sprout, TrendingUp, Bug, LogOut,
  Menu, X, Leaf, Bell
} from 'lucide-react';
import { io } from 'socket.io-client';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/crop',      icon: Sprout,          label: 'Crop Advisor' },
  { path: '/price',     icon: TrendingUp,       label: 'Price Forecast' },
  { path: '/disease',   icon: Bug,              label: 'Disease Detect' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [alertsOpen, setAlertsOpen] = useState(false);

  useEffect(() => {
    const socket = io('/', { transports: ['websocket'] });
    socket.on('price_alert', (data) => {
      setAlerts(prev => [data, ...prev].slice(0, 10));
    });
    return () => socket.disconnect();
  }, []);

  const roleColors = {
    farmer: 'badge-green',
    trader: 'badge-blue',
    agribusiness: 'badge-amber',
    admin: 'badge-red'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 40, backdropFilter: 'blur(2px)'
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 248,
        background: 'var(--green-900)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, bottom: 0, left: 0,
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.25s ease',
      }}
        className="sidebar"
      >
        {/* Logo */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <div style={{
            width: 38, height: 38, background: 'var(--green-500)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Leaf size={20} color="white" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
              FarmPredict
            </div>
            <div style={{ color: 'var(--green-400)', fontSize: '0.72rem', fontWeight: 500 }}>
              360° Intelligence
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.5)', display: 'none' }}
            id="close-sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* User info */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, var(--green-500), var(--green-700))',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '1rem',
            marginBottom: 8
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>{user?.name}</div>
          <div style={{ color: 'var(--green-400)', fontSize: '0.75rem', marginBottom: 6 }}>{user?.email}</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px' }}>
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                marginBottom: 4,
                textDecoration: 'none',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                background: isActive ? 'rgba(80,200,120,0.18)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.9rem',
                transition: 'all 0.15s',
                borderLeft: isActive ? '3px solid var(--green-400)' : '3px solid transparent',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={logout}
            className="btn btn-ghost"
            style={{
              width: '100%', color: 'rgba(255,255,255,0.55)',
              justifyContent: 'flex-start', gap: 10, padding: '10px 12px',
              borderRadius: 10, fontSize: '0.9rem'
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: 248, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
        className="main-content">
        {/* Topbar */}
        <header style={{
          height: 64, background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          padding: '0 24px', gap: 12,
          position: 'sticky', top: 0, zIndex: 30,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn btn-ghost btn-sm mobile-menu"
            style={{ display: 'none', marginRight: 8 }}
          >
            <Menu size={20} />
          </button>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              {navItems.find(n => location.pathname.startsWith(n.path))?.label || 'FarmPredict 360'}
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

         
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 24px' }} className="animate-fadeIn">
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0 !important; }
          .mobile-menu { display: flex !important; }
          #close-sidebar { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
