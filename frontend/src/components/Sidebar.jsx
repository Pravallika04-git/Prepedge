import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, BookOpen, User, MessageSquare,
  Mic, Users, PlusSquare, LogOut, Zap, Shield,
  Map, Code, FileText, Briefcase, BarChart3,
  Trophy, Building2, Settings
} from 'lucide-react';

const studentLinks = [
  { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/roadmap',          icon: Map,             label: 'Roadmap' },
  { to: '/quizzes',          icon: BookOpen,        label: 'Quizzes' },
  { to: '/coding',           icon: Code,            label: 'Coding' },
  { to: '/ai-coach',         icon: MessageSquare,   label: 'AI Coach' },
  { to: '/resume-analyzer',  icon: FileText,        label: 'Resume Analyzer' },
  { to: '/job-matcher',      icon: Briefcase,       label: 'Job Matcher' },
  { to: '/mock-interview',   icon: Mic,             label: 'Mock Interview' },
  { to: '/analytics',        icon: BarChart3,       label: 'Analytics' },
  { to: '/achievements',     icon: Trophy,          label: 'Achievements' },
  { to: '/companies',        icon: Building2,       label: 'Companies' },
  { to: '/profile',          icon: User,            label: 'Profile' },
  { to: '/settings',         icon: Settings,        label: 'Settings' },
];

const adminLinks = [
  { to: '/admin',         icon: Shield,     label: 'Admin Dashboard' },
  { to: '/admin/users',   icon: Users,      label: 'Manage Users' },
  { to: '/admin/quizzes', icon: PlusSquare, label: 'Create Quiz' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={18} color="#fff" />
        </div>
        <span className="sidebar-logo-text">PrepEdge</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Main</span>
        {studentLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <span className="sidebar-section-label" style={{ marginTop: '8px' }}>Admin</span>
            {adminLinks.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.fullName || 'User'}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost"
            style={{ padding: '6px', borderRadius: '6px', display: 'flex' }}
            title="Logout"
          >
            <LogOut size={16} color="var(--text-muted)" />
          </button>
        </div>
      </div>
    </aside>
  );
}
