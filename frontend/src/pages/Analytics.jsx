import { useState, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, Award, CheckCircle, Clock, 
  Code, BookOpen, Mic, FileText, Sparkles, ArrowUpRight, 
  Flame, Target, AlertTriangle, ArrowRight, Calendar
} from 'lucide-react';
import { getLocalData } from '../api/mockData';
import { useNavigate } from 'react-router-dom';

export default function Analytics() {
  const navigate = useNavigate();

  // Load live data from localStorage or provide realistic defaults
  const problems = getLocalData('problems', []);
  const streak = getLocalData('streak', { count: 4 });
  const quizHistory = getLocalData('quiz_history', {
    attemptedCount: 4,
    avgScore: 82,
    totalPoints: 380,
    bestTopic: 'Java'
  });

  const solvedProblems = problems.filter(p => p.solved).length;
  const totalProblems = problems.length || 10;
  const codingSolvedPct = Math.round((solvedProblems / totalProblems) * 100);

  // Overall Readiness Calculation
  const readinessScore = useMemo(() => {
    // Weighted combination of coding, quizzes, streak, and resume
    const quizWeight = (quizHistory.avgScore || 75) * 0.35;
    const codingWeight = Math.min(100, Math.max(30, codingSolvedPct * 1.5)) * 0.35;
    const interviewWeight = 80 * 0.15;
    const streakWeight = Math.min(100, (streak.count || 3) * 20) * 0.15;
    return Math.round(quizWeight + codingWeight + interviewWeight + streakWeight);
  }, [quizHistory, codingSolvedPct, streak]);

  // Weekly Activity Data (Last 7 Days)
  const weeklyActivity = [
    { day: 'Mon', hours: 2.5, problems: 2, quizzes: 1 },
    { day: 'Tue', hours: 3.8, problems: 4, quizzes: 2 },
    { day: 'Wed', hours: 1.5, problems: 1, quizzes: 0 },
    { day: 'Thu', hours: 4.2, problems: 5, quizzes: 2 },
    { day: 'Fri', hours: 3.0, problems: 3, quizzes: 1 },
    { day: 'Sat', hours: 5.0, problems: 6, quizzes: 3 },
    { day: 'Sun', hours: 3.5, problems: 3, quizzes: 1 },
  ];

  // Subject Proficiency Breakdown
  const skillsMatrix = [
    { name: 'Data Structures & Algorithms', score: 82, status: 'Strong', color: 'var(--success)' },
    { name: 'Java OOP & Collections', score: 91, status: 'Mastered', color: 'var(--accent-primary)' },
    { name: 'Database & SQL Joins', score: 78, status: 'Proficient', color: 'var(--info)' },
    { name: 'Operating Systems & Concurrency', score: 68, status: 'Needs Practice', color: 'var(--warning)' },
    { name: 'System Design & Scalability', score: 64, status: 'Needs Practice', color: 'var(--warning)' },
    { name: 'Quantitative & Logical Aptitude', score: 86, status: 'Strong', color: 'var(--success)' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1><span className="gradient-text">Preparation Analytics</span></h1>
          <p>Comprehensive performance metrics, placement readiness, and personalized improvement insights</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="badge badge-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            <Calendar size={14} style={{ marginRight: 6 }} />
            Active Session: 2026 Season
          </span>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid-4 mb-6" style={{ gap: 16 }}>
        {/* Readiness Index */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px' }}>
          <div style={{
            width: 58, height: 58, borderRadius: '50%',
            background: 'var(--accent-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--accent-primary)', flexShrink: 0
          }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
              {readinessScore}%
            </span>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Readiness Index</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Placement Ready</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>+4% this week</div>
          </div>
        </div>

        {/* Coding Solved */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px' }}>
          <div style={{
            width: 58, height: 58, borderRadius: '50%',
            background: 'var(--success-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--success)', flexShrink: 0
          }}>
            <Code size={24} color="var(--success)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Coding Progress</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {solvedProblems} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {totalProblems} Solved</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{codingSolvedPct}% Completion</div>
          </div>
        </div>

        {/* Quiz Avg */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px' }}>
          <div style={{
            width: 58, height: 58, borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--warning)', flexShrink: 0
          }}>
            <BookOpen size={24} color="var(--warning)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Quiz Average</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {quizHistory.avgScore}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{quizHistory.attemptedCount} Quizzes Attempted</div>
          </div>
        </div>

        {/* Streak */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px' }}>
          <div style={{
            width: 58, height: 58, borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--error)', flexShrink: 0
          }}>
            <Flame size={24} color="var(--error)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Streak</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {streak.count} Days
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--error)' }}>Top 8% on PrepEdge</div>
          </div>
        </div>
      </div>

      {/* Section 1: Weekly Activity Chart + Coding Breakdown */}
      <div className="grid-2 mb-6" style={{ gap: 20 }}>
        {/* Weekly Activity Visualizer */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Weekly Study & Practice Hours</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Total 23.5 hours logged this week</p>
            </div>
            <span className="badge badge-success">+18% vs Last Week</span>
          </div>

          {/* Custom SVG / Bar Chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 180, paddingTop: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
            {weeklyActivity.map((item, idx) => {
              const maxHours = 6;
              const heightPct = (item.hours / maxHours) * 100;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.hours}h</span>
                  <div style={{
                    width: '32px',
                    height: `${heightPct}%`,
                    background: item.day === 'Sat' ? 'var(--accent-gradient)' : 'rgba(99, 102, 241, 0.4)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.4s ease',
                    border: '1px solid var(--border-hover)'
                  }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.day}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>• 24 Problems Solved</span>
            <span>• 10 Quizzes Completed</span>
            <span>• 2 Mock Interviews</span>
          </div>
        </div>

        {/* Coding & Difficulty Distribution */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Coding Problems by Difficulty</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/coding')} style={{ fontSize: '0.8rem' }}>
              Practice More <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Easy */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>Easy Problems</span>
                <span style={{ fontWeight: 700 }}>4 / 4 Solved (100%)</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: 'var(--success)' }} />
              </div>
            </div>

            {/* Medium */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--warning)', fontWeight: 600 }}>Medium Problems</span>
                <span style={{ fontWeight: 700 }}>2 / 3 Solved (67%)</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '67%', height: '100%', background: 'var(--warning)' }} />
              </div>
            </div>

            {/* Hard */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--error)', fontWeight: 600 }}>Hard Problems</span>
                <span style={{ fontWeight: 700 }}>1 / 3 Solved (33%)</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '33%', height: '100%', background: 'var(--error)' }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, padding: 14, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              💡 Practice Target:
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Solving 2 more Hard problems will boost your Tier-1 company interview probability by 28%.
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Skills & Competency Matrix */}
      <div className="card mb-6" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>Topic Competency & Performance Breakdown</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Assessed across quiz scores, coding problem accuracy, and concept mastery tests.
        </p>

        <div className="grid-2" style={{ gap: 20 }}>
          {skillsMatrix.map((item, idx) => (
            <div key={idx} style={{ padding: 16, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.name}</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: item.color }}>{item.score}%</span>
              </div>

              <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ width: `${item.score}%`, height: '100%', background: item.color, borderRadius: 3 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Status: <strong style={{ color: item.color }}>{item.status}</strong></span>
                <span>Placement Weight: High</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: AI Strengths & Weaknesses Action Plan */}
      <div className="grid-2 mb-6" style={{ gap: 20 }}>
        {/* Identified Strengths */}
        <div className="card" style={{ padding: 22, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <h4 style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <CheckCircle size={18} /> Verified Strengths
          </h4>
          <ul style={{ paddingLeft: 18, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7 }}>
            <li><strong>Java OOP & Collections:</strong> Top 5% in exception handling and streams</li>
            <li><strong>Arrays & Two-Pointers:</strong> 95% first-attempt submission success</li>
            <li><strong>Resume ATS Score:</strong> Strong keywords matching backend engineering roles</li>
          </ul>
        </div>

        {/* Identified Gaps to Work On */}
        <div className="card" style={{ padding: 22, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <h4 style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <AlertTriangle size={18} /> High-Priority Focus Areas
          </h4>
          <ul style={{ paddingLeft: 18, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: 14 }}>
            <li><strong>Dynamic Programming:</strong> Practice Coin Change and Knapsack variations</li>
            <li><strong>Operating Systems:</strong> Review deadlocks and virtual memory paging</li>
            <li><strong>System Design:</strong> Understand Consistent Hashing and Caching architectures</li>
          </ul>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/coding')}>
              Practice DP <ArrowRight size={13} />
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/quizzes')}>
              Take OS Quiz <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
