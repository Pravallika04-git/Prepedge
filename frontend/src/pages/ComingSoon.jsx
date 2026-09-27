import { useLocation } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

const pageMeta = {
  '/analytics':    { title: 'Analytics',    desc: 'Track your detailed performance metrics and insights' },
  '/achievements': { title: 'Achievements', desc: 'Earn badges and rewards for your preparation milestones' },
  '/companies':    { title: 'Companies',    desc: 'Explore company-specific preparation guides and interview patterns' },
  '/settings':     { title: 'Settings',     desc: 'Customize your PrepEdge experience and preferences' },
};

export default function ComingSoon() {
  const { pathname } = useLocation();
  const meta = pageMeta[pathname] || { title: 'Page', desc: 'This feature is under development' };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="gradient-text">{meta.title}</span></h1>
        <p>{meta.desc}</p>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '64px 32px' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--accent-glow)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Construction size={36} color="var(--accent-primary)" />
        </div>

        <h2 style={{ marginBottom: 8, color: 'var(--text-primary)' }}>Coming Soon</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 28px', lineHeight: 1.6 }}>
          We're building something awesome! The <strong>{meta.title}</strong> feature is currently
          under development and will be available soon.
        </p>

        <a href="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', gap: 8 }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </a>
      </div>
    </div>
  );
}
