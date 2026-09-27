import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';
import { Users, BookOpen, Activity, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin')
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load admin dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><div className="loader"><div className="spinner" /></div></div>;

  const stats = [
    { icon: Users,    label: 'Total Students',  value: data?.totalStudents ?? 0,  color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { icon: BookOpen, label: 'Total Quizzes',   value: data?.totalQuizzes ?? 0,   color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { icon: Activity, label: 'Total Attempts',  value: data?.totalAttempts ?? 0,  color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { icon: TrendingUp,label:'Mock Interviews', value: data?.totalInterviews ?? 0,color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="gradient-text">Admin Dashboard</span></h1>
        <p>Platform overview and management</p>
      </div>

      <div className="grid-stats mb-8">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>
          <Clock size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--accent-primary)' }} />Recent Activity
        </h3>
        {data?.recentActivities?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.recentActivities.map((act, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{act.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{act.description} · {act.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '30px' }}>
            <Activity size={36} />
            <p>No recent platform activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
