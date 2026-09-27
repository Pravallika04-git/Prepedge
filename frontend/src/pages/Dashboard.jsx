import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { getLocalData, setLocalData } from '../api/mockData';
import {
  BookOpen, TrendingUp, Mic, FileText, Flame, Target,
  CheckCircle, BarChart2, ArrowRight, Zap, Lightbulb, Code
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, ArcElement);

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState(() => getLocalData('goals', []));

  useEffect(() => {
    api.get('/dashboard/student')
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const toggleGoal = (id) => {
    const updated = goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
    setGoals(updated);
    setLocalData('goals', updated);
  };

  if (loading) return (
    <div className="page-container">
      <div className="loader"><div className="spinner" /></div>
    </div>
  );

  const streak = getLocalData('streak', { count: 0 });
  const quizzesAttempted = data?.quizzesAttempted ?? 0;
  const avgScore = data?.averageScore ?? 0;
  const interviews = data?.interviewsCompleted ?? 0;
  const resumes = data?.resumeAnalyses ?? 0;
  const readinessScore = Math.min(100, Math.round((avgScore * 0.4) + (quizzesAttempted * 3) + (interviews * 5) + (resumes * 4) + (streak.count * 2)));

  const chartData = {
    labels: data?.categoryScores?.map(c => c.category) || [],
    datasets: [{
      label: 'Avg Score (%)',
      data: data?.categoryScores?.map(c => c.averageScore?.toFixed(1)) || [],
      backgroundColor: 'rgba(99, 102, 241, 0.6)',
      borderColor: '#6366f1',
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#334155', borderWidth: 1 },
    },
    scales: {
      x: { grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#94a3b8' }, max: 100, min: 0 },
    },
  };

  const doughnutData = {
    labels: ['Completed', 'Remaining'],
    datasets: [{
      data: [goals.filter(g => g.completed).length, goals.filter(g => !g.completed).length],
      backgroundColor: ['#6366f1', 'rgba(148,163,184,0.15)'],
      borderWidth: 0,
    }]
  };

  const stats = [
    { icon: BookOpen, label: 'Quizzes Done', value: quizzesAttempted, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { icon: TrendingUp, label: 'Avg Score', value: `${avgScore.toFixed(1)}%`, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { icon: Mic, label: 'Interviews', value: interviews, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { icon: FileText, label: 'Resumes', value: resumes, color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
    { icon: Flame, label: 'Day Streak', value: streak.count, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { icon: Code, label: 'Problems', value: getLocalData('problems', []).filter(p => p.solved).length, color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  ];

  const aiRecommendations = [
    { text: 'Practice SQL joins — your DBMS score is below average', icon: Lightbulb },
    { text: 'Try a System Design mock interview for better readiness', icon: Target },
    { text: 'Upload your resume for an ATS compatibility check', icon: FileText },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.fullName?.split(' ')[0]} 👋</span>
        </h1>
        <p>Track your placement preparation progress</p>
      </div>

      {/* Top: Readiness + Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, marginBottom: 24 }}>
        {/* Readiness */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="readiness-score-ring" style={{ '--readiness-score': `${readinessScore}%` }}>
            <div className="readiness-score-inner">
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{readinessScore}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>Readiness</span>
            </div>
          </div>
          <div className="xp-level-badge" style={{ marginTop: 12 }}>Level {Math.floor(readinessScore / 20) + 1}</div>
        </div>

        {/* Stats Grid */}
        <div className="grid-stats">
          {stats.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon" style={{ background: bg }}>
                <Icon size={20} color={color} />
              </div>
              <div className="stat-info">
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid: Charts + Goals + AI */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Performance Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3><BarChart2 size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--accent-primary)' }} />Performance by Category</h3>
          </div>
          {data?.categoryScores?.length > 0 ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <div className="empty-state" style={{ padding: 30 }}>
              <BarChart2 size={40} />
              <h3>No data yet</h3>
              <p>Take some quizzes to see your performance</p>
            </div>
          )}
        </div>

        {/* Today's Goals */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3><Target size={18} style={{ display: 'inline', marginRight: 8, color: '#f59e0b' }} />Today's Goals</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{goals.filter(g => g.completed).length}/{goals.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {goals.map(g => (
              <div key={g.id} className={`goal-item${g.completed ? ' completed' : ''}`} onClick={() => toggleGoal(g.id)}>
                <div className="goal-checkbox">
                  {g.completed && <CheckCircle size={12} />}
                </div>
                <span className="goal-text">{g.text}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-full" onClick={() => navigate('/quizzes')} style={{ marginTop: 20 }}>
            Browse Quizzes <ArrowRight size={16} />
          </button>
        </div>

        {/* AI Recommendations */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: 16 }}><Zap size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--accent-primary)' }} />AI Recommendations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {aiRecommendations.map((rec, i) => (
              <div key={i} style={{ padding: 16, background: 'rgba(99,102,241,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <rec.icon size={16} color="var(--accent-primary)" />
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
