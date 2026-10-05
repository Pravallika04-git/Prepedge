import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Map, CheckCircle, Circle, Clock, Target, BookOpen,
  ChevronRight, X, ExternalLink, Play, RotateCcw,
  Zap, Award, CheckSquare, Square
} from 'lucide-react';
import { MOCK_ROADMAPS, ROADMAP_TOPIC_DETAILS } from '../api/mockData';

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLES      = Object.keys(MOCK_ROADMAPS);
const PROG_KEY   = 'prepedge_roadmap_progress';
const ROLE_KEY   = 'prepedge_roadmap_role';

// ─── localStorage helpers ─────────────────────────────────────────────────────
function loadProgress() {
  try { const r = localStorage.getItem(PROG_KEY); return r ? JSON.parse(r) : {}; }
  catch { return {}; }
}
function saveProgress(data) {
  try { localStorage.setItem(PROG_KEY, JSON.stringify(data)); } catch { /* quota */ }
}
function loadRole() {
  try {
    return localStorage.getItem(ROLE_KEY)
      || localStorage.getItem('selected_role')
      || 'Java Developer';
  } catch { return 'Java Developer'; }
}
function persistRole(role) {
  try {
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem('selected_role', role); // keep legacy key in sync
  } catch { /* ignore */ }
}

// ─── Computation helpers ──────────────────────────────────────────────────────
function getSubtopics(stepId) {
  return ROADMAP_TOPIC_DETAILS[stepId]?.subtopics ?? [];
}

function deriveStatus(stepId, completedIds = []) {
  const subs = getSubtopics(stepId);
  if (!subs.length) return 'Not Started';
  const done = subs.filter(s => completedIds.includes(s.id)).length;
  if (done === 0)        return 'Not Started';
  if (done === subs.length) return 'Completed';
  return 'In Progress';
}

function calcPct(stepId, completedIds = []) {
  const subs = getSubtopics(stepId);
  if (!subs.length) return 0;
  return Math.round((subs.filter(s => completedIds.includes(s.id)).length / subs.length) * 100);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cls = status === 'Completed' ? 'badge-success'
    : status === 'In Progress'       ? 'badge-warning'
    : 'badge-info';
  return <span className={`badge ${cls}`}>{status}</span>;
}

function RoadmapCard({ step, index, status, pct, onClick }) {
  const dotCls = status === 'Completed' ? 'rm-dot--done'
    : status === 'In Progress'          ? 'rm-dot--active' : '';
  const DotIcon = status === 'Completed' ? CheckCircle
    : status === 'In Progress'           ? Zap : Circle;

  return (
    <div className={`rm-card ${status === 'Completed' ? 'rm-card--done' : status === 'In Progress' ? 'rm-card--active' : ''}`}>
      <div className={`rm-dot ${dotCls}`} aria-hidden="true"><DotIcon size={11} /></div>

      <button
        className="rm-card-body"
        onClick={() => onClick(step)}
        aria-label={`Open details for ${step.title ?? 'topic'}`}
        id={`roadmap-card-${step.id}`}
      >
        <div className="rm-card-top">
          <span className="rm-card-step">Step {index + 1}</span>
          <StatusBadge status={status} />
        </div>

        <h4 className="rm-card-title">{step.title || 'Untitled Topic'}</h4>
        <p className="rm-card-desc">{step.description || 'No description available.'}</p>

        {pct > 0 && (
          <div className="rm-card-progress">
            <div className="rm-card-progress-track">
              <div className="rm-card-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="rm-card-progress-label">{pct}%</span>
          </div>
        )}

        <div className="rm-card-cta">
          <span>
            {status === 'Completed'   ? 'Review topic'
             : status === 'In Progress' ? 'Continue learning'
             : 'Start learning'}
          </span>
          <ChevronRight size={15} />
        </div>
      </button>
    </div>
  );
}

function TopicModal({ step, completedIds, onClose, onToggleSubtopic, onNavigate }) {
  if (!step) return null;
  const det       = ROADMAP_TOPIC_DETAILS[step.id] ?? {};
  const subtopics = det.subtopics  ?? [];
  const skills    = det.skills     ?? [];
  const objectives= det.objectives ?? [];
  const estTime   = det.estimatedTime ?? 'Varies';
  const fLink     = det.featureLink ?? null;
  const fLabel    = det.featureLinkLabel ?? 'Open feature';

  const done   = subtopics.filter(s => completedIds.includes(s.id)).length;
  const total  = subtopics.length;
  const pct    = total ? Math.round((done / total) * 100) : 0;
  const status = deriveStatus(step.id, completedIds);

  const handleCta = () => {
    if (!subtopics.length) return;
    if (status === 'Completed') {
      // Reset all subtopics (mark as In Progress)
      subtopics.forEach(s => { if (completedIds.includes(s.id)) onToggleSubtopic(s.id); });
    } else {
      // Check the first uncompleted subtopic to begin / continue
      const first = subtopics.find(s => !completedIds.includes(s.id));
      if (first) onToggleSubtopic(first.id);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="topic-modal-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="rm-modal">
        {/* Header */}
        <div className="rm-modal-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <StatusBadge status={status} />
              <span className="rm-modal-meta-chip"><Clock size={12} /> {estTime}</span>
            </div>
            <h2 id="topic-modal-title" className="rm-modal-title">{step.title ?? 'Topic Details'}</h2>
            <p className="rm-modal-desc">{step.description ?? ''}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="rm-modal-progress-wrap">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{done} / {total} subtopics completed</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{pct}%</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div className="rm-modal-body">
          {skills.length > 0 && (
            <section className="rm-modal-section">
              <h5 className="rm-modal-section-title"><Award size={14} /> Skills Covered</h5>
              <div className="rm-skill-tags">
                {skills.map(s => <span key={s} className="rm-skill-tag">{s}</span>)}
              </div>
            </section>
          )}

          {objectives.length > 0 && (
            <section className="rm-modal-section">
              <h5 className="rm-modal-section-title"><Target size={14} /> Learning Objectives</h5>
              <ul className="rm-objective-list">
                {objectives.map((o, i) => (
                  <li key={i} className="rm-objective-item">
                    <CheckCircle size={13} className="rm-obj-icon" style={{ flexShrink: 0, color: 'var(--success)' }} />
                    {o}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {subtopics.length > 0 && (
            <section className="rm-modal-section">
              <h5 className="rm-modal-section-title"><BookOpen size={14} /> Subtopics &amp; Tasks</h5>
              <div className="rm-subtopic-list">
                {subtopics.map((sub, i) => {
                  const checked = completedIds.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      id={`subtopic-${sub.id}`}
                      className={`rm-subtopic-item${checked ? ' rm-subtopic-item--done' : ''}`}
                      onClick={() => onToggleSubtopic(sub.id)}
                      aria-pressed={checked}
                    >
                      <span className="rm-subtopic-check">
                        {checked ? <CheckSquare size={15} /> : <Square size={15} />}
                      </span>
                      <span className="rm-subtopic-num">{i + 1}.</span>
                      <span className="rm-subtopic-label">{sub.title}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="rm-modal-footer">
          <button
            id={`cta-btn-${step.id}`}
            className={`btn ${status === 'Completed' ? 'btn-secondary' : 'btn-primary'} btn-sm`}
            onClick={handleCta}
            style={{ flex: 1 }}
          >
            {status === 'In Progress' ? <Play size={13} />
              : status === 'Completed' ? <RotateCcw size={13} />
              : <Zap size={13} />}
            {status === 'Completed' ? 'Review — Reset Progress'
              : status === 'In Progress' ? 'Continue Learning'
              : 'Start Learning'}
          </button>

          {fLink && (
            <button
              id={`feature-link-${step.id}`}
              className="btn btn-secondary btn-sm"
              onClick={() => { onClose(); onNavigate(fLink); }}
            >
              <ExternalLink size={13} />
              {fLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Roadmap() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(loadRole);
  const [progress, setProgress]         = useState(loadProgress);
  const [activeStep, setActiveStep]     = useState(null);

  const steps = MOCK_ROADMAPS[selectedRole] ?? [];

  const completedForStep = useCallback((stepId) => {
    return Object.keys(progress[`${selectedRole}::${stepId}`] ?? {});
  }, [progress, selectedRole]);

  const roleCompletedCount = steps.filter(s =>
    deriveStatus(s.id, completedForStep(s.id)) === 'Completed'
  ).length;
  const inProgressCount = steps.filter(s =>
    deriveStatus(s.id, completedForStep(s.id)) === 'In Progress'
  ).length;
  const rolePct = steps.length ? Math.round((roleCompletedCount / steps.length) * 100) : 0;

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    persistRole(role);
    setActiveStep(null);
  };

  const toggleSubtopic = useCallback((subtopicId) => {
    if (!activeStep) return;
    const scopeKey = `${selectedRole}::${activeStep.id}`;
    setProgress(prev => {
      const scope = { ...(prev[scopeKey] ?? {}) };
      if (scope[subtopicId]) { delete scope[subtopicId]; } else { scope[subtopicId] = true; }
      const next = { ...prev, [scopeKey]: scope };
      saveProgress(next);
      return next;
    });
  }, [activeStep, selectedRole]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="gradient-text">Learning Roadmap</span></h1>
        <p>Follow a structured path to master your target role — track your progress step by step.</p>
      </div>

      {/* Role Tabs */}
      <div className="card mb-6">
        <h4 style={{ marginBottom: 12 }}>Select Target Role</h4>
        <div className="filter-tabs" style={{ marginBottom: 0 }}>
          {ROLES.map(role => (
            <button
              key={role}
              id={`role-tab-${role.replace(/[\s&-]+/g, '-')}`}
              className={`filter-tab${selectedRole === role ? ' active' : ''}`}
              onClick={() => handleRoleChange(role)}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="card mb-6">
        <div className="rm-summary">
          <div style={{ flex: 1, minWidth: 160 }}>
            <h3 style={{ marginBottom: 4 }}>{selectedRole} Path</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {roleCompletedCount} of {steps.length} topics fully completed
            </p>
          </div>
          <div className="rm-summary-stats">
            <div className="rm-stat-cell" style={{ color: 'var(--accent-primary)' }}>
              <span className="rm-stat-val">{rolePct}%</span>
              <span className="rm-stat-lbl">OVERALL</span>
            </div>
            <div className="rm-stat-cell" style={{ color: 'var(--success)' }}>
              <span className="rm-stat-val">{roleCompletedCount}</span>
              <span className="rm-stat-lbl">DONE</span>
            </div>
            <div className="rm-stat-cell" style={{ color: 'var(--warning)' }}>
              <span className="rm-stat-val">{inProgressCount}</span>
              <span className="rm-stat-lbl">IN PROGRESS</span>
            </div>
            <div style={{ width: 160 }}>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: `${rolePct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {steps.length === 0 ? (
        <div className="empty-state">
          <Map size={48} />
          <h3>No topics found</h3>
          <p>Select a role above to view the learning roadmap.</p>
        </div>
      ) : (
        <div className="rm-timeline">
          {steps.map((step, i) => {
            const ids    = completedForStep(step.id);
            const status = deriveStatus(step.id, ids);
            const pct    = calcPct(step.id, ids);
            return (
              <RoadmapCard
                key={step.id}
                step={step}
                index={i}
                status={status}
                pct={pct}
                onClick={setActiveStep}
              />
            );
          })}
        </div>
      )}

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 28 }}>
        Click any card to open details and track subtopics · Progress is saved automatically in your browser
      </p>

      {activeStep && (
        <TopicModal
          step={activeStep}
          completedIds={completedForStep(activeStep.id)}
          onClose={() => setActiveStep(null)}
          onToggleSubtopic={toggleSubtopic}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}
