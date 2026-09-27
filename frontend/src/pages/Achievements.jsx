import { useState } from 'react';
import { 
  Trophy, Award, Star, Flame, Zap, CheckCircle2, Lock, 
  Sparkles, Shield, Gift, Target, ChevronRight, Check
} from 'lucide-react';
import { getLocalData, setLocalData } from '../api/mockData';
import { useToast } from '../context/ToastContext';

const BADGES_DATA = [
  {
    id: 'b1',
    title: 'Hello World',
    category: 'Onboarding',
    rarity: 'Common',
    xp: 100,
    earned: true,
    earnedDate: 'Sep 12, 2026',
    icon: 'Zap',
    description: 'Created an account and started your journey on PrepEdge.',
    progress: 100
  },
  {
    id: 'b2',
    title: 'Code Warrior',
    category: 'Coding',
    rarity: 'Rare',
    xp: 250,
    earned: true,
    earnedDate: 'Sep 18, 2026',
    icon: 'Award',
    description: 'Submit a verified correct solution to any 3 coding practice problems.',
    progress: 100
  },
  {
    id: 'b3',
    title: 'Streak Titan',
    category: 'Consistency',
    rarity: 'Epic',
    xp: 500,
    earned: true,
    earnedDate: 'Sep 24, 2026',
    icon: 'Flame',
    description: 'Maintain a 5-day continuous preparation streak.',
    progress: 100
  },
  {
    id: 'b4',
    title: 'Quiz Master',
    category: 'Quizzes',
    rarity: 'Rare',
    xp: 350,
    earned: false,
    icon: 'Trophy',
    description: 'Complete 5 different topic quizzes with a score of 80% or above.',
    progress: 60,
    currentStep: '3 of 5 completed'
  },
  {
    id: 'b5',
    title: 'Algorithm Alchemist',
    category: 'Coding',
    rarity: 'Epic',
    xp: 600,
    earned: false,
    icon: 'Sparkles',
    description: 'Solve at least 2 HARD difficulty problems in Dynamic Programming or Graphs.',
    progress: 50,
    currentStep: '1 of 2 completed'
  },
  {
    id: 'b6',
    title: 'ATS Optimizer',
    category: 'Interview Prep',
    rarity: 'Rare',
    xp: 300,
    earned: true,
    earnedDate: 'Sep 20, 2026',
    icon: 'Shield',
    description: 'Score an ATS compatibility score of 85% or higher on Resume Analyzer.',
    progress: 100
  },
  {
    id: 'b7',
    title: 'Ace Interviewer',
    category: 'Interview Prep',
    rarity: 'Epic',
    xp: 500,
    earned: false,
    icon: 'Star',
    description: 'Complete a full AI Mock Interview with an overall score above 8.5/10.',
    progress: 30,
    currentStep: '1 of 3 rounds passed'
  },
  {
    id: 'b8',
    title: 'Placement Prodigy',
    category: 'Placement Ready',
    rarity: 'Legendary',
    xp: 1200,
    earned: false,
    icon: 'Trophy',
    description: 'Achieve an overall Placement Readiness score of 90% or higher.',
    progress: 82,
    currentStep: '82% of 90% achieved'
  }
];

const MILESTONES_DATA = [
  {
    id: 'm1',
    title: 'Solve 5 DSA Coding Problems',
    category: 'Coding',
    current: 4,
    target: 5,
    xp: 150,
    claimed: false
  },
  {
    id: 'm2',
    title: 'Score 90%+ in a Core CS Quiz',
    category: 'Quizzes',
    current: 1,
    target: 1,
    xp: 200,
    claimed: false // Ready to claim!
  },
  {
    id: 'm3',
    title: 'Maintain 7-Day Active Streak',
    category: 'Consistency',
    current: 4,
    target: 7,
    xp: 300,
    claimed: false
  },
  {
    id: 'm4',
    title: 'Match with 3 Tier-1 Jobs',
    category: 'Career',
    current: 3,
    target: 3,
    xp: 150,
    claimed: true
  }
];

const rarityColors = {
  Common: 'var(--text-muted)',
  Rare: 'var(--info)',
  Epic: 'var(--accent-secondary)',
  Legendary: '#f59e0b'
};

export default function Achievements() {
  const toast = useToast();
  
  const [filter, setFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [badges, setBadges] = useState(() => getLocalData('user_badges', BADGES_DATA));
  const [milestones, setMilestones] = useState(() => getLocalData('user_milestones', MILESTONES_DATA));
  const [selectedBadge, setSelectedBadge] = useState(null);

  // User Level & XP
  const [userXp, setUserXp] = useState(1450);
  const currentLevel = Math.floor(userXp / 500) + 1;
  const xpInCurrentLevel = userXp % 500;
  const levelProgressPct = Math.round((xpInCurrentLevel / 500) * 100);

  // Filter Badges
  const filteredBadges = badges.filter(b => {
    if (filter === 'Earned' && !b.earned) return false;
    if (filter === 'Locked' && b.earned) return false;
    if (filter === 'In Progress' && (b.earned || b.progress === 0)) return false;
    if (categoryFilter !== 'All' && b.category !== categoryFilter) return false;
    return true;
  });

  const earnedCount = badges.filter(b => b.earned).length;

  const handleClaimMilestone = (mId) => {
    const updated = milestones.map(m => {
      if (m.id === mId) {
        toast.success(`🎉 Claimed ${m.xp} XP for completing "${m.title}"!`);
        setUserXp(prev => prev + m.xp);
        return { ...m, claimed: true };
      }
      return m;
    });
    setMilestones(updated);
    setLocalData('user_milestones', updated);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1><span className="gradient-text">Badges & Achievements</span></h1>
          <p>Celebrate your placement milestones, unlock prestigious honors, and level up your career readiness</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="badge badge-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            <Trophy size={14} color="#f59e0b" style={{ marginRight: 6 }} />
            Global Rank #42 (Top 5%)
          </span>
        </div>
      </div>

      {/* Gamification Level & XP Progress Card */}
      <div className="card mb-6" style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
        border: '1px solid var(--border-hover)',
        padding: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'var(--accent-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--accent-primary)', flexShrink: 0
            }}>
              <Shield size={30} color="var(--accent-primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Level {currentLevel} • Code Vanguard
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {userXp.toLocaleString()} Total XP Earned
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Next Level: </span>
            <strong style={{ color: 'var(--text-primary)' }}>Level {currentLevel + 1}</strong>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)' }}>
              {500 - xpInCurrentLevel} XP required
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{ height: 10, background: 'var(--bg-tertiary)', borderRadius: 5, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{
              width: `${levelProgressPct}%`,
              height: '100%',
              background: 'var(--accent-gradient)',
              borderRadius: 5,
              transition: 'width 0.4s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Level {currentLevel} ({userXp} XP)</span>
            <span>{levelProgressPct}% to Level {currentLevel + 1}</span>
          </div>
        </div>
      </div>

      {/* Section 1: Active Milestones with Claimable Rewards */}
      <div className="card mb-6" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={18} color="var(--accent-primary)" /> Season Milestones & Quests
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Resetting in 5 days</span>
        </div>

        <div className="grid-2" style={{ gap: 16 }}>
          {milestones.map(m => {
            const isCompleted = m.current >= m.target;
            const pct = Math.min(100, Math.round((m.current / m.target) * 100));

            return (
              <div
                key={m.id}
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-glass)',
                  border: isCompleted && !m.claimed ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{m.title}</span>
                  <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>+{m.xp} XP</span>
                </div>

                <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: isCompleted ? 'var(--success)' : 'var(--accent-primary)',
                    borderRadius: 3
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Progress: {m.current} / {m.target}</span>

                  {isCompleted ? (
                    m.claimed ? (
                      <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Check size={14} color="var(--success)" /> Claimed
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ padding: '4px 12px', fontSize: '0.75rem', background: '#f59e0b', borderColor: '#f59e0b' }}
                        onClick={() => handleClaimMilestone(m.id)}
                      >
                        <Gift size={12} /> Claim Reward
                      </button>
                    )
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>In Progress</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Badges Directory */}
      <div className="card mb-6" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Hall of Badges</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              {earnedCount} of {badges.length} Badges Unlocked
            </p>
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['All', 'Earned', 'In Progress', 'Locked'].map(tab => (
              <button
                key={tab}
                className={`btn btn-sm ${filter === tab ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                onClick={() => setFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid-4" style={{ gap: 16 }}>
          {filteredBadges.map(b => {
            const isEarned = b.earned;
            const rarityColor = rarityColors[b.rarity] || 'var(--text-muted)';

            return (
              <div
                key={b.id}
                id={`badge-card-${b.id}`}
                className="card card-hover"
                onClick={() => setSelectedBadge(b)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '24px 16px',
                  border: isEarned ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border)',
                  background: isEarned ? 'rgba(30, 41, 59, 0.85)' : 'rgba(15, 23, 42, 0.5)',
                  opacity: isEarned ? 1 : 0.75,
                  position: 'relative'
                }}
              >
                {/* Rarity Tag */}
                <span style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: rarityColor,
                  textTransform: 'uppercase'
                }}>
                  {b.rarity}
                </span>

                {/* Badge Icon Emblem */}
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: isEarned ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${isEarned ? 'var(--accent-primary)' : 'var(--border)'}`,
                  marginBottom: 14,
                  boxShadow: isEarned ? '0 0 15px var(--accent-glow)' : 'none'
                }}>
                  {isEarned ? (
                    <Trophy size={28} color="var(--accent-primary)" />
                  ) : (
                    <Lock size={22} color="var(--text-muted)" />
                  )}
                </div>

                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                  {b.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12, minHeight: 32 }}>
                  {b.description}
                </div>

                {/* Status or Progress */}
                {isEarned ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--success)' }}>
                    <CheckCircle2 size={13} /> Unlocked
                  </div>
                ) : (
                  <div style={{ width: '100%', marginTop: 'auto' }}>
                    <div style={{ height: 5, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{ width: `${b.progress || 0}%`, height: '100%', background: 'var(--accent-secondary)' }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {b.currentStep || `${b.progress}% Progress`}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div className="card text-center" style={{ maxWidth: 440, width: '100%', padding: 32, border: '1px solid var(--border-hover)' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: selectedBadge.earned ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              border: `2px solid ${selectedBadge.earned ? 'var(--accent-primary)' : 'var(--border)'}`
            }}>
              {selectedBadge.earned ? (
                <Trophy size={40} color="var(--accent-primary)" />
              ) : (
                <Lock size={30} color="var(--text-muted)" />
              )}
            </div>

            <span className="badge badge-primary" style={{ marginBottom: 8, fontSize: '0.75rem' }}>
              {selectedBadge.rarity} • +{selectedBadge.xp} XP
            </span>
            <h2 style={{ marginBottom: 8 }}>{selectedBadge.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
              {selectedBadge.description}
            </p>

            {selectedBadge.earned ? (
              <div style={{ padding: 12, background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: '0.85rem', marginBottom: 20 }}>
                ✓ Unlocked on {selectedBadge.earnedDate || 'September 2026'}
              </div>
            ) : (
              <div style={{ padding: 12, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                Status: {selectedBadge.currentStep || `${selectedBadge.progress}% Completed`}
              </div>
            )}

            <button className="btn btn-secondary btn-full" onClick={() => setSelectedBadge(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
