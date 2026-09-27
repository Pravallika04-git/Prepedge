import { useState } from 'react';
import { Map, CheckCircle, Circle, Loader } from 'lucide-react';
import { getLocalData, setLocalData, MOCK_ROADMAPS } from '../api/mockData';

const ROLES = Object.keys(MOCK_ROADMAPS);

export default function Roadmap() {
  const [selectedRole, setSelectedRole] = useState(() => getLocalData('selected_role', 'Java Developer'));
  const [roadmaps, setRoadmaps] = useState(() => getLocalData('roadmaps', MOCK_ROADMAPS));

  const steps = roadmaps[selectedRole] || [];
  const completedCount = steps.filter(s => s.progress === 'Completed').length;
  const pct = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;

  const changeRole = (role) => {
    setSelectedRole(role);
    setLocalData('selected_role', role);
  };

  const cycleProgress = (id) => {
    const order = ['Not Started', 'In Progress', 'Completed'];
    const updated = { ...roadmaps };
    const arr = [...updated[selectedRole]];
    const idx = arr.findIndex(s => s.id === id);
    const cur = order.indexOf(arr[idx].progress);
    arr[idx] = { ...arr[idx], progress: order[(cur + 1) % 3] };
    updated[selectedRole] = arr;
    setRoadmaps(updated);
    setLocalData('roadmaps', updated);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="gradient-text">Learning Roadmap</span></h1>
        <p>Follow a structured path to master your target role</p>
      </div>

      {/* Role selector */}
      <div className="card mb-6">
        <h4 style={{ marginBottom: 12 }}>Select Target Role</h4>
        <div className="filter-tabs" style={{ marginBottom: 0 }}>
          {ROLES.map(role => (
            <button key={role} className={`filter-tab${selectedRole === role ? ' active' : ''}`} onClick={() => changeRole(role)}>
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Progress summary */}
      <div className="card mb-6" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: 4 }}>{selectedRole} Path</h3>
          <p style={{ fontSize: '0.85rem' }}>{completedCount} of {steps.length} topics completed</p>
        </div>
        <div style={{ width: 200 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>Progress</span><span>{pct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="roadmap-timeline">
        {steps.map(step => {
          const cls = step.progress === 'Completed' ? 'completed' : step.progress === 'In Progress' ? 'in-progress' : '';
          return (
            <div key={step.id} className={`roadmap-node ${cls}`}>
              <div className="roadmap-node-dot" onClick={() => cycleProgress(step.id)} title="Click to change status" style={{ cursor: 'pointer' }}>
                {step.progress === 'Completed' ? <CheckCircle size={12} /> :
                  step.progress === 'In Progress' ? <Loader size={12} /> :
                    <Circle size={12} />}
              </div>
              <div className="roadmap-node-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <h4 style={{ margin: 0 }}>{step.title}</h4>
                  <span className={`badge ${step.progress === 'Completed' ? 'badge-success' : step.progress === 'In Progress' ? 'badge-warning' : 'badge-info'}`}>
                    {step.progress}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-muted)' }}>{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
