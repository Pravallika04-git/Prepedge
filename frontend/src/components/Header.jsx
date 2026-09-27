import { useState, useRef } from 'react';
import { Search, Bell, Flame } from 'lucide-react';
import { getLocalData, setLocalData } from '../api/mockData';

export default function Header() {
  const [search, setSearch] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  const notifications = getLocalData('notifications', []);
  const streak = getLocalData('streak', { count: 0 });
  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setLocalData('notifications', updated);
    setShowNotifs(false);
  };

  return (
    <header className="topbar">
      <div className="search-container">
        <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          id="global-search"
          className="search-input"
          placeholder="Search quizzes, topics, companies…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="topbar-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(245,158,11,0.08)', borderRadius: 999, border: '1px solid rgba(245,158,11,0.2)' }}>
          <Flame size={14} color="#f59e0b" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b' }}>{streak.count}</span>
        </div>

        <button className="topbar-btn" onClick={() => setShowNotifs(!showNotifs)} ref={notifRef}>
          <Bell size={18} />
          {unread > 0 && <span className="badge-dot" />}
        </button>
      </div>

      {showNotifs && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
            <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={markAllRead}>
              Mark all read
            </button>
          </div>
          <div className="notif-body">
            {notifications.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No notifications</div>
            ) : notifications.map(n => (
              <div key={n.id} className={`notif-item${!n.read ? ' unread' : ''}`}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{n.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.text}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{n.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
