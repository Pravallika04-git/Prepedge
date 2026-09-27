import { useState } from 'react';
import { 
  Settings as SettingsIcon, User, Bell, Palette, Shield, 
  Save, Check, AlertTriangle, Download, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getLocalData, setLocalData } from '../api/mockData';

export default function Settings() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile Preferences
  const [profile, setProfile] = useState(() => getLocalData('settings_profile', {
    fullName: 'Jane Smith',
    email: 'janesmith2026_final@example.com',
    targetRole: 'Full Stack SDE',
    targetBatch: '2026',
    college: 'National Institute of Technology',
    dailyGoalHours: '2.5',
    targetCtc: '20 LPA+'
  }));

  // Notification Preferences
  const [notifications, setNotifications] = useState(() => getLocalData('settings_notifications', {
    dailyReminder: true,
    weeklyDigest: true,
    jobAlerts: true,
    driveDeadlines: true,
    soundEffects: false
  }));

  // Theme & Appearance Preferences
  const [theme, setTheme] = useState(() => getLocalData('settings_theme', {
    mode: 'dark',
    accentColor: 'indigo',
    compactView: false
  }));

  // Password Security Form
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Save Handlers
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setLocalData('settings_profile', profile);
    toast.success('Profile preferences updated successfully!');
  };

  const handleToggleNotification = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    setLocalData('settings_notifications', updated);
    toast.info(`Notification setting updated: ${key}`);
  };

  const handleThemeChange = (color) => {
    const updated = { ...theme, accentColor: color };
    setTheme(updated);
    setLocalData('settings_theme', updated);
    toast.success(`Accent color changed to ${color}`);
  };

  const handleToggleCompact = () => {
    const updated = { ...theme, compactView: !theme.compactView };
    setTheme(updated);
    setLocalData('settings_theme', updated);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!passwords.newPassword || passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Security password successfully changed!');
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleExportData = () => {
    const exportObject = {
      profile,
      notifications,
      theme,
      exportDate: new Date().toISOString(),
      platform: 'PrepEdge Placement Portal'
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `prepedge_profile_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Preparation data backup downloaded!');
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset your local quiz and problem progress? This action cannot be undone.')) {
      localStorage.removeItem('problems');
      localStorage.removeItem('quiz_history');
      toast.warning('Practice progress reset to initial defaults.');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1><span className="gradient-text">Settings & Preferences</span></h1>
        <p>Manage your student profile, placement goals, notification frequency, theme, and security</p>
      </div>

      {/* Main Settings Layout: Left Nav + Right Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: 24, alignItems: 'flex-start' }}>
        {/* Navigation Sidebar */}
        <div className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button
            className={`btn btn-full ${activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: 'flex-start', gap: 10, padding: '10px 14px' }}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} /> Profile Preferences
          </button>
          <button
            className={`btn btn-full ${activeTab === 'notifications' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: 'flex-start', gap: 10, padding: '10px 14px' }}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={16} /> Notifications
          </button>
          <button
            className={`btn btn-full ${activeTab === 'theme' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: 'flex-start', gap: 10, padding: '10px 14px' }}
            onClick={() => setActiveTab('theme')}
          >
            <Palette size={16} /> Theme & Display
          </button>
          <button
            className={`btn btn-full ${activeTab === 'security' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: 'flex-start', gap: 10, padding: '10px 14px' }}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={16} /> Account & Security
          </button>
        </div>

        {/* Content Pane */}
        <div>
          {/* TAB 1: PROFILE PREFERENCES */}
          {activeTab === 'profile' && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 6, fontSize: '1.2rem' }}>Student Profile Preferences</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
                These preferences tailor your recommended jobs, roadmaps, and difficulty calibrations.
              </p>

              <form onSubmit={handleSaveProfile}>
                <div className="grid-2 mb-6" style={{ gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.fullName}
                      onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={profile.email}
                      disabled
                      style={{ opacity: 0.7 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Role</label>
                    <select
                      className="form-select"
                      value={profile.targetRole}
                      onChange={e => setProfile({ ...profile, targetRole: e.target.value })}
                    >
                      <option value="Full Stack SDE">Full Stack Software Development Engineer</option>
                      <option value="Java Backend Developer">Java & Spring Boot Backend Engineer</option>
                      <option value="Frontend Developer">React / Modern Frontend Developer</option>
                      <option value="AI / ML Engineer">AI & Machine Learning Engineer</option>
                      <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Graduation Batch</label>
                    <select
                      className="form-select"
                      value={profile.targetBatch}
                      onChange={e => setProfile({ ...profile, targetBatch: e.target.value })}
                    >
                      <option value="2025">2025 Batch</option>
                      <option value="2026">2026 Batch (Current Focus)</option>
                      <option value="2027">2027 Batch</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">College / University</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.college}
                      onChange={e => setProfile({ ...profile, college: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Daily Study Target</label>
                    <select
                      className="form-select"
                      value={profile.dailyGoalHours}
                      onChange={e => setProfile({ ...profile, dailyGoalHours: e.target.value })}
                    >
                      <option value="1.0">1.0 Hour / Day (Casual)</option>
                      <option value="2.5">2.5 Hours / Day (Recommended)</option>
                      <option value="4.0">4.0 Hours / Day (Intensive)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', gap: 8 }}>
                  <Save size={16} /> Save Profile Preferences
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 6, fontSize: '1.2rem' }}>Notification Preferences</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
                Control which alerts, reminders, and updates you receive from PrepEdge.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { key: 'dailyReminder', title: 'Daily Practice Reminders', desc: 'Get notified to maintain your active coding and quiz streak.' },
                  { key: 'weeklyDigest', title: 'Weekly Performance Digest', desc: 'Receive a summary of your accuracy, hours logged, and rank movements.' },
                  { key: 'jobAlerts', title: 'New Job Match Notifications', desc: 'Alerts when a company posts a role matching 80%+ of your skills.' },
                  { key: 'driveDeadlines', title: 'Placement Drive Deadlines', desc: 'Urgent reminders for upcoming campus registration deadlines.' },
                  { key: 'soundEffects', title: 'Audio Cues & Sound Effects', desc: 'Play celebratory audio sounds on quiz completion and test pass.' }
                ].map(item => (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 16,
                      background: 'var(--bg-glass)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>

                    <button
                      type="button"
                      className={`btn btn-sm ${notifications[item.key] ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ minWidth: 80, justifyContent: 'center' }}
                      onClick={() => handleToggleNotification(item.key)}
                    >
                      {notifications[item.key] ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: THEME & DISPLAY */}
          {activeTab === 'theme' && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 6, fontSize: '1.2rem' }}>Theme & Appearance</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
                Personalize your visual experience on the PrepEdge dark portal.
              </p>

              {/* Accent Color Picker */}
              <div style={{ marginBottom: 24 }}>
                <label className="form-label" style={{ marginBottom: 10 }}>Portal Accent Color</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { name: 'indigo', hex: '#6366f1' },
                    { name: 'violet', hex: '#8b5cf6' },
                    { name: 'emerald', hex: '#10b981' },
                    { name: 'rose', hex: '#f43f5e' },
                    { name: 'amber', hex: '#f59e0b' }
                  ].map(c => (
                    <div
                      key={c.name}
                      onClick={() => handleThemeChange(c.name)}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        background: c.hex,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: theme.accentColor === c.name ? '3px solid #fff' : '2px solid transparent',
                        boxShadow: theme.accentColor === c.name ? `0 0 14px ${c.hex}` : 'none',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      {theme.accentColor === c.name && <Check size={18} color="#fff" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Compact Mode Toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Compact Layout</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Condenses row padding for higher density problem and quiz tables.</div>
                </div>

                <button
                  type="button"
                  className={`btn btn-sm ${theme.compactView ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ minWidth: 80, justifyContent: 'center' }}
                  onClick={handleToggleCompact}
                >
                  {theme.compactView ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ACCOUNT & SECURITY */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Change Password Card */}
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 6, fontSize: '1.2rem' }}>Change Password</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
                  Update your authentication credentials for your PrepEdge student account.
                </p>

                <form onSubmit={handleUpdatePassword}>
                  <div className="form-group mb-4">
                    <label className="form-label">Current Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={passwords.currentPassword}
                      onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    />
                  </div>

                  <div className="grid-2 mb-6" style={{ gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="At least 6 characters"
                        value={passwords.newPassword}
                        onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Re-enter new password"
                        value={passwords.confirmPassword}
                        onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button type="submit" className="btn btn-primary">
                      Update Password
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />} {showPassword ? 'Hide' : 'Show'} Passwords
                    </button>
                  </div>
                </form>
              </div>

              {/* Data & Privacy / Danger Zone */}
              <div className="card" style={{ padding: 24, border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                <h4 style={{ color: 'var(--error)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={18} /> Data Management & Danger Zone
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
                  Export your preparation records or reset local progress caches.
                </p>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary btn-sm" onClick={handleExportData} style={{ display: 'inline-flex', gap: 6 }}>
                    <Download size={14} /> Export Prep Data (JSON)
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={handleResetProgress} style={{ display: 'inline-flex', gap: 6 }}>
                    <RefreshCw size={14} /> Reset Practice Progress
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
